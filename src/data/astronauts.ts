import type {
  Astronaut, MetricWithBaseline, HealthStatus,
  AIAlert, TimelineEntry, RecoveryData,
  PhysiologicalData, ActivityData,
} from '@/types';

// ─── Helper ───────────────────────────────────────────────────────────────────

function deviation(current: number, mean: number): number {
  return Math.round(((current - mean) / mean) * 100);
}

function status(devPct: number, thresholds = { green: 10, yellow: 20, orange: 30 }): HealthStatus {
  const abs = Math.abs(devPct);
  if (abs <= thresholds.green) return 'GREEN';
  if (abs <= thresholds.yellow) return 'YELLOW';
  if (abs <= thresholds.orange) return 'ORANGE';
  return 'RED';
}

function metric(
  label: string, unit: string,
  bMin: number, bMax: number,
  current: number,
  trend: number[],
  thresholds?: { green: number; yellow: number; orange: number }
): MetricWithBaseline {
  const mean = (bMin + bMax) / 2;
  const dev = deviation(current, mean);
  return {
    label, unit, current,
    baseline: { min: bMin, max: bMax, mean, unit, label },
    trend,
    deviationPct: dev,
    status: status(dev, thresholds),
  };
}

// ─── ASTRONAUT 01: Maya Chen — Healthy / Normal ───────────────────────────────

const mayaChenPhysio: PhysiologicalData = {
  heartRate:       metric('Heart Rate',       'bpm', 62, 78, 71, [70, 72, 69, 74, 71, 73, 71]),
  restingHR:       metric('Resting HR',       'bpm', 58, 68, 62, [61, 63, 60, 64, 62, 65, 62]),
  spo2:            metric('SpO2',             '%',   97, 99, 98, [98, 98, 97, 99, 98, 98, 98]),
  temperature:     metric('Temperature',      '°C',  36.5, 37.2, 36.8, [36.8, 36.9, 36.7, 36.8, 36.9, 36.8, 36.8]),
  systolicBP:      metric('Systolic BP',      'mmHg',112, 124, 118, [117, 119, 116, 120, 118, 119, 118]),
  diastolicBP:     metric('Diastolic BP',     'mmHg', 72, 80,  76, [75, 77, 74, 78, 76, 77, 76]),
  respiratoryRate: metric('Respiratory Rate', 'br/m', 12, 16,  14, [14, 14, 13, 15, 14, 15, 14]),
  hrv:             metric('HRV',              'ms',   55, 75,  68, [67, 69, 66, 70, 68, 71, 68]),
  hydration:       metric('Hydration',        '%',    88, 96,  93, [93, 92, 94, 91, 93, 94, 93]),
  weight:          metric('Weight',           'kg',   59, 62,  60.5,[60.5, 60.4, 60.6, 60.5, 60.5, 60.4, 60.5]),
};

const mayaChenActivity: ActivityData = {
  exerciseDuration:  metric('Exercise Duration',  'min', 40, 60,  52, [48, 55, 50, 58, 52, 54, 52]),
  exerciseIntensity: metric('Exercise Intensity', '%',   55, 75,  65, [62, 68, 60, 72, 65, 67, 65]),
  dailyActivity:     metric('Daily Activity',     'kcal',2200, 2800, 2550, [2500, 2600, 2450, 2650, 2550, 2580, 2550]),
  workload:          metric('Workload Score',     '/10', 4, 7,    5, [5, 5, 4, 6, 5, 5, 5]),
};

const mayaChenRecovery: RecoveryData = {
  sleepDuration: metric('Sleep Duration', 'hrs', 6.8, 8.0, 7.4, [7.3, 7.5, 7.2, 7.6, 7.4, 7.5, 7.4]),
  sleepQuality:  metric('Sleep Quality',  '/10', 7, 9, 8.2, [8, 8.5, 7.8, 8.5, 8.2, 8.3, 8.2]),
  recoveryScore: 91,
  recoveryStatus: 'PEAK',
  recoveryFactors: [
    { label: 'Sleep quality', impact: 'positive', description: 'Above baseline — 8.2/10' },
    { label: 'Resting HR', impact: 'positive', description: 'Within personal baseline' },
    { label: 'HRV', impact: 'positive', description: 'HRV strong at 68 ms' },
    { label: 'Exercise load', impact: 'neutral', description: 'Normal training load' },
  ],
};

const mayaAlerts: AIAlert[] = [];

const mayaTimeline: TimelineEntry[] = [
  { missionDay: 140, date: '2031-03-01', status: 'GREEN', type: 'normal', title: 'Normal operations', description: 'All metrics within personal baseline.' },
  { missionDay: 143, date: '2031-03-04', status: 'GREEN', type: 'milestone', title: 'EVA completed', description: 'Nominal EVA. Recovery excellent.' },
  { missionDay: 147, date: '2031-03-08', status: 'GREEN', type: 'normal', title: 'Optimal readiness', description: 'Recovery Score: 91. EVA Readiness: 92.' },
];

