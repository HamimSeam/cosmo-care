'use client';

import { useApp } from '@/context/AppContext';
import { analyzeHealthRisk } from '@/lib/aiEngine';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ComposedChart, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea, Legend,
} from 'recharts';

// ─── Anomaly detection chart ──────────────────────────────────────────────────

const DETECT_URL = '/api/detect';  // proxied through Next.js — no CORS
const POLL_MS = 4000;              // normal poll interval (ms)
const WAKE_POLL_MS = 10000;        // slower retry on errors
const MAX_POINTS = 60;        // rolling window of displayed data points

interface DetectResponse {
  person_id: string;
  timestamp: number;
  anomaly_score: number;   // higher = more normal (Isolation Forest decision_function)
  anomaly_pred: number;    // -1 = anomaly, 1 = normal
  raw_vitals: { hr: number; spo2: number; resp_rr: number };
}

interface ChartPoint {
  t: number;            // unix seconds
  label: string;        // formatted time label
  score: number;        // anomaly_score (higher = more normal)
  hr: number;
  spo2: number;
  resp: number;
  isAnomaly: boolean;
}

interface AnomalySpan {
  t0: number;
  t1: number;
}

function computeSpans(pts: ChartPoint[]): AnomalySpan[] {
  const spans: AnomalySpan[] = [];
  let spanStart: number | null = null;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (p.isAnomaly && spanStart === null) spanStart = p.t;
    if (!p.isAnomaly && spanStart !== null) {
      spans.push({ t0: spanStart, t1: pts[i - 1].t });
      spanStart = null;
    }
  }
  if (spanStart !== null) spans.push({ t0: spanStart, t1: pts[pts.length - 1].t });
  return spans;
}

function useAnomalyDetection(personId: string, hr: number, spo2: number, respRr: number) {
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [spans, setSpans] = useState<AnomalySpan[]>([]);
  const [status, setStatus] = useState<'idle' | 'polling' | 'error' | 'waking'>('idle');
  const [errorDetail, setErrorDetail] = useState<string>('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const personIdRef = useRef(personId);
  const consecutiveErrorsRef = useRef(0);

  // Keep latest vitals accessible inside the interval without restarting it
  const vitalsRef = useRef({ hr, spo2, respRr });
  vitalsRef.current = { hr, spo2, respRr };

  // Recompute spans whenever points change
  useEffect(() => {
    setSpans(computeSpans(points));
  }, [points]);

  const poll = useCallback(async () => {
    const now = Date.now() / 1000;
    const { hr: curHr, spo2: curSpo2, respRr: curResp } = vitalsRef.current;

    try {
      const res = await fetch(DETECT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person_id: personIdRef.current,
          ring: 1,
          start: now,
          hr: curHr,
          spo2: curSpo2,
          resp_rr: curResp,
        }),
      });

      if (!res.ok) {
        consecutiveErrorsRef.current += 1;
        setErrorDetail(`HTTP ${res.status}`);
        setStatus('error');
        return;
      }

      const data: DetectResponse = await res.json();
      consecutiveErrorsRef.current = 0;
      setErrorDetail('');
      setStatus('polling');

      const label = new Date(data.timestamp * 1000).toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });

      const newPoint: ChartPoint = {
        t: data.timestamp,
        label,
        score: parseFloat(data.anomaly_score.toFixed(4)),
        hr: data.raw_vitals.hr,
        spo2: data.raw_vitals.spo2,
        resp: data.raw_vitals.resp_rr,
        isAnomaly: data.anomaly_pred === -1,
      };

      setPoints(prev => [...prev, newPoint].slice(-MAX_POINTS));
    } catch (err) {
      consecutiveErrorsRef.current += 1;
      const msg = err instanceof Error ? err.message : String(err);
      // "Failed to fetch" = network/CORS; distinguish from HTTP errors
      const isCors = msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network');
      setErrorDetail(isCors ? 'CORS / network' : msg);
      // First few failures likely mean Render is cold-starting
      setStatus(consecutiveErrorsRef.current <= 4 ? 'waking' : 'error');
    }
  }, []);

  useEffect(() => {
    personIdRef.current = personId;
    setPoints([]);
    setSpans([]);
    setStatus('idle');
    setErrorDetail('');
    consecutiveErrorsRef.current = 0;
  }, [personId]);

  useEffect(() => {
    let active = true;

    const schedule = () => {
      if (!active) return;
      // Adapt interval: slower while waking (cold start), fast once live
      const delay = consecutiveErrorsRef.current > 0 ? WAKE_POLL_MS : POLL_MS;
      timerRef.current = setTimeout(async () => {
        if (!active) return;
        await poll();
        schedule();
      }, delay);
    };

    // Fire first call immediately, then recurse
    (async () => {
      if (!active) return;
      await poll();
      schedule();
    })();

    return () => {
      active = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personId]);

  return { points, spans, status, errorDetail };
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function AnomalyTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const byName = Object.fromEntries(payload.map(p => [p.name, p]));
  return (
    <div style={{ background: '#0d1320', border: '1px solid #1e2a3a', borderRadius: 4, padding: '8px 12px', fontSize: 11 }}>
      <div style={{ color: '#64748b', marginBottom: 6 }}>{label}</div>
      {byName['Anomaly Score'] && (
        <div style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 4 }}>
          Score: <span style={{ color: byName['Anomaly Score'].value < 0 ? '#f87171' : '#34d399' }}>
            {byName['Anomaly Score'].value.toFixed(4)}
          </span>
          <span style={{ fontSize: 9, marginLeft: 6, color: byName['Anomaly Score'].value < 0 ? '#f87171' : '#34d399' }}>
            {byName['Anomaly Score'].value < 0 ? '⚠ ANOMALY' : '✓ NORMAL'}
          </span>
        </div>
      )}
      {byName['HR'] && <div style={{ color: '#7dd3fc' }}>HR: {byName['HR'].value} bpm</div>}
      {byName['SpO₂'] && <div style={{ color: '#86efac' }}>SpO₂: {byName['SpO₂'].value}%</div>}
      {byName['Resp'] && <div style={{ color: '#fdba74' }}>Resp: {byName['Resp'].value} br/m</div>}
    </div>
  );
}

