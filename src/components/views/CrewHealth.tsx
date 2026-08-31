'use client';

import { useApp } from '@/context/AppContext';
import type { MetricWithBaseline } from '@/types';
import { symptomColor, symptomLabel } from '@/lib/utils';
import {
  LineChart, Line, ResponsiveContainer
} from 'recharts';

function MetricRow({ metric }: { metric: MetricWithBaseline }) {
  const isAbove = metric.deviationPct > 0;
  const devAbs = Math.abs(metric.deviationPct);
  const statusColor = ({
    GREEN: '#34d399', YELLOW: '#fbbf24', ORANGE: '#fb923c', RED: '#f87171'
  } as Record<string, string>)[metric.status] ?? '#94a3b8';

  const sparkData = metric.trend.map((v: number, i: number) => ({ v, i }));

  return (
    <div className="data-row" style={{ alignItems: 'center' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>{metric.label}</div>
        <div style={{ fontSize: 10, color: '#475569' }}>
          Baseline: {metric.baseline.min}–{metric.baseline.max} {metric.unit}
        </div>
      </div>

      {/* Sparkline */}
      <div style={{ width: 60, height: 28 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkData}>
            <Line type="monotone" dataKey="v" stroke={statusColor} strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Current + deviation */}
      <div style={{ textAlign: 'right', minWidth: 80 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: statusColor }}>
          {typeof metric.current === 'number' ? metric.current.toFixed(metric.unit === '°C' ? 1 : 0) : metric.current}
          <span style={{ fontSize: 10, fontWeight: 400, color: '#64748b', marginLeft: 2 }}>{metric.unit}</span>
        </div>
        {devAbs > 1 && (
          <div style={{ fontSize: 10, color: statusColor }}>
            {isAbove ? '+' : ''}{metric.deviationPct}% baseline
          </div>
        )}
        {devAbs <= 1 && (
          <div style={{ fontSize: 10, color: '#334155' }}>Within baseline</div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="card-title">{title}</div>
      {subtitle && <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{subtitle}</div>}
    </div>
  );
}

export default function CrewHealth() {
  const { selectedAstronaut: a } = useApp();
  const { physiological: p, activity: act, recovery: r, environmental: env, cognitive: cog, symptoms: sym } = a;

  const statusColor = { GREEN: '#34d399', YELLOW: '#fbbf24', ORANGE: '#fb923c', RED: '#f87171' }[a.healthStatus];

  return (
    <div className="content-area">
      {/* Header */}
      <div className="view-header crew-view-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e3a5f, #0891b2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#e2e8f0',
            }}>
              {a.avatar}
            </div>
            <div>
              <div className="view-title">{a.name}</div>
              <div className="view-subtitle" style={{ textTransform: 'uppercase' }}>
                {a.role} · Mission Day {a.missionDay}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Health score */}
          <div className="telemetry-chip" style={{ textAlign: 'center', padding: '10px 16px' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: statusColor }}>{a.overallHealthScore}</div>
            <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' }}>Health Score</div>
          </div>
          <div className="telemetry-chip" style={{
            textAlign: 'center', borderColor: `${statusColor}30`, padding: '10px 16px',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: statusColor }}>{a.healthStatus}</div>
            <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' }}>Status</div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {a.alerts.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {a.alerts.map(alert => {
            const alertColors = {
              LOW:      { bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.3)',  text: '#34d399' },
              MODERATE: { bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)',  text: '#fbbf24' },
              ELEVATED: { bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.3)',  text: '#fb923c' },
              CRITICAL: { bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', text: '#f87171' },
            }[alert.riskLevel];

            return (
              <div key={alert.id} className="health-alert-panel slide-in-top" style={{ background: alertColors.bg, border: `1px solid ${alertColors.border}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ background: alertColors.bg, border: `1px solid ${alertColors.border}`, color: alertColors.text, borderRadius: 3, padding: '1px 6px', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em' }}>
                        {alert.riskLevel} RISK
                      </span>
                      <span style={{ fontSize: 10, color: '#64748b' }}>Confidence: {alert.confidence}%</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>{alert.title}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6, marginBottom: 8 }}>{alert.summary}</div>
                    <div style={{ marginBottom: 6 }}>
                      <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Contributing Factors</div>
                      {alert.contributingFactors.map((f, i) => (
                        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 2 }}>
                          <span style={{ color: alertColors.text, flexShrink: 0, marginTop: 2, fontSize: 8 }}>▶</span>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>{f}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: 'rgba(30,42,58,0.5)', borderRadius: 4, padding: '6px 10px' }}>
                      <span style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recommended Action: </span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{alert.recommendation}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main grid */}
      <div className="grid-main-side">
        {/* Left: Physiological */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Vital signs */}
          <div className="card">
            <SectionHeader title="Physiological — Primary Vitals" subtitle="Current vs personal baseline" />
            {[p.heartRate, p.restingHR, p.spo2, p.temperature, p.systolicBP, p.diastolicBP].map(m => (
              <MetricRow key={m.label} metric={m} />
            ))}
          </div>

          {/* Secondary physio */}
          <div className="card">
            <SectionHeader title="Physiological — Secondary" />
            {[p.respiratoryRate, p.hrv, p.hydration, p.weight].map(m => (
              <MetricRow key={m.label} metric={m} />
            ))}
          </div>

          {/* Activity */}
          <div className="card">
            <SectionHeader title="Activity & Workload" />
            {[act.exerciseDuration, act.exerciseIntensity, act.dailyActivity, act.workload].map(m => (
              <MetricRow key={m.label} metric={m} />
            ))}
          </div>

          {/* Environmental */}
          <div className="card">
            <SectionHeader title="Environmental" />
            {[env.co2Level, env.radiationExposure, env.cabinTemp, env.humidity, env.airQuality].map(m => (
              <MetricRow key={m.label} metric={m} />
            ))}
          </div>
        </div>

        {/* Right: Recovery + Cognitive + Symptoms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Recovery score */}
          <div className="card">
            <SectionHeader title="Recovery Score" />
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <RecoveryGauge score={r.recoveryScore} status={r.recoveryStatus} />
            </div>
            <div style={{ marginBottom: 8 }}>
              {r.recoveryFactors.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 5 }}>
                  <span style={{
                    color: f.impact === 'positive' ? '#34d399' : f.impact === 'negative' ? '#f87171' : '#64748b',
                    fontSize: 10, flexShrink: 0, marginTop: 1,
                  }}>
                    {f.impact === 'positive' ? '▲' : f.impact === 'negative' ? '▼' : '—'}
                  </span>
                  <div>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{f.label}: </span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{f.description}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 10, color: '#334155', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
              Note: Recovery Score reflects physiological recovery state, not overall health status.
            </div>
          </div>

          {/* Sleep */}
          <div className="card">
            <SectionHeader title="Sleep" />
            <MetricRow metric={r.sleepDuration} />
            <MetricRow metric={r.sleepQuality} />
          </div>

          {/* Cognitive */}
          <div className="card">
            <SectionHeader title="Cognitive Readiness" />
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: cog.cognitiveReadiness >= 80 ? '#34d399' : cog.cognitiveReadiness >= 60 ? '#fbbf24' : '#f87171' }}>
                  {cog.cognitiveReadiness}
                </div>
                <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' }}>/ 100</div>
              </div>
              <div>
                {cog.cognitiveReadinessFactors.map((f, i) => (
                  <div key={i} style={{ fontSize: 10, color: '#64748b', marginBottom: 3, display: 'flex', gap: 4 }}>
                    <span style={{ color: '#334155', flexShrink: 0 }}>·</span>{f}
                  </div>
                ))}
              </div>
            </div>
            <MetricRow metric={cog.reactionTime} />
            <MetricRow metric={cog.fatigueLevel} />
          </div>

          {/* Symptoms */}
          <div className="card">
            <SectionHeader title="Self-Reported Symptoms" />
            {[
              { label: 'Fatigue', value: sym.fatigue },
              { label: 'Headache', value: sym.headache },
              { label: 'Dizziness', value: sym.dizziness },
              { label: 'Nausea', value: sym.nausea },
              { label: 'Cough', value: sym.cough },
              { label: 'Sore Throat', value: sym.soreThroat },
              { label: 'Shortness of Breath', value: sym.shortnessOfBreath },
            ].map(s => (
              <div key={s.label} className="data-row">
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{s.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 60, height: 4, background: '#1e2a3a', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 2,
                      width: `${(s.value / 10) * 100}%`,
                      background: s.value === 0 ? '#1e2a3a' : s.value <= 2 ? '#fbbf24' : s.value <= 5 ? '#fb923c' : '#f87171',
                      transition: 'width 0.3s',
                    }} />
                  </div>
                  <span style={{ fontSize: 11, minWidth: 50, color: symptomColor(s.value) }}>
                    {s.value > 0 ? `${s.value}/10 · ` : ''}{symptomLabel(s.value)}
                  </span>
                </div>
              </div>
            ))}
            {sym.other.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 10, color: '#64748b' }}>Other: </span>
                {sym.other.map(s => (
                  <span key={s} style={{ fontSize: 10, color: '#fb923c', marginRight: 8 }}>{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecoveryGauge({ score, status }: { score: number; status: string }) {
  const color = score >= 80 ? '#34d399' : score >= 65 ? '#fbbf24' : score >= 45 ? '#fb923c' : '#f87171';
  const statusLabel = {
    PEAK: 'PEAK', GOOD: 'GOOD', REDUCED: 'REDUCED', LOW: 'LOW', POOR: 'POOR'
  }[status] || status;

  const r = 42;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dash = pct * circ;
  const gap = circ - dash;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={100} height={100} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={50} cy={50} r={r} fill="none" stroke="#1e2a3a" strokeWidth={7} />
        <circle
          cx={50} cy={50} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${dash} ${gap}`} strokeLinecap="round"
        />
        <text x={50} y={55} textAnchor="middle" fill={color} fontSize={22} fontWeight={700}
          style={{ transform: 'rotate(90deg)', transformOrigin: '50px 50px' }}>
          {score}
        </text>
      </svg>
      <div style={{ fontSize: 11, color, fontWeight: 600 }}>{statusLabel}</div>
    </div>
  );
}