export const MAYA_CHEN: Astronaut = {
  id: 'maya-chen',
  name: 'Maya Chen',
  role: 'Commander',
  missionDay: 147,
  avatar: 'MC',
  healthStatus: 'GREEN',
  overallHealthScore: 94,
  physiological: mayaChenPhysio,
  activity: mayaChenActivity,
  recovery: mayaChenRecovery,
  environmental: {
    co2Level:          metric('CO₂ Level',           'ppm', 350, 800, 520, [510, 515, 520, 530, 520, 510, 520]),
    radiationExposure: metric('Radiation Exposure',  'μSv/d', 0.2, 0.8, 0.42, [0.40, 0.41, 0.42, 0.43, 0.42, 0.41, 0.42]),
    cabinTemp:         metric('Cabin Temperature',   '°C', 20, 24, 22, [22, 22, 21, 23, 22, 22, 22]),
    humidity:          metric('Humidity',            '%', 40, 60, 50, [49, 50, 51, 50, 49, 50, 50]),
    airQuality:        metric('Air Quality',         '/100', 85, 100, 96, [95, 96, 97, 96, 95, 96, 96]),
  },
  cognitive: {
    reactionTime:        metric('Reaction Time',    'ms', 220, 280, 248, [252, 245, 250, 242, 248, 244, 248]),
    cognitiveTaskScore:  metric('Cognitive Score',  '/100', 78, 92, 87, [85, 88, 86, 89, 87, 88, 87]),
    fatigueLevel:        metric('Fatigue Level',    '/10', 1, 3, 2, [2, 2, 2, 1, 2, 2, 2]),
    selfReportedStress:  metric('Stress Level',     '/10', 2, 5, 3, [3, 3, 2, 3, 3, 4, 3]),
    selfReportedMood:    metric('Mood',             '/10', 7, 10, 8.5, [8.5, 8.0, 8.5, 9.0, 8.5, 8.0, 8.5]),
    cognitiveReadiness: 88,
    cognitiveReadinessFactors: ['Reaction time within baseline', 'High cognitive task score', 'Low fatigue', 'Normal stress levels'],
  },
  symptoms: { fatigue: 1, headache: 0, dizziness: 0, nausea: 0, cough: 0, soreThroat: 0, shortnessOfBreath: 0, other: [] },
  alerts: mayaAlerts,
  missionReadiness: {
    activity: 'EVA',
    score: 92,
    status: 'RECOMMENDED',
    contributingFactors: ['Optimal recovery score', 'Normal physiological state', 'Strong HRV', 'Adequate sleep'],
    recommendation: 'Astronaut is cleared for EVA operations. All physiological and cognitive metrics are within personal baseline.',
    whatIfSimulation: { delay3h: 93, delay6h: 93, delay12h: 92 },
  },
  medicalEvents: [],
  timeline: mayaTimeline,
  scenario: 'NORMAL',
};

// ─── ASTRONAUT 02: Alex Rivera — Mild Fatigue / Declining Recovery ────────────

const alexRiveraPhysio: PhysiologicalData = {
  heartRate:       metric('Heart Rate',       'bpm', 64, 80, 81, [72, 74, 75, 77, 79, 80, 81]),
  restingHR:       metric('Resting HR',       'bpm', 60, 70, 78, [63, 65, 67, 70, 73, 76, 78]),
  spo2:            metric('SpO2',             '%',   96, 99, 97, [98, 98, 97, 97, 97, 97, 97]),
  temperature:     metric('Temperature',      '°C',  36.4, 37.1, 36.9, [36.6, 36.7, 36.8, 36.9, 36.9, 36.9, 36.9]),
  systolicBP:      metric('Systolic BP',      'mmHg',115, 128, 125, [119, 121, 122, 123, 124, 125, 125]),
  diastolicBP:     metric('Diastolic BP',     'mmHg', 74, 82,  80, [76, 77, 78, 79, 79, 80, 80]),
  respiratoryRate: metric('Respiratory Rate', 'br/m', 13, 17,  16, [14, 14, 15, 15, 15, 16, 16]),
  hrv:             metric('HRV',              'ms',   50, 68,  46, [66, 62, 58, 55, 51, 48, 46]),
  hydration:       metric('Hydration',        '%',    86, 94,  84, [92, 91, 89, 88, 87, 85, 84]),
  weight:          metric('Weight',           'kg',   74, 77,  74.8,[76.2, 75.9, 75.6, 75.3, 75.1, 74.9, 74.8]),
};

