"""
main.py — Cosmo Care backend API

Serves three capabilities to the frontend:
  1. POST /detect    — real-time anomaly detection on a new telemetry reading
  2. POST /forecast   — project current trend forward and re-score
  3. POST /recommend — RAG: retrieve NASA reference material + Granite recommendation
  4. POST /analyze   — convenience endpoint that chains all three (good for the demo)

Run with:
    uvicorn main:app --reload --port 8000

Expects these files to exist alongside this script (produced by model.ipynb):
    iso_forest.joblib
    feature_cols.joblib
    ./kb/                (persisted Chroma vector store from your RAG cells)
"""

import os
import json
from collections import defaultdict, deque
from typing import Optional

import joblib
import numpy as np
import pandas as pd
import shap
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_ibm import ChatWatsonx, WatsonxEmbeddings
from langchain_chroma import Chroma

load_dotenv()

# ---------------------------------------------------------------------------
# Config — matches model.ipynb exactly
# ---------------------------------------------------------------------------

VITALS = ["hr", "spo2", "resp_rr"]
TIME_WINDOWS = ("30s", "120s", "600s")
BUFFER_SECONDS = 700  # a bit more than the largest rolling window (600s)

SYSTEM_MAP = {
    "cardiovascular": lambda col: col.startswith("hr"),
    "respiratory": lambda col: col.startswith("spo2") or col.startswith("resp_rr"),
}

SOURCE_DIR = "./docs"
PERSIST_DIR = "./kb"
COLLECTION_NAME = "medical_kb"
TOP_K = 3

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")

# ---------------------------------------------------------------------------
# Load trained model artifacts (produced in model.ipynb)
# ---------------------------------------------------------------------------

try:
    iso_forest = joblib.load("iso_forest.joblib")
    feature_cols = joblib.load("feature_cols.joblib")
except FileNotFoundError as e:
    raise RuntimeError(
        "Missing model artifacts. In model.ipynb, run: "
        "joblib.dump(iso_forest, 'iso_forest.joblib'); "
        "joblib.dump(feature_cols, 'feature_cols.joblib')"
    ) from e

explainer = shap.TreeExplainer(iso_forest)

# ---------------------------------------------------------------------------
# RAG setup — same config as model.ipynb
# ---------------------------------------------------------------------------

embeddings = WatsonxEmbeddings(
    model_id="ibm/granite-embedding-278m-multilingual",
    url=os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com"),
    project_id=os.getenv("WATSONX_PROJECT_ID"),
    apikey=os.getenv("WATSONX_API_KEY"),
)

vector_store = Chroma(
    collection_name=COLLECTION_NAME,
    embedding_function=embeddings,
    persist_directory=PERSIST_DIR,
)

llm = ChatWatsonx(
    model_id="ibm/granite-4-h-small",
    url=os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com"),
    project_id=os.getenv("WATSONX_PROJECT_ID"),
    api_key=os.getenv("WATSONX_API_KEY"),
    params={"max_tokens": 256, "temperature": 0.0},
)

# ---------------------------------------------------------------------------
# In-memory per-astronaut telemetry buffers (real-time state)
# ---------------------------------------------------------------------------
# Keyed by (person_id, ring). Each buffer holds recent raw readings so we can
# compute the same rolling features used at training time.

buffers: dict[tuple[str, int], deque] = defaultdict(lambda: deque(maxlen=2000))


def _rolling_slope_raw(x):
    if len(x) < 2:
        return 0.0
    return np.polyfit(np.arange(len(x)), x, 1)[0]


def add_rolling_features(df: pd.DataFrame, time_windows=TIME_WINDOWS) -> pd.DataFrame:
    """Identical logic to model.ipynb's add_rolling_features, applied to a
    single-person buffer so train/serve feature computation never drifts apart."""
    df = df.sort_values("start").reset_index(drop=True)
    df["_start_dt"] = pd.to_datetime(df["start"], unit="s")
    g = df.set_index("_start_dt").sort_index()

    for vital in VITALS:
        for w in time_windows:
            g[f"{vital}_roll_mean_{w}"] = g[vital].rolling(w, min_periods=1).mean()
            g[f"{vital}_roll_std_{w}"] = g[vital].rolling(w, min_periods=2).std()
            g[f"{vital}_roll_slope_{w}"] = g[vital].rolling(w, min_periods=2).apply(
                _rolling_slope_raw, raw=True
            )
        g[f"{vital}_dev_from_roll"] = g[vital] - g[f"{vital}_roll_mean_{time_windows[0]}"]

    out = g.reset_index(drop=True)
    roll_cols = [c for c in out.columns if "_roll_" in c or c.endswith("_dev_from_roll")]
    out[roll_cols] = out[roll_cols].bfill().ffill().fillna(0)
    return out


