'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import type { ScenarioType } from '@/types';

const SCENARIOS: { id: ScenarioType; label: string; desc: string; astronautId: string; color: string }[] = [
  {
    id: 'NORMAL',
    label: '1 — Normal',
    desc: 'Maya Chen — Healthy, optimal readiness',
    astronautId: 'maya-chen',
    color: '#34d399',
  },
  {
    id: 'FATIGUE_BUILDUP',
    label: '2 — Fatigue Buildup',
    desc: 'Alex Rivera — Declining sleep, HRV, recovery',
    astronautId: 'alex-rivera',
    color: '#fbbf24',
  },
  {
    id: 'DEVELOPING_ILLNESS',
    label: '3 — Developing Illness',
    desc: 'Sam Patel — Multi-system physiological stress',
    astronautId: 'sam-patel',
    color: '#fb923c',
  },
  {
    id: 'MEDICAL_EMERGENCY',
    label: '4 — Medical Emergency',
    desc: 'Jordan Lee — Critical: post-EVA hemodynamic compromise',
    astronautId: 'jordan-lee',
    color: '#f87171',
  },
];

export default function DemoControls() {
  const { state, triggerScenario, selectAstronaut, setNav, simulateCommDelay, resumeComm } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`demo-console${isOpen ? ' open' : ''}`}>
      <button
        className="demo-console-trigger hud-btn"
        onClick={() => setIsOpen(value => !value)}
        aria-expanded={isOpen}
        aria-controls="demo-scenario-console"
      >
        <span className="demo-console-glyph" aria-hidden>◇</span>
        Scenario Console
        <span className="demo-console-state">{state.scenario.replaceAll('_', ' ')}</span>
      </button>

      {isOpen && <div id="demo-scenario-console" className="demo-console-panel hud-glass-3 slide-in-top">
      <div className="demo-console-header">
        <div>
          <div className="hud-label">Simulation Controls</div>
          <div className="hud-unit">Mission operator sandbox</div>
        </div>
        <button className="demo-console-close" onClick={() => setIsOpen(false)} aria-label="Close scenario console">×</button>
      </div>

      <div className="demo-console-hint">Select a crew health scenario</div>

      {SCENARIOS.map(scenario => {
        const isActive = state.scenario === scenario.id;
        return (
          <button
            key={scenario.id}
            className="demo-scenario-button"
            onClick={() => {
              triggerScenario(scenario.id, scenario.astronautId);
              selectAstronaut(scenario.astronautId);
              if (scenario.id === 'MEDICAL_EMERGENCY') {
                setNav('medical-events');
              } else {
                setNav('crew-health');
              }
            }}
            style={{
              background: isActive ? `${scenario.color}10` : 'transparent',
              borderColor: isActive ? scenario.color + '60' : undefined,
            }}
            aria-pressed={isActive}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: scenario.color, flexShrink: 0, marginTop: 3 }} />
            <div>
              <div className="demo-scenario-title" style={{ color: isActive ? scenario.color : undefined }}>{scenario.label}</div>
              <div className="demo-scenario-description">{scenario.desc}</div>
            </div>
          </button>
        );
      })}

      {/* Comm delay */}
      <div className="demo-comm-control">
        <div className="demo-console-hint">Earth communication</div>
        {state.commStatus.mode === 'NOMINAL' ? (
          <button
            onClick={() => simulateCommDelay(18)}
            className="hud-btn demo-comm-button"
            style={{ color: 'var(--status-yellow)', borderColor: 'var(--status-yellow-border)' }}
          >
            Simulate 18-min Delay
          </button>
        ) : (
          <button
            onClick={() => resumeComm()}
            className="hud-btn demo-comm-button"
            style={{ color: 'var(--status-green)', borderColor: 'var(--status-green-border)' }}
          >
            Resume Comm (Active: {state.commStatus.delayMinutes}m delay)
          </button>
        )}
      </div>

      <div className="demo-console-footnote">
        Simulated mission data · no clinical use
      </div>
      </div>}
    </div>
  );
}
