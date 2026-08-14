import type { Astronaut, ReadinessEvaluation, MissionActivity, RiskLevel } from '@/types';
import { MEDICAL_RESOURCES } from '@/data/medicalResources';
import { searchKnowledge } from '@/data/knowledgeBase';

// ─── Risk Analysis Engine ─────────────────────────────────────────────────────

export function analyzeHealthRisk(astronaut: Astronaut): { riskLevel: RiskLevel; confidence: number; factors: string[] } {
  const { physiological: p, cognitive: c, recovery: r, symptoms: s } = astronaut;
  let score = 0;
  const factors: string[] = [];

  // Resting HR deviation
  const hrDev = Math.abs(p.restingHR.deviationPct);
  if (hrDev > 20) { score += 3; factors.push(`Resting HR ${p.restingHR.deviationPct > 0 ? '+' : ''}${p.restingHR.deviationPct}% from personal baseline`); }
  else if (hrDev > 10) { score += 1; factors.push(`Resting HR mildly elevated — ${p.restingHR.deviationPct}% from baseline`); }

  // HRV
  const hrvDev = p.hrv.deviationPct;
  if (hrvDev < -35) { score += 3; factors.push(`HRV critically low — ${hrvDev}% below personal baseline`); }
  else if (hrvDev < -20) { score += 2; factors.push(`HRV significantly reduced — ${hrvDev}% below baseline`); }
  else if (hrvDev < -10) { score += 1; factors.push(`HRV mildly reduced — ${hrvDev}% below baseline`); }

  // SpO2
  if (p.spo2.current < 94) { score += 4; factors.push(`SpO2 critically low — ${p.spo2.current}%`); }
  else if (p.spo2.current < 96) { score += 2; factors.push(`SpO2 below personal minimum — ${p.spo2.current}%`); }
  else if (p.spo2.deviationPct < -1) { score += 1; factors.push(`SpO2 trending below personal baseline`); }

  // Temperature
  const tempDev = p.temperature.current - p.temperature.baseline.max;
  if (tempDev > 0.8) { score += 3; factors.push(`Temperature ${p.temperature.current}°C — ${tempDev.toFixed(1)}°C above personal range`); }
  else if (tempDev > 0.3) { score += 2; factors.push(`Temperature ${p.temperature.current}°C — elevated above personal range`); }

  // BP
  const bpDev = p.systolicBP.deviationPct;
  if (bpDev < -15) { score += 3; factors.push(`Systolic BP ${bpDev}% below personal baseline — hemodynamic concern`); }
  else if (bpDev > 15) { score += 2; factors.push(`Systolic BP ${bpDev}% above personal baseline`); }

  // Sleep
  const sleepDev = r.sleepDuration.deviationPct;
  if (sleepDev < -25) { score += 2; factors.push(`Sleep ${Math.abs(sleepDev)}% below personal baseline over recent days`); }
  else if (sleepDev < -15) { score += 1; factors.push(`Sleep duration ${Math.abs(sleepDev)}% below personal baseline`); }

  // Fatigue
  if (s.fatigue >= 8) { score += 2; factors.push(`Reported fatigue ${s.fatigue}/10 — severely elevated`); }
  else if (s.fatigue >= 5) { score += 1; factors.push(`Reported fatigue ${s.fatigue}/10 — above normal range`); }

  // Cognitive
  const rtDev = c.reactionTime.deviationPct;
  if (rtDev > 40) { score += 2; factors.push(`Reaction time ${rtDev}% slower than personal baseline`); }
  else if (rtDev > 15) { score += 1; factors.push(`Reaction time ${rtDev}% slower than personal baseline`); }

  // Symptoms
  if (s.dizziness >= 7) { score += 2; factors.push(`Severe dizziness reported (${s.dizziness}/10)`); }
  else if (s.dizziness >= 3) { score += 1; factors.push(`Dizziness reported`); }
  if (s.nausea >= 5) { score += 1; factors.push(`Nausea reported (${s.nausea}/10)`); }
  if (s.shortnessOfBreath >= 5) { score += 2; factors.push(`Shortness of breath reported`); }

  // Hydration
  const hydrDev = p.hydration.deviationPct;
  if (hydrDev < -20) { score += 3; factors.push(`Hydration critically low — ${p.hydration.current}%`); }
  else if (hydrDev < -10) { score += 1; factors.push(`Hydration below personal baseline`); }

  let riskLevel: RiskLevel;
  let confidence: number;

  if (score >= 12) { riskLevel = 'CRITICAL'; confidence = Math.min(98, 85 + score); }
  else if (score >= 7) { riskLevel = 'ELEVATED'; confidence = Math.min(95, 75 + score); }
  else if (score >= 3) { riskLevel = 'MODERATE'; confidence = Math.min(90, 65 + score * 2); }
  else { riskLevel = 'LOW'; confidence = Math.max(70, 90 - score * 5); }

  return { riskLevel, confidence, factors };
}

