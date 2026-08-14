// ─── Core Types ──────────────────────────────────────────────────────────────

export type HealthStatus = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
export type RiskLevel = 'LOW' | 'MODERATE' | 'ELEVATED' | 'CRITICAL';

export interface VitalReading {
  value: number;
  unit: string;
  timestamp: string;
}

export interface Baseline {
  min: number;
  max: number;
  mean: number;
  unit: string;
  label: string;
}

export interface MetricWithBaseline {
  current: number;
  baseline: Baseline;
  trend: number[]; // last 7 readings
  deviationPct: number;
  unit: string;
  label: string;
  status: HealthStatus;
}

// ─── Physiological Data ───────────────────────────────────────────────────────

export interface PhysiologicalData {
  heartRate: MetricWithBaseline;
  restingHR: MetricWithBaseline;
  spo2: MetricWithBaseline;
  temperature: MetricWithBaseline;
  systolicBP: MetricWithBaseline;
  diastolicBP: MetricWithBaseline;
  respiratoryRate: MetricWithBaseline;
  hrv: MetricWithBaseline;
  hydration: MetricWithBaseline;
  weight: MetricWithBaseline;
}

// ─── Activity Data ────────────────────────────────────────────────────────────

export interface ActivityData {
  exerciseDuration: MetricWithBaseline;
  exerciseIntensity: MetricWithBaseline;
  dailyActivity: MetricWithBaseline;
  workload: MetricWithBaseline;
}

// ─── Recovery Data ────────────────────────────────────────────────────────────

export interface RecoveryData {
  sleepDuration: MetricWithBaseline;
  sleepQuality: MetricWithBaseline;
  recoveryScore: number;
  recoveryStatus: 'PEAK' | 'GOOD' | 'REDUCED' | 'LOW' | 'POOR';
  recoveryFactors: RecoveryFactor[];
}

export interface RecoveryFactor {
  label: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

// ─── Environmental Data ───────────────────────────────────────────────────────

export interface EnvironmentalData {
  co2Level: MetricWithBaseline;
  radiationExposure: MetricWithBaseline;
  cabinTemp: MetricWithBaseline;
  humidity: MetricWithBaseline;
  airQuality: MetricWithBaseline;
}

// ─── Cognitive Data ───────────────────────────────────────────────────────────

export interface CognitiveData {
  reactionTime: MetricWithBaseline;
  cognitiveTaskScore: MetricWithBaseline;
  fatigueLevel: MetricWithBaseline;
  selfReportedStress: MetricWithBaseline;
  selfReportedMood: MetricWithBaseline;
  cognitiveReadiness: number;
  cognitiveReadinessFactors: string[];
}

// ─── Symptoms ─────────────────────────────────────────────────────────────────

export interface Symptoms {
  fatigue: number; // 0–10
  headache: number;
  dizziness: number;
  nausea: number;
  cough: number;
  soreThroat: number;
  shortnessOfBreath: number;
  other: string[];
}

// ─── AI Alert ─────────────────────────────────────────────────────────────────

export interface AIAlert {
  id: string;
  riskLevel: RiskLevel;
  title: string;
  summary: string;
  confidence: number;
  contributingFactors: string[];
  recommendation: string;
  timestamp: string;
  acknowledged: boolean;
}

// ─── Mission Readiness ────────────────────────────────────────────────────────

export type MissionActivity = 'EVA' | 'SPACEWALK' | 'MAINTENANCE' | 'EMERGENCY_REPAIR' | 'SCIENCE';

export interface ReadinessEvaluation {
  activity: MissionActivity;
  score: number;
  status: 'RECOMMENDED' | 'CONDITIONAL' | 'NOT_RECOMMENDED' | 'PROHIBITED';
  contributingFactors: string[];
  recommendation: string;
  whatIfSimulation: {
    delay3h: number;
    delay6h: number;
    delay12h: number;
  };
}

// ─── Medical Event ────────────────────────────────────────────────────────────

export interface MedicalEvent {
  id: string;
  missionDay: number;
  timestamp: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  symptoms: string[];
  vitalChanges: { metric: string; change: string }[];
  recentContext: string[];
  aiAssessment: string;
  possibleConditions: string[];
  actionsTaken: string[];
  currentStatus: 'ACTIVE' | 'IMPROVING' | 'RESOLVED' | 'ESCALATED';
  flightSurgeonStatus: 'PENDING' | 'APPROVED' | 'MODIFIED' | 'ESCALATED';
  flightSurgeonNotes?: string;
}

// ─── Timeline Entry ───────────────────────────────────────────────────────────

export interface TimelineEntry {
  missionDay: number;
  date: string;
  status: HealthStatus;
  title: string;
  description: string;
  type: 'normal' | 'alert' | 'event' | 'recovery' | 'milestone';
}

// ─── Medical Resource ─────────────────────────────────────────────────────────

export interface MedicalResource {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  available: boolean;
  expiryDays?: number;
}

// ─── Communication Status ─────────────────────────────────────────────────────

export interface CommStatus {
  connected: boolean;
  delayMinutes: number;
  mode: 'NOMINAL' | 'DELAYED' | 'BLACKOUT';
  lastContactTimestamp: string;
}

// ─── Astronaut ────────────────────────────────────────────────────────────────

export interface Astronaut {
  id: string;
  name: string;
  role: string;
  missionDay: number;
  avatar: string; // initials
  healthStatus: HealthStatus;
  physiological: PhysiologicalData;
  activity: ActivityData;
  recovery: RecoveryData;
  environmental: EnvironmentalData;
  cognitive: CognitiveData;
  symptoms: Symptoms;
  alerts: AIAlert[];
  missionReadiness: ReadinessEvaluation;
  medicalEvents: MedicalEvent[];
  timeline: TimelineEntry[];
  scenario: ScenarioType;
  overallHealthScore: number;
}

// ─── Scenario ─────────────────────────────────────────────────────────────────

export type ScenarioType = 'NORMAL' | 'FATIGUE_BUILDUP' | 'DEVELOPING_ILLNESS' | 'MEDICAL_EMERGENCY' | 'RECOVERY';

// ─── App State ────────────────────────────────────────────────────────────────

export interface AppState {
  selectedAstronautId: string;
  activeNav: NavSection;
  commStatus: CommStatus;
  scenario: ScenarioType;
  missionDay: number;
  emergencyMode: boolean;
  medicalResources: MedicalResource[];
}

export type NavSection =
  | 'mission-overview'
  | 'crew-health'
  | 'health-intelligence'
  | 'mission-readiness'
  | 'medical-events'
  | 'recovery'
  | 'medical-resources'
  | 'ai-assistant';
