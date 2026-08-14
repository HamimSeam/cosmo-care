'use client';

import { useApp } from '@/context/AppContext';
import type { Astronaut } from '@/types';

function ScoreRing({ score, size = 64, label }: { score: number; size?: number; label?: string }) {
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dash = pct * circ;
  const gap = circ - dash;
  const color = score >= 80 ? '#34d399' : score >= 65 ? '#fbbf24' : score >= 45 ? '#fb923c' : '#f87171';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e2a3a" strokeWidth={5} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={`${dash} ${gap}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
        <text
          x={size/2} y={size/2 + 5}
          textAnchor="middle" fill={color}
          fontSize={size < 60 ? 14 : 18} fontWeight={700}
          style={{ transform: 'rotate(90deg)', transformOrigin: `${size/2}px ${size/2}px` }}
        >
          {score}
        </text>
      </svg>
      {label && <span style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>}
    </div>
  );
}

function StatusBadge({ status }: { status: Astronaut['healthStatus'] }) {
  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    GREEN:  { bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.3)',  text: '#34d399' },
    YELLOW: { bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)',  text: '#fbbf24' },
    ORANGE: { bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.3)',  text: '#fb923c' },
    RED:    { bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', text: '#f87171' },
  };
  const colors = colorMap[status];
  return (
    <span style={{
      background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text,
      borderRadius: 3, padding: '1px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
    }}>
      {status}
    </span>
  );
}

function AstronautCard({ astronaut, isSelected, onClick }: { astronaut: Astronaut; isSelected: boolean; onClick: () => void }) {
  const hasAlert = astronaut.alerts.length > 0;
  const isEmergency = astronaut.healthStatus === 'RED';

  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? '#0d1f35' : 'var(--surface)',
        border: `1px solid ${isSelected ? '#3b82f6' : isEmergency ? 'rgba(248,113,113,0.4)' : 'var(--border)'}`,
        borderRadius: 6, padding: 16, cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e3a5f, #0891b2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#e2e8f0', flexShrink: 0,
          }}>
            {astronaut.avatar}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{astronaut.name}</div>
            <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{astronaut.role}</div>
          </div>
        </div>
        <StatusBadge status={astronaut.healthStatus} />
      </div>

      {/* Scores row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
        {[
          { label: 'Health', value: astronaut.overallHealthScore },
          { label: 'Recovery', value: astronaut.recovery.recoveryScore },
          { label: 'Readiness', value: astronaut.missionReadiness.score },
        ].map(({ label, value }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: value >= 80 ? '#34d399' : value >= 60 ? '#fbbf24' : value >= 40 ? '#fb923c' : '#f87171' }}>
              {value}
            </div>
            <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Alert */}
      {hasAlert ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: isEmergency ? 'rgba(220,38,38,0.1)' : 'rgba(251,146,60,0.1)',
          border: `1px solid ${isEmergency ? 'rgba(220,38,38,0.3)' : 'rgba(251,146,60,0.3)'}`,
          borderRadius: 4, padding: '4px 8px',
        }}>
          <span style={{ fontSize: 10 }}>{isEmergency ? '⚠' : '◉'}</span>
          <span style={{ fontSize: 10, color: isEmergency ? '#f87171' : '#fb923c', fontWeight: 500 }}>
            {astronaut.alerts[0]?.title.slice(0, 45)}...
          </span>
        </div>
      ) : (
        <div style={{
          background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)',
          borderRadius: 4, padding: '4px 8px',
        }}>
          <span style={{ fontSize: 10, color: '#34d399' }}>No active alerts</span>
        </div>
      )}
    </div>
  );
}

export default function MissionOverview() {
  const { astronauts, state, selectAstronaut, setNav } = useApp();

  const critical = astronauts.filter(a => a.healthStatus === 'RED');
  const elevated = astronauts.filter(a => a.healthStatus === 'ORANGE');
  const monitored = astronauts.filter(a => a.healthStatus === 'YELLOW');
  const nominal = astronauts.filter(a => a.healthStatus === 'GREEN');

  return (
    <div className="content-area">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>Mission Overview</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>
          AI-powered health intelligence — Mission Day {state.missionDay} · 4 crew members monitored
        </div>
      </div>

      {/* Status summary */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Nominal', count: nominal.length, color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
          { label: 'Monitor', count: monitored.length, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)' },
          { label: 'Elevated Risk', count: elevated.length, color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)' },
          { label: 'Critical', count: critical.length, color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ background: s.bg, border: `1px solid ${s.border}`, textAlign: 'center', padding: '12px 16px' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 10, color: s.color, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Crew cards */}
      <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Crew Health Status</div>
      <div className="grid-2">
        {astronauts.map(a => (
          <AstronautCard
            key={a.id}
            astronaut={a}
            isSelected={state.selectedAstronautId === a.id}
            onClick={() => { selectAstronaut(a.id); setNav('crew-health'); }}
          />
        ))}
      </div>

      {/* AI System note */}
      <div className="card" style={{ marginTop: 20, background: 'rgba(30,45,69,0.5)', border: '1px solid #1e2d45' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ color: '#3b82f6', fontSize: 16, flexShrink: 0 }}>◆</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#60a5fa', marginBottom: 4 }}>COSMOCARE AI — SYSTEM NOTICE</div>
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
              CosmoCare AI provides health intelligence and decision support for flight medical personnel. All AI-generated assessments represent potential risks based on personalized baseline analysis and require review by a qualified flight surgeon or medical professional.
              <strong style={{ color: '#94a3b8' }}> CosmoCare AI does not diagnose or prescribe treatment.</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
