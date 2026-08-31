export type HealthStatus = "nominal" | "monitor" | "elevated" | "critical";
export type NavPage =
  | "overview"
  | "crew"
  | "intelligence"
  | "readiness"
  | "events"
  | "recovery"
  | "triage"
  | "assistant";
export type Scenario = "normal" | "fatigue" | "illness" | "emergency";

export interface TrendPoint {
  hour: string;
  value: number;
  baseline: number;
}

export interface Vitals {
  heartRate: number;
  hrv: number;
  sleep: number;
  spo2: number;
  recovery: number;
}

export interface IntelFactor {
  label: string;
  direction: "up" | "down";
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  status: HealthStatus;
  health: number;
  recoveryScore: number;
  readiness: number;
  module: string;
  position3D: [number, number, number];
  baseline: Vitals;
  current: Vitals;
  intelligence: {
    pattern: string;
    factors: IntelFactor[];
    assessment: string;
    action: string;
    actionLabel: string;
    recommendations: string[];
  };
  trends: {
    heartRate: TrendPoint[];
    hrv: TrendPoint[];
    spo2: TrendPoint[];
    sleep: TrendPoint[];
    recovery: TrendPoint[];
  };
}
