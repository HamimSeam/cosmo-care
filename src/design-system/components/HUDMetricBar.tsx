'use client';

import type { CSSProperties } from 'react';
import type { HealthStatus } from '@/types';
import { STATUS_COLOR, STATUS_GLOW } from '../status';

export function HUDMetricBar({
  value,
  color,
  status,
  className = '',
  style,
}: {
  value: number;
  color?: string;
  status?: HealthStatus;
  className?: string;
  style?: CSSProperties;
}) {
  const fillColor = color ?? (status ? STATUS_COLOR[status] : 'var(--accent-cyan)');
  const glow = status ? STATUS_GLOW[status] : 'var(--accent-glow)';
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={`metric-bar ${className}`} style={style}>
      <div
        className="metric-bar-fill"
        style={{ width: `${clamped}%`, background: fillColor, boxShadow: `0 0 6px ${glow}` }}
      />
    </div>
  );
}
