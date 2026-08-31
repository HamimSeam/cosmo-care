'use client';

import { useApp } from '@/context/AppContext';
import { CommDelayBanner, HUDStatusDot } from '@/components/HUDComponents';

export default function TopBar() {
  const { state, astronauts, selectAstronaut, simulateCommDelay, resumeComm, setNav } = useApp();
  const { commStatus } = state;

  const isNominal  = commStatus.mode === 'NOMINAL';

  return (
    <div className="topbar" style={{ justifyContent: 'space-between', gap: 12 }}>

      {/* ── Left: crew selector ────────────────────────────────────── */}
      <div className="topbar-crew" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase',
          color: 'var(--text-dim)', flexShrink: 0,
        }}>
          CREW
        </span>

        {/* Thin separator */}
        <span style={{ width: 1, height: 14, background: 'var(--glass-2-border)', flexShrink: 0 }} />

        <div style={{ display: 'flex', gap: 5 }}>
          {astronauts.map(a => {
            const selected = state.selectedAstronautId === a.id;
            return (
              <button
                key={a.id}
                onClick={() => { selectAstronaut(a.id); setNav('crew-health'); }}
                aria-pressed={selected}
                aria-label={`Open ${a.name} crew health`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '3px 9px',
                  background: selected ? 'rgba(77,232,208,0.08)' : 'transparent',
                  border: `1px solid ${selected ? 'var(--accent-border)' : 'var(--glass-1-border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  color: selected ? 'var(--text)' : 'var(--text-dim)',
                  fontSize: 11, fontWeight: selected ? 600 : 400,
                  letterSpacing: '0.02em',
                  transition: 'all 0.2s ease',
                  boxShadow: selected ? '0 0 10px rgba(77,232,208,0.12)' : 'none',
                }}
              >
                <HUDStatusDot status={a.healthStatus} size={5} pulse={a.healthStatus === 'RED'} />
                {a.name.split(' ')[0]}
                {a.healthStatus === 'RED' && (
                  <span style={{ color: 'var(--status-red)', fontSize: 9, lineHeight: 1 }}>⚠</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Center: mission identity ───────────────────────────────── */}
      <div className="topbar-mission" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
        }}>
          ARTEMIS FORWARD
        </span>
        <span style={{ width: 1, height: 12, background: 'var(--glass-2-border)' }} />
        <span style={{
          fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase',
          color: 'var(--text-dim)',
        }}>
          DAY
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700, color: 'var(--accent-cyan)',
          letterSpacing: '0.04em',
        }}>
          {state.missionDay}
        </span>
      </div>

      {/* ── Right: comm + emergency ────────────────────────────────── */}
      <div className="topbar-comm" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

        {/* Comm delay banner (only when not nominal) */}
        {!isNominal && (
          <CommDelayBanner
            commStatus={commStatus}
            style={{ padding: '4px 10px' }}
          />
        )}

        {/* Nominal Earth link */}
        {isNominal && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--status-green)',
              boxShadow: '0 0 6px var(--status-green-glow)',
              display: 'inline-block', flexShrink: 0,
            }} />
            <span style={{
              fontSize: 10, color: 'var(--status-green)',
              fontWeight: 500, letterSpacing: '0.06em',
            }}>
              EARTH LINKED
            </span>
          </div>
        )}

        {/* Comm control button */}
        <button
          onClick={isNominal ? () => simulateCommDelay(18) : () => resumeComm()}
          aria-label={isNominal ? 'Simulate an 18 minute Earth communication delay' : 'Resume nominal Earth communications'}
          style={{
            fontSize: 9, letterSpacing: '0.07em', textTransform: 'uppercase',
            color: isNominal ? 'var(--text-dim)' : 'var(--status-green)',
            background: 'transparent',
            border: `1px solid ${isNominal ? 'var(--glass-1-border)' : 'var(--status-green-border)'}`,
            borderRadius: 'var(--radius-sm)',
            padding: '2px 7px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {isNominal ? 'SIM DELAY' : 'RESUME'}
        </button>

        {/* Thin separator */}
        {state.emergencyMode && (
          <span style={{ width: 1, height: 14, background: 'var(--glass-2-border)', flexShrink: 0 }} />
        )}

        {/* Emergency indicator */}
        {state.emergencyMode && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'var(--status-red-bg)',
            border: '1px solid var(--status-red-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '3px 9px',
            boxShadow: '0 0 14px var(--status-red-glow)',
          }}>
            <span
              className="pulse-red"
              style={{
                width: 5, height: 5, borderRadius: '50%',
                background: 'var(--status-red)', flexShrink: 0,
              }}
            />
            <span style={{
              fontSize: 9, color: 'var(--status-red)',
              fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              MEDICAL EMERGENCY
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
