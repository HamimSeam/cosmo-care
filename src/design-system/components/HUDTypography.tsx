'use client';

import type { ReactNode, CSSProperties } from 'react';
import { cn } from '../utils';

export function HUDTitle({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <h1 className={cn('hud-title', className)} style={style}>{children}</h1>;
}

export function HUDLabel({
  children,
  dot = false,
  color,
  className,
  style,
}: {
  children: ReactNode;
  dot?: boolean;
  color?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={cn('hud-label', className)} style={{ display: 'flex', alignItems: 'center', gap: 5, color, ...style }}>
      {dot && (
        <span style={{
          width: 4, height: 4, borderRadius: '50%',
          background: 'var(--accent-cyan)', flexShrink: 0,
          boxShadow: '0 0 4px var(--accent-cyan)',
        }} />
      )}
      {children}
    </span>
  );
}

export function HUDBody({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <p className={cn('hud-body', className)} style={style}>{children}</p>;
}

export function HUDSectionTitle({
  children,
  accent = false,
  className,
  style,
}: {
  children: ReactNode;
  accent?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 8, ...style }}>
      {accent && (
        <span style={{
          width: 2, height: 14, borderRadius: 1,
          background: 'var(--accent-cyan)',
          boxShadow: '0 0 6px var(--accent-cyan)',
          flexShrink: 0,
        }} />
      )}
      <span style={{
        fontSize: 11, fontWeight: 600, letterSpacing: '0.09em',
        textTransform: 'uppercase', color: 'var(--text)',
      }}>
        {children}
      </span>
    </div>
  );
}

export function HUDPanelHeader({
  label,
  action,
  className,
  style,
}: {
  label: ReactNode;
  action?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 'var(--space-3)', gap: 'var(--space-2)', ...style,
      }}
    >
      <HUDLabel dot>{label}</HUDLabel>
      {action}
    </div>
  );
}
