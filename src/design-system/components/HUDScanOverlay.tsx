'use client';

import type { CSSProperties } from 'react';
import { cn } from '../utils';

/** Subtle scan-line shimmer overlay for intelligence / loading panels */
export function HUDScanOverlay({
  active = true,
  className,
  style,
}: {
  active?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  if (!active) return null;

  return (
    <span
      aria-hidden
      className={cn('hud-scan-anim', className)}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.35,
        borderRadius: 'inherit',
        ...style,
      }}
    />
  );
}