const alexRiveraRecovery: RecoveryData = {
  sleepDuration: metric('Sleep Duration', 'hrs', 7.0, 8.2, 5.6, [7.8, 7.4, 7.0, 6.5, 6.2, 5.9, 5.6]),
  sleepQuality:  metric('Sleep Quality',  '/10', 7.5, 9.0, 5.8, [8.2, 7.8, 7.4, 7.0, 6.5, 6.2, 5.8]),
  recoveryScore: 62,
  recoveryStatus: 'REDUCED',
  recoveryFactors: [
    { label: 'Sleep deficit', impact: 'negative', description: 'Sleep has decreased 28% over 3 days' },
    { label: 'Elevated resting HR', impact: 'negative', description: 'Resting HR 17% above personal baseline' },
    { label: 'Declining HRV', impact: 'negative', description: 'HRV declined 30% from baseline' },
    { label: 'Increased fatigue', impact: 'negative', description: 'Fatigue score up to 6/10' },
    { label: 'Exercise load', impact: 'neutral', description: 'Moderate recent training load' },
  ],
};

const alexAlerts: AIAlert[] = [
  {
    id: 'alert-alex-01',
    riskLevel: 'MODERATE',
    title: 'Emerging Fatigue Pattern Detected',
    summary: 'Multivariate analysis identifies a developing fatigue pattern with multiple correlated physiological deviations over the past 72 hours.',
    confidence: 84,
    contributingFactors: [
      'Resting heart rate is 17% above personal baseline and trending upward',
      'Sleep duration has decreased 28% over the past 3 days',
      'HRV has declined 30% from baseline — sustained autonomic stress signal',
      'Self-reported fatigue has increased from 2/10 to 6/10',
      'Reaction time is 11% slower than personal baseline',
    ],
    recommendation: 'Increase monitoring frequency. Consider reducing non-essential workload for 24–48 hours. Reassess EVA readiness before any scheduled EVA.',
    timestamp: '2031-03-08T09:22:00Z',
    acknowledged: false,
  },
];

const alexTimeline: TimelineEntry[] = [
  { missionDay: 141, date: '2031-03-02', status: 'GREEN', type: 'normal', title: 'Nominal status', description: 'All metrics within baseline.' },
  { missionDay: 143, date: '2031-03-04', status: 'GREEN', type: 'normal', title: 'Sleep duration decreased', description: 'Sleep dropped from 7.8 hrs to 7.0 hrs.' },
  { missionDay: 144, date: '2031-03-05', status: 'YELLOW', type: 'alert', title: 'Resting HR elevated', description: 'Resting HR increased to 73 bpm (+8%).' },
  { missionDay: 145, date: '2031-03-06', status: 'YELLOW', type: 'alert', title: 'HRV declining', description: 'HRV dropped to 51 ms — 25% below baseline.' },
  { missionDay: 146, date: '2031-03-07', status: 'ORANGE', type: 'alert', title: 'Fatigue reported', description: 'Crew member self-reported fatigue 6/10.' },
  { missionDay: 147, date: '2031-03-08', status: 'ORANGE', type: 'alert', title: 'Emerging fatigue risk detected', description: 'AI identified multivariate fatigue pattern. Monitoring frequency increased.' },
];

