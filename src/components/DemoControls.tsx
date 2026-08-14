'use client';

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

  return (
    <div style={{
      position: 'fixed', bottom: 16, right: 16,
      background: '#0d1320', border: '1px solid #1e2d45',
      borderRadius: 8, padding: 14, width: 260, zIndex: 100,
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    }}>
      <div style={{ fontSize: 10, color: '#3b82f6', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
        Demo Controls
      </div>

      <div style={{ fontSize: 9, color: '#334155', marginBottom: 8 }}>Select scenario to simulate:</div>

      {SCENARIOS.map(scenario => {
        const isActive = state.selectedAstronautId === scenario.astronautId;
        return (
          <button
            key={scenario.id}
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
              display: 'flex', width: '100%', gap: 8, alignItems: 'flex-start',
              padding: '7px 10px', marginBottom: 4,
              background: isActive ? `${scenario.color}10` : 'transparent',
              border: `1px solid ${isActive ? scenario.color + '60' : '#1e2a3a'}`,
              borderRadius: 4, cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: scenario.color, flexShrink: 0, marginTop: 3 }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: isActive ? scenario.color : '#94a3b8' }}>{scenario.label}</div>
              <div style={{ fontSize: 9, color: '#475569' }}>{scenario.desc}</div>
            </div>
          </button>
        );
      })}

      {/* Comm delay */}
      <div style={{ borderTop: '1px solid #1e2a3a', paddingTop: 10, marginTop: 6 }}>
        <div style={{ fontSize: 9, color: '#334155', marginBottom: 6 }}>Earth Communication:</div>
        {state.commStatus.mode === 'NOMINAL' ? (
          <button
            onClick={() => simulateCommDelay(18)}
            style={{
              width: '100%', padding: '6px 10px', background: 'transparent',
              border: '1px solid #fbbf2440', borderRadius: 4, color: '#fbbf24',
              fontSize: 10, cursor: 'pointer', fontWeight: 500,
            }}
          >
            Simulate 18-min Delay
          </button>
        ) : (
          <button
            onClick={() => resumeComm()}
            style={{
              width: '100%', padding: '6px 10px', background: 'transparent',
              border: '1px solid #34d39940', borderRadius: 4, color: '#34d399',
              fontSize: 10, cursor: 'pointer', fontWeight: 500,
            }}
          >
            Resume Comm (Active: {state.commStatus.delayMinutes}m delay)
          </button>
        )}
      </div>

      <div style={{ fontSize: 8, color: '#1e2a3a', marginTop: 8, textAlign: 'center' }}>
        MVP Demo Mode · Simulated Data
      </div>
    </div>
  );
}
