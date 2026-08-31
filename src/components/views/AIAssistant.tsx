'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { queryAIAssistant } from '@/lib/aiEngine';
import { KNOWLEDGE_BASE } from '@/data/knowledgeBase';

// Requests go through local Next.js API routes (avoids CORS + Render cold-start UX)
const API_ANALYZE = '/api/analyze';
const API_RECOMMEND = '/api/recommend';

// ─── Types matching the backend response shapes ───────────────────────────────

interface TopFeature {
  feature: string;
  shap_value: number;
}

interface DetectionResult {
  person_id: string;
  ring: number;
  timestamp: number;
  raw_vitals: { hr: number; spo2: number; resp_rr: number };
  anomaly_score: number;
  anomaly_pred: number; // -1 = anomaly, 1 = normal
  system_attribution: Record<string, number>;
  top_contributing_features: TopFeature[];
}

interface ForecastResult {
  person_id: string;
  ring: number;
  horizon_s: number;
  projected_vitals: { hr: number; spo2: number; resp_rr: number };
  note: string;
  anomaly_score: number;
  anomaly_pred: number;
  system_attribution: Record<string, number>;
  top_contributing_features: TopFeature[];
}

interface RecommendResult {
  recommendation: string;
  retrieved_sources: { source: string; page: number | null }[];
}

interface AnalyzeResult {
  detection: DetectionResult;
  forecast: ForecastResult;
  recommendation: RecommendResult;
}

// ─── Structured Granite response parser ──────────────────────────────────────
// The LLM is prompted to always respond as:
//   SUMMARY:\nPRIMARY CONCERN:\nSEVERITY:\nRECOMMENDED ACTION:\nSOURCE:

const SECTION_KEYS = ['SUMMARY', 'PRIMARY CONCERN', 'SEVERITY', 'RECOMMENDED ACTION', 'SOURCE'] as const;
type SectionKey = typeof SECTION_KEYS[number];

function parseGraniteResponse(text: string): Record<SectionKey, string> {
  const result = {} as Record<SectionKey, string>;
  for (let i = 0; i < SECTION_KEYS.length; i++) {
    const key = SECTION_KEYS[i];
    const next = SECTION_KEYS[i + 1];
    const start = text.indexOf(`${key}:`);
    if (start === -1) { result[key] = ''; continue; }
    const contentStart = start + key.length + 1;
    const end = next ? text.indexOf(`${next}:`) : text.length;
    result[key] = text.slice(contentStart, end === -1 ? text.length : end).trim();
  }
  return result;
}