export const ALEX_RIVERA: Astronaut = {
  id: 'alex-rivera',
  name: 'Alex Rivera',
  role: 'Flight Engineer',
  missionDay: 147,
  avatar: 'AR',
  healthStatus: 'YELLOW',
  overallHealthScore: 74,
  physiological: alexRiveraPhysio,
  activity: {
    exerciseDuration:  metric('Exercise Duration',  'min', 45, 65, 38, [58, 55, 52, 48, 45, 41, 38]),
    exerciseIntensity: metric('Exercise Intensity', '%',   60, 80, 58, [72, 70, 68, 65, 62, 60, 58]),
    dailyActivity:     metric('Daily Activity',     'kcal', 2400, 3000, 2280, [2850, 2780, 2650, 2520, 2420, 2350, 2280]),
    workload:          metric('Workload Score',     '/10', 4, 7, 7.5, [5, 5.5, 6, 6.5, 7, 7.2, 7.5]),
  },
  recovery: alexRiveraRecovery,
  environmental: {
    co2Level:          metric('CO₂ Level',           'ppm', 350, 800, 610, [510, 530, 555, 580, 600, 605, 610]),
    radiationExposure: metric('Radiation Exposure',  'μSv/d', 0.2, 0.8, 0.55, [0.40, 0.42, 0.45, 0.48, 0.50, 0.53, 0.55]),
    cabinTemp:         metric('Cabin Temperature',   '°C', 20, 24, 23, [22, 22, 23, 23, 23, 23, 23]),
    humidity:          metric('Humidity',            '%', 40, 60, 55, [50, 51, 52, 53, 54, 55, 55]),
    airQuality:        metric('Air Quality',         '/100', 85, 100, 88, [96, 94, 92, 91, 90, 89, 88]),
  },
  cognitive: {
    reactionTime:        metric('Reaction Time',    'ms', 230, 285, 316, [242, 252, 263, 278, 293, 305, 316]),
    cognitiveTaskScore:  metric('Cognitive Score',  '/100', 78, 94, 79, [91, 89, 87, 85, 83, 81, 79]),
    fatigueLevel:        metric('Fatigue Level',    '/10', 1, 3, 6, [2, 3, 3, 4, 5, 5, 6]),
    selfReportedStress:  metric('Stress Level',     '/10', 2, 5, 6, [3, 3, 4, 4, 5, 6, 6]),
    selfReportedMood:    metric('Mood',             '/10', 7, 10, 6.0, [8.5, 8.0, 7.5, 7.2, 6.8, 6.4, 6.0]),
    cognitiveReadiness: 71,
    cognitiveReadinessFactors: [
      'Reaction time 11% slower than personal baseline',
      'Cognitive task score near lower range of baseline',
      'Reported fatigue at 6/10 — above usual range',
      'Mood declining over 72 hours',
    ],
  },
  symptoms: { fatigue: 6, headache: 2, dizziness: 1, nausea: 0, cough: 0, soreThroat: 0, shortnessOfBreath: 0, other: [] },
  alerts: alexAlerts,
  missionReadiness: {
    activity: 'EVA',
    score: 63,
    status: 'NOT_RECOMMENDED',
    contributingFactors: [
      'Sleep deficit — 28% below baseline',
      'Reduced recovery score (62/100)',
      'Reaction time 11% slower than baseline',
      'Elevated fatigue (6/10)',
      'HRV 30% below personal baseline',
    ],
    recommendation: 'EVA not recommended. Delay and reassess after a 6–8 hour monitored rest period. Recommend reassessment after sleep recovery.',
    whatIfSimulation: { delay3h: 71, delay6h: 81, delay12h: 88 },
  },
  medicalEvents: [],
  timeline: alexTimeline,
  scenario: 'FATIGUE_BUILDUP',
};

// ─── ASTRONAUT 03: Sam Patel — Developing Health Concern ─────────────────────

const samPatelPhysio: PhysiologicalData = {
  heartRate:       metric('Heart Rate',       'bpm', 65, 82, 94, [74, 76, 80, 85, 89, 92, 94]),
  restingHR:       metric('Resting HR',       'bpm', 60, 72, 84, [64, 65, 68, 72, 76, 80, 84]),
  spo2:            metric('SpO2',             '%',   96, 99, 95, [98, 98, 97, 97, 96, 96, 95], {green:1, yellow:2, orange:3}),
  temperature:     metric('Temperature',      '°C',  36.4, 37.0, 37.8, [36.7, 36.9, 37.1, 37.3, 37.5, 37.7, 37.8]),
  systolicBP:      metric('Systolic BP',      'mmHg', 118, 130, 138, [122, 124, 127, 130, 133, 136, 138]),
  diastolicBP:     metric('Diastolic BP',     'mmHg',  76, 86, 90, [78, 79, 81, 84, 86, 88, 90]),
  respiratoryRate: metric('Respiratory Rate', 'br/m',  12, 17, 20, [14, 14, 15, 16, 17, 19, 20]),
  hrv:             metric('HRV',              'ms',   48, 66, 32, [62, 58, 54, 48, 43, 37, 32]),
  hydration:       metric('Hydration',        '%',    85, 94, 79, [92, 90, 88, 86, 84, 82, 79]),
  weight:          metric('Weight',           'kg',   80, 84, 81.5, [83.0, 82.8, 82.5, 82.2, 82.0, 81.8, 81.5]),
};

const samPatelAlerts: AIAlert[] = [
  {
    id: 'alert-sam-01',
    riskLevel: 'ELEVATED',
    title: 'Developing Physiological Stress Pattern',
    summary: 'Multi-system physiological deterioration detected. Pattern consistent with developing systemic stress or early illness. Requires immediate monitoring increase and medical review.',
    confidence: 91,
    contributingFactors: [
      'Resting HR elevated 24% above personal baseline and trending upward over 5 days',
      'Core temperature elevated 0.8°C above personal baseline range',
      'HRV declined 48% from baseline — significant autonomic disruption',
      'SpO2 trending downward — currently 1% below personal minimum',
      'Respiratory rate elevated to 20 br/min — 18% above baseline',
      'Systolic BP elevated 6% above baseline range',
      'Hydration decreased to 79% — 8% below baseline',
      'Self-reported nausea and fatigue',
    ],
    recommendation: 'Recommend immediate medical assessment. Increase monitoring to continuous. Reduce all non-essential mission activities. Recommend flight surgeon review within 1 hour.',
    timestamp: '2031-03-08T11:45:00Z',
    acknowledged: false,
  },
];

