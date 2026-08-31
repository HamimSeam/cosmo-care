'use client';

import type { CSSProperties } from 'react';
import type { HealthStatus } from '@/types';
import { STATUS_COLOR, STATUS_GLOW, scoreToStatus } from '../status';

export function HUDScoreGauge({
  score,
  label,
  size = 80,
  status,
  className = '',
  style,
}: {
  score: number;
  label?: string;
  size?: number;
  status?: HealthStatus;
  className?: string;
  style?: CSSProperties;
}) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (score / 100) * circumference;

  const resolvedStatus = status ?? scoreToStatus(score);
  const color = STATUS_COLOR[resolvedStatus];
  const glow = STATUS_GLOW[resolvedStatus];

  return (
    <div className={`score-display ${className}`} style={{ width: size, height: size, position: 'relative', ...style }}>
      <svg width={size} height={size} style={{ position: 'absolute' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 5px ${glow})`, transition: 'stroke 0.4s ease, stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div style={{ position: 'relative', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ fontSize: size < 70 ? 16 : 22, fontWeight: 700, color, lineHeight: 1, transition: 'color 0.4s ease' }}>
          {score}
        </div>
        {label && (
          <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: 2 }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