const SUGGESTED_QUERIES = [
  'EVA clearance criteria and medical requirements',
  'Dehydration assessment and treatment protocol',
  'HRV interpretation and spaceflight significance',
  'Sleep deprivation effects on performance',
  'Fever management protocol in spaceflight',
  'CO₂ exposure health effects',
  'Ondansetron dosing and contraindications',
  'Post-EVA medical assessment protocol',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function anomalyColor(pred: number, score: number) {
  if (pred === -1) return { text: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' };
  if (score < 0.05) return { text: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.25)' };
  return { text: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)' };
}

function anomalyLabel(pred: number) {
  return pred === -1 ? 'ANOMALY DETECTED' : 'NORMAL';
}

function severityColor(severity: string) {
  const s = severity.toUpperCase();
  if (s.includes('CRITICAL') || s.includes('HIGH')) return '#f87171';
  if (s.includes('MODERATE') || s.includes('MEDIUM')) return '#fb923c';
  return '#4ade80';
}

// Normalise a feature key like "hr_roll_mean_30s" → "HR roll mean 30s"
function fmtFeature(f: string) {
  return f.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// Pill label
function SectionLabel({ text }: { text: string }) {
  return (
    <span style={{
      display: 'inline-block', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
      textTransform: 'uppercase', color: '#60a5fa', background: 'rgba(59,130,246,0.12)',
      border: '1px solid rgba(59,130,246,0.2)', borderRadius: 3, padding: '2px 7px',
      marginBottom: 6,
    }}>
      {text}
    </span>
  );
}

// Divider
function Divider() {
  return <div style={{ borderTop: '1px solid #1e2a3a', margin: '10px 0' }} />;
}

// Structured Granite response card
function GraniteCard({ rec }: { rec: RecommendResult }) {
  const sections = parseGraniteResponse(rec.recommendation);
  const hasStructure = SECTION_KEYS.some(k => sections[k]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* If parsing works, show structured layout; else fall back to raw text */}
      {hasStructure ? (
        <>
          {sections['SUMMARY'] && (
            <div style={{ marginBottom: 14 }}>
              <SectionLabel text="Summary" />
              <p style={{ margin: 0, fontSize: 13, color: '#cbd5e1', lineHeight: 1.7 }}>
                {sections['SUMMARY']}
              </p>
            </div>
          )}

          {(sections['PRIMARY CONCERN'] || sections['SEVERITY']) && (
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14,
            }}>
              {sections['PRIMARY CONCERN'] && (
                <div style={{ background: '#0d1320', borderRadius: 6, padding: '10px 12px' }}>
                  <SectionLabel text="Primary Concern" />
                  <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
                    {sections['PRIMARY CONCERN']}
                  </p>
                </div>
              )}
              {sections['SEVERITY'] && (
                <div style={{ background: '#0d1320', borderRadius: 6, padding: '10px 12px' }}>
                  <SectionLabel text="Severity" />
                  <p style={{
                    margin: 0, fontSize: 13, fontWeight: 700, lineHeight: 1.6,
                    color: severityColor(sections['SEVERITY']),
                  }}>
                    {sections['SEVERITY']}
                  </p>
                </div>
              )}
            </div>
          )}

          {sections['RECOMMENDED ACTION'] && (
            <div style={{
              background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.18)',
              borderRadius: 6, padding: '12px 14px', marginBottom: 14,
            }}>
              <SectionLabel text="Recommended Action" />
              <p style={{ margin: 0, fontSize: 12, color: '#bfdbfe', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                {sections['RECOMMENDED ACTION']}
              </p>
            </div>
          )}

          {sections['SOURCE'] && (
            <div style={{ marginBottom: 10 }}>
              <SectionLabel text="Source" />
              <p style={{ margin: 0, fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
                {sections['SOURCE']}
              </p>
            </div>
          )}
        </>
      ) : (
        <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
          {rec.recommendation}
        </p>
      )}

      {/* Retrieved KB sources */}
      {rec.retrieved_sources.length > 0 && (
        <>
          <Divider />
          <div>
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#475569', marginBottom: 6,
            }}>
              Retrieved Knowledge Sources
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {rec.retrieved_sources.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'baseline', gap: 8,
                  fontSize: 11, color: '#64748b',
                }}>
                  <span style={{ color: '#3b82f6', flexShrink: 0 }}>↗</span>
                  <span>
                    {s.source}
                    {s.page != null && (
                      <span style={{ marginLeft: 6, fontSize: 10, color: '#475569' }}>p. {s.page}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AIAssistant() {
  const { selectedAstronaut: a } = useApp();

  // ── Free-text recommend query state ──
  const [query, setQuery] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [querySlow, setQuerySlow] = useState(false);
  const [queryResult, setQueryResult] = useState<RecommendResult | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ q: string; r: RecommendResult }[]>([]);

  // ── Live telemetry analysis state ──
  const COLD_START_MS = 15_000;
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeSlow, setAnalyzeSlow] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  // ── POST /recommend ──
  const handleQuery = async (q: string) => {
    if (!q.trim()) return;
    setQueryLoading(true);
    setQuerySlow(false);
    setQueryError(null);
    setQueryResult(null);

    const slowTimer = setTimeout(() => setQuerySlow(true), COLD_START_MS);

    const alertPayload = {
      person_id: a.id,
      raw_vitals: {
        hr: a.physiological.heartRate.current,
        spo2: a.physiological.spo2.current,
        resp_rr: a.physiological.respiratoryRate.current,
      },
      top_contributing_features: [{ feature: q, shap_value: 0 }],
      anomaly_score: 0,
      anomaly_pred: 1,
      system_attribution: {},
    };

    try {
      const res = await fetch(API_RECOMMEND, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert: alertPayload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `Server error ${res.status}`);
      const typed = data as RecommendResult;
      setQueryResult(typed);
      setHistory(prev => [{ q, r: typed }, ...prev.slice(0, 4)]);
      setQuery(q);
    } catch (err) {
      setQueryError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      clearTimeout(slowTimer);
      setQuerySlow(false);
      setQueryLoading(false);
    }
  };

  // ── POST /analyze ──
  const handleAnalyze = async () => {
    setAnalyzeLoading(true);
    setAnalyzeSlow(false);
    setAnalyzeError(null);
    setAnalyzeResult(null);

    const slowTimer = setTimeout(() => setAnalyzeSlow(true), COLD_START_MS);

    const reading = {
      person_id: a.id,
      ring: 1,
      start: Date.now() / 1000,
      hr: a.physiological.heartRate.current,
      spo2: a.physiological.spo2.current,
      resp_rr: a.physiological.respiratoryRate.current,
    };

    try {
      const res = await fetch(API_ANALYZE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reading, horizon_s: 300 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `Server error ${res.status}`);
      setAnalyzeResult(data as AnalyzeResult);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      clearTimeout(slowTimer);
      setAnalyzeSlow(false);
      setAnalyzeLoading(false);
    }
  };

  return (
    <div className="content-area">
      <div className="view-header">
        <div className="view-title">AstroTriage</div>
        <div className="view-subtitle">Protocol-grounded onboard decision support · Demonstration knowledge base</div>
      </div>

      <div className="grid-main-side">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── Live Telemetry Analysis ── */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 8 }}>Live Telemetry Analysis</div>

            {/* Current vitals summary row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {[
                { label: 'HR', value: `${a.physiological.heartRate.current}`, unit: 'bpm' },
                { label: 'SpO₂', value: `${a.physiological.spo2.current}`, unit: '%' },
                { label: 'RR', value: `${a.physiological.respiratoryRate.current}`, unit: '/min' },
              ].map(v => (
                <div key={v.label} style={{
                  flex: 1, background: '#0d1320', border: '1px solid #1e2a3a',
                  borderRadius: 6, padding: '8px 10px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                    {v.label}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', lineHeight: 1 }}>
                    {v.value}
                  </div>
                  <div style={{ fontSize: 9, color: '#475569', marginTop: 2 }}>{v.unit}</div>
                </div>
              ))}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={analyzeLoading}
              style={{
                width: '100%', padding: '9px 16px',
                background: analyzeLoading ? '#111827' : '#1e3a5f',
                border: `1px solid ${analyzeLoading ? '#1e2a3a' : '#3b82f6'}`,
                borderRadius: 5, color: analyzeLoading ? '#475569' : '#60a5fa',
                fontSize: 12, fontWeight: 600,
                cursor: analyzeLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {analyzeLoading ? 'Analyzing…' : '▶  Analyze with AI'}
            </button>

            {analyzeLoading && analyzeSlow && (
              <div style={{
                marginTop: 10, fontSize: 11, color: '#fb923c',
                background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)',
                borderRadius: 4, padding: '7px 10px',
              }}>
                Backend is waking up on Render — first request can take up to 60 s. Please wait…
              </div>
            )}

            {analyzeError && (
              <div style={{
                marginTop: 10, fontSize: 11, color: '#f87171',
                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: 4, padding: '7px 10px',
              }}>
                {analyzeError}
              </div>
            )}

            {/* ── Analysis results ── */}
            {analyzeResult && !analyzeLoading && (() => {
              const det = analyzeResult.detection;
              const fore = analyzeResult.forecast;
              const detColors = anomalyColor(det.anomaly_pred, det.anomaly_score);
              const foreColors = anomalyColor(fore.anomaly_pred, fore.anomaly_score);
              return (
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

                  {/* Detection + Forecast side by side */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>

                    {/* Detection */}
                    <div style={{
                      background: '#0a0f1a', border: `1px solid ${detColors.border}`,
                      borderRadius: 6, padding: '12px 14px',
                    }}>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569', marginBottom: 8 }}>
                        Current Detection
                      </div>
                      <div style={{
                        display: 'inline-block', fontSize: 11, fontWeight: 700,
                        background: detColors.bg, color: detColors.text,
                        border: `1px solid ${detColors.border}`,
                        borderRadius: 4, padding: '3px 9px', marginBottom: 8,
                      }}>
                        {anomalyLabel(det.anomaly_pred)}
                      </div>
                      <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>
                        Anomaly score: <span style={{ color: '#94a3b8', fontWeight: 600 }}>{det.anomaly_score}</span>
                      </div>
                      <Divider />
                      <div style={{ fontSize: 9, color: '#475569', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                        Top drivers
                      </div>
                      {det.top_contributing_features.map((f, i) => (
                        <div key={i} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          marginBottom: 4,
                        }}>
                          <span style={{ fontSize: 10, color: '#94a3b8' }}>{fmtFeature(f.feature)}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 600, fontFamily: 'monospace',
                            color: f.shap_value < 0 ? '#f87171' : '#fb923c',
                          }}>
                            {f.shap_value > 0 ? '+' : ''}{f.shap_value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Forecast */}
                    <div style={{
                      background: '#0a0f1a', border: `1px solid ${foreColors.border}`,
                      borderRadius: 6, padding: '12px 14px',
                    }}>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569', marginBottom: 8 }}>
                        5-Min Forecast
                      </div>
                      <div style={{
                        display: 'inline-block', fontSize: 11, fontWeight: 700,
                        background: foreColors.bg, color: foreColors.text,
                        border: `1px solid ${foreColors.border}`,
                        borderRadius: 4, padding: '3px 9px', marginBottom: 8,
                      }}>
                        {anomalyLabel(fore.anomaly_pred)}
                      </div>
                      <div style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
                        {Object.entries(fore.projected_vitals).map(([k, v]) => (
                          <div key={k}>
                            <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' }}>{k}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      <Divider />
                      {/* System attribution */}
                      {Object.entries(det.system_attribution).map(([sys, val]) => (
                        <div key={sys} style={{ marginBottom: 5 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={{ fontSize: 10, color: '#94a3b8', textTransform: 'capitalize' }}>{sys}</span>
                            <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}>{val.toFixed(3)}</span>
                          </div>
                          <div style={{ height: 3, background: '#1e2a3a', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: 2,
                              width: `${Math.min(100, Math.abs(val) * 300)}%`,
                              background: val < -0.05 ? '#f87171' : '#3b82f6',
                            }} />
                          </div>
                        </div>
                      ))}
                      <div style={{ fontSize: 9, color: '#334155', marginTop: 6, lineHeight: 1.5 }}>
                        {fore.note}
                      </div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div style={{
                    background: '#0a0f1a', border: '1px solid #1e3a5f',
                    borderRadius: 6, padding: '14px 16px',
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
                    }}>
                      <span style={{ fontSize: 13, color: '#3b82f6' }}>◆</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>Granite Recommendation</span>
                    </div>
                    <GraniteCard rec={analyzeResult.recommendation} />
                  </div>

                  {/* Disclaimer */}
                  <div style={{
                    background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.2)',
                    borderRadius: 5, padding: '8px 12px', fontSize: 11, color: '#f59e0b', lineHeight: 1.5,
                  }}>
                    ⚠ DECISION SUPPORT ONLY — All medical actions require flight surgeon authorization.
                  </div>

                </div>
              );
            })()}
          </div>

          {/* ── Free-text Query ── */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 10 }}>Query Medical Knowledge Base</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleQuery(query)}
                placeholder="Ask about spaceflight medical protocols, medications, emergency procedures…"
                style={{
                  flex: 1, background: '#0d1320', border: '1px solid #1e2a3a', borderRadius: 4,
                  color: '#e2e8f0', fontSize: 12, padding: '8px 12px',
                  outline: 'none', fontFamily: 'inherit',
                }}
              />
              <button
                onClick={() => handleQuery(query)}
                disabled={queryLoading}
                style={{
                  padding: '8px 16px', background: queryLoading ? '#111827' : '#1e3a5f',
                  border: `1px solid ${queryLoading ? '#1e2a3a' : '#3b82f6'}`,
                  borderRadius: 4, color: queryLoading ? '#475569' : '#60a5fa',
                  fontSize: 12, fontWeight: 600,
                  cursor: queryLoading ? 'not-allowed' : 'pointer', flexShrink: 0,
                  transition: 'all 0.15s',
                }}
              >
                {queryLoading ? 'Querying…' : 'Query'}
              </button>
            </div>
          </div>

          {/* Suggested queries */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 10 }}>Suggested Queries</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUGGESTED_QUERIES.map(q => (
                <button
                  key={q}
                  onClick={() => handleQuery(q)}
                  style={{
                    padding: '4px 10px', background: '#111827', border: '1px solid #1e2a3a',
                    borderRadius: 3, color: '#64748b', fontSize: 11, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseOver={e => {
                    (e.target as HTMLElement).style.borderColor = '#3b82f6';
                    (e.target as HTMLElement).style.color = '#60a5fa';
                  }}
                  onMouseOut={e => {
                    (e.target as HTMLElement).style.borderColor = '#1e2a3a';
                    (e.target as HTMLElement).style.color = '#64748b';
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Query loading */}
          {queryLoading && (
            <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
              <div style={{ fontSize: 13, color: '#60a5fa', marginBottom: 4 }}>Querying Granite via RAG…</div>
              <div style={{ fontSize: 11, color: '#475569' }}>Retrieving NASA reference material and generating response</div>
              {querySlow && (
                <div style={{
                  marginTop: 10, fontSize: 11, color: '#fb923c',
                  background: 'rgba(251,146,60,0.08)', borderRadius: 4, padding: '6px 10px', display: 'inline-block',
                }}>
                  Backend is waking up on Render — please wait up to 60 s…
                </div>
              )}
            </div>
          )}

          {/* Query error */}
          {queryError && !queryLoading && (
            <div className="card" style={{
              background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)',
            }}>
              <div style={{ fontSize: 11, color: '#f87171' }}>{queryError}</div>
            </div>
          )}

          {/* Query result */}
          {queryResult && !queryLoading && (
            <div className="card" style={{ border: '1px solid #1e3a5f' }}>
              {/* Header row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
                paddingBottom: 10, borderBottom: '1px solid #1e2a3a',
              }}>
                <span style={{ fontSize: 13, color: '#3b82f6' }}>◆</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>Granite Response</span>
              </div>

              {/* Query echo */}
              <div style={{
                background: '#0a0f1a', borderRadius: 4, padding: '8px 12px',
                marginBottom: 14, display: 'flex', gap: 8, alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 10, color: '#475569', flexShrink: 0, paddingTop: 1 }}>Query</span>
                <span style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>{query}</span>
              </div>

              <GraniteCard rec={queryResult} />

              {/* Disclaimer */}
              <div style={{
                marginTop: 14, background: 'rgba(251,146,60,0.06)',
                border: '1px solid rgba(251,146,60,0.2)', borderRadius: 5,
                padding: '8px 12px', fontSize: 11, color: '#f59e0b', lineHeight: 1.5,
              }}>
                ⚠ DECISION SUPPORT ONLY — All medical decisions require review and authorization by a qualified flight surgeon.
              </div>
            </div>
          )}

          {/* Query history */}
          {history.length > 1 && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>Recent Queries</div>
              {history.slice(1).map((h, i) => (
                <button
                  key={i}
                  onClick={() => { setQuery(h.q); setQueryResult(h.r); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '6px 8px', background: 'none', border: '1px solid #1e2a3a',
                    borderRadius: 3, color: '#64748b', fontSize: 11, cursor: 'pointer',
                    marginBottom: 4, transition: 'all 0.15s',
                  }}
                  onMouseOver={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#3b82f6';
                    (e.currentTarget as HTMLElement).style.color = '#94a3b8';
                  }}
                  onMouseOut={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#1e2a3a';
                    (e.currentTarget as HTMLElement).style.color = '#64748b';
                  }}
                >
                  {h.q}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Knowledge Base</div>
            {KNOWLEDGE_BASE.map(entry => (
              <div
                key={entry.id}
                onClick={() => handleQuery(entry.title)}
                style={{
                  padding: '8px 10px', border: '1px solid #1e2a3a', borderRadius: 4,
                  marginBottom: 6, cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseOver={e => (e.currentTarget.style.borderColor = '#3b82f6')}
                onMouseOut={e => (e.currentTarget.style.borderColor = '#1e2a3a')}
              >
                <div style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 500, marginBottom: 2 }}>
                  {entry.title}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{
                    fontSize: 9, background: '#1e2d45', color: '#60a5fa',
                    borderRadius: 2, padding: '1px 5px',
                  }}>
                    {entry.category}
                  </span>
                  <span style={{ fontSize: 9, color: '#334155' }}>
                    {entry.source.split('—')[0].trim()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{
            background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#60a5fa', marginBottom: 6 }}>
              Backend: Granite 4 + RAG
            </div>
            <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.65 }}>
              Queries and telemetry analysis are processed by IBM Granite 4 via Watson.ai, grounded on NASA
              reference material retrieved from a Chroma vector store. Anomaly detection uses an Isolation
              Forest model trained on simulated spaceflight telemetry.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
