'use client';

import type { CSSProperties, ReactNode } from 'react';

export type HolographicEdge = 'top' | 'left' | 'right' | 'bottom';

const EDGE_STYLES: Record<HolographicEdge, CSSProperties> = {
  top: {
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    background: 'linear-gradient(90deg, transparent, var(--accent-cyan) 30%, var(--accent-teal) 70%, transparent)',
    boxShadow: '0 0 8px var(--accent-glow)',
  },
  bottom: {
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    background: 'linear-gradient(90deg, transparent, var(--accent-cyan) 40%, transparent)',
    opacity: 0.6,
  },
  left: {
    top: 0,
    bottom: 0,
    left: 0,
    width: 2,
    background: 'linear-gradient(180deg, var(--accent-cyan), transparent 80%)',
    boxShadow: '0 0 6px var(--accent-glow)',
  },
  right: {
    top: 0,
    bottom: 0,
    right: 0,
    width: 1,
    background: 'linear-gradient(180deg, transparent, var(--accent-cyan) 60%, transparent)',
    opacity: 0.5,
  },
};

/** Thin illuminated edge accent — parent must be `position: relative` */
export function HolographicBorder({
  edge = 'top',
  color,
  style,
}: {
  edge?: HolographicEdge;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        zIndex: 2,
        ...EDGE_STYLES[edge],
        ...(color ? { background: color } : {}),
        ...style,
      }}
    />
  );
}

/** Full border wrapper with optional holographic edge highlight */
export function HolographicFrame({
  children,
  edge = 'top',
  className,
  style,
}: {
  children: ReactNode;
  edge?: HolographicEdge;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      <HolographicBorder edge={edge} />
      {children}
    </div>
  );
}
