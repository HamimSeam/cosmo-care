'use client';

import type { CSSProperties } from 'react';

const METRIC_FONT_SIZE = { lg: '24px', md: '16px', sm: '13px' } as const;

export function HUDMetricValue({
  value,
  unit,
  size = 'lg',
  color,
  className = '',
  style,
}: {
  value: string | number;
  unit?: string;
  size?: 'lg' | 'md' | 'sm';
  color?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'baseline', gap: 3, ...style }}>
      <span style={{
        fontSize: METRIC_FONT_SIZE[size],
        fontWeight: 600,
        letterSpacing: '-0.01em',
        lineHeight: 1.1,
        color: color ?? 'var(--text)',
        transition: 'color 0.4s ease',
      }}>
        {value}
      </span>
      {unit && <span className="hud-unit">{unit}</span>}
    </span>
  );
}
