'use client';

import { useApp } from '@/context/AppContext';
import type { NavSection } from '@/types';
import { HUDStatusDot } from '@/components/HUDComponents';

const NAV_ITEMS: { id: NavSection; label: string; icon: string }[] = [
  { id: 'mission-overview',    label: 'Mission Overview',    icon: '◉' },
  { id: 'crew-health',         label: 'Crew Health',         icon: '♥' },
  { id: 'health-intelligence', label: 'Health Intelligence', icon: '◈' },
  { id: 'mission-readiness',   label: 'Mission Readiness',   icon: '▲' },
  { id: 'medical-events',      label: 'Medical Events',      icon: '⚠' },
  { id: 'recovery',            label: 'Recovery',            icon: '↺' },
  { id: 'medical-resources',   label: 'Medical Resources',   icon: '✚' },
  { id: 'ai-assistant',        label: 'AI Assistant',        icon: '◆' },
];

export default function Sidebar() {
  const { state, setNav, astronauts } = useApp();

  const criticalCount = astronauts.filter(a => a.healthStatus === 'RED').length;

  return (
    <aside className="sidebar" aria-label="Primary mission navigation">

      {/* ── Logo ─────────────────────────────────────────────────────── */}
      <div className="sidebar-brand" style={{
        padding: '14px 14px 12px',
        borderBottom: '1px solid var(--glass-1-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
          {/* Mark */}
          <div style={{
            width: 26, height: 26, borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, rgba(30,64,175,0.9), rgba(8,145,178,0.9))',
            border: '1px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0,
            boxShadow: '0 0 10px rgba(77,232,208,0.2)',
          }}>C</div>

          <div className="sidebar-brand-copy">
            <div style={{
              fontSize: 12, fontWeight: 700, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'var(--accent-cyan)',
            }}>
              COSMOCARE
            </div>
            <div style={{
              fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase',
              color: 'var(--text-dim)',
            }}>
              Health Intelligence
            </div>
          </div>
        </div>

        {/* Mission day */}
        <div className="sidebar-mission-day" style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 6px',
          background: 'rgba(77,232,208,0.04)',
          border: '1px solid var(--glass-1-border)',
          borderRadius: 'var(--radius-sm)',
        }}>
          <span style={{
            fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase',
            color: 'var(--text-dim)',
          }}>
            MISSION DAY
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700, color: 'var(--accent-cyan)',
            letterSpacing: '0.04em',
          }}>
            {state.missionDay}
          </span>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '6px 8px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item${state.activeNav === item.id ? ' active' : ''}`}
            onClick={() => setNav(item.id)}
            aria-current={state.activeNav === item.id ? 'page' : undefined}
            aria-label={item.label}
            title={item.label}
          >
            <span style={{
              fontSize: 11, width: 14, textAlign: 'center', flexShrink: 0,
              opacity: state.activeNav === item.id ? 1 : 0.5,
            }}>
              {item.icon}
            </span>
            <span className="nav-label" style={{ flex: 1 }}>{item.label}</span>

            {/* Critical alert badge */}
            {item.id === 'medical-events' && criticalCount > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: 'var(--status-red-bg)',
                color: 'var(--status-red)',
                border: '1px solid var(--status-red-border)',
                borderRadius: 10, fontSize: 9,
                padding: '1px 6px', fontWeight: 700,
                boxShadow: '0 0 8px var(--status-red-glow)',
                letterSpacing: '0.04em',
              }}>
                {criticalCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* ── Crew status mini ─────────────────────────────────────────── */}
      <div className="sidebar-crew" style={{
        padding: '10px 12px',
        borderTop: '1px solid var(--glass-1-border)',
      }}>
        <div style={{
          fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase',
          color: 'var(--text-dim)', marginBottom: 8,
        }}>
          Crew Status
        </div>
        {astronauts.map(a => (
          <div
            key={a.id}
            style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}
          >
            <HUDStatusDot status={a.healthStatus} size={6} pulse={a.healthStatus === 'RED'} />
            <span style={{
              fontSize: 11,
              color: a.healthStatus === 'RED' ? 'var(--status-red)' : 'var(--text-muted)',
              transition: 'color 0.4s ease',
            }}>
              {a.name}
            </span>
          </div>
        ))}
      </div>

      {/* ── Version ──────────────────────────────────────────────────── */}
      <div className="sidebar-version" style={{
        padding: '6px 12px 8px',
        borderTop: '1px solid var(--glass-1-border)',
      }}>
        <div style={{
          fontSize: 9, letterSpacing: '0.07em', textTransform: 'uppercase',
          color: 'var(--text-dim)',
        }}>
          CosmoCare AI v1.0 · Demo Mode
        </div>
      </div>

    </aside>
  );
}
