'use client';

import { useApp } from '@/context/AppContext';

export default function TopBar() {
  const { state, astronauts, selectAstronaut, simulateCommDelay, resumeComm, setNav } = useApp();
  const { commStatus } = state;

  const commModeColor = commStatus.mode === 'NOMINAL' ? '#34d399' : commStatus.mode === 'DELAYED' ? '#fbbf24' : '#f87171';

  return (
    <div className="topbar" style={{ justifyContent: 'space-between' }}>
      {/* Left: Astronaut selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>
          Crew Member
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {astronauts.map(a => (
            <button
              key={a.id}
              onClick={() => { selectAstronaut(a.id); setNav('crew-health'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 10px',
                background: state.selectedAstronautId === a.id ? '#1e2d45' : 'transparent',
                border: `1px solid ${state.selectedAstronautId === a.id ? '#3b82f6' : '#1e2a3a'}`,
                borderRadius: 4, cursor: 'pointer', color: state.selectedAstronautId === a.id ? '#e2e8f0' : '#64748b',
                fontSize: 12, transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: { GREEN: '#34d399', YELLOW: '#fbbf24', ORANGE: '#fb923c', RED: '#f87171' }[a.healthStatus],
                flexShrink: 0,
              }} />
              {a.name.split(' ')[0]}
              {a.healthStatus === 'RED' && (
                <span style={{ color: '#f87171', fontSize: 10 }}>⚠</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Comm status + emergency */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Earth comm */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: commModeColor,
            boxShadow: commStatus.mode === 'DELAYED' ? `0 0 6px ${commModeColor}` : undefined,
          }} />
          <span style={{ fontSize: 11, color: commModeColor, fontWeight: 500 }}>
            {commStatus.mode === 'NOMINAL' ? 'EARTH: CONNECTED' : `EARTH DELAY: ${commStatus.delayMinutes}m`}
          </span>
          {commStatus.mode === 'NOMINAL' ? (
            <button
              onClick={() => simulateCommDelay(18)}
              style={{ fontSize: 10, color: '#475569', background: 'none', border: '1px solid #1e2a3a', borderRadius: 3, padding: '2px 6px', cursor: 'pointer' }}
            >
              Simulate Delay
            </button>
          ) : (
            <button
              onClick={() => resumeComm()}
              style={{ fontSize: 10, color: '#34d399', background: 'none', border: '1px solid #1e2a3a', borderRadius: 3, padding: '2px 6px', cursor: 'pointer' }}
            >
              Resume
            </button>
          )}
        </div>

        {/* Mission day */}
        <div style={{ fontSize: 11, color: '#475569' }}>
          <span style={{ color: '#334155' }}>DAY </span>
          <span style={{ color: '#60a5fa', fontWeight: 600 }}>{state.missionDay}</span>
        </div>

        {/* Emergency indicator */}
        {state.emergencyMode && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.5)',
            borderRadius: 4, padding: '3px 10px',
          }}>
            <div className="pulse-red" style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171' }} />
            <span style={{ fontSize: 11, color: '#f87171', fontWeight: 600, letterSpacing: '0.06em' }}>MEDICAL EMERGENCY ACTIVE</span>
          </div>
        )}
      </div>
    </div>
  );
}
