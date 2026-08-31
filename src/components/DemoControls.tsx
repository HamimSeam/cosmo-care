'use client';

import type { CSSProperties } from 'react';
import { useApp } from '@/context/AppContext';
import type { ScenarioType } from '@/types';

const SCENARIOS: { id: ScenarioType; label: string; sub: string; astronautId: string; color: string }[] = [
  { id: 'NORMAL', label: 'NORMAL', sub: 'Maya · Nominal', astronautId: 'maya-chen', color: '#22c55e' },
  { id: 'FATIGUE_BUILDUP', label: 'FATIGUE', sub: 'Alex · Fatigue', astronautId: 'alex-rivera', color: '#eab308' },
  { id: 'DEVELOPING_ILLNESS', label: 'ILLNESS', sub: 'Sam · Developing', astronautId: 'sam-patel', color: '#f97316' },
  { id: 'MEDICAL_EMERGENCY', label: 'EMERGENCY', sub: 'Jordan · Critical', astronautId: 'jordan-lee', color: '#ef4444' },
];

export default function DemoControls() {
  const { state, triggerScenario, selectAstronaut } = useApp();

  return (
    <div className="figma-scenario-console" aria-label="Demo scenario selector">
      <span className="figma-scenario-label font-mono">DEMO SCENARIO</span>
      <div className="figma-scenario-options">
        {SCENARIOS.map(scenario => {
          const active = state.scenario === scenario.id;
          return (
            <button
              key={scenario.id}
              className="figma-scenario-option"
              onClick={() => {
                triggerScenario(scenario.id, scenario.astronautId);
                selectAstronaut(scenario.astronautId);
              }}
              aria-pressed={active}
              style={{
                '--scenario-color': scenario.color,
                background: active ? `${scenario.color}15` : undefined,
                borderColor: active ? `${scenario.color}40` : undefined,
              } as CSSProperties}
            >
              <span className="font-mono">{scenario.label}</span>
              <span className="font-mono">{scenario.sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
