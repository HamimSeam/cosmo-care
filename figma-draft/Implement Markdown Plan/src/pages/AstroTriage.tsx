import { crewMembers, getStatusColor } from "../data/crew";
import GlassPanel from "../components/GlassPanel";

export default function AstroTriage() {
  const jordan = crewMembers.find((c) => c.id === "jordan")!;
  const color = getStatusColor(jordan.status);

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        padding: "24px 32px",
        background: "linear-gradient(180deg, #06060e 0%, #04091a 100%)",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div
          className="font-mono"
          style={{ fontSize: 8, letterSpacing: "0.22em", color: "#ef4444", marginBottom: 6 }}
        >
          ASTROTRIAGE PROTOCOL · ACTIVE
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#e4f0f8", letterSpacing: "-0.01em" }}>
          Medical Event — {jordan.name}
        </div>
        <div
          className="font-mono"
          style={{ fontSize: 9, color: "rgba(100,160,200,0.5)", letterSpacing: "0.12em", marginTop: 3 }}
        >
          {jordan.role.toUpperCase()} · {jordan.module.toUpperCase()} · MISSION DAY 147 · 14:22 UTC
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, maxWidth: 1100 }}>
        {/* Critical Vitals */}
        <GlassPanel hi style={{ padding: "16px" }}>
          <div
            className="font-mono"
            style={{ fontSize: 7.5, letterSpacing: "0.18em", color: "rgba(100,160,200,0.55)", marginBottom: 10 }}
          >
            CRITICAL VITALS
          </div>
          {[
            { label: "HEART RATE", value: jordan.current.heartRate, unit: "BPM", baseline: jordan.baseline.heartRate, critical: true },
            { label: "HRV", value: jordan.current.hrv, unit: "ms", baseline: jordan.baseline.hrv, critical: true },
            { label: "SPO₂", value: jordan.current.spo2, unit: "%", baseline: jordan.baseline.spo2, critical: true },
            { label: "SLEEP", value: jordan.current.sleep, unit: "HR", baseline: jordan.baseline.sleep, critical: true },
            { label: "RECOVERY", value: jordan.current.recovery, unit: "", baseline: jordan.baseline.recovery, critical: true },
          ].map((v) => (
            <div
              key={v.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                padding: "6px 0",
                borderBottom: "1px solid rgba(239,68,68,0.08)",
              }}
            >
              <span
                className="font-mono"
                style={{ fontSize: 7.5, letterSpacing: "0.1em", color: "rgba(100,160,200,0.5)" }}
              >
                {v.label}
              </span>
              <div style={{ textAlign: "right" }}>
                <span
                  className="font-mono"
                  style={{ fontSize: 16, fontWeight: 600, color: "#ef4444" }}
                >
                  {v.value}
                </span>
                <span className="font-mono" style={{ fontSize: 8, color: "rgba(239,68,68,0.5)", marginLeft: 2 }}>
                  {v.unit}
                </span>
                <div
                  className="font-mono"
                  style={{ fontSize: 7, color: "rgba(100,160,200,0.35)" }}
                >
                  baseline {v.baseline}{v.unit}
                </div>
              </div>
            </div>
          ))}
        </GlassPanel>

        {/* Symptoms & Factors */}
        <GlassPanel style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div
              className="font-mono"
              style={{ fontSize: 7.5, letterSpacing: "0.18em", color: "rgba(100,160,200,0.55)", marginBottom: 8 }}
            >
              PRESENTING SYMPTOMS
            </div>
            {["Tachycardia (HR 112 bpm)", "Dyspnea on exertion", "Severe fatigue", "Hypoxic episodes (SpO₂ 91%)", "Sleep disruption — 2.8 hr"].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 5 }}>
                <span style={{ color: "#ef4444", fontSize: 8, marginTop: 1.5 }}>▸</span>
                <span style={{ fontSize: 9, color: "rgba(160,200,230,0.7)" }}>{s}</span>
              </div>
            ))}
          </div>
          <div>
            <div
              className="font-mono"
              style={{ fontSize: 7.5, letterSpacing: "0.18em", color: "rgba(100,160,200,0.55)", marginBottom: 8 }}
            >
              CONTRIBUTING FACTORS
            </div>
            {jordan.intelligence.factors.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 5 }}>
                <span style={{ color: "#ef4444", fontSize: 10, lineHeight: 1.2 }}>↓</span>
                <span style={{ fontSize: 8.5, color: "rgba(160,200,230,0.65)" }}>{f.label}</span>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* Assessment & Response */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <GlassPanel hi style={{ padding: "14px" }}>
            <div
              className="font-mono"
              style={{ fontSize: 7.5, letterSpacing: "0.18em", color: "rgba(100,160,200,0.55)", marginBottom: 8 }}
            >
              COSMOCARE ASSESSMENT
            </div>
            <p style={{ fontSize: 8.5, color: "rgba(160,200,230,0.65)", lineHeight: 1.6, margin: 0 }}>
              {jordan.intelligence.assessment}
            </p>
          </GlassPanel>

          <GlassPanel style={{ padding: "14px" }}>
            <div
              className="font-mono"
              style={{ fontSize: 7.5, letterSpacing: "0.18em", color: "rgba(100,160,200,0.55)", marginBottom: 8 }}
            >
              RECOMMENDED RESPONSE
            </div>
            <div
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                padding: "5px 8px",
                marginBottom: 8,
              }}
            >
              <span
                className="font-mono"
                style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", letterSpacing: "0.2em" }}
              >
                RESPOND
              </span>
            </div>
            {jordan.intelligence.recommendations.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 5 }}>
                <span style={{ color: "#ef4444", fontSize: 8, flexShrink: 0, marginTop: 1 }}>•</span>
                <span style={{ fontSize: 8.5, color: "rgba(160,200,230,0.7)", lineHeight: 1.45 }}>{r}</span>
              </div>
            ))}
          </GlassPanel>

          {/* Escalate button */}
          <button
            style={{
              width: "100%",
              padding: "12px 0",
              background: "rgba(239,68,68,0.14)",
              border: "1px solid rgba(239,68,68,0.5)",
              color: "#ef4444",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              letterSpacing: "0.2em",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = "rgba(239,68,68,0.22)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = "rgba(239,68,68,0.14)";
            }}
          >
            ESCALATE TO FLIGHT SURGEON →
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div
        style={{
          marginTop: 24,
          padding: "8px 12px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
          maxWidth: 700,
        }}
      >
        <p style={{ fontSize: 8, color: "rgba(100,160,200,0.35)", margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>
          CosmoCare provides medical decision support and does not replace qualified medical professionals. All recommendations require validation by a certified flight surgeon before implementation.
        </p>
      </div>
    </div>
  );
}
