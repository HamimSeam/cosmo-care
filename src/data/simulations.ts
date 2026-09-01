// ─── Demo Simulation Data ─────────────────────────────────────────────────────
//
// Each scenario contains a time-series of vital snapshots (one per tick) plus
// alert threshold rules.  The tick interval is defined in AppContext (3 s).
// Values are intentionally hardcoded so demos are deterministic and repeatable.
//
// The Isolation Forest was trained on real wearable data with these observed ranges:
//   hr:       40–125 bpm  (person-dependent)
//   spo2:     79–99 %     (person 5 dipped to ~79 during exercise — wide range)
//   resp_rr:  6–29 br/min
//
// The model detects MULTIVARIATE anomalies using 30s/120s/600s rolling features
// (mean, std, slope, deviation-from-roll).  A single out-of-range value is not
// enough — the scenarios below use SIMULTANEOUS extreme shifts in all three vitals
// plus high roll-slope (rapid change) to guarantee detection.
//
// Design rules for anomaly scenarios:
//   - Start clearly within a normal band so early rolling features are "normal"
//   - Then drive a fast, large simultaneous shift in hr + spo2 + resp_rr
//   - Keep the shift sustained so rolling windows fully capture it
//   - Values should reach levels that are jointly unusual (high HR + low SpO2 +
//     high resp together, with steep slopes)

export type SimVitalKey =
  | 'heartRate'
  | 'restingHR'
  | 'spo2'
  | 'temperature'
  | 'systolicBP'
  | 'diastolicBP'
  | 'respiratoryRate'
  | 'hrv'
  | 'hydration'
  | 'overallHealthScore'
  | 'recoveryScore'
  | 'cognitiveReadiness';

export interface SimFrame {
  tick: number; // 0-based index
  vitals: Record<SimVitalKey, number>;
}

export type AlertSeverity = 'MODERATE' | 'ELEVATED' | 'CRITICAL';

export interface SimAlertRule {
  id: string;
  vital: SimVitalKey;
  /** Trigger when value satisfies: direction='above' ? value >= threshold : value <= threshold */
  direction: 'above' | 'below';
  threshold: number;
  severity: AlertSeverity;
  title: string;
  summary: string;
  recommendation: string;
  /** Only fire once this tick index is reached (avoids spurious early alerts) */
  minTick?: number;
}