// ─── The chart itself ─────────────────────────────────────────────────────────

function AnomalyChart({ personId, hr, spo2, respRr }: {
  personId: string; hr: number; spo2: number; respRr: number;
}) {
  const { points, spans, status, errorDetail } = useAnomalyDetection(personId, hr, spo2, respRr);

  const anomalyCount = points.filter(p => p.isAnomaly).length;
  const latestScore = points[points.length - 1]?.score;
  const isAnomaly = points[points.length - 1]?.isAnomaly ?? false;

  // Compute dual-axis domains
  const scoreVals = points.map(p => p.score);
  const scoreDomain: [number, number] = scoreVals.length
    ? [Math.min(...scoreVals) - 0.02, Math.max(...scoreVals) + 0.02]
    : [-0.2, 0.2];

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div className="card-title" style={{ marginBottom: 2 }}>Live Anomaly Detection</div>
          <div style={{ fontSize: 10, color: '#475569' }}>
            Isolation Forest · HR / SpO₂ / Resp rate · Rolling features from session history
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Status pill */}
          <div style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
            padding: '2px 8px', borderRadius: 3,
            background: status === 'error' ? 'rgba(248,113,113,0.12)'
              : status === 'polling' ? 'rgba(52,211,153,0.1)'
              : status === 'waking' ? 'rgba(251,191,36,0.1)'
              : 'rgba(100,116,139,0.1)',
            border: `1px solid ${status === 'error' ? 'rgba(248,113,113,0.3)'
              : status === 'polling' ? 'rgba(52,211,153,0.3)'
              : status === 'waking' ? 'rgba(251,191,36,0.3)'
              : 'rgba(100,116,139,0.2)'}`,
            color: status === 'error' ? '#f87171'
              : status === 'polling' ? '#34d399'
              : status === 'waking' ? '#fbbf24'
              : '#64748b',
          }}>
            {status === 'error' ? '✕ OFFLINE'
              : status === 'polling' ? '● LIVE'
              : status === 'waking' ? '◌ WAKING'
              : '○ CONNECTING'}
          </div>
          {/* Current score badge */}
          {latestScore !== undefined && (
            <div style={{
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 3,
              background: isAnomaly ? 'rgba(248,113,113,0.12)' : 'rgba(52,211,153,0.1)',
              border: `1px solid ${isAnomaly ? 'rgba(248,113,113,0.35)' : 'rgba(52,211,153,0.3)'}`,
              color: isAnomaly ? '#f87171' : '#34d399',
            }}>
              {latestScore.toFixed(4)} {isAnomaly ? '⚠' : '✓'}
            </div>
          )}
          {anomalyCount > 0 && (
            <div style={{ fontSize: 9, color: '#f87171' }}>{anomalyCount} anomaly pt{anomalyCount !== 1 ? 's' : ''}</div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {points.length < 2 ? (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: status === 'error' ? '#f87171' : status === 'waking' ? '#fbbf24' : '#334155', marginBottom: 4 }}>
              {status === 'error'
                ? `Detection unavailable${errorDetail ? ` — ${errorDetail}` : ''}`
                : status === 'waking'
                ? 'Connecting to detection service…'
                : 'Awaiting first reading…'}
            </div>
            {(status === 'idle' || status === 'waking') && (
              <div style={{ fontSize: 10, color: '#1e2a3a' }}>Retrying every {WAKE_POLL_MS / 1000}s</div>
            )}
          </div>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={points} margin={{ top: 6, right: 12, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2235" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: '#334155' }}
                axisLine={false} tickLine={false}
                interval="preserveStartEnd"
              />
              {/* Left axis: anomaly score */}
              <YAxis
                yAxisId="score"
                orientation="left"
                domain={scoreDomain}
                tick={{ fontSize: 9, fill: '#64748b' }}
                axisLine={false} tickLine={false}
                tickFormatter={v => v.toFixed(2)}
                width={42}
              />
              {/* Right axis: vitals (hidden ticks, just for scaling) */}
              <YAxis
                yAxisId="vitals"
                orientation="right"
                tick={false}
                axisLine={false} tickLine={false}
                width={0}
              />

              <Tooltip content={<AnomalyTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 10, color: '#475569', paddingTop: 6 }}
                iconSize={8}
              />

              {/* Zero line on score axis */}
              <ReferenceLine yAxisId="score" y={0} stroke="#334155" strokeDasharray="4 2" strokeWidth={1} />

              {/* Anomaly span highlights */}
              {spans.map((span, i) => (
                <ReferenceArea
                  key={i}
                  yAxisId="score"
                  x1={points.find(p => p.t === span.t0)?.label}
                  x2={points.find(p => p.t === span.t1)?.label}
                  fill="rgba(248,113,113,0.10)"
                  stroke="rgba(248,113,113,0.25)"
                  strokeWidth={1}
                />
              ))}

              {/* Faded vital lines — right axis */}
              <Line
                yAxisId="vitals" type="monotone" dataKey="hr"
                name="HR" stroke="rgba(125,211,252,0.45)" strokeWidth={1.5}
                dot={false} activeDot={{ r: 3 }}
              />
              <Line
                yAxisId="vitals" type="monotone" dataKey="spo2"
                name="SpO₂" stroke="rgba(134,239,172,0.45)" strokeWidth={1.5}
                dot={false} activeDot={{ r: 3 }}
              />
              <Line
                yAxisId="vitals" type="monotone" dataKey="resp"
                name="Resp" stroke="rgba(253,186,116,0.45)" strokeWidth={1.5}
                dot={false} activeDot={{ r: 3 }}
              />

              {/* Prominent anomaly score line — left axis */}
              <Line
                yAxisId="score" type="monotone" dataKey="score"
                name="Anomaly Score"
                stroke="#e2e8f0" strokeWidth={2.5}
                dot={false} activeDot={{ r: 4, fill: '#e2e8f0' }}
              />
            </ComposedChart>
          </ResponsiveContainer>

          {/* Scale note */}
          <div style={{ fontSize: 9, color: '#1e2a3a', marginTop: 4 }}>
            Anomaly score: negative = anomalous · Vitals scaled independently on right axis
          </div>
        </>
      )}
    </div>
  );
}

