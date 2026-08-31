'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useApp } from '@/context/AppContext';
import type { Astronaut, HealthStatus } from '@/types';
import {
  HUDPanel,
  HUDLabel,
  HUDMetricValue,
  HUDStatusDot,
  HUDStatusBadge,
  HUDDivider,
  CommDelayBanner,
  STATUS_LABEL,
  STATUS_GLOW,
} from '@/design-system';

// Load the 3D viewer client-side only — Three.js requires browser APIs
const SpacecraftViewer = dynamic(() => import('@/components/SpacecraftViewer'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'transparent',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#334155', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
          Loading spacecraft...
        </div>
        <div style={{ width: 40, height: 2, background: '#1e2a3a', borderRadius: 2, overflow: 'hidden', margin: '0 auto' }}>
          <div style={{ height: '100%', background: '#3b82f6', animation: 'slideIn 1.2s ease-in-out infinite', borderRadius: 2 }} />
        </div>
      </div>
    </div>
  ),
});

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_HEX: Record<HealthStatus, string> = {
  GREEN: '#34d399', YELLOW: '#fbbf24', ORANGE: '#fb923c', RED: '#f87171',
};

// ─── Mini sparkline ───────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 60, h = 20;
  if (!data.length) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 2) - 1;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Score pill ───────────────────────────────────────────────────────────────

