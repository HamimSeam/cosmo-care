'use client';

import type { CSSProperties } from 'react';
import type { CommStatus } from '@/types';

export function CommDelayBanner({
  commStatus,
  className = '',
  style,
}: {
  commStatus: CommStatus;
  className?: string;
  style?: CSSProperties;
}) {
  if (commStatus.mode === 'NOMINAL' && commStatus.connected) return null;

  const isBlackout = commStatus.mode === 'BLACKOUT';
  const accentColor = isBlackout ? 'var(--status-red)' : 'var(--status-yellow)';
  const accentGlow = isBlackout ? 'var(--status-red-glow)' : 'var(--status-yellow-glow)';
  const accentBg = isBlackout ? 'var(--status-red-bg)' : 'var(--status-yellow-bg)';
  const accentBorder = isBlackout ? 'var(--status-red-border)' : 'var(--status-yellow-border)';

  return (
    <div
      className={`slide-in-top ${className}`}
      style={{
        background: accentBg,
        border: `1px solid ${accentBorder}`,
        borderRadius: 'var(--radius-md)',
        padding: '8px 14px',
        boxShadow: `0 0 16px ${accentGlow}`,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        ...style,
      }}
    >
      <span style={{ color: accentColor, fontSize: 13, lineHeight: 1 }}>
        {isBlackout ? '✕' : '⚠'}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: accentColor }}>
          {isBlackout ? 'EARTH LINK — BLACKOUT' : `EARTH LINK DELAYED — ${commStatus.delayMinutes}:00 MIN`}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          LOCAL DECISION SUPPORT ACTIVE
        </div>
      </div>
    </div>
  );
}
