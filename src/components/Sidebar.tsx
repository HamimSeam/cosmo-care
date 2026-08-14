'use client';

import { useApp } from '@/context/AppContext';
import type { NavSection } from '@/types';

const NAV_ITEMS: { id: NavSection; label: string; icon: string }[] = [
  { id: 'mission-overview',   label: 'Mission Overview',   icon: '◉' },
  { id: 'crew-health',        label: 'Crew Health',        icon: '♥' },
  { id: 'health-intelligence',label: 'Health Intelligence',icon: '◈' },
  { id: 'mission-readiness',  label: 'Mission Readiness',  icon: '▲' },
  { id: 'medical-events',     label: 'Medical Events',     icon: '⚠' },
  { id: 'recovery',           label: 'Recovery',           icon: '↺' },
  { id: 'medical-resources',  label: 'Medical Resources',  icon: '✚' },
  { id: 'ai-assistant',       label: 'AI Assistant',       icon: '◆' },
];

export default function Sidebar() {
  const { state, setNav, astronauts } = useApp();

  const criticalCount = astronauts.filter(a => a.healthStatus === 'RED').length;

  return (
    <div className="sidebar">
      {/* Logo */}
      <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 4,
            background: 'linear-gradient(135deg, #1e40af, #0891b2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>C</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.02em' }}>COSMOCARE</div>
            <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI · Health Intelligence</div>
          </div>
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
          <span style={{ fontSize: 10, color: '#64748b' }}>MISSION DAY</span>
          <span style={{ fontSize: 10, color: '#60a5fa', fontWeight: 600 }}>{state.missionDay}</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item${state.activeNav === item.id ? ' active' : ''}`}
            onClick={() => setNav(item.id)}
          >
            <span style={{ fontSize: 12, width: 14, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
            <span>{item.label}</span>
            {item.id === 'medical-events' && criticalCount > 0 && (
              <span style={{
                marginLeft: 'auto', background: '#dc2626', color: '#fff',
                borderRadius: 10, fontSize: 10, padding: '1px 6px', fontWeight: 600,
              }}>{criticalCount}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Crew status mini */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Crew Status</div>
        {astronauts.map(a => (
          <div
            key={a.id}
            style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}
          >
            <div style={{
              width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
              background: { GREEN: '#34d399', YELLOW: '#fbbf24', ORANGE: '#fb923c', RED: '#f87171' }[a.healthStatus],
            }} />
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{a.name}</span>
          </div>
        ))}
      </div>

      {/* Version */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 9, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          CosmoCare AI v1.0 MVP · Demo Mode
        </div>
      </div>
    </div>
  );
}