const samTimeline: TimelineEntry[] = [
  { missionDay: 140, date: '2031-03-01', status: 'GREEN', type: 'normal', title: 'Normal operations', description: 'All metrics within baseline.' },
  { missionDay: 142, date: '2031-03-03', status: 'GREEN', type: 'normal', title: 'Increased workload', description: 'Mission activity increased. Sleep slightly reduced.' },
  { missionDay: 143, date: '2031-03-04', status: 'YELLOW', type: 'alert', title: 'HR trend noted', description: 'Heart rate beginning upward trend.' },
  { missionDay: 144, date: '2031-03-05', status: 'YELLOW', type: 'alert', title: 'Temperature elevated', description: 'Temperature 0.3°C above personal baseline.' },
  { missionDay: 145, date: '2031-03-06', status: 'ORANGE', type: 'alert', title: 'HRV significantly declined', description: 'HRV at 43 ms — 35% below baseline.' },
  { missionDay: 146, date: '2031-03-07', status: 'ORANGE', type: 'alert', title: 'Multiple metrics deteriorating', description: 'SpO2 decreasing. Respiratory rate elevated. Nausea reported.' },
  { missionDay: 147, date: '2031-03-08', status: 'RED', type: 'event', title: 'Elevated risk detected — medical review required', description: 'AI identified multi-system physiological stress pattern. Flight surgeon review recommended.' },
];

export const SAM_PATEL: Astronaut = {
  id: 'sam-patel',
  name: 'Sam Patel',
  role: 'Mission Specialist',
  missionDay: 147,
  avatar: 'SP',
  healthStatus: 'ORANGE',
  overallHealthScore: 58,
  physiological: samPatelPhysio,
  activity: {
    exerciseDuration:  metric('Exercise Duration',  'min', 40, 60, 20, [52, 48, 42, 35, 28, 22, 20]),
    exerciseIntensity: metric('Exercise Intensity', '%',   55, 72, 30, [65, 62, 55, 48, 40, 35, 30]),
    dailyActivity:     metric('Daily Activity',     'kcal', 2100, 2700, 1850, [2500, 2400, 2250, 2100, 1980, 1900, 1850]),
    workload:          metric('Workload Score',     '/10', 4, 7, 8, [5, 6, 7, 7.5, 8, 8, 8]),
  },
  recovery: {
    sleepDuration: metric('Sleep Duration', 'hrs', 6.5, 8.0, 4.9, [7.5, 7.0, 6.5, 6.0, 5.5, 5.2, 4.9]),
    sleepQuality:  metric('Sleep Quality',  '/10', 7.0, 9.0, 4.5, [8.0, 7.5, 7.0, 6.5, 5.8, 5.0, 4.5]),
    recoveryScore: 41,
    recoveryStatus: 'LOW',
    recoveryFactors: [
      { label: 'Severe sleep deficit', impact: 'negative', description: 'Sleep decreased 35% over 5 days' },
      { label: 'Elevated resting HR', impact: 'negative', description: 'Resting HR 24% above baseline' },
      { label: 'HRV critically low', impact: 'negative', description: 'HRV 48% below personal baseline' },
      { label: 'High workload', impact: 'negative', description: 'Sustained high mission workload' },
      { label: 'Physical symptoms', impact: 'negative', description: 'Reported nausea and fatigue' },
    ],
  },
  environmental: {
    co2Level:          metric('CO₂ Level',           'ppm', 350, 800, 720, [510, 560, 610, 650, 690, 710, 720]),
    radiationExposure: metric('Radiation Exposure',  'μSv/d', 0.2, 0.8, 0.74, [0.40, 0.48, 0.55, 0.62, 0.68, 0.72, 0.74]),
    cabinTemp:         metric('Cabin Temperature',   '°C', 20, 24, 25, [22, 22, 23, 24, 24.5, 25, 25]),
    humidity:          metric('Humidity',            '%', 40, 60, 64, [50, 52, 55, 58, 61, 63, 64]),
    airQuality:        metric('Air Quality',         '/100', 85, 100, 78, [96, 93, 90, 87, 82, 79, 78]),
  },
  cognitive: {
    reactionTime:        metric('Reaction Time',    'ms', 238, 295, 348, [255, 265, 278, 295, 315, 332, 348]),
    cognitiveTaskScore:  metric('Cognitive Score',  '/100', 76, 92, 68, [88, 85, 81, 78, 74, 70, 68]),
    fatigueLevel:        metric('Fatigue Level',    '/10', 1, 3, 8, [3, 4, 5, 6, 7, 7.5, 8]),
    selfReportedStress:  metric('Stress Level',     '/10', 2, 5, 8, [4, 5, 6, 7, 7.5, 8, 8]),
    selfReportedMood:    metric('Mood',             '/10', 7, 10, 4.5, [8.0, 7.5, 7.0, 6.5, 6.0, 5.2, 4.5]),
    cognitiveReadiness: 52,
    cognitiveReadinessFactors: [
      'Reaction time 21% slower than personal baseline — significant impairment',
      'Cognitive task performance 24% below normal range',
      'Fatigue rated 8/10 — severely elevated',
      'Mood critically low — 4.5/10 vs baseline 7–10',
    ],
  },
  symptoms: { fatigue: 8, headache: 5, dizziness: 4, nausea: 6, cough: 2, soreThroat: 1, shortnessOfBreath: 3, other: ['Chills', 'Myalgia'] },
  alerts: samPatelAlerts,
  missionReadiness: {
    activity: 'EVA',
    score: 22,
    status: 'PROHIBITED',
    contributingFactors: [
      'Active health concern — multi-system physiological stress',
      'Critical recovery score (41/100)',
      'Cognitive impairment — 21% reaction time increase',
      'Severely elevated fatigue (8/10)',
      'SpO2 below personal minimum',
      'Elevated temperature',
    ],
    recommendation: 'EVA prohibited. Astronaut requires immediate medical assessment and full rest. No mission activities until medical clearance.',
    whatIfSimulation: { delay3h: 25, delay6h: 32, delay12h: 44 },
  },
  medicalEvents: [
    {
      id: 'event-sam-01',
      missionDay: 147,
      timestamp: '2031-03-08T11:45:00Z',
      severity: 'HIGH',
      symptoms: ['Fever', 'Nausea', 'Fatigue', 'Dizziness', 'Chills', 'Myalgia'],
      vitalChanges: [
        { metric: 'Resting HR', change: '+24% above baseline' },
        { metric: 'Temperature', change: '+0.8°C above personal range' },
        { metric: 'SpO2', change: '-3% from baseline' },
        { metric: 'HRV', change: '-48% from baseline' },
        { metric: 'Respiratory Rate', change: '+18% above baseline' },
      ],
      recentContext: [
        'Elevated workload over past 5 days',
        'Sleep deficit accumulated over 5 days',
        'CO₂ levels slightly elevated in work module',
        'No recent EVA',
      ],
      aiAssessment: 'Current multi-system pattern is potentially consistent with a systemic infection, physiological stress response, or environmental exposure. The combination of elevated temperature, declining SpO2, elevated HR, decreased HRV, and reported symptoms requires urgent medical assessment. Further assessment is required to determine etiology.',
      possibleConditions: [
        'Systemic infection (requires assessment)',
        'Physiological stress response (requires assessment)',
        'Environmental exposure — elevated CO₂ (partial contributor)',
        'Fatigue-mediated immune compromise (contributing factor)',
      ],
      actionsTaken: [
        'Monitoring frequency increased to continuous',
        'Non-essential mission activities suspended',
        'Hydration protocol initiated',
        'CO₂ scrubber inspection scheduled',
      ],
      currentStatus: 'ACTIVE',
      flightSurgeonStatus: 'PENDING',
    },
  ],
  timeline: samTimeline,
  scenario: 'DEVELOPING_ILLNESS',
};