export default function HealthIntelligence() {
  const { selectedAstronaut: a } = useApp();
  const { riskLevel, confidence, factors } = analyzeHealthRisk(a);

  const riskColors = {
    LOW:      { bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.3)',  text: '#34d399' },
    MODERATE: { bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)',  text: '#fbbf24' },
    ELEVATED: { bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.3)',  text: '#fb923c' },
    CRITICAL: { bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', text: '#f87171' },
  };
  const rc = riskColors[riskLevel];

  // Build trend chart data for HR, HRV, Sleep
  const days = ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'Today'];
  const hrTrend = a.physiological.restingHR.trend;
  const hrvTrend = a.physiological.hrv.trend;
  const sleepTrend = a.recovery.sleepDuration.trend;
  const reactionTrend = a.cognitive.reactionTime.trend;
  const fatigueTrend = a.cognitive.fatigueLevel.trend;

  const trendData = days.map((d, i) => ({
    day: d,
    hr: hrTrend[i] ?? null,
    hrv: hrvTrend[i] ?? null,
    sleep: sleepTrend[i] ?? null,
    reaction: reactionTrend[i] ?? null,
    fatigue: fatigueTrend[i] ?? null,
  }));

  const hrBaseline = a.physiological.restingHR.baseline.mean;
  const hrvBaseline = a.physiological.hrv.baseline.mean;
  const sleepBaseline = a.recovery.sleepDuration.baseline.mean;

  return (
    <div className="content-area">
      <div className="view-header">
        <div className="view-title">Health Intelligence</div>
        <div className="view-subtitle">AI-powered multivariate pattern analysis · {a.name}</div>
      </div>

      {/* Risk summary */}
      <div className={`intelligence-focus${riskLevel === 'CRITICAL' ? ' critical-panel' : ''}`} style={{ background: rc.bg, border: `1px solid ${rc.border}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Risk Level</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: rc.text }}>{riskLevel}</div>
            <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
              Confidence: {confidence}%
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>
              {riskLevel === 'LOW' && 'No significant health patterns detected'}
              {riskLevel === 'MODERATE' && 'Emerging physiological stress pattern detected'}
              {riskLevel === 'ELEVATED' && 'Multi-system physiological deterioration detected'}
              {riskLevel === 'CRITICAL' && 'Critical multi-system physiological emergency detected'}
            </div>
            {factors.length > 0 ? (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Contributing Factors</div>
                {factors.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 4 }}>
                    <span style={{ color: rc.text, flexShrink: 0, fontSize: 8, marginTop: 3 }}>▶</span>
                    <span style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 11, color: '#34d399' }}>All monitored physiological indicators are within acceptable range of personal baseline.</div>
            )}
            <div style={{ fontSize: 10, color: '#475569', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 8 }}>
              ⚠ This analysis represents a potential risk pattern requiring assessment by qualified medical personnel. CosmoCare AI does not provide diagnoses.
            </div>
          </div>
        </div>
      </div>

      {/* Live anomaly detection chart */}
      <AnomalyChart
        personId={a.id}
        hr={a.physiological.heartRate.current}
        spo2={a.physiological.spo2.current}
        respRr={a.physiological.respiratoryRate.current}
      />

      {/* Trend charts */}
      <div className="grid-2" style={{ marginBottom: 16 }}>
        {/* Resting HR trend */}
        <TrendChart
          title="Resting HR — 7-Day Trend"
          data={trendData.map(d => ({ day: d.day, value: d.hr, baseline: hrBaseline }))}
          color={a.physiological.restingHR.status === 'GREEN' ? '#34d399' : a.physiological.restingHR.status === 'YELLOW' ? '#fbbf24' : '#fb923c'}
          unit="bpm"
          baselineLabel={`Baseline: ${a.physiological.restingHR.baseline.min}–${a.physiological.restingHR.baseline.max} bpm`}
          baselineValue={hrBaseline}
        />

        {/* HRV trend */}
        <TrendChart
          title="HRV — 7-Day Trend"
          data={trendData.map(d => ({ day: d.day, value: d.hrv, baseline: hrvBaseline }))}
          color={a.physiological.hrv.status === 'GREEN' ? '#34d399' : a.physiological.hrv.status === 'YELLOW' ? '#fbbf24' : '#fb923c'}
          unit="ms"
          baselineLabel={`Baseline: ${a.physiological.hrv.baseline.min}–${a.physiological.hrv.baseline.max} ms`}
          baselineValue={hrvBaseline}
        />
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        {/* Sleep trend */}
        <TrendChart
          title="Sleep Duration — 7-Day Trend"
          data={trendData.map(d => ({ day: d.day, value: d.sleep, baseline: sleepBaseline }))}
          color={a.recovery.sleepDuration.status === 'GREEN' ? '#34d399' : a.recovery.sleepDuration.status === 'YELLOW' ? '#fbbf24' : '#fb923c'}
          unit="hrs"
          baselineLabel={`Baseline: ${a.recovery.sleepDuration.baseline.min}–${a.recovery.sleepDuration.baseline.max} hrs`}
          baselineValue={sleepBaseline}
        />

        {/* Reaction time */}
        <TrendChart
          title="Reaction Time — 7-Day Trend"
          data={trendData.map(d => ({ day: d.day, value: d.reaction, baseline: a.cognitive.reactionTime.baseline.mean }))}
          color={a.cognitive.reactionTime.status === 'GREEN' ? '#34d399' : a.cognitive.reactionTime.status === 'YELLOW' ? '#fbbf24' : '#fb923c'}
          unit="ms"
          baselineLabel={`Baseline: ${a.cognitive.reactionTime.baseline.min}–${a.cognitive.reactionTime.baseline.max} ms`}
          baselineValue={a.cognitive.reactionTime.baseline.mean}
        />
      </div>

      {/* Pattern explanation */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>How AI Pattern Detection Works</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { title: 'Personalized Baseline', desc: 'CosmoCare learns each astronaut\'s individual normal ranges from historical data rather than applying generic universal thresholds.' },
            { title: 'Multivariate Analysis', desc: 'Single metric deviations are not flagged as risks. The AI identifies correlated patterns across multiple physiological systems simultaneously.' },
            { title: 'Trend Detection', desc: 'The AI analyzes directional trends over time. A gradual decline over 72 hours carries more weight than a single elevated reading.' },
            { title: 'Explainable Outputs', desc: 'Every alert identifies specific contributing factors and their magnitude. No black-box outputs — all reasoning is transparent and reviewable.' },
          ].map(item => (
            <div key={item.title} style={{ background: 'rgba(30,45,69,0.3)', borderRadius: 4, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#60a5fa', marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrendChartTooltip({
  active,
  payload,
  label,
  unit,
  baselineValue,
  color,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
  unit: string;
  baselineValue: number;
  color: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#0d1320', border: '1px solid #1e2a3a', borderRadius: 4, padding: '8px 12px' }}>
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color }}>
          {payload[0]?.value?.toFixed(1)} {unit}
        </div>
        <div style={{ fontSize: 10, color: '#475569' }}>Baseline: {baselineValue.toFixed(1)} {unit}</div>
      </div>
    );
  }
  return null;
}

function TrendChart({
  title, data, color, unit, baselineLabel, baselineValue
}: {
  title: string;
  data: { day: string; value: number | null; baseline: number }[];
  color: string;
  unit: string;
  baselineLabel: string;
  baselineValue: number;
}) {
  const allValues = data.map(d => d.value).filter((v): v is number => v !== null);
  const minVal = Math.min(...allValues, baselineValue) * 0.9;
  const maxVal = Math.max(...allValues, baselineValue) * 1.1;

  return (
    <div className="card">
      <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="card-title">{title}</div>
        <div style={{ fontSize: 10, color: '#475569' }}>{baselineLabel}</div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} domain={[minVal, maxVal]} />
          <Tooltip content={<TrendChartTooltip unit={unit} baselineValue={baselineValue} color={color} />} />
          <ReferenceLine y={baselineValue} stroke="#334155" strokeDasharray="4 4" />
          <Line
            type="monotone" dataKey="value" stroke={color} strokeWidth={2}
            dot={{ r: 3, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
