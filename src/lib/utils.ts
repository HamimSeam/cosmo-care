import type { HealthStatus, RiskLevel } from '@/types';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function statusColor(status: HealthStatus): string {
  return {
    GREEN: 'text-emerald-400',
    YELLOW: 'text-yellow-400',
    ORANGE: 'text-orange-400',
    RED: 'text-red-400',
  }[status];
}

export function statusBg(status: HealthStatus): string {
  return {
    GREEN: 'bg-emerald-400/10 border-emerald-400/30',
    YELLOW: 'bg-yellow-400/10 border-yellow-400/30',
    ORANGE: 'bg-orange-400/10 border-orange-400/30',
    RED: 'bg-red-400/10 border-red-400/30',
  }[status];
}

export function statusDot(status: HealthStatus): string {
  return {
    GREEN: 'bg-emerald-400',
    YELLOW: 'bg-yellow-400',
    ORANGE: 'bg-orange-400',
    RED: 'bg-red-400',
  }[status];
}

export function riskColor(risk: RiskLevel): string {
  return {
    LOW: 'text-emerald-400',
    MODERATE: 'text-yellow-400',
    ELEVATED: 'text-orange-400',
    CRITICAL: 'text-red-400',
  }[risk];
}

export function riskBg(risk: RiskLevel): string {
  return {
    LOW: 'bg-emerald-400/10 border-emerald-400/30',
    MODERATE: 'bg-yellow-400/10 border-yellow-400/30',
    ELEVATED: 'bg-orange-400/10 border-orange-400/30',
    CRITICAL: 'bg-red-400/10 border-red-400/30',
  }[risk];
}

export function deviationColor(pct: number, invert = false): string {
  const v = invert ? -pct : pct;
  const abs = Math.abs(pct);
  if (abs <= 5) return 'text-slate-400';
  if (v > 0) return abs > 20 ? 'text-red-400' : abs > 10 ? 'text-orange-400' : 'text-yellow-400';
  return abs > 20 ? 'text-red-400' : abs > 10 ? 'text-orange-400' : 'text-yellow-400';
}

export function deviationLabel(pct: number): string {
  if (pct === 0) return 'At baseline';
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct}% from baseline`;
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 65) return 'text-yellow-400';
  if (score >= 45) return 'text-orange-400';
  return 'text-red-400';
}

export function scoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-400';
  if (score >= 65) return 'bg-yellow-400';
  if (score >= 45) return 'bg-orange-400';
  return 'bg-red-400';
}

export function readinessStatusColor(status: string): string {
  return {
    RECOMMENDED: 'text-emerald-400',
    CONDITIONAL: 'text-yellow-400',
    NOT_RECOMMENDED: 'text-orange-400',
    PROHIBITED: 'text-red-400',
  }[status] ?? 'text-slate-400';
}

export function formatDeviation(pct: number): string {
  if (Math.abs(pct) < 1) return 'Within baseline';
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct}%`;
}

export function symptomLabel(score: number): string {
  if (score === 0) return 'None';
  if (score <= 2) return 'Mild';
  if (score <= 5) return 'Moderate';
  if (score <= 8) return 'Severe';
  return 'Critical';
}

export function symptomColor(score: number): string {
  if (score === 0) return 'text-slate-500';
  if (score <= 2) return 'text-yellow-400';
  if (score <= 5) return 'text-orange-400';
  return 'text-red-400';
}