// ─── ASTRONAUT 04: Jordan Lee — Medical Emergency ─────────────────────────────

const jordanLeePhysio: PhysiologicalData = {
  heartRate:       metric('Heart Rate',       'bpm', 62, 76, 118, [70, 72, 78, 88, 98, 110, 118]),
  restingHR:       metric('Resting HR',       'bpm', 58, 70, 106, [62, 65, 70, 78, 88, 98, 106]),
  spo2:            metric('SpO2',             '%',   97, 99, 93, [98, 98, 97, 96, 95, 94, 93], {green:1, yellow:2, orange:3}),
  temperature:     metric('Temperature',      '°C',  36.5, 37.2, 37.9, [36.7, 36.8, 37.0, 37.3, 37.6, 37.8, 37.9]),
  systolicBP:      metric('Systolic BP',      'mmHg',114, 126, 96, [120, 118, 114, 108, 102, 98, 96]),
  diastolicBP:     metric('Diastolic BP',     'mmHg', 72, 82, 60, [78, 76, 73, 68, 64, 62, 60]),
  respiratoryRate: metric('Respiratory Rate', 'br/m', 12, 16, 22, [14, 14, 15, 16, 18, 20, 22]),
  hrv:             metric('HRV',              'ms',   52, 72, 18, [68, 62, 52, 42, 32, 24, 18]),
  hydration:       metric('Hydration',        '%',    87, 95, 68, [93, 91, 88, 84, 78, 72, 68]),
  weight:          metric('Weight',           'kg',   72, 75, 72.2, [74.5, 74.3, 74.0, 73.6, 73.1, 72.6, 72.2]),
};

