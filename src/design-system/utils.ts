import clsx, { type ClassValue } from 'clsx';
import type { GlassLevel } from './tokens';

/** Merge class names */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Inline glass panel styles for non-component contexts */
export function glassStyle(level: GlassLevel = 2) {
  const prefix = `--glass-${level}`;
  return {
    background: `var(${prefix}-bg)`,
    backdropFilter: `blur(var(${prefix}-blur))`,
    WebkitBackdropFilter: `blur(var(${prefix}-blur))`,
    border: `1px solid var(${prefix}-border)`,
    borderRadius: 'var(--radius-md)',
  } as const;
}
