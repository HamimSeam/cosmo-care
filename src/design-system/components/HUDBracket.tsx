'use client';

import type { CSSProperties } from 'react';

export function HUDBracket({
  size = 16,
  color = 'var(--accent-cyan)',
  opacity = 0.9,
}: {
  size?: number;
  color?: string;
  opacity?: number;
}) {
  const s: CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 1,
  };

  const w = 1.5;

  return (
    <span style={s} aria-hidden>
      <svg style={{ position: 'absolute', top: 0, left: 0 }} width={size} height={size} fill="none">
        <path d={`M ${size} ${w / 2} L ${w / 2} ${w / 2} L ${w / 2} ${size}`} stroke={color} strokeWidth={w} opacity={opacity} />
      </svg>
      <svg style={{ position: 'absolute', top: 0, right: 0 }} width={size} height={size} fill="none">
        <path d={`M 0 ${w / 2} L ${size - w / 2} ${w / 2} L ${size - w / 2} ${size}`} stroke={color} strokeWidth={w} opacity={opacity} />
      </svg>
      <svg style={{ position: 'absolute', bottom: 0, left: 0 }} width={size} height={size} fill="none">
        <path d={`M ${w / 2} 0 L ${w / 2} ${size - w / 2} L ${size} ${size - w / 2}`} stroke={color} strokeWidth={w} opacity={opacity} />
      </svg>
      <svg style={{ position: 'absolute', bottom: 0, right: 0 }} width={size} height={size} fill="none">
        <path d={`M ${size - w / 2} 0 L ${size - w / 2} ${size - w / 2} L 0 ${size - w / 2}`} stroke={color} strokeWidth={w} opacity={opacity} />
      </svg>
    </span>
  );
}