const jordanAlerts: AIAlert[] = [
  {
    id: 'alert-jordan-01',
    riskLevel: 'CRITICAL',
    title: 'CRITICAL: Medical Emergency — Immediate Review Required',
    summary: 'Critical multi-system physiological deterioration detected. Pattern consistent with severe dehydration and/or hemodynamic compromise following EVA. Immediate medical assessment required.',
    confidence: 97,
    contributingFactors: [
      'Heart rate elevated 63% above personal baseline — 118 bpm',
      'Systolic blood pressure critically low — 24% below baseline range',
      'SpO2 at 93% — critically below personal minimum of 97%',
      'HRV critically low at 18 ms — 72% below baseline',
      'Hydration at 68% — severely depleted',
      'EVA completed 2 hours prior — high exertion history',
      'Reported dizziness, nausea, and severe fatigue',
      'Respiratory rate 37.5% above personal baseline',
    ],
    recommendation: 'IMMEDIATE medical intervention required. Initiate oral or IV rehydration. Continuous monitoring. Restrict all activity. Activate emergency medical protocol. Contact flight surgeon immediately.',
    timestamp: '2031-03-08T14:30:00Z',
    acknowledged: false,
  },
];

const jordanTimeline: TimelineEntry[] = [
  { missionDay: 143, date: '2031-03-04', status: 'GREEN', type: 'normal', title: 'Pre-EVA baseline', description: 'Normal status. EVA preparation complete.' },
  { missionDay: 144, date: '2031-03-05', status: 'GREEN', type: 'milestone', title: 'EVA commenced', description: '6.5-hour spacewalk — nominal during EVA.' },
  { missionDay: 145, date: '2031-03-06', status: 'YELLOW', type: 'alert', title: 'Post-EVA fatigue', description: 'Mild fatigue and HR elevation post-EVA — expected.' },
  { missionDay: 146, date: '2031-03-07', status: 'ORANGE', type: 'alert', title: 'Recovery stalling', description: 'HR not returning to baseline. Hydration decreasing.' },
  { missionDay: 147, date: '2031-03-08', status: 'RED', type: 'event', title: '⚠ MEDICAL EMERGENCY ACTIVE', description: 'Critical vitals: HR 118, BP ↓24%, SpO2 93%. Dizziness and nausea reported.' },
];