def compute_realtime_slope(person_id: str, ring: int, vital: str, window_s: float = 60) -> float:
    """Real per-second rate of change for `vital`, fit on actual elapsed time
    (not sample index). Used only for forecasting math — kept separate from
    the model's internal roll_slope_* features, which are index-based and
    not safe to multiply by a horizon in seconds."""
    buf = buffers[(person_id, ring)]
    if len(buf) < 2:
        return 0.0

    recent = [r for r in buf if r["start"] >= buf[-1]["start"] - window_s]
    if len(recent) < 2:
        recent = list(buf)[-2:]

    times = np.array([r["start"] for r in recent], dtype=float)
    values = np.array([r[vital] for r in recent], dtype=float)

    if times.max() == times.min():
        return 0.0

    slope, _ = np.polyfit(times, values, 1)  # units: vital per second
    return float(slope)


def compute_latest_features(person_id: str, ring: int) -> pd.Series:
    """Rebuild features from the buffer and return the most recent row,
    reindexed to match the exact column order the model was trained on."""
    buf = buffers[(person_id, ring)]
    if len(buf) == 0:
        raise HTTPException(status_code=400, detail="No telemetry buffered for this astronaut yet.")

    df = pd.DataFrame(buf)
    feat_df = add_rolling_features(df)
    latest = feat_df.iloc[-1]
    return latest.reindex(feature_cols).fillna(0)


def score_and_explain(feature_row: pd.Series) -> dict:
    X = feature_row.to_frame().T
    anomaly_score = float(iso_forest.decision_function(X)[0])       # higher = more normal
    anomaly_pred = int(iso_forest.predict(X)[0])                    # -1 = anomaly, 1 = normal

    shap_values = explainer.shap_values(X)[0]
    shap_row = pd.Series(shap_values, index=feature_cols)

    top_features = shap_row.sort_values().head(3)
    system_scores = {}
    for system, matcher in SYSTEM_MAP.items():
        cols = [c for c in shap_row.index if matcher(c)]
        system_scores[system] = float(shap_row[cols].sum())

    return {
        "anomaly_score": round(anomaly_score, 4),
        "anomaly_pred": anomaly_pred,
        "system_attribution": {k: round(v, 4) for k, v in system_scores.items()},
        "top_contributing_features": [
            {"feature": feat, "shap_value": round(float(val), 4)}
            for feat, val in top_features.items()
        ],
    }


# ---------------------------------------------------------------------------
# RAG helpers — same logic as model.ipynb
# ---------------------------------------------------------------------------

def build_retrieval_query(raw_vitals: dict, top_features: list[dict]) -> str:
    feature_names = ", ".join(d["feature"] for d in top_features)
    vitals_str = ", ".join(f"{k}={v}" for k, v in raw_vitals.items())
    return (
        f"Astronaut physiological anomaly involving {feature_names}. "
        f"Current readings: {vitals_str}. "
        f"What are the relevant safety thresholds, required actions, and EVA/mission constraints?"
    )


def retrieve(query: str, k: int = TOP_K) -> list[dict]:
    results = vector_store.similarity_search_with_score(query, k=k)
    return [
        {
            "source": doc.metadata.get("source", "unknown"),
            "page": doc.metadata.get("page"),
            "text": doc.page_content,
            "relevance_score": float(score),
        }
        for doc, score in results
    ]