// ─── Recovery Score Engine ────────────────────────────────────────────────────

export function computeRecoveryScore(astronaut: Astronaut): number {
  const { physiological: p, recovery: r, cognitive: c, symptoms: s } = astronaut;

  let score = 100;

  // Sleep impact (max -30)
  const sleepDev = r.sleepDuration.deviationPct;
  if (sleepDev < 0) score += Math.max(-30, sleepDev * 0.8);
  const sleepQDev = r.sleepQuality.deviationPct;
  if (sleepQDev < 0) score += Math.max(-15, sleepQDev * 0.5);

  // HRV impact (max -20)
  const hrvDev = p.hrv.deviationPct;
  if (hrvDev < 0) score += Math.max(-20, hrvDev * 0.4);

  // Resting HR impact (max -15)
  const hrDev = p.restingHR.deviationPct;
  if (hrDev > 0) score -= Math.min(15, hrDev * 0.5);

  // Fatigue impact (max -15)
  score -= Math.min(15, (s.fatigue / 10) * 15);

  // Symptoms impact
  score -= Math.min(10, (s.nausea + s.dizziness + s.headache) / 3);

  // Hydration
  const hydrDev = p.hydration.deviationPct;
  if (hydrDev < 0) score += Math.max(-10, hydrDev * 0.5);

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ─── Readiness Engine ─────────────────────────────────────────────────────────

export function computeReadiness(astronaut: Astronaut, activity: MissionActivity = 'EVA'): ReadinessEvaluation {
  const { physiological: p, recovery: r, cognitive: c, symptoms: s, medicalEvents } = astronaut;
  const factors: string[] = [];
  let score = 100;

  const hasActiveEmergency = medicalEvents.some(e => e.currentStatus === 'ACTIVE' && e.severity === 'CRITICAL');
  const hasActiveHighEvent = medicalEvents.some(e => e.currentStatus === 'ACTIVE' && e.severity === 'HIGH');

  if (hasActiveEmergency) { return { activity, score: 0, status: 'PROHIBITED', contributingFactors: ['Active medical emergency'], recommendation: 'All activities prohibited — active medical emergency.', whatIfSimulation: { delay3h: 0, delay6h: 10, delay12h: 25 } }; }

  // SpO2
  if (p.spo2.current < 95) { score -= 30; factors.push(`SpO2 critically low (${p.spo2.current}%)`); }
  else if (p.spo2.current < 97) { score -= 15; factors.push(`SpO2 below EVA clearance threshold`); }

  // Temperature
  if (p.temperature.current > 37.8) { score -= 25; factors.push(`Elevated temperature (${p.temperature.current}°C)`); }
  else if (p.temperature.current > 37.5) { score -= 10; factors.push(`Temperature above EVA clearance threshold`); }

  // HR deviation
  const hrDev = Math.abs(p.restingHR.deviationPct);
  if (hrDev > 20) { score -= 15; factors.push(`Resting HR ${Math.abs(p.restingHR.deviationPct)}% from baseline`); }
  else if (hrDev > 10) { score -= 7; factors.push(`Resting HR mildly elevated`); }

  // BP (falling is dangerous for EVA)
  if (p.systolicBP.deviationPct < -15) { score -= 25; factors.push(`Systolic BP significantly below baseline`); }
  else if (p.systolicBP.deviationPct < -5) { score -= 10; factors.push(`Systolic BP below personal baseline`); }

  // Recovery
  const rs = r.recoveryScore;
  if (rs < 40) { score -= 20; factors.push(`Critical recovery score (${rs}/100)`); }
  else if (rs < 65) { score -= 12; factors.push(`Reduced recovery score (${rs}/100)`); }
  else if (rs < 80) { score -= 5; factors.push(`Recovery score below optimal (${rs}/100)`); }

  // Sleep
  const sleepDev = r.sleepDuration.deviationPct;
  if (sleepDev < -25) { score -= 15; factors.push(`Significant sleep deficit (${Math.abs(sleepDev)}% below baseline)`); }
  else if (sleepDev < -10) { score -= 8; factors.push(`Sleep below personal baseline`); }

  // Cognitive
  const rtDev = c.reactionTime.deviationPct;
  if (rtDev > 30) { score -= 15; factors.push(`Reaction time ${rtDev}% slower than baseline`); }
  else if (rtDev > 10) { score -= 7; factors.push(`Reaction time ${rtDev}% slower than baseline`); }

  // Fatigue
  if (s.fatigue >= 8) { score -= 15; factors.push(`Severe fatigue (${s.fatigue}/10)`); }
  else if (s.fatigue >= 5) { score -= 8; factors.push(`Elevated fatigue (${s.fatigue}/10)`); }

  // Active events
  if (hasActiveHighEvent) { score -= 20; factors.push('Active medical event — HIGH severity'); }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let readStatus: ReadinessEvaluation['status'];
  let recommendation: string;

  if (score >= 85) { readStatus = 'RECOMMENDED'; recommendation = 'Astronaut is cleared for this activity. All key physiological and cognitive metrics are within acceptable range.'; }
  else if (score >= 70) { readStatus = 'CONDITIONAL'; recommendation = 'Activity may proceed with enhanced monitoring and flight surgeon awareness. Address contributing factors where possible.'; }
  else if (score >= 40) { readStatus = 'NOT_RECOMMENDED'; recommendation = 'Activity not recommended. Address contributing factors and reassess after a recovery period before proceeding.'; }
  else { readStatus = 'PROHIBITED'; recommendation = 'Activity prohibited. Medical assessment required before any mission activities are considered.'; }

  const baseDelay3h = Math.min(100, score + 8);
  const baseDelay6h = Math.min(100, score + 18);
  const baseDelay12h = Math.min(100, score + 28);

  return {
    activity,
    score,
    status: readStatus,
    contributingFactors: factors.length > 0 ? factors : ['All metrics within acceptable range'],
    recommendation,
    whatIfSimulation: { delay3h: baseDelay3h, delay6h: baseDelay6h, delay12h: baseDelay12h },
  };
}

// ─── Emergency Decision Support ───────────────────────────────────────────────

export function generateEmergencySupport(astronaut: Astronaut): {
  severity: string;
  assessment: string;
  immediateActions: string[];
  protocols: string[];
  medicationsAvailable: string[];
  escalation: string;
} {
  const availableResources = MEDICAL_RESOURCES.filter(r => r.available && r.quantity > 0);
  const event = astronaut.medicalEvents[0];

  // Find relevant knowledge
  const symptoms = astronaut.symptoms;
  const queryTerms = [];
  if (symptoms.dizziness >= 5) queryTerms.push('dizziness');
  if (symptoms.nausea >= 5) queryTerms.push('nausea');
  if (astronaut.physiological.hydration.deviationPct < -15) queryTerms.push('dehydration');
  if (astronaut.physiological.temperature.current > 37.5) queryTerms.push('fever');

  const relevantResources = availableResources
    .filter(r => ['Fluids', 'Medication', 'Monitoring Equipment'].includes(r.category))
    .map(r => `${r.name} (${r.quantity} ${r.unit} available)`);

  const immediateActions = [
    'Assess airway, breathing, circulation (ABC)',
    'Obtain baseline vital signs (HR, BP, SpO2, Temperature, RR)',
    'Restrict physical activity — assist to supine position',
  ];

  if (astronaut.physiological.hydration.current < 80) {
    const oralRehydration = availableResources.find(r => r.id === 'r01');
    const ivFluids = availableResources.find(r => r.id === 'r02');
    if (oralRehydration && oralRehydration.quantity > 0) {
      immediateActions.push(`Initiate oral rehydration — administer 1 packet ORS in 250 mL water (${oralRehydration.quantity} packets available)`);
    }
    if (ivFluids && ivFluids.quantity > 0) {
      immediateActions.push(`IV access — prepare Normal Saline 500 mL bolus if oral intake not tolerated (${ivFluids.quantity} bags available — requires medical authorization)`);
    }
  }

  if (astronaut.physiological.spo2.current < 95) {
    const oxygen = availableResources.find(r => r.id === 'r03');
    if (oxygen && oxygen.quantity > 0) {
      immediateActions.push(`Supplemental oxygen — ${oxygen.quantity} cylinders available. Administer if SpO2 <94%`);
    }
  }

  if (symptoms.nausea >= 5) {
    const antiemetic = availableResources.find(r => r.id === 'r09');
    if (antiemetic && antiemetic.quantity > 0) {
      immediateActions.push(`Antiemetic available — Ondansetron 4mg (${antiemetic.quantity} tablets available — requires medical authorization)`);
    }
  }

  if (astronaut.physiological.temperature.current > 37.8) {
    const antipyretic = availableResources.find(r => r.id === 'r10');
    if (antipyretic && antipyretic.quantity > 0) {
      immediateActions.push(`Antipyretic — Acetaminophen 500–1000mg if temperature >38°C (${antipyretic.quantity} tablets available)`);
    }
  }

  immediateActions.push('Initiate continuous vital sign monitoring — every 5 minutes');
  immediateActions.push('Document all symptoms, vital changes, and actions taken');
  immediateActions.push('Attempt Earth contact — notify mission control and request flight surgeon consultation');

  return {
    severity: event?.severity || 'HIGH',
    assessment: event?.aiAssessment || 'Multi-system physiological deterioration detected. Assessment and decision support generated based on available telemetry and symptom data.',
    immediateActions,
    protocols: ['Dehydration Management Protocol', 'Post-EVA Medical Assessment', 'Acute Febrile Illness Protocol'],
    medicationsAvailable: relevantResources,
    escalation: 'Contact flight surgeon immediately. If Earth communication delayed: proceed with local decision support protocol. Document all actions. Generate medical event report for handoff.',
  };
}

// ─── AI Assistant Query ───────────────────────────────────────────────────────

export function queryAIAssistant(query: string, astronaut?: Astronaut): {
  answer: string;
  sources: string[];
  confidence: string;
  disclaimer: string;
} {
  const knowledge = searchKnowledge(query);
  const sources = knowledge.map(k => k.source);

  let answer = '';
  const q = query.toLowerCase();

  if (q.includes('dehydrat') || q.includes('fluid') || q.includes('rehydr')) {
    const k = knowledge.find(e => e.id === 'k01');
    answer = k ? `Based on the spaceflight dehydration protocol:\n\n${k.content}` : 'Relevant dehydration protocol not found in current knowledge base.';
  } else if (q.includes('eva') || q.includes('spacewalk') || q.includes('readiness') || q.includes('clearance')) {
    const k = knowledge.find(e => e.id === 'k06');
    answer = k ? `EVA Medical Clearance Criteria:\n\n${k.content}` : 'EVA clearance criteria not found.';
  } else if (q.includes('hrv') || q.includes('heart rate variability')) {
    const k = knowledge.find(e => e.id === 'k03');
    answer = k ? k.content : 'HRV information not found.';
  } else if (q.includes('sleep') || q.includes('circadian') || q.includes('fatigue')) {
    const k = knowledge.find(e => e.id === 'k05');
    answer = k ? k.content : 'Sleep protocol information not found.';
  } else if (q.includes('fever') || q.includes('temperature') || q.includes('febrile')) {
    const k = knowledge.find(e => e.id === 'k04');
    answer = k ? k.content : 'Fever protocol not found.';
  } else if (q.includes('co2') || q.includes('carbon dioxide')) {
    const k = knowledge.find(e => e.id === 'k07');
    answer = k ? k.content : 'CO₂ exposure information not found.';
  } else if (q.includes('ondansetron') || q.includes('nausea') || q.includes('antiemetic')) {
    const k = knowledge.find(e => e.id === 'k08');
    answer = k ? k.content : 'Antiemetic information not found.';
  } else if (knowledge.length > 0) {
    answer = knowledge[0].content;
  } else {
    answer = 'The query did not match specific protocols in the current demonstration knowledge base. In a production system, this query would be processed against a comprehensive spaceflight medical reference database. Please consult the flight surgeon for medical guidance on this topic.';
  }

  return {
    answer,
    sources: sources.length > 0 ? sources : ['CosmoCare AI Demonstration Knowledge Base'],
    confidence: knowledge.length > 0 ? 'Based on matched protocol reference' : 'No matched reference — response is general guidance only',
    disclaimer: '⚠ DEMONSTRATION DATA — This is simulated decision support. All medical decisions require review and authorization by a qualified flight surgeon or medical professional. CosmoCare AI does not diagnose or prescribe treatment.',
  };
}
