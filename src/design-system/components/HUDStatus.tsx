'use client';

import type { CSSProperties } from 'react';
import type { HealthStatus, RiskLevel } from '@/types';
import {
  STATUS_COLOR, STATUS_GLOW, STATUS_BG, STATUS_BORDER, STATUS_LABEL,
  RISK_COLOR, RISK_GLOW, RISK_BG, RISK_BORDER,
} from '../status';
import { cn } from '../utils';

export function HUDStatusDot({
  status,
  pulse = true,
  size = 8,
  className = '',
  style,
}: {
  status: HealthStatus;
  pulse?: boolean;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const color = STATUS_COLOR[status];
  const glow = STATUS_GLOW[status];

  return (
    <span
      className={className}
      style={{
        position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, width: size + 8, height: size + 8, ...style,
      }}
    >
      {pulse && (
        <span
          className="hud-ring-pulse"
          style={{
            position: 'absolute', width: size + 4, height: size + 4,
            borderRadius: '50%', border: `1px solid ${color}`, opacity: 0.7,
          }}
        />
      )}
      <span style={{
        width: size, height: size, borderRadius: '50%', background: color,
        boxShadow: `0 0 ${size}px ${glow}`,
        transition: 'background 0.4s ease, box-shadow 0.4s ease', flexShrink: 0,
      }} />
    </span>
  );
}

export function HUDStatusBadge({
  status,
  label,
  className = '',
  style,
}: {
  status: HealthStatus;
  label?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const color = STATUS_COLOR[status];
  const bg = STATUS_BG[status];
  const border = STATUS_BORDER[status];
  const glow = STATUS_GLOW[status];
  const text = label ?? STATUS_LABEL[status];

  return (
    <span
      className={cn('alert-badge', className)}
      style={{
        color, background: bg, borderColor: border,
        boxShadow: `0 0 8px ${glow}`,
        transition: 'color 0.4s ease, border-color 0.4s ease, background 0.4s ease, box-shadow 0.4s ease',
        ...style,
      }}
    >
      {text}
    </span>
  );
}

export function HUDRiskBadge({
  risk,
  label,
  className = '',
  style,
}: {
  risk: RiskLevel;
  label?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const color = RISK_COLOR[risk];
  const bg = RISK_BG[risk];
  const border = RISK_BORDER[risk];
  const glow = RISK_GLOW[risk];
  const text = label ?? risk;

  return (
    <span
      className={cn('alert-badge', className)}
      style={{
        color, background: bg, borderColor: border,
        boxShadow: `0 0 8px ${glow}`,
        transition: 'color 0.4s ease, border-color 0.4s ease, background 0.4s ease',
        ...style,
      }}
    >
      {text}
    </span>
  );
}
