'use client';

import { useApp } from '@/context/AppContext';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, type TooltipProps } from 'recharts';

export default function RecoveryView() {
  const { selectedAstronaut: a } = useApp();
  const { physiological: p, recovery: r, cognitive: cog, symptoms: sym } = a;

  const recoveryColor = r.recoveryScore >= 80 ? '#34d399' : r.recoveryScore >= 65 ? '#fbbf24' : r.recoveryScore >= 45 ? '#fb923c' : '#f87171';

  // Build recovery trend data from available trends
  const days = ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'Today'];
  const trendData = days.map((d, i) => ({
    day: d,
    hr: p.restingHR.trend[i],
    hrv: p.hrv.trend[i],
    spo2: p.spo2.trend[i],
    sleep: r.sleepDuration.trend[i],
    fatigue: cog.fatigueLevel.trend[i],
  }));

  const isInRecovery = a.medicalEvents.some(e => ['ACTIVE', 'IMPROVING'].includes(e.currentStatus));

  return (
    <div className="content-area">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>Recovery</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>Recovery tracking vs personal baseline · {a.name}</div>
      </div>

      {/* Recovery score overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 16px' }}>
          <RecoveryRingLarge score={r.recoveryScore} status={r.recoveryStatus} />
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 10 }}>Recovery Status</div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.7, marginBottom: 12 }}>
            {r.recoveryScore >= 85
              ? `${a.name} is showing optimal recovery. All physiological markers are within or above personal baseline.`
              : r.recoveryScore >= 70
              ? `${a.name} is in a good recovery state. Minor deviations from baseline are present but not clinically significant.`
              : r.recoveryScore >= 50
              ? `${a.name} has a reduced recovery score. Multiple physiological indicators are below personal baseline. Increased monitoring recommended.`
              : `${a.name} has a critically low recovery score. Significant physiological deviations are present. Medical assessment and mandatory rest required.`}
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Recovery Factors</div>
            {r.recoveryFactors.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                <span style={{
                  color: f.impact === 'positive' ? '#34d399' : f.impact === 'negative' ? '#f87171' : '#64748b',
                  fontSize: 10, flexShrink: 0, marginTop: 2,
                }}>
                  {f.impact === 'positive' ? '▲' : f.impact === 'negative' ? '▼' : '—'}
                </span>
                <div>
                  <span style={{ fontSize: 11, color: '#e2e8f0' }}>{f.label}: </span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{f.description}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(30,45,69,0.4)', borderRadius: 4, padding: '6px 10px', fontSize: 10, color: '#475569', fontStyle: 'italic' }}>
            Recovery Score ≠ Overall Health. A crewmember may be medically healthy but have a low recovery score if sleep, HRV, or workload patterns are suboptimal.
          </div>
        </div>
      </div>

      {/* Metrics vs baseline */}
      <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
        Current vs Personal Baseline
      </div>
      <div className="grid-3" style={{ marginBottom: 20 }}>
        {[
          {
            label: 'Resting HR',
            current: p.restingHR.current,
            baseline: `${p.restingHR.baseline.min}–${p.restingHR.baseline.max}`,
            unit: 'bpm',
            dev: p.restingHR.deviationPct,
            trend: p.restingHR.trend,
            color: Math.abs(p.restingHR.deviationPct) > 20 ? '#f87171' : Math.abs(p.restingHR.deviationPct) > 10 ? '#fbbf24' : '#34d399',
          },
          {
            label: 'HRV',
            current: p.hrv.current,
            baseline: `${p.hrv.baseline.min}–${p.hrv.baseline.max}`,
            unit: 'ms',
            dev: p.hrv.deviationPct,
            trend: p.hrv.trend,
            color: p.hrv.deviationPct < -35 ? '#f87171' : p.hrv.deviationPct < -20 ? '#fbbf24' : '#34d399',
          },
          {
            label: 'SpO2',
            current: p.spo2.current,
            baseline: `${p.spo2.baseline.min}–${p.spo2.baseline.max}`,
            unit: '%',
            dev: p.spo2.deviationPct,
            trend: p.spo2.trend,
            color: p.spo2.current < 95 ? '#f87171' : p.spo2.current < 97 ? '#fbbf24' : '#34d399',
          },
          {
            label: 'Temperature',
            current: p.temperature.current,
            baseline: `${p.temperature.baseline.min}–${p.temperature.baseline.max}`,
            unit: '°C',
            dev: Math.round(((p.temperature.current - p.temperature.baseline.mean) / p.temperature.baseline.mean) * 100),
            trend: p.temperature.trend,
            color: p.temperature.current > 37.8 ? '#f87171' : p.temperature.current > 37.4 ? '#fbbf24' : '#34d399',
          },
          {
            label: 'Sleep Duration',
            current: r.sleepDuration.current,
            baseline: `${r.sleepDuration.baseline.min}–${r.sleepDuration.baseline.max}`,
            unit: 'hrs',
            dev: r.sleepDuration.deviationPct,
            trend: r.sleepDuration.trend,
            color: r.sleepDuration.deviationPct < -25 ? '#f87171' : r.sleepDuration.deviationPct < -10 ? '#fbbf24' : '#34d399',
          },
          {
            label: 'Fatigue',
            current: cog.fatigueLevel.current,
            baseline: `${cog.fatigueLevel.baseline.min}–${cog.fatigueLevel.baseline.max}`,
            unit: '/10',
            dev: cog.fatigueLevel.deviationPct,
            trend: cog.fatigueLevel.trend,
            color: cog.fatigueLevel.current >= 7 ? '#f87171' : cog.fatigueLevel.current >= 5 ? '#fbbf24' : '#34d399',
          },
        ].map(item => (
          <div key={item.label} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>{item.label}</div>
              <div style={{ fontSize: 9, color: '#334155' }}>Baseline: {item.baseline}</div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: item.color, marginBottom: 4 }}>
              {typeof item.current === 'number' ? item.current.toFixed(item.unit === '°C' || item.unit === 'hrs' ? 1 : 0) : item.current}
              <span style={{ fontSize: 11, fontWeight: 400, color: '#475569', marginLeft: 3 }}>{item.unit}</span>
            </div>
            <div style={{ fontSize: 10, color: Math.abs(item.dev) <= 5 ? '#334155' : item.color, marginBottom: 8 }}>
              {item.dev > 0 ? '+' : ''}{item.dev}% from baseline
            </div>
            {/* Mini sparkline */}
            <ResponsiveContainer width="100%" height={40}>
              <LineChart data={item.trend.map((v, i) => ({ i, v }))}>
                <Line type="monotone" dataKey="v" stroke={item.color} strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* Cognitive recovery */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title" style={{ marginBottom: 12 }}>Cognitive Recovery</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Cognitive Readiness</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: cog.cognitiveReadiness >= 80 ? '#34d399' : cog.cognitiveReadiness >= 60 ? '#fbbf24' : '#f87171' }}>
                  {cog.cognitiveReadiness}
                </div>
                <div style={{ fontSize: 10, color: '#475569' }}>/100</div>
              </div>
            </div>
            {cog.cognitiveReadinessFactors.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
                <span style={{ color: '#334155', fontSize: 8, flexShrink: 0, marginTop: 3 }}>·</span>
                <span style={{ fontSize: 11, color: '#64748b' }}>{f}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Reaction Time</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: cog.reactionTime.deviationPct > 20 ? '#f87171' : cog.reactionTime.deviationPct > 10 ? '#fbbf24' : '#34d399', marginBottom: 4 }}>
              {cog.reactionTime.current} ms
            </div>
            <div style={{ fontSize: 10, color: '#475569', marginBottom: 8 }}>
              Baseline: {cog.reactionTime.baseline.min}–{cog.reactionTime.baseline.max} ms
              {' · '}{cog.reactionTime.deviationPct > 0 ? '+' : ''}{cog.reactionTime.deviationPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Recovery projection */}
      {isInRecovery && (
        <div className="card" style={{ background: 'rgba(30,45,69,0.5)', border: '1px solid #1e2d45' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <span style={{ color: '#3b82f6' }}>◆</span>
            <div className="card-title">AI Recovery Projection</div>
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.7, marginBottom: 8 }}>
            Based on current recovery trajectory and historical response patterns, continued improvement is projected if rest protocols are maintained. Physiological metrics are expected to return toward personal baseline within 24–48 hours with adequate sleep, hydration, and workload reduction.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { label: 'In 6h', value: Math.min(100, r.recoveryScore + 10), color: '#fbbf24' },
              { label: 'In 12h', value: Math.min(100, r.recoveryScore + 22), color: '#fbbf24' },
              { label: 'In 24h', value: Math.min(100, r.recoveryScore + 38), color: '#34d399' },
            ].map(item => (
              <div key={item.label} style={{ background: '#0d1320', borderRadius: 4, padding: '8px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' }}>{item.label} (projected)</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 10, color: '#334155', fontStyle: 'italic' }}>
            ⚠ Recovery projections are estimates. Cognitive performance recovery may lag physiological recovery by 4–6 hours.
          </div>
        </div>
      )}
    </div>
  );
}

function RecoveryRingLarge({ score, status }: { score: number; status: string }) {
  const color = score >= 80 ? '#34d399' : score >= 65 ? '#fbbf24' : score >= 45 ? '#fb923c' : '#f87171';
  const r = 55;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dash = pct * circ;
  const gap = circ - dash;

  const statusLabels: Record<string, string> = {
    PEAK: 'PEAK', GOOD: 'GOOD', REDUCED: 'REDUCED', LOW: 'LOW', POOR: 'POOR'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={130} height={130} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={65} cy={65} r={r} fill="none" stroke="#1e2a3a" strokeWidth={8} />
        <circle cx={65} cy={65} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${gap}`} strokeLinecap="round" />
        <text x={65} y={72} textAnchor="middle" fill={color} fontSize={28} fontWeight={700}
          style={{ transform: 'rotate(90deg)', transformOrigin: '65px 65px' }}>{score}</text>
      </svg>
      <div style={{ fontSize: 13, color, fontWeight: 700 }}>{statusLabels[status] || status}</div>
      <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recovery Score</div>
    </div>
  );
}