function ScorePill({ value, label }: { value: number; label: string }) {
  const status: HealthStatus = value >= 80 ? 'GREEN' : value >= 60 ? 'YELLOW' : value >= 40 ? 'ORANGE' : 'RED';
  return (
    <div style={{ textAlign: 'center' }}>
      <HUDMetricValue value={value} size="sm" color={STATUS_HEX[status]} />
      <div className="hud-unit" style={{ marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ─── Left Panel: crew status summary + crew cards ─────────────────────────────

function LeftPanel() {
  const { astronauts, state, selectAstronaut, setNav } = useApp();

  const counts = {
    GREEN:  astronauts.filter(a => a.healthStatus === 'GREEN').length,
    YELLOW: astronauts.filter(a => a.healthStatus === 'YELLOW').length,
    ORANGE: astronauts.filter(a => a.healthStatus === 'ORANGE').length,
    RED:    astronauts.filter(a => a.healthStatus === 'RED').length,
  };

  const handleClick = (a: Astronaut) => {
    selectAstronaut(a.id);
    setNav('crew-health');
  };

  return (
    <div className="hud-side-rail hud-side-rail-left">
      <HUDPanel level={1} brackets edge="left" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}>
        <div className="hud-side-rail-inner">
      {/* Crew Status Summary */}
      <div style={{ padding: '14px 14px 10px' }}>
        <HUDLabel dot style={{ marginBottom: 10 }}>Crew Status Summary</HUDLabel>
        <div className="hud-body" style={{ fontSize: 10, marginBottom: 10 }}>4 crew monitored</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {(['GREEN', 'YELLOW', 'ORANGE', 'RED'] as const).map(s => (
            <HUDPanel key={s} level={1} padding="6px 8px" glowColor={STATUS_GLOW[s]}>
              <HUDMetricValue value={counts[s]} size="md" color={STATUS_HEX[s]} />
              <div style={{ fontSize: 8, color: STATUS_HEX[s], opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 2 }}>
                {STATUS_LABEL[s]}
              </div>
            </HUDPanel>
          ))}
        </div>
      </div>

      <HUDDivider />

      {/* Habitat Telemetry */}
      <div style={{ padding: '12px 14px' }}>
        <HUDLabel style={{ marginBottom: 8 }}>Habitat Telemetry</HUDLabel>
        {[
          { label: 'O₂', value: '21.4%', ok: true },
          { label: 'CO₂', value: '0.04%', ok: true },
          { label: 'Temp', value: '72.4°F', ok: true },
          { label: 'Pressure', value: '14.7 PSI', ok: true },
          { label: 'Humidity', value: '48%', ok: true },
          { label: 'Radiation', value: '0.3 mSv/d', ok: false },
        ].map(({ label, value, ok }) => (
          <div key={label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            <span style={{ fontSize: 10, color: '#64748b' }}>{label}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: ok ? '#34d399' : '#fbbf24', fontVariantNumeric: 'tabular-nums' }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      <HUDDivider />

      {/* Crew cards */}
      <div style={{ padding: '10px 10px', flex: 1 }}>
        <HUDLabel style={{ marginBottom: 8 }}>Crew Health Status</HUDLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {astronauts.map(a => {
            const isSelected = state.selectedAstronautId === a.id;
            const hex = STATUS_HEX[a.healthStatus];
            const hasAlert = a.alerts.length > 0;
            return (
              <HUDPanel
                key={a.id}
                as="button"
                level={isSelected ? 3 : 2}
                brackets={isSelected}
                className={`hud-crew-card${isSelected ? ' selected' : ''}`}
                padding="10px"
                glowColor={isSelected ? 'var(--accent-glow)' : undefined}
                onClick={() => handleClick(a)}
                ariaLabel={`Open ${a.name} health telemetry`}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <HUDStatusDot status={a.healthStatus} size={7} pulse={a.healthStatus === 'RED'} />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{a.name}</div>
                      <div className="hud-unit">{a.role}</div>
                    </div>
                  </div>
                  <HUDStatusBadge status={a.healthStatus} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, marginBottom: 8 }}>
                  <ScorePill value={a.overallHealthScore} label="Health" />
                  <ScorePill value={a.recovery.recoveryScore} label="Recovery" />
                  <ScorePill value={a.missionReadiness.score} label="Readiness" />
                </div>

                <div style={{ marginBottom: 6 }}>
                  <Sparkline data={a.physiological.heartRate.trend} color={hex} />
                </div>

                {hasAlert ? (
                  <HUDPanel level={1} padding="3px 6px" glowColor={STATUS_GLOW[a.healthStatus]}>
                    <span style={{ fontSize: 9, color: hex, fontWeight: 500 }}>
                      ⚠ {a.alerts[0]?.title.slice(0, 38)}{a.alerts[0]?.title.length > 38 ? '…' : ''}
                    </span>
                  </HUDPanel>
                ) : (
                  <div style={{ fontSize: 9, color: 'var(--status-green)' }}>All systems nominal</div>
                )}
              </HUDPanel>
            );
          })}
        </div>
      </div>
        </div>
      </HUDPanel>
    </div>
  );
}

// ─── Right Panel: selected crew member detail ─────────────────────────────────

function RightPanel() {
  const { astronauts, state, selectAstronaut, setNav } = useApp();
  const selected = astronauts.find(a => a.id === state.selectedAstronautId);

  if (!selected) {
    const alerts = astronauts.flatMap(a => a.alerts.map(al => ({ astronaut: a, alert: al })));
    return (
      <div className="hud-side-rail hud-side-rail-right">
        <HUDPanel level={1} brackets edge="right" style={{ flex: 1, padding: '14px 12px' }}>
          <HUDLabel dot style={{ marginBottom: 10 }}>Crew Health Status</HUDLabel>
          {alerts.length === 0 ? (
            <div style={{ fontSize: 11, color: 'var(--status-green)' }}>All crew nominal</div>
          ) : alerts.map(({ astronaut: a, alert: al }) => (
            <HUDPanel
              key={al.id}
              level={2}
              padding="8px 10px"
              style={{ marginBottom: 8, cursor: 'pointer' }}
              glowColor={STATUS_GLOW[a.healthStatus]}
              onClick={() => { selectAstronaut(a.id); setNav('health-intelligence'); }}
            >
              <div style={{ fontSize: 10, fontWeight: 600, color: STATUS_HEX[a.healthStatus], marginBottom: 3 }}>{a.name}</div>
              <div className="hud-body" style={{ fontSize: 10 }}>{al.title}</div>
            </HUDPanel>
          ))}
        </HUDPanel>
      </div>
    );
  }

  const hex = STATUS_HEX[selected.healthStatus];
  const hr = selected.physiological.heartRate;

  return (
    <div className="hud-side-rail hud-side-rail-right">
      <HUDPanel level={2} brackets edge="right" glowColor="var(--accent-glow)" style={{ flex: 1, padding: '14px 12px', overflowY: 'auto' }}>
        <HUDLabel dot style={{ marginBottom: 10 }}>Selected Crew Member</HUDLabel>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <HUDStatusDot status={selected.healthStatus} size={10} pulse={selected.healthStatus === 'RED'} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{selected.name}</div>
            <div className="hud-unit">{selected.role}</div>
          </div>
        </div>

      {/* Score row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, marginBottom: 14 }}>
        <ScorePill value={selected.overallHealthScore} label="Health" />
        <ScorePill value={selected.recovery.recoveryScore} label="Recovery" />
        <ScorePill value={selected.missionReadiness.score} label="Readiness" />
      </div>

      <HUDPanel level={1} padding="6px 10px" style={{ marginBottom: 12 }} glowColor={STATUS_GLOW[selected.healthStatus]}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <HUDStatusDot status={selected.healthStatus} size={6} pulse={false} />
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: hex }}>{STATUS_LABEL[selected.healthStatus]}</div>
            <div className="hud-body" style={{ fontSize: 9 }}>
              {selected.healthStatus === 'GREEN' && 'All metrics within baseline'}
              {selected.healthStatus === 'YELLOW' && 'Early deviation detected'}
              {selected.healthStatus === 'ORANGE' && 'Multiple signals elevated'}
              {selected.healthStatus === 'RED' && 'Medical emergency active'}
            </div>
          </div>
        </div>
      </HUDPanel>

      <div style={{ marginBottom: 12 }}>
        <HUDLabel style={{ marginBottom: 6 }}>Cardiac</HUDLabel>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 }}>
          <div>
            <HUDMetricValue value={hr.current} unit="BPM" size="lg" color={STATUS_HEX[hr.status]} />
            <div className="hud-unit">Current</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <HUDMetricValue value={hr.baseline.mean} size="sm" color="var(--text-muted)" />
            <div className="hud-unit">Baseline</div>
          </div>
        </div>
        <Sparkline data={hr.trend} color={STATUS_HEX[hr.status] ?? '#64748b'} />
      </div>

      {/* HRV */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>HRV</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: selected.physiological.hrv.deviationPct < -15 ? '#fb923c' : '#64748b' }}>
            {selected.physiological.hrv.current} <span style={{ fontSize: 8, fontWeight: 400 }}>ms</span>
          </span>
        </div>
        <div style={{ fontSize: 8, color: '#334155' }}>
          Baseline: {selected.physiological.hrv.baseline.mean} ms
        </div>
      </div>

      {/* SpO₂ */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <span style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>SpO₂</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: selected.physiological.spo2.current < 95 ? '#f87171' : '#34d399' }}>
            {selected.physiological.spo2.current}<span style={{ fontSize: 8, fontWeight: 400 }}>%</span>
          </span>
        </div>
        <div style={{ height: 3, background: '#1e2a3a', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 2, transition: 'width 0.3s',
            width: `${selected.physiological.spo2.current}%`,
            background: selected.physiological.spo2.current < 95 ? '#f87171' : '#34d399',
          }} />
        </div>
      </div>

      {/* Current Alert */}
      {selected.alerts.length > 0 && (
        <div>
          <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Current Alert
          </div>
          <div style={{
            background: selected.healthStatus === 'RED' ? 'rgba(220,38,38,0.1)' : 'rgba(251,146,60,0.1)',
            border: `1px solid ${selected.healthStatus === 'RED' ? 'rgba(220,38,38,0.3)' : 'rgba(251,146,60,0.3)'}`,
            borderRadius: 4, padding: '8px 10px', marginBottom: 8,
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: hex, marginBottom: 3 }}>
              {selected.alerts[0].title}
            </div>
            <div style={{ fontSize: 9, color: '#94a3b8', lineHeight: 1.5 }}>
              {selected.alerts[0].summary.slice(0, 100)}{selected.alerts[0].summary.length > 100 ? '…' : ''}
            </div>
          </div>
          <button
            onClick={() => setNav('health-intelligence')}
            style={{
              width: '100%', padding: '6px 0', fontSize: 10, fontWeight: 600,
              color: '#60a5fa', background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.2)', borderRadius: 4, cursor: 'pointer',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}
          >
            View Health Intelligence →
          </button>
        </div>
      )}

      <HUDPanel level={1} padding="8px 10px" style={{ marginTop: 14 }}>
        <div className="hud-body" style={{ fontSize: 8 }}>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>COSMOCARE AI</span> — Health intelligence for qualified medical personnel. Does not diagnose or prescribe.
        </div>
      </HUDPanel>
      </HUDPanel>
    </div>
  );
}

// ─── Main MissionOverview ─────────────────────────────────────────────────────

export default function MissionOverview() {
  const { astronauts, state, selectAstronaut } = useApp();

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      {/* Full-bleed 3D spacecraft */}
      <div style={{ position: 'absolute', inset: 0, background: 'transparent' }}>
        <Suspense fallback={null}>
          <SpacecraftViewer
            astronauts={astronauts}
            selectedId={state.selectedAstronautId}
            onSelectAstronaut={selectAstronaut}
          />
        </Suspense>
      </div>

      {/* Floating HUD panels over spacecraft */}
      <LeftPanel />
      <RightPanel />

      {/* Mission label overlay */}
      <div style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 15,
        pointerEvents: 'none',
      }}>
        <HUDPanel level={1} brackets padding="4px 16px" edge="top">
          <div style={{ fontSize: 10, color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center' }}>
            Artemis Forward — Day {state.missionDay}
          </div>
          <div className="hud-unit" style={{ textAlign: 'center', marginTop: 2 }}>
            Monitor · Detect · Understand · Act · Recover
          </div>
        </HUDPanel>
      </div>

      {/* Comm delay banner */}
      {state.commStatus.mode !== 'NOMINAL' && (
        <div style={{
          position: 'absolute', top: 58, left: '50%', transform: 'translateX(-50%)', zIndex: 15,
          pointerEvents: 'none', minWidth: 320,
        }}>
          <CommDelayBanner commStatus={state.commStatus} />
        </div>
      )}

      {/* Crew legend */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 15,
        display: 'flex', gap: 8, pointerEvents: 'none',
      }}>
        {astronauts.map(a => (
          <HUDPanel key={a.id} level={1} padding="3px 8px">
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <HUDStatusDot status={a.healthStatus} size={5} pulse={false} />
              <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{a.name.split(' ')[0]}</span>
            </div>
          </HUDPanel>
        ))}
      </div>
    </div>
  );
}
