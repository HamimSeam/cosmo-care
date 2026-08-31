import type { HealthStatus, RiskLevel } from '@/types';

export const STATUS_COLOR: Record<HealthStatus, string> = {
  GREEN: 'var(--status-green)',
  YELLOW: 'var(--status-yellow)',
  ORANGE: 'var(--status-orange)',
  RED: 'var(--status-red)',
};

export const STATUS_GLOW: Record<HealthStatus, string> = {
  GREEN: 'var(--status-green-glow)',
  YELLOW: 'var(--status-yellow-glow)',
  ORANGE: 'var(--status-orange-glow)',
  RED: 'var(--status-red-glow)',
};

export const STATUS_BG: Record<HealthStatus, string> = {
  GREEN: 'var(--status-green-bg)',
  YELLOW: 'var(--status-yellow-bg)',
  ORANGE: 'var(--status-orange-bg)',
  RED: 'var(--status-red-bg)',
};

export const STATUS_BORDER: Record<HealthStatus, string> = {
  GREEN: 'var(--status-green-border)',
  YELLOW: 'var(--status-yellow-border)',
  ORANGE: 'var(--status-orange-border)',
  RED: 'var(--status-red-border)',
};

export const STATUS_LABEL: Record<HealthStatus, string> = {
  GREEN: 'NOMINAL',
  YELLOW: 'MONITOR',
  ORANGE: 'ELEVATED',
  RED: 'CRITICAL',
};

export const RISK_COLOR: Record<RiskLevel, string> = {
  LOW: 'var(--status-green)',
  MODERATE: 'var(--status-yellow)',
  ELEVATED: 'var(--status-orange)',
  CRITICAL: 'var(--status-red)',
};

export const RISK_GLOW: Record<RiskLevel, string> = {
  LOW: 'var(--status-green-glow)',
  MODERATE: 'var(--status-yellow-glow)',
  ELEVATED: 'var(--status-orange-glow)',
  CRITICAL: 'var(--status-red-glow)',
};

export const RISK_BG: Record<RiskLevel, string> = {
  LOW: 'var(--status-green-bg)',
  MODERATE: 'var(--status-yellow-bg)',
  ELEVATED: 'var(--status-orange-bg)',
  CRITICAL: 'var(--status-red-bg)',
};

export const RISK_BORDER: Record<RiskLevel, string> = {
  LOW: 'var(--status-green-border)',
  MODERATE: 'var(--status-yellow-border)',
  ELEVATED: 'var(--status-orange-border)',
  CRITICAL: 'var(--status-red-border)',
};

export function statusToGlowColor(status: HealthStatus): string {
  return STATUS_GLOW[status];
}

export function riskToGlowColor(risk: RiskLevel): string {
  return RISK_GLOW[risk];
}

export function scoreToStatus(score: number): HealthStatus {
  if (score >= 80) return 'GREEN';
  if (score >= 65) return 'YELLOW';
  if (score >= 45) return 'ORANGE';
  return 'RED';
}
