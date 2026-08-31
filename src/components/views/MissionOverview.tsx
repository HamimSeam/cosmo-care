'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useApp } from '@/context/AppContext';
import { analyzeHealthRisk } from '@/lib/aiEngine';
import type { Astronaut, HealthStatus } from '@/types';

const SpacecraftViewer = dynamic(() => import('@/components/SpacecraftViewer'), {
  ssr: false,
  loading: () => (
    <div className="figma-spacecraft-loading font-mono">
      <span /> LOADING SPACECRAFT
    </div>
  ),
});

const STATUS_COLOR: Record<HealthStatus, string> = {
  GREEN: '#22c55e',
  YELLOW: '#eab308',
  ORANGE: '#f97316',
  RED: '#ef4444',
};

const STATUS_LABEL: Record<HealthStatus, string> = {
  GREEN: 'NOMINAL',
  YELLOW: 'MONITOR',
  ORANGE: 'ELEVATED',
  RED: 'CRITICAL',
};

function GlassPanel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`figma-glass-panel bracket ${className}`}>{children}</section>;
}

function MiniTrend({ data, color }: { data: number[]; color: string }) {
  const width = 248;
  const height = 44;
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - 4 - ((value - min) / range) * (height - 8);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden>
      <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="rgba(34,211,238,0.08)" strokeDasharray="3 4" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function CrewPanel({ onOpenProfile }: { onOpenProfile: () => void }) {
  const { astronauts, state, selectAstronaut } = useApp();
  const alertCount = astronauts.filter(astronaut => astronaut.healthStatus !== 'GREEN').length;

  return (
    <GlassPanel className="figma-crew-panel hud-appear">
      <header className="figma-panel-header">
        <div className="font-mono">CREW STATUS</div>
        <div className="figma-crew-summary">
          <strong>{astronauts.length}</strong>
          <span className="font-mono">CREW MONITORED</span>
          {alertCount > 0 && <em className="font-mono">{alertCount} ALERTS</em>}
        </div>
      </header>

      <div className="figma-crew-list">
        {astronauts.map(astronaut => {
          const selected = astronaut.id === state.selectedAstronautId;
          const color = STATUS_COLOR[astronaut.healthStatus];
          return (
            <button
              key={astronaut.id}
              className="figma-crew-row"
              data-selected={selected}
              onClick={() => selectAstronaut(astronaut.id)}
              aria-pressed={selected}
              style={{ '--crew-color': color } as React.CSSProperties}
            >
              <div className="figma-crew-row-main">
                <span className={`figma-crew-status-dot${astronaut.healthStatus === 'RED' ? ' pulse-fast' : ' pulse'}`} />
                <span className="figma-crew-copy">
                  <strong>{astronaut.name}</strong>
                  <small className="font-mono">{astronaut.role}</small>
                </span>
                <span className="figma-crew-score">
                  <small className="font-mono">{STATUS_LABEL[astronaut.healthStatus]}</small>
                  <strong className="font-mono">{astronaut.overallHealthScore}</strong>
                </span>
              </div>
              <span className="figma-health-track"><span style={{ width: `${astronaut.overallHealthScore}%` }} /></span>
            </button>
          );
        })}
      </div>

      <footer className="figma-panel-footer">
        <span className="pulse" />
        <span className="font-mono">LIVE TELEMETRY · 5s UPDATE</span>
        <button className="font-mono" onClick={onOpenProfile}>OPEN PROFILE →</button>
      </footer>
    </GlassPanel>
  );
}

function MetricComparison({ label, current, baseline, unit, color }: {
  label: string;
  current: number;
  baseline: number;
  unit: string;
  color: string;
}) {
  const difference = current - baseline;
  return (
    <div className="figma-metric-row">
      <div className="figma-metric-label font-mono">
        <span>{label}</span>
        <em style={{ color }}>{difference >= 0 ? '↑' : '↓'} {Math.abs(difference).toFixed(unit === 'HR' ? 1 : 0)}{unit} FROM BASELINE</em>
      </div>
      <div className="figma-metric-values">
        <span><small className="font-mono">BASELINE</small><strong className="font-mono">{baseline}<em>{unit}</em></strong></span>
        <b>→</b>
        <span><small className="font-mono">CURRENT</small><strong className="font-mono" style={{ color }}>{current}<em>{unit}</em></strong></span>
      </div>
    </div>
  );
}

function SelectedHealthPanel({ astronaut }: { astronaut: Astronaut }) {
  const color = STATUS_COLOR[astronaut.healthStatus];
  const { physiological, recovery } = astronaut;

  return (
    <GlassPanel className="figma-health-panel hud-appear">
      <header className="figma-panel-header compact">
        <div>
          <span className="font-mono">HEALTH TELEMETRY</span>
          <strong>{astronaut.name}</strong>
          <small className="font-mono">{astronaut.role} · MISSION DAY {astronaut.missionDay}</small>
        </div>
        <div className="figma-selected-score" style={{ color }}>
          <strong className="font-mono">{astronaut.overallHealthScore}</strong>
          <small className="font-mono">{STATUS_LABEL[astronaut.healthStatus]}</small>
        </div>
      </header>
      <div className="figma-health-metrics">
        <MetricComparison
          label="RESTING HEART RATE"
          current={physiological.restingHR.current}
          baseline={physiological.restingHR.baseline.mean}
          unit="BPM"
          color={STATUS_COLOR[physiological.restingHR.status]}
        />
        <MetricComparison
          label="HEART RATE VARIABILITY"
          current={physiological.hrv.current}
          baseline={physiological.hrv.baseline.mean}
          unit="ms"
          color={STATUS_COLOR[physiological.hrv.status]}
        />
        <MetricComparison
          label="SLEEP DURATION"
          current={recovery.sleepDuration.current}
          baseline={recovery.sleepDuration.baseline.mean}
          unit="HR"
          color={STATUS_COLOR[recovery.sleepDuration.status]}
        />
      </div>
    </GlassPanel>
  );
}

function IntelligencePanel({ astronaut, onOpen }: { astronaut: Astronaut; onOpen: () => void }) {
  const analysis = analyzeHealthRisk(astronaut);
  const riskColor = {
    LOW: '#22c55e', MODERATE: '#eab308', ELEVATED: '#f97316', CRITICAL: '#ef4444',
  }[analysis.riskLevel];
  const alert = astronaut.alerts[0];

  return (
    <GlassPanel className="figma-intelligence-panel hud-appear">
      <header className="figma-panel-header compact inline">
        <div>
          <span className="font-mono">COSMOCARE INTELLIGENCE</span>
          <strong style={{ color: riskColor }}>
            {alert?.title ?? (analysis.riskLevel === 'LOW' ? 'No significant pattern detected' : `${analysis.riskLevel} health pattern detected`)}
          </strong>
        </div>
        <span className="figma-risk-badge font-mono" style={{ color: riskColor, borderColor: `${riskColor}45` }}>
          {analysis.riskLevel} · {analysis.confidence}%
        </span>
      </header>

      <div className="figma-factor-list">
        <div className="font-mono">CONTRIBUTING FACTORS</div>
        {(analysis.factors.length ? analysis.factors : ['All monitored metrics remain within the personal baseline envelope.']).slice(0, 4).map((factor, index) => (
          <p key={`${factor}-${index}`}><span style={{ color: riskColor }}>▸</span>{factor}</p>
        ))}
      </div>

      <div className="figma-assessment">
        <span className="font-mono">COSMOCARE ASSESSMENT</span>
        <p>{alert?.summary ?? 'No correlated physiological deviations currently require medical intervention.'}</p>
      </div>

      <button className="figma-open-triage font-mono" onClick={onOpen} style={{ color: riskColor, borderColor: `${riskColor}50` }}>
        {analysis.riskLevel === 'LOW' ? 'OPEN HEALTH INTELLIGENCE' : 'OPEN ASTROTRIAGE'} →
      </button>
    </GlassPanel>
  );
}

function TrendsPanel({ astronaut }: { astronaut: Astronaut }) {
  const trend = astronaut.physiological.restingHR.trend;
  const color = STATUS_COLOR[astronaut.physiological.restingHR.status];
  return (
    <GlassPanel className="figma-trends-panel hud-appear">
      <header className="figma-panel-header compact inline">
        <div>
          <span className="font-mono">7-DAY TREND · RESTING HR</span>
          <strong className="font-mono" style={{ color }}>{astronaut.physiological.restingHR.current} BPM</strong>
        </div>
        <small className="font-mono">BASELINE {astronaut.physiological.restingHR.baseline.min}–{astronaut.physiological.restingHR.baseline.max}</small>
      </header>
      <div className="figma-trend-chart"><MiniTrend data={trend} color={color} /></div>
    </GlassPanel>
  );
}

export default function MissionOverview() {
  const { astronauts, selectedAstronaut, state, selectAstronaut, setNav } = useApp();
  const nominalCount = astronauts.filter(astronaut => astronaut.healthStatus === 'GREEN').length;
  const alertCount = astronauts.length - nominalCount;

  return (
    <div className="figma-overview">
      <div className="figma-spacecraft-layer">
        <Suspense fallback={null}>
          <SpacecraftViewer
            astronauts={astronauts}
            selectedId={state.selectedAstronautId}
            onSelectAstronaut={selectAstronaut}
          />
        </Suspense>
      </div>

      <div className="figma-overview-label font-mono">
        MISSION OVERVIEW · ARTEMIS FORWARD
        <span />
      </div>

      <div className="figma-hud-layout">
        <CrewPanel onOpenProfile={() => setNav('crew-health')} />
        <div className="figma-hud-space" aria-hidden />
        <div className="figma-right-stack">
          <SelectedHealthPanel astronaut={selectedAstronaut} />
          <IntelligencePanel astronaut={selectedAstronaut} onOpen={() => setNav('health-intelligence')} />
          <TrendsPanel astronaut={selectedAstronaut} />
        </div>
      </div>

      <div className="figma-mission-stats">
        {[
          { label: 'MISSION DAY', value: state.missionDay },
          { label: 'CREW NOMINAL', value: `${nominalCount} / ${astronauts.length}` },
          { label: 'ACTIVE ALERTS', value: alertCount },
        ].map(stat => (
          <div key={stat.label}>
            <strong className="font-mono">{stat.value}</strong>
            <span className="font-mono">{stat.label}</span>
          </div>
        ))}
      </div>

      {state.commStatus.mode !== 'NOMINAL' && (
        <div className="figma-local-support font-mono">
          <span className="pulse" /> LOCAL DECISION SUPPORT ACTIVE
        </div>
      )}
    </div>
  );
}