export interface DemoScenario {
  id: 'NORMAL' | 'DEVELOPING_ILLNESS' | 'MEDICAL_EMERGENCY';
  label: string;
  astronautId: string;
  color: string;
  description: string;
  /** Tick interval in milliseconds */
  tickMs: number;
  frames: SimFrame[];
  alertRules: SimAlertRule[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) {
  return parseFloat((a + (b - a) * t).toFixed(2));
}

/** Add gentle sinusoidal noise (±amplitude) around a flat value */
function flat(value: number, n: number, amplitude = 0): number[] {
  return Array.from({ length: n }, (_, i) => {
    const noise = amplitude * Math.sin(i * 1.3 + value * 0.07);
    return parseFloat((value + noise).toFixed(2));
  });
}

function buildFrames(series: Record<SimVitalKey, number[]>): SimFrame[] {
  const len = (Object.values(series)[0] as number[]).length;
  return Array.from({ length: len }, (_, tick) => ({
    tick,
    vitals: Object.fromEntries(
      (Object.keys(series) as SimVitalKey[]).map(k => [k, series[k][tick]])
    ) as Record<SimVitalKey, number>,
  }));
}

// Total ticks. At 3–4 s per poll the backend accumulates ~30 s of rolling context
// by tick 8–10, so anomaly onset from tick 10 onwards will have meaningful slopes.
const N = 40;

// ─── Scenario 1: NORMAL ───────────────────────────────────────────────────────
// Maya Chen — All three model vitals (hr, spo2, resp_rr) stable and typical.
// hr ≈ 72, spo2 ≈ 98, resp ≈ 14 — comfortably inside the training distribution.
// Gentle noise keeps rolling-std non-zero (more natural).

const normalSeries: Record<SimVitalKey, number[]> = {
  // Model vitals — flat with small physiological jitter
  heartRate:          flat(72, N, 2),
  respiratoryRate:    flat(14, N, 0.8),
  spo2:               flat(98, N, 0.3),

  // Supporting vitals (not sent to model but drive UI)
  restingHR:          flat(62, N, 1),
  temperature:        flat(36.8, N, 0.04),
  systolicBP:         flat(118, N, 1.5),
  diastolicBP:        flat(76, N, 1),
  hrv:                flat(68, N, 2),
  hydration:          flat(93, N, 0.8),
  overallHealthScore: flat(94, N, 0.5),
  recoveryScore:      flat(91, N, 0.5),
  cognitiveReadiness: flat(88, N, 0.5),
};

// ─── Scenario 2: DEVELOPING_ILLNESS ──────────────────────────────────────────
// Sam Patel — Gradual fever + tachycardia + early hypoxia developing over the run.
//
// Strategy:
//   Ticks  0–9  : normal baseline (builds "normal" rolling context)
//   Ticks 10–24 : steady upward ramp in hr & resp, downward in spo2
//   Ticks 25–39 : sustained plateau at clearly abnormal levels
//
// Target end-state:  hr=105, spo2=92, resp=26
// The combination of rising roll_slope + deviation-from-roll + sustained plateau
// should produce a clearly negative anomaly_score.

const ILL_ONSET = 10;
const ILL_RAMP  = 15;

function illnessVital(
  normal: number, peak: number,
  onsetTick: number, rampLen: number, total: number
): number[] {
  return Array.from({ length: total }, (_, i) => {
    if (i < onsetTick) return parseFloat((normal + (Math.sin(i * 1.1) * 1.2)).toFixed(2));
    const t = Math.min(i - onsetTick, rampLen) / rampLen;
    // ease-in curve so slope accelerates — creates a steep roll_slope signal
    const eased = t * t;
    return parseFloat(lerp(normal, peak, eased).toFixed(2));
  });
}

const illnessSeries: Record<SimVitalKey, number[]> = {
  // Model vitals — gradual but clear deterioration
  heartRate:          illnessVital(72,  105, ILL_ONSET, ILL_RAMP, N),   // +33 bpm
  respiratoryRate:    illnessVital(14,  26,  ILL_ONSET, ILL_RAMP, N),   // +12 br/min
  spo2:               illnessVital(98,  91,  ILL_ONSET, ILL_RAMP, N),   // −7 %  (descent)

  // Supporting vitals
  restingHR:          illnessVital(64,  95,  ILL_ONSET, ILL_RAMP, N),
  temperature:        illnessVital(36.7, 38.2, ILL_ONSET, ILL_RAMP, N),
  systolicBP:         illnessVital(122, 140, ILL_ONSET, ILL_RAMP, N),
  diastolicBP:        illnessVital(78,  92,  ILL_ONSET, ILL_RAMP, N),
  hrv:                illnessVital(62,  28,  ILL_ONSET, ILL_RAMP, N),   // HRV drops
  hydration:          illnessVital(92,  76,  ILL_ONSET, ILL_RAMP, N),
  overallHealthScore: illnessVital(84,  48,  ILL_ONSET, ILL_RAMP, N),
  recoveryScore:      illnessVital(78,  35,  ILL_ONSET, ILL_RAMP, N),
  cognitiveReadiness: illnessVital(85,  45,  ILL_ONSET, ILL_RAMP, N),
};

// ─── Scenario 3: MEDICAL_EMERGENCY ───────────────────────────────────────────
// Jordan Lee — Rapid post-EVA hemodynamic collapse.
//
// Strategy:
//   Ticks  0–7  : slightly elevated but plausible (post-EVA recovery)
//   Ticks  8–15 : sharp step-change — all three vitals swing hard simultaneously
//   Ticks 16–39 : sustained extreme values
//
// Target end-state:  hr=128, spo2=84, resp=30
// The abrupt simultaneous shift creates the highest possible roll_slope and
// dev_from_roll signals in all three channels, guaranteeing anomaly detection.

function emergencyVital(
  phase0: number, phase1: number, phase2: number,
  p1Start: number, p2Start: number, total: number
): number[] {
  return Array.from({ length: total }, (_, i) => {
    if (i < p1Start) {
      // Phase 0: slight post-EVA noise
      return parseFloat((phase0 + Math.sin(i * 0.9) * 1.5).toFixed(2));
    } else if (i < p2Start) {
      // Phase 1: fast ramp — linear over 8 ticks
      const t = (i - p1Start) / (p2Start - p1Start);
      return parseFloat(lerp(phase0, phase1, t).toFixed(2));
    } else {
      // Phase 2: sustained extreme with tiny noise
      return parseFloat((phase2 + Math.sin(i * 1.7) * 0.8).toFixed(2));
    }
  });
}

const emergencySeries: Record<SimVitalKey, number[]> = {
  // Model vitals — hard simultaneous shift
  heartRate:          emergencyVital(82,  115, 128, 8, 16, N),   // +46 above baseline
  respiratoryRate:    emergencyVital(16,  25,  30,  8, 16, N),   // +14 above baseline
  spo2:               emergencyVital(97,  90,  84,  8, 16, N),   // −13 %

  // Supporting vitals
  restingHR:          emergencyVital(70,  100, 115, 8, 16, N),
  temperature:        emergencyVital(36.7, 37.5, 38.1, 8, 16, N),
  systolicBP:         emergencyVital(120, 102,  92,  8, 16, N),  // BP dropping
  diastolicBP:        emergencyVital(78,  65,   58,  8, 16, N),
  hrv:                emergencyVital(65,  30,   16,  8, 16, N),
  hydration:          emergencyVital(92,  78,   66,  8, 16, N),
  overallHealthScore: emergencyVital(88,  55,   24,  8, 16, N),
  recoveryScore:      emergencyVital(84,  50,   16,  8, 16, N),
  cognitiveReadiness: emergencyVital(86,  52,   18,  8, 16, N),
};

// ─── Alert Rules ──────────────────────────────────────────────────────────────
// These fire in the UI based on simulated vital values.
// minTick ensures they only trigger once vitals have actually deteriorated.

const illnessAlerts: SimAlertRule[] = [
  {
    id: 'ill-hr',
    vital: 'heartRate',
    direction: 'above',
    threshold: 88,
    severity: 'MODERATE',
    minTick: ILL_ONSET + 4,
    title: 'Tachycardia — HR Rising',
    summary: 'Heart rate trending above personal baseline. Consistent with developing febrile illness or physiological stress.',
    recommendation: 'Increase monitoring frequency. Review workload. Assess for fever and dehydration.',
  },
  {
    id: 'ill-resp',
    vital: 'respiratoryRate',
    direction: 'above',
    threshold: 20,
    severity: 'MODERATE',
    minTick: ILL_ONSET + 6,
    title: 'Respiratory Rate Elevated',
    summary: 'Respiratory rate rising above normal range — possible early respiratory compromise or fever response.',
    recommendation: 'Monitor SpO₂ continuously. Assess for dyspnoea. Flag for medical review.',
  },
  {
    id: 'ill-spo2',
    vital: 'spo2',
    direction: 'below',
    threshold: 95,
    severity: 'ELEVATED',
    minTick: ILL_ONSET + 8,
    title: 'SpO₂ Declining',
    summary: 'Blood oxygen saturation trending below safe threshold. Combined with elevated HR and respiratory rate — multi-system stress pattern.',
    recommendation: 'Immediate medical assessment. Consider supplemental oxygen. Restrict activity.',
  },
  {
    id: 'ill-multisystem',
    vital: 'spo2',
    direction: 'below',
    threshold: 93,
    severity: 'ELEVATED',
    minTick: ILL_ONSET + 12,
    title: 'Multi-System Deterioration — Medical Review Required',
    summary: 'Simultaneous tachycardia, hypoxia, and tachypnoea indicate developing multi-system physiological stress. Pattern consistent with developing illness.',
    recommendation: 'Flight surgeon review within 1 hour. Suspend non-essential activities. Begin monitoring protocol.',
  },
];

const emergencyAlerts: SimAlertRule[] = [
  {
    id: 'emg-hr',
    vital: 'heartRate',
    direction: 'above',
    threshold: 100,
    severity: 'MODERATE',
    minTick: 10,
    title: 'Tachycardia — Rapid HR Elevation Post-EVA',
    summary: 'Heart rate acutely elevated following EVA. Rate of change suggests haemodynamic stress rather than exertion alone.',
    recommendation: 'Initiate oral rehydration. Complete rest. Continuous monitoring.',
  },
  {
    id: 'emg-spo2-warn',
    vital: 'spo2',
    direction: 'below',
    threshold: 93,
    severity: 'ELEVATED',
    minTick: 12,
    title: 'SpO₂ Critically Low',
    summary: 'Oxygen saturation falling rapidly. Combined with tachycardia and tachypnoea — haemodynamic compromise likely.',
    recommendation: 'Supplemental oxygen immediately. Alert flight surgeon. Prepare IV access.',
  },
  {
    id: 'emg-resp',
    vital: 'respiratoryRate',
    direction: 'above',
    threshold: 26,
    severity: 'ELEVATED',
    minTick: 14,
    title: 'Severe Tachypnoea',
    summary: 'Respiratory rate critically elevated. Combined with hypoxia and tachycardia — medical emergency in progress.',
    recommendation: 'IMMEDIATE medical intervention. Emergency protocol active. Contact flight surgeon.',
  },
  {
    id: 'emg-critical',
    vital: 'spo2',
    direction: 'below',
    threshold: 88,
    severity: 'CRITICAL',
    minTick: 18,
    title: 'CRITICAL: Severe Hypoxia — Medical Emergency',
    summary: 'SpO₂ at life-threatening level. Concurrent tachycardia (HR > 120) and respiratory distress confirm haemodynamic emergency.',
    recommendation: 'IMMEDIATE: Supplemental oxygen, IV fluids, continuous monitoring. Emergency medical protocol. Contact flight surgeon NOW.',
  },
];

// ─── Exported scenarios ───────────────────────────────────────────────────────

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'NORMAL',
    label: 'NORMAL',
    astronautId: 'maya-chen',
    color: '#22c55e',
    description: 'Maya · Nominal operations',
    tickMs: 3000,
    frames: buildFrames(normalSeries),
    alertRules: [],
  },
  {
    id: 'DEVELOPING_ILLNESS',
    label: 'ILLNESS',
    astronautId: 'sam-patel',
    color: '#f97316',
    description: 'Sam · Developing illness',
    tickMs: 3000,
    frames: buildFrames(illnessSeries),
    alertRules: illnessAlerts,
  },
  {
    id: 'MEDICAL_EMERGENCY',
    label: 'EMERGENCY',
    astronautId: 'jordan-lee',
    color: '#ef4444',
    description: 'Jordan · Medical emergency',
    tickMs: 2500,
    frames: buildFrames(emergencySeries),
    alertRules: emergencyAlerts,
  },
];

export function getScenario(id: DemoScenario['id']): DemoScenario {
  return DEMO_SCENARIOS.find(s => s.id === id) ?? DEMO_SCENARIOS[0];
}