export const JORDAN_LEE: Astronaut = {
  id: 'jordan-lee',
  name: 'Jordan Lee',
  role: 'Science Officer',
  missionDay: 147,
  avatar: 'JL',
  healthStatus: 'RED',
  overallHealthScore: 28,
  physiological: jordanLeePhysio,
  activity: {
    exerciseDuration:  metric('Exercise Duration',  'min', 40, 60, 390, [52, 50, 48, 390, 10, 0, 0]),
    exerciseIntensity: metric('Exercise Intensity', '%',   55, 75, 92, [62, 65, 68, 92, 20, 0, 0]),
    dailyActivity:     metric('Daily Activity',     'kcal', 2000, 2600, 4200, [2400, 2350, 2400, 4200, 1800, 1200, 800]),
    workload:          metric('Workload Score',     '/10', 3, 7, 9.5, [5, 5.5, 6, 9.5, 8, 7, 6]),
  },
  recovery: {
    sleepDuration: metric('Sleep Duration', 'hrs', 6.8, 8.0, 3.2, [7.5, 7.2, 6.8, 3.5, 3.2, 3.2, 3.2]),
    sleepQuality:  metric('Sleep Quality',  '/10', 7.2, 9.0, 2.8, [8.2, 8.0, 7.5, 3.5, 2.8, 2.8, 2.8]),
    recoveryScore: 18,
    recoveryStatus: 'POOR',
    recoveryFactors: [
      { label: 'Acute dehydration', impact: 'negative', description: 'Hydration at 68% — severe deficit' },
      { label: 'Post-EVA physiological stress', impact: 'negative', description: '6.5-hour EVA completed 2 hours ago' },
      { label: 'Critical sleep deprivation', impact: 'negative', description: 'Only 3.2 hrs sleep in past 24h' },
      { label: 'Hemodynamic instability', impact: 'negative', description: 'BP falling, HR critically elevated' },
      { label: 'SpO2 below safe threshold', impact: 'negative', description: 'SpO2 at 93%' },
    ],
  },
  environmental: {
    co2Level:          metric('CO₂ Level',           'ppm', 350, 800, 580, [510, 520, 530, 540, 555, 570, 580]),
    radiationExposure: metric('Radiation Exposure',  'μSv/d', 0.2, 0.8, 0.68, [0.40, 0.44, 0.48, 0.85, 0.70, 0.68, 0.68]),
    cabinTemp:         metric('Cabin Temperature',   '°C', 20, 24, 26, [22, 22, 22, 27, 26, 26, 26]),
    humidity:          metric('Humidity',            '%', 40, 60, 42, [50, 50, 50, 45, 42, 42, 42]),
    airQuality:        metric('Air Quality',         '/100', 85, 100, 82, [96, 95, 94, 92, 88, 84, 82]),
  },
  cognitive: {
    reactionTime:        metric('Reaction Time',    'ms', 225, 280, 412, [248, 255, 265, 380, 395, 404, 412]),
    cognitiveTaskScore:  metric('Cognitive Score',  '/100', 80, 95, 44, [90, 88, 85, 58, 50, 47, 44]),
    fatigueLevel:        metric('Fatigue Level',    '/10', 1, 3, 10, [2, 2, 3, 8, 9, 10, 10]),
    selfReportedStress:  metric('Stress Level',     '/10', 2, 5, 9, [3, 3, 4, 8, 9, 9, 9]),
    selfReportedMood:    metric('Mood',             '/10', 7, 10, 3.0, [8.5, 8.2, 8.0, 4.0, 3.2, 3.0, 3.0]),
    cognitiveReadiness: 22,
    cognitiveReadinessFactors: [
      'Reaction time 58% slower than personal baseline — severe impairment',
      'Cognitive task performance 54% below normal range',
      'Fatigue at maximum reported level (10/10)',
      'Severe psychological distress indicators',
    ],
  },
  symptoms: { fatigue: 10, headache: 8, dizziness: 9, nausea: 8, cough: 0, soreThroat: 0, shortnessOfBreath: 7, other: ['Confusion', 'Weakness', 'Pallor'] },
  alerts: jordanAlerts,
  missionReadiness: {
    activity: 'EVA',
    score: 0,
    status: 'PROHIBITED',
    contributingFactors: [
      'Active medical emergency — hemodynamic instability',
      'SpO2 at 93% — below safe operational threshold',
      'Severe dehydration (68% hydration)',
      'Critical cognitive impairment — 58% reaction time increase',
      'Maximum fatigue (10/10)',
    ],
    recommendation: 'All mission activities prohibited. Medical emergency protocol active. Immediate medical intervention required.',
    whatIfSimulation: { delay3h: 8, delay6h: 22, delay12h: 41 },
  },
  medicalEvents: [
    {
      id: 'event-jordan-01',
      missionDay: 147,
      timestamp: '2031-03-08T14:30:00Z',
      severity: 'CRITICAL',
      symptoms: ['Severe dizziness', 'Nausea', 'Extreme fatigue', 'Shortness of breath', 'Confusion', 'Weakness'],
      vitalChanges: [
        { metric: 'Heart Rate', change: '+63% above baseline — 118 bpm' },
        { metric: 'Systolic BP', change: '-24% below baseline — 96 mmHg' },
        { metric: 'SpO2', change: '-4% from baseline — 93%' },
        { metric: 'HRV', change: '-72% from baseline — 18 ms' },
        { metric: 'Hydration', change: '-26% below baseline — 68%' },
        { metric: 'Temperature', change: '+0.7°C above baseline range — 37.9°C' },
      ],
      recentContext: [
        '6.5-hour EVA completed 2 hours prior',
        'High physical exertion during EVA',
        'Only 3.2 hours sleep in past 24 hours',
        'Pre-EVA hydration status was borderline',
        'Elevated cabin temperature post-EVA (26°C)',
      ],
      aiAssessment: 'Current physiological pattern is potentially consistent with severe dehydration and post-EVA hemodynamic compromise. The combination of critically elevated heart rate, decreased blood pressure, declining SpO2, severely low HRV, and acute hydration deficit following a prolonged EVA is consistent with volume depletion. Hypovolemic response and orthostatic hypotension should be assessed. Differential considerations include heat stress and EVA-related physiological decompensation. Definitive assessment requires qualified medical evaluation.',
      possibleConditions: [
        'Severe dehydration / hypovolemia (high probability — requires confirmation)',
        'Post-EVA hemodynamic compromise (high probability — requires confirmation)',
        'Orthostatic hypotension (requires assessment)',
        'Heat stress (contributing factor)',
        'EVA-related physiological decompensation (requires assessment)',
      ],
      actionsTaken: [
        'Oral rehydration solution initiated immediately',
        'All mission activities suspended',
        'Continuous monitoring activated',
        'IV fluids prepared (pending medical authorization)',
        'Crew Medical Officer notified',
        'Earth communication attempted — 18-minute delay active',
        'Emergency medical protocol initiated',
      ],
      currentStatus: 'ACTIVE',
      flightSurgeonStatus: 'PENDING',
    },
  ],
  timeline: jordanTimeline,
  scenario: 'MEDICAL_EMERGENCY',
};

// ─── Export all ───────────────────────────────────────────────────────────────

export const ASTRONAUTS: Astronaut[] = [MAYA_CHEN, ALEX_RIVERA, SAM_PATEL, JORDAN_LEE];

export function getAstronautById(id: string): Astronaut | undefined {
  return ASTRONAUTS.find(a => a.id === id);
}
