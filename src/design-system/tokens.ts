/**
 * CosmoCare Holographic HUD — design tokens
 * Use CSS variables in styles; use these constants for programmatic access (Three.js, charts, etc.)
 */

export const colors = {
  bg: '#020408',
  bg2: '#050a12',

  text: '#e8edf5',
  textMuted: '#5a7090',
  textDim: '#3d5068',

  accentCyan: '#4de8d0',
  accentTeal: '#39d9ff',
  accentBlue: '#3b82f6',
  accentGlow: 'rgba(77, 232, 208, 0.18)',
  accentBorder: 'rgba(77, 232, 208, 0.30)',

  status: {
    green: '#34d399',
    yellow: '#fbbf24',
    orange: '#fb923c',
    red: '#f87171',
  },
} as const;

export const glass = {
  1: {
    bg: 'var(--glass-1-bg)',
    border: 'var(--glass-1-border)',
    blur: 'var(--glass-1-blur)',
  },
  2: {
    bg: 'var(--glass-2-bg)',
    border: 'var(--glass-2-border)',
    blur: 'var(--glass-2-blur)',
  },
  3: {
    bg: 'var(--glass-3-bg)',
    border: 'var(--glass-3-border)',
    blur: 'var(--glass-3-blur)',
  },
} as const;

export type GlassLevel = 1 | 2 | 3;

export const spacing = {
  1: 'var(--space-1)',
  2: 'var(--space-2)',
  3: 'var(--space-3)',
  4: 'var(--space-4)',
  5: 'var(--space-5)',
  6: 'var(--space-6)',
  8: 'var(--space-8)',
} as const;

export const radius = {
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
} as const;

export const typography = {
  missionTitle: 'hud-title',
  sectionLabel: 'hud-label',
  metricValue: 'hud-value',
  metricValueSm: 'hud-value-sm',
  unit: 'hud-unit',
  body: 'hud-body',
} as const;

export const animation = {
  pulse: 'hud-pulse',
  ringPulse: 'hud-ring-pulse',
  scan: 'hud-scan-anim',
  statusFade: 'status-fade',
  slideInTop: 'slide-in-top',
  slideInLeft: 'slide-in-left',
  borderGlowPulse: 'border-glow-pulse',
  redGlowPulse: 'red-glow-pulse',
} as const;
