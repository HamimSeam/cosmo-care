'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import type { DemoScenario } from '@/data/simulations';
import { DEMO_SCENARIOS } from '@/data/simulations';

// ─── Tick progress bar ────────────────────────────────────────────────────────

function ProgressBar({ tick, total, color }: { tick: number; total: number; color: string }) {
  const pct = total > 1 ? Math.min(100, (tick / (total - 1)) * 100) : 0;
  return (
    <div style={{ height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1, overflow: 'hidden' }}>
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 1,
          transition: 'width 0.3s linear',
        }}
      />
    </div>
  );
}

// ─── Scenario card ────────────────────────────────────────────────────────────

function ScenarioCard({
  scenario,
  isActive,
  isRunning,
  onStart,
  onStop,
  tick,
}: {
  scenario: DemoScenario;
  isActive: boolean;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  tick: number;
}) {
  const totalFrames = scenario.frames.length;
  const finished = isActive && !isRunning && tick > 0;

  return (
    <div
      style={{
        border: `1px solid ${isActive ? scenario.color + '60' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 6,
        padding: '8px 10px',
        background: isActive ? `${scenario.color}12` : 'rgba(15,23,35,0.6)',
        transition: 'all 0.2s',
        minWidth: 0,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, gap: 6 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: isActive ? scenario.color : '#94a3b8' }}>
            {scenario.label}
          </div>
          <div style={{ fontSize: 9, color: '#475569', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {scenario.description}
          </div>
        </div>

        {/* Play / Stop / Replay button */}
        {!isActive || finished ? (
          <button
            onClick={onStart}
            title={finished ? 'Replay simulation' : 'Start simulation'}
            style={{
              background: `${scenario.color}22`,
              border: `1px solid ${scenario.color}50`,
              color: scenario.color,
              borderRadius: 4,
              padding: '3px 8px',
              fontSize: 9,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {finished ? '↺ REPLAY' : '▶ RUN'}
          </button>
        ) : (
          <button
            onClick={onStop}
            title="Stop simulation"
            style={{
              background: 'rgba(248,113,113,0.12)',
              border: '1px solid rgba(248,113,113,0.4)',
              color: '#f87171',
              borderRadius: 4,
              padding: '3px 8px',
              fontSize: 9,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            ■ STOP
          </button>
        )}
      </div>

      {/* Progress bar — only shown when active */}
      {isActive && (
        <ProgressBar tick={tick} total={totalFrames} color={scenario.color} />
      )}

      {/* Tick label */}
      {isActive && (
        <div style={{ fontSize: 8, color: '#475569', marginTop: 3, textAlign: 'right' }}>
          {finished ? 'COMPLETE' : isRunning ? `T+${tick}/${totalFrames - 1}` : `T+${tick}/${totalFrames - 1}`}
        </div>
      )}
    </div>
  );
}

// ─── Main widget ──────────────────────────────────────────────────────────────

export default function DemoControls() {
  const { sim, startSim, stopSim } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 200,
        width: collapsed ? 'auto' : 220,
        background: 'rgba(10,16,28,0.92)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8,
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        fontFamily: 'var(--font-mono, monospace)',
        overflow: 'hidden',
      }}
      aria-label="Demo simulation controls"
    >
      {/* Title bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '7px 10px',
          borderBottom: collapsed ? 'none' : '1px solid rgba(255,255,255,0.07)',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setCollapsed(c => !c)}
        title={collapsed ? 'Expand demo controls' : 'Collapse demo controls'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Pulse dot when sim is running */}
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: sim.running ? '#22c55e' : '#334155',
              boxShadow: sim.running ? '0 0 6px #22c55e' : 'none',
              animation: sim.running ? 'pulse-dot 1.2s ease-in-out infinite' : 'none',
            }}
          />
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#64748b' }}>
            DEMO SIM
          </span>
          {sim.running && (
            <span style={{ fontSize: 8, color: '#22c55e', letterSpacing: '0.05em' }}>LIVE</span>
          )}
        </div>
        <span style={{ fontSize: 9, color: '#334155' }}>{collapsed ? '▲' : '▼'}</span>
      </div>

      {/* Scenario list */}
      {!collapsed && (
        <div style={{ padding: '8px 8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {DEMO_SCENARIOS.map(scenario => {
            const isActive = sim.scenarioId === scenario.id;
            return (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                isActive={isActive}
                isRunning={isActive && sim.running}
                tick={isActive ? sim.tick : 0}
                onStart={() => startSim(scenario.id)}
                onStop={stopSim}
              />
            );
          })}
          {/* Stop all shortcut */}
          {sim.running && (
            <button
              onClick={stopSim}
              style={{
                marginTop: 2,
                background: 'transparent',
                border: '1px solid rgba(248,113,113,0.25)',
                color: '#94a3b8',
                borderRadius: 4,
                padding: '4px 0',
                fontSize: 9,
                cursor: 'pointer',
                letterSpacing: '0.06em',
              }}
            >
              STOP ALL & RESET
            </button>
          )}
        </div>
      )}

      {/* Keyframe animation for the pulse dot */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
