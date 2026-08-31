'use client';

import { useApp } from '@/context/AppContext';
import type { NavSection } from '@/types';

const NAV_ITEMS: { id: NavSection; label: string; shortLabel: string; icon: string }[] = [
  { id: 'mission-overview', label: 'Mission Overview', shortLabel: 'OVERVIEW', icon: '⊞' },
  { id: 'crew-health', label: 'Crew Health', shortLabel: 'CREW', icon: '◎' },
  { id: 'health-intelligence', label: 'Health Intelligence', shortLabel: 'INTEL', icon: '◈' },
  { id: 'mission-readiness', label: 'Mission Readiness', shortLabel: 'READY', icon: '◇' },
  { id: 'medical-events', label: 'Medical Events', shortLabel: 'EVENTS', icon: '▲' },
  { id: 'recovery', label: 'Recovery', shortLabel: 'RECOVER', icon: '↑' },
  { id: 'medical-resources', label: 'Medical Resources', shortLabel: 'MEDS', icon: '✚' },
  { id: 'ai-assistant', label: 'AstroTriage / AI Assistant', shortLabel: 'TRIAGE', icon: '◉' },
];

export default function Sidebar() {
  const { state, setNav, astronauts } = useApp();
  const criticalCount = astronauts.filter(astronaut => astronaut.healthStatus === 'RED').length;

  return (
    <aside className="sidebar figma-nav-rail" aria-label="Primary mission navigation">
      <nav className="figma-nav-list">
        {NAV_ITEMS.map(item => {
          const active = state.activeNav === item.id;
          const danger = item.id === 'ai-assistant' || item.id === 'medical-events';
          return (
            <button
              key={item.id}
              className={`nav-item${active ? ' active' : ''}${danger ? ' nav-item-danger' : ''}`}
              onClick={() => setNav(item.id)}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              title={item.label}
            >
              <span className="nav-icon" aria-hidden>{item.icon}</span>
              <span className="nav-label">{item.shortLabel}</span>
              {item.id === 'medical-events' && criticalCount > 0 && (
                <span className="nav-alert-count">{criticalCount}</span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="nav-rail-live" title="Live telemetry connected">
        <span className="pulse" />
      </div>
    </aside>
  );
}
