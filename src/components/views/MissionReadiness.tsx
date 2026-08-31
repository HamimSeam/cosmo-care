'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { computeReadiness } from '@/lib/aiEngine';
import type { MissionActivity } from '@/types';

const ACTIVITIES: { id: MissionActivity; label: string; desc: string }[] = [
  { id: 'EVA',              label: 'EVA',                  desc: 'Extravehicular Activity — 4–8 hour spacewalk' },
  { id: 'SPACEWALK',        label: 'Spacewalk',            desc: 'Unscheduled external work' },
  { id: 'MAINTENANCE',      label: 'High-Precision Maint.', desc: 'Critical system maintenance requiring fine motor control' },
  { id: 'EMERGENCY_REPAIR', label: 'Emergency Repair',     desc: 'Emergency system repair — high physical and cognitive demand' },
  { id: 'SCIENCE',          label: 'Scientific Experiment', desc: 'Precision laboratory experiment — moderate demand' },
];

export default function MissionReadiness() {
  const { selectedAstronaut: a } = useApp();
  const [selectedActivity, setSelectedActivity] = useState<MissionActivity>('EVA');
  const [showExplainer, setShowExplainer] = useState(false);

  const evaluation = computeReadiness(a, selectedActivity);

  const statusColors = {
    RECOMMENDED:     { bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.3)',  text: '#34d399', label: 'RECOMMENDED' },
    CONDITIONAL:     { bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)',  text: '#fbbf24', label: 'CONDITIONAL' },
    NOT_RECOMMENDED: { bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.3)',  text: '#fb923c', label: 'NOT RECOMMENDED' },
    PROHIBITED:      { bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', text: '#f87171', label: 'PROHIBITED' },
  };
  const sc = statusColors[evaluation.status];

  return (
    <div className="content-area">
      <div className="view-header">
        <div className="view-title">Mission Readiness</div>
        <div className="view-subtitle">AI activity clearance evaluation · {a.name}</div>
      </div>

      <div className="grid-main-side">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Activity selector */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Select Mission Activity</div>
            {ACTIVITIES.map(act => (
              <button
                key={act.id}
                className="hud-choice"
                onClick={() => setSelectedActivity(act.id)}
                style={{
                  background: selectedActivity === act.id ? 'rgba(77,232,208,0.07)' : 'transparent',
                  borderColor: selectedActivity === act.id ? 'var(--accent-border)' : undefined,
                }}
              >
                <span style={{ fontSize: 10, color: selectedActivity === act.id ? '#60a5fa' : '#475569', flexShrink: 0, marginTop: 2 }}>
                  {selectedActivity === act.id ? '◉' : '○'}
                </span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: selectedActivity === act.id ? '#e2e8f0' : '#94a3b8' }}>{act.label}</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>{act.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Evaluation result */}
          <div className="readiness-focus" style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                {selectedActivity} READINESS — {a.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <ReadinessScore score={evaluation.score} />
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: sc.text, marginBottom: 4 }}>{sc.label}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6, maxWidth: 380 }}>
                    {evaluation.recommendation}
                  </div>
                </div>
              </div>
            </div>

            {/* Contributing factors */}
            {evaluation.contributingFactors.length > 0 && evaluation.contributingFactors[0] !== 'All metrics within acceptable range' && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}>
                <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  Contributing Factors
                  <button
                    onClick={() => setShowExplainer(!showExplainer)}
                    style={{ marginLeft: 8, fontSize: 9, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {showExplainer ? 'Hide' : 'Why?'}
                  </button>
                </div>
                {evaluation.contributingFactors.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 4 }}>
                    <span style={{ color: sc.text, flexShrink: 0, fontSize: 8, marginTop: 3 }}>▶</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{f}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Explainer */}
            {showExplainer && (
              <div style={{ marginTop: 12, background: 'rgba(30,45,69,0.5)', borderRadius: 4, padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#60a5fa', marginBottom: 6 }}>Why was this readiness score calculated?</div>
                <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
                  The readiness score is computed by evaluating {a.name}&apos;s current physiological state, personal baseline deviations, recovery score, sleep status, cognitive performance, and any active medical events against the requirements of the selected activity. Each factor contributes a weighted deduction from a maximum score of 100. The evaluation uses {a.name}&apos;s personal baseline, not universal thresholds.
                </div>
              </div>
            )}
          </div>

          {/* What-if simulation */}
          <div className="card">
            <div style={{ marginBottom: 12 }}>
              <div className="card-title">What-If Simulation</div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>Projected readiness after rest/recovery delay</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
              {[
                { label: 'Now', value: evaluation.score },
                { label: '+3 Hours', value: evaluation.whatIfSimulation.delay3h },
                { label: '+6 Hours', value: evaluation.whatIfSimulation.delay6h },
                { label: '+12 Hours', value: evaluation.whatIfSimulation.delay12h },
              ].map(item => {
                const c = item.value >= 85 ? '#34d399' : item.value >= 70 ? '#fbbf24' : item.value >= 40 ? '#fb923c' : '#f87171';
                const isImproved = item.value > evaluation.score;
                return (
                  <div key={item.label} style={{ textAlign: 'center', background: 'rgba(30,45,69,0.3)', borderRadius: 4, padding: '10px 8px' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{item.value}</div>
                    <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', marginBottom: 3 }}>{item.label}</div>
                    {isImproved && (
                      <div style={{ fontSize: 9, color: '#34d399' }}>+{item.value - evaluation.score}</div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 10, fontSize: 10, color: '#334155', fontStyle: 'italic' }}>
              ⚠ Projections are estimates based on expected physiological recovery trajectory. Actual recovery may differ. Flight surgeon verification recommended before proceeding.
            </div>
          </div>
        </div>

        {/* Right: Crew readiness summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CrewReadinessSummary activity={selectedActivity} />

          {/* Readiness breakdown */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Readiness Breakdown</div>
            {[
              { label: 'Physiological', value: Math.min(100, Math.max(0, 100 + a.physiological.restingHR.deviationPct * -0.4 + a.physiological.spo2.deviationPct * 2)) },
              { label: 'Recovery', value: a.recovery.recoveryScore },
              { label: 'Cognitive', value: a.cognitive.cognitiveReadiness },
              { label: 'Sleep', value: Math.min(100, Math.max(0, 100 + a.recovery.sleepDuration.deviationPct * 1.5)) },
            ].map(item => {
              const c = item.value >= 80 ? '#34d399' : item.value >= 60 ? '#fbbf24' : item.value >= 40 ? '#fb923c' : '#f87171';
              return (
                <div key={item.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{item.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: c }}>{Math.round(item.value)}</span>
                  </div>
                  <div style={{ height: 4, background: '#1e2a3a', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round(item.value)}%`, background: c, borderRadius: 2, transition: 'width 0.5s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadinessScore({ score }: { score: number }) {
  const color = score >= 85 ? '#34d399' : score >= 70 ? '#fbbf24' : score >= 40 ? '#fb923c' : '#f87171';
  const r = 38;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dash = pct * circ;
  const gap = circ - dash;

  return (
    <div style={{ flexShrink: 0 }}>
      <svg width={90} height={90} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={45} cy={45} r={r} fill="none" stroke="#1e2a3a" strokeWidth={6} />
        <circle cx={45} cy={45} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${gap}`} strokeLinecap="round" />
        <text x={45} y={50} textAnchor="middle" fill={color} fontSize={20} fontWeight={700}
          style={{ transform: 'rotate(90deg)', transformOrigin: '45px 45px' }}>{score}</text>
      </svg>
    </div>
  );
}

function CrewReadinessSummary({ activity }: { activity: MissionActivity }) {
  const { astronauts } = useApp();
  return (
    <div className="card">
      <div className="card-title" style={{ marginBottom: 12 }}>Crew {activity} Readiness</div>
      {astronauts.map(a => {
        const ev = computeReadiness(a, activity);
        const sc = {
          RECOMMENDED:     '#34d399',
          CONDITIONAL:     '#fbbf24',
          NOT_RECOMMENDED: '#fb923c',
          PROHIBITED:      '#f87171',
        }[ev.status];
        return (
          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ fontSize: 11, flex: 1, color: '#94a3b8' }}>{a.name}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: sc, width: 36, textAlign: 'right' }}>{ev.score}</div>
            <div style={{ fontSize: 9, color: sc, width: 90, textAlign: 'right' }}>{ev.status.replace('_', ' ')}</div>
          </div>
        );
      })}
    </div>
  );
}
