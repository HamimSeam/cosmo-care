'use client';

import { useApp } from '@/context/AppContext';

export default function HealthTimeline() {
  const { selectedAstronaut: a } = useApp();

  const typeColors: Record<string, string> = {
    normal: '#475569',
    alert: '#fbbf24',
    event: '#f87171',
    recovery: '#34d399',
    milestone: '#60a5fa',
  };

  const statusColors: Record<string, string> = {
    GREEN: '#34d399',
    YELLOW: '#fbbf24',
    ORANGE: '#fb923c',
    RED: '#f87171',
  };

  return (
    <div className="content-area">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>Health Timeline</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>Longitudinal health history · {a.name}</div>
      </div>

      <div className="card">
        <div style={{ position: 'relative', paddingLeft: 24 }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute', left: 7, top: 0, bottom: 0,
            width: 1, background: 'var(--border)',
          }} />

          {[...a.timeline].reverse().map((entry, i) => (
            <div key={i} style={{ position: 'relative', marginBottom: 20 }}>
              {/* Dot */}
              <div style={{
                position: 'absolute', left: -20, top: 4,
                width: 10, height: 10, borderRadius: '50%',
                background: statusColors[entry.status],
                border: `2px solid var(--bg)`,
                boxShadow: `0 0 6px ${statusColors[entry.status]}40`,
              }} />

              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Mission Day
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: statusColors[entry.status] }}>
                    {entry.missionDay}
                  </div>
                  <div style={{ fontSize: 9, color: '#334155' }}>{entry.date}</div>
                </div>

                <div style={{ flex: 1, background: '#0d1320', border: `1px solid ${statusColors[entry.status]}20`, borderRadius: 4, padding: '8px 12px' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{
                      fontSize: 9, color: typeColors[entry.type], background: `${typeColors[entry.type]}15`,
                      border: `1px solid ${typeColors[entry.type]}30`,
                      borderRadius: 2, padding: '1px 5px', textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {entry.type}
                    </span>
                    <span style={{ fontSize: 9, color: statusColors[entry.status], fontWeight: 600 }}>
                      {entry.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>{entry.title}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{entry.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
