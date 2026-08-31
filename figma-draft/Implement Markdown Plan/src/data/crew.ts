import type { CrewMember, TrendPoint } from "../types";

function hrs(values: number[], baseline: number): TrendPoint[] {
  return values.map((value, i) => ({
    hour: `${String(i).padStart(2, "0")}:00`,
    value,
    baseline,
  }));
}

export const crewMembers: CrewMember[] = [
  {
    id: "maya",
    name: "Maya Chen",
    role: "Commander",
    status: "nominal",
    health: 94,
    recoveryScore: 91,
    readiness: 92,
    module: "Command Module",
    position3D: [0.1, 0.35, -2.6],
    baseline: { heartRate: 62, hrv: 65, sleep: 7.4, spo2: 98.5, recovery: 92 },
    current: { heartRate: 64, hrv: 63, sleep: 7.2, spo2: 98, recovery: 91 },
    intelligence: {
      pattern: "All Systems Nominal",
      factors: [
        { label: "Vitals within personal baseline", direction: "up" },
        { label: "Sleep quality maintained", direction: "up" },
        { label: "Recovery index optimal", direction: "up" },
      ],
      assessment:
        "Commander Chen's physiological indicators are consistent with her personal baseline across all tracked metrics. Sleep architecture, heart rate variability, and recovery scores indicate optimal performance state. No intervention required.",
      action: "NOMINAL",
      actionLabel: "Maintain",
      recommendations: [
        "Continue standard monitoring protocol",
        "Maintain current rest and work schedule",
        "All scheduled mission activities cleared to proceed",
      ],
    },
    trends: {
      heartRate: hrs([64,62,63,61,60,59,63,67,68,66,65,67,68,69,66,65,64,65,67,66,64,63,65,64], 62),
      hrv: hrs([62,64,65,66,67,68,65,60,59,61,62,60,59,58,61,62,63,62,60,61,63,64,62,63], 65),
      spo2: hrs([98,98,99,98,99,99,98,98,97,98,98,98,98,97,98,98,99,98,98,98,97,98,98,98], 98.5),
      sleep: hrs([7.4,7.3,7.2,7.1,7.3,7.4,7.3,7.2,7.3,7.4,7.3,7.4,7.2,7.3,7.4,7.3,7.2,7.4,7.3,7.2,7.3,7.4,7.2,7.4], 7.4),
      recovery: hrs([90,91,92,92,91,94,93,92,90,91,92,91,90,91,92,91,90,91,92,93,92,91,92,94], 92),
    },
  },
  {
    id: "alex",
    name: "Alex Rivera",
    role: "Flight Engineer",
    status: "monitor",
    health: 74,
    recoveryScore: 68,
    readiness: 71,
    module: "Engineering Section",
    position3D: [0.35, -0.15, 1.4],
    baseline: { heartRate: 66, hrv: 60, sleep: 7.1, spo2: 97.5, recovery: 85 },
    current: { heartRate: 76, hrv: 48, sleep: 5.9, spo2: 96, recovery: 74 },
    intelligence: {
      pattern: "Emerging Fatigue Pattern",
      factors: [
        { label: "Sleep quality declining (–1.2 hr vs baseline)", direction: "down" },
        { label: "HRV reduced (–12 ms from baseline)", direction: "down" },
        { label: "Resting heart rate elevated (+10 bpm)", direction: "up" },
        { label: "Recovery score decreasing trend", direction: "down" },
      ],
      assessment:
        "Multiple physiological deviations from Engineer Rivera's personal baseline indicate accumulating physiological stress consistent with sleep-related fatigue. Trend is worsening over the past 12 hours. Early intervention recommended before performance impairment occurs.",
      action: "MONITOR",
      actionLabel: "Monitor",
      recommendations: [
        "Increase physiological monitoring frequency",
        "Encourage prioritized rest period before next duty cycle",
        "Ensure adequate hydration — 500ml above standard",
        "Recheck HRV and resting HR metrics in 30 minutes",
      ],
    },
    trends: {
      heartRate: hrs([70,71,72,73,74,75,76,75,74,73,75,76,77,78,79,79,78,77,78,79,80,81,80,76], 66),
      hrv: hrs([58,56,55,54,52,51,52,50,49,48,47,46,48,46,45,44,48,46,48,48,47,46,48,48], 60),
      spo2: hrs([97,97,96,97,97,96,96,97,96,97,96,96,96,96,97,96,97,96,97,96,96,96,97,96], 97.5),
      sleep: hrs([7.1,6.9,6.8,6.5,6.4,6.3,6.5,6.3,6.2,6.1,6.0,6.1,6.2,6.0,5.9,5.9,6.0,6.1,6.0,6.0,5.9,5.9,6.0,5.9], 7.1),
      recovery: hrs([82,80,79,78,76,75,74,73,72,72,71,72,72,71,70,71,72,72,71,73,72,74,73,74], 85),
    },
  },
  {
    id: "sam",
    name: "Sam Patel",
    role: "Mission Specialist",
    status: "elevated",
    health: 58,
    recoveryScore: 52,
    readiness: 49,
    module: "Science Laboratory",
    position3D: [-0.3, 0.5, -0.8],
    baseline: { heartRate: 70, hrv: 55, sleep: 7.0, spo2: 97.0, recovery: 80 },
    current: { heartRate: 89, hrv: 36, sleep: 5.1, spo2: 94, recovery: 58 },
    intelligence: {
      pattern: "Developing Physiological Stress",
      factors: [
        { label: "Heart rate elevated +19 bpm above baseline", direction: "up" },
        { label: "HRV critically reduced (–19 ms)", direction: "down" },
        { label: "SpO₂ declining toward lower threshold", direction: "down" },
        { label: "Sleep severely disrupted (–1.9 hr)", direction: "down" },
        { label: "Recovery at 52 — below mission threshold", direction: "down" },
      ],
      assessment:
        "Specialist Patel exhibits a multi-system deviation pattern from personal baseline consistent with developing physiological illness or acute stress response. The convergence of elevated heart rate, depressed HRV, reduced SpO₂, and poor sleep quality across a 16-hour window warrants escalated assessment and immediate workload reduction.",
      action: "PREVENT",
      actionLabel: "Prevent",
      recommendations: [
        "Immediately reduce discretionary workload — mission non-critical tasks only",
        "Initiate targeted health assessment: temperature, blood pressure, chest auscultation",
        "Begin hydration and rest protocol — 4-hour protected rest window",
        "Notify mission medical officer for formal evaluation",
      ],
    },
    trends: {
      heartRate: hrs([78,80,81,83,85,84,86,87,86,88,89,88,87,89,90,89,88,87,88,90,89,88,89,89], 70),
      hrv: hrs([44,42,40,39,38,37,36,38,36,35,34,35,36,34,34,33,34,35,36,37,36,35,36,36], 55),
      spo2: hrs([96,95,96,95,95,94,95,95,94,94,95,94,94,94,95,94,94,95,94,94,95,94,95,94], 97),
      sleep: hrs([6.8,6.5,6.3,6.0,5.8,5.7,5.6,5.5,5.4,5.3,5.2,5.1,5.2,5.1,5.0,5.1,5.2,5.1,5.1,5.0,5.1,5.1,5.1,5.1], 7.0),
      recovery: hrs([70,68,66,64,62,60,58,57,56,55,54,53,54,55,56,57,56,57,58,59,58,57,58,58], 80),
    },
  },
  {
    id: "jordan",
    name: "Jordan Lee",
    role: "Science Officer",
    status: "critical",
    health: 28,
    recoveryScore: 24,
    readiness: 18,
    module: "Medical Bay",
    position3D: [0.4, 0.1, -1.4],
    baseline: { heartRate: 68, hrv: 62, sleep: 7.3, spo2: 98.0, recovery: 88 },
    current: { heartRate: 112, hrv: 22, sleep: 2.8, spo2: 91, recovery: 28 },
    intelligence: {
      pattern: "Critical Physiological Event",
      factors: [
        { label: "Tachycardia: HR 112 bpm (+44 above baseline)", direction: "up" },
        { label: "HRV severely depressed (–40 ms)", direction: "down" },
        { label: "SpO₂ at 91% — hypoxic threshold", direction: "down" },
        { label: "Sleep collapsed to 2.8 hr — severe disruption", direction: "down" },
        { label: "Recovery index critical: 28/100", direction: "down" },
      ],
      assessment:
        "Officer Lee is experiencing a critical multi-system physiological event. The combination of severe tachycardia, markedly depressed HRV, hypoxic SpO₂ levels, and near-complete sleep disruption represents an acute medical emergency. Immediate clinical assessment and intervention are required. AstroTriage protocol should be initiated without delay.",
      action: "RESPOND",
      actionLabel: "Respond",
      recommendations: [
        "INITIATE ASTROTRIAGE PROTOCOL IMMEDIATELY",
        "Assign crew member for immediate physical assessment",
        "Begin supplemental oxygen — 2L/min via cannula",
        "Contact flight surgeon — priority uplink required",
        "Document all vitals every 5 minutes",
      ],
    },
    trends: {
      heartRate: hrs([95,98,102,105,108,112,110,108,110,112,115,113,112,110,112,114,115,113,110,108,110,112,109,112], 68),
      hrv: hrs([28,26,25,24,23,22,22,21,20,22,20,18,19,20,18,18,19,20,22,21,20,19,22,22], 62),
      spo2: hrs([93,92,91,92,91,92,91,92,91,91,91,92,91,90,91,91,92,91,91,91,91,92,91,91], 98),
      sleep: hrs([5.2,4.8,4.2,3.8,3.5,3.2,2.9,2.8,2.8,2.8,2.8,2.8,2.8,2.8,2.8,2.8,2.8,2.8,2.8,2.8,2.8,2.8,2.8,2.8], 7.3),
      recovery: hrs([42,38,35,32,30,28,26,25,28,26,24,22,24,25,26,26,28,27,28,29,28,28,28,28], 88),
    },
  },
];

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "nominal": return "#22c55e";
    case "monitor": return "#eab308";
    case "elevated": return "#f97316";
    case "critical": return "#ef4444";
    default: return "#22c55e";
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case "nominal": return "NOMINAL";
    case "monitor": return "MONITOR";
    case "elevated": return "ELEVATED";
    case "critical": return "CRITICAL";
    default: return "UNKNOWN";
  }
};

export const getStatusBg = (status: string): string => {
  switch (status) {
    case "nominal": return "rgba(34,197,94,0.1)";
    case "monitor": return "rgba(234,179,8,0.1)";
    case "elevated": return "rgba(249,115,22,0.12)";
    case "critical": return "rgba(239,68,68,0.14)";
    default: return "rgba(34,197,94,0.1)";
  }
};