def build_prompt(alert_payload: dict, retrieved: list[dict]) -> str:
    context_block = "\n\n".join(
        f"[Source: {r['source']}" + (f", p.{r['page']}" if r.get("page") is not None else "") + f"]\n{r['text']}"
        for r in retrieved
    )
    return f"""You are a spaceflight medical decision-support assistant.
Use ONLY the reference material below to ground your answer. If the
references don't cover the situation, say so explicitly rather than guessing.

REFERENCE MATERIAL:
{context_block}

ASTRONAUT DATA:
{json.dumps(alert_payload, indent=2)}

Respond in exactly this format:
SUMMARY:
PRIMARY CONCERN:
SEVERITY:
RECOMMENDED ACTION:
SOURCE:
"""


# ---------------------------------------------------------------------------
# API schemas
# ---------------------------------------------------------------------------

class TelemetryReading(BaseModel):
    person_id: str
    ring: int = 1
    start: float          # unix timestamp (seconds)
    hr: float
    spo2: float
    resp_rr: float


class ForecastRequest(BaseModel):
    person_id: str
    ring: int = 1
    horizon_s: float = 300  # how far ahead to project, in seconds


class RecommendRequest(BaseModel):
    alert: dict  # the payload returned by /detect or /forecast


class AnalyzeRequest(BaseModel):
    reading: TelemetryReading
    horizon_s: Optional[float] = 300


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(title="Cosmo Care API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/detect")
def detect(reading: TelemetryReading):
    """1) Real-time anomaly detection on a new telemetry reading."""
    key = (reading.person_id, reading.ring)
    buffers[key].append(reading.model_dump())

    feature_row = compute_latest_features(reading.person_id, reading.ring)
    result = score_and_explain(feature_row)

    return {
        "person_id": reading.person_id,
        "ring": reading.ring,
        "timestamp": reading.start,
        "raw_vitals": {"hr": reading.hr, "spo2": reading.spo2, "resp_rr": reading.resp_rr},
        **result,
    }


@app.post("/forecast")
def forecast(req: ForecastRequest):
    """2) Project the current trend forward using the rolling-slope features
    already in the model, and re-score at that projected point.
    Framed as conditional ('if trend continues'), not a hard prediction."""
    feature_row = compute_latest_features(req.person_id, req.ring)
    projected = feature_row.copy()

    buf = buffers[(req.person_id, req.ring)]
    projected_vitals = {}
    for vital in VITALS:
        slope_per_sec = compute_realtime_slope(req.person_id, req.ring, vital)
        current_val = buf[-1][vital] if buf else 0.0
        projected_val = current_val + slope_per_sec * req.horizon_s
        projected_vitals[vital] = round(float(projected_val), 2)

        dev_col = f"{vital}_dev_from_roll"
        if dev_col in projected.index:
            projected[dev_col] = projected[dev_col] + slope_per_sec * req.horizon_s

    result = score_and_explain(projected)

    return {
        "person_id": req.person_id,
        "ring": req.ring,
        "horizon_s": req.horizon_s,
        "projected_vitals": projected_vitals,
        "note": "Projection assumes the current trend continues linearly; not a guarantee.",
        **result,
    }


@app.post("/recommend")
def recommend(req: RecommendRequest):
    """3) RAG: retrieve NASA reference material and get a Granite recommendation
    for an alert produced by /detect or /forecast."""
    alert = req.alert
    top_features = alert.get("top_contributing_features", [])
    raw_vitals = alert.get("raw_vitals") or alert.get("projected_vitals", {})

    query = build_retrieval_query(raw_vitals, top_features)
    retrieved = retrieve(query)
    prompt = build_prompt(alert, retrieved)
    response = llm.invoke(prompt)

    return {
        "recommendation": response.content,
        "retrieved_sources": [
            {"source": r["source"], "page": r["page"]} for r in retrieved
        ],
    }


@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    """Convenience endpoint: detect -> forecast -> recommend in one call.
    Good for the frontend's main 'Analyze' / scenario-injector button."""
    detect_result = detect(req.reading)
    forecast_result = forecast(
        ForecastRequest(
            person_id=req.reading.person_id,
            ring=req.reading.ring,
            horizon_s=req.horizon_s or 300,
        )
    )
    recommend_result = recommend(RecommendRequest(alert=detect_result))

    return {
        "detection": detect_result,
        "forecast": forecast_result,
        "recommendation": recommend_result,
    }


@app.get("/health")
def health():
    return {"status": "ok"}
