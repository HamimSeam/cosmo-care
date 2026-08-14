'use client';

import { useApp } from '@/context/AppContext';
import { analyzeHealthRisk } from '@/lib/aiEngine';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, type TooltipProps } from 'recharts';

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
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>Health Intelligence</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>AI-powered multivariate pattern analysis · {a.name}</div>
      </div>

      {/* Risk summary */}
      <div style={{ background: rc.bg, border: `1px solid ${rc.border}`, borderRadius: 6, padding: 16, marginBottom: 20 }}>
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
  const CustomTooltip = ({ active, payload, label }: any) => {
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
  };

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
          <Tooltip content={<CustomTooltip />} />
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
