export interface KnowledgeEntry {
  id: string;
  category: string;
  title: string;
  source: string;
  content: string;
  keywords: string[];
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: 'k01',
    category: 'Emergency Response',
    title: 'Dehydration Management Protocol — Spaceflight',
    source: 'SIMULATED — NASA Flight Medicine Reference (Demonstration Only)',
    keywords: ['dehydration', 'rehydration', 'iv fluids', 'hydration', 'dizziness', 'nausea'],
    content: `Assessment: Assess level of dehydration using HR, BP, skin turgor, mucous membranes, and urine output.

Mild–Moderate Dehydration (HR <100, BP normal):
• Oral rehydration solution — 500 mL over 1 hour
• Monitor HR and BP every 15 minutes
• Restrict physical activity
• Reassess in 1–2 hours

Severe Dehydration (HR >100, BP falling, altered cognition):
• IV access immediately if trained personnel available
• IV Normal Saline 500 mL bolus over 30 minutes
• Continuous vital sign monitoring
• Contact flight surgeon immediately
• Document all fluid intake and output

Space-specific considerations:
• Microgravity affects fluid distribution — symptoms may differ from terrestrial presentation
• Post-EVA dehydration is common due to suit perspiration losses
• Pre-EVA hydration is critical — minimum 16 oz (480 mL) fluid intake 2 hours before EVA`,
  },
  {
    id: 'k02',
    category: 'Emergency Response',
    title: 'Post-EVA Medical Assessment Protocol',
    source: 'SIMULATED — NASA EVA Medical Operations (Demonstration Only)',
    keywords: ['eva', 'spacewalk', 'post-eva', 'decompression', 'fatigue', 'recovery'],
    content: `Mandatory post-EVA assessment within 1 hour of suit removal:

Vital signs:
• HR, BP, SpO2, Temperature, Respiratory rate
• Compare against pre-EVA baseline

Decompression illness screening:
• Ask about: joint pain, skin mottling, neurological symptoms, chest pain
• If any symptoms: oxygen therapy and flight surgeon notification immediately

Hydration assessment:
• Weigh crewmember — weight loss >2% body weight indicates significant dehydration
• Initiate oral rehydration if indicated

Rest requirements:
• Minimum 12-hour rest period recommended after EVA >4 hours
• No EVA within 24 hours of previous EVA without flight surgeon authorization`,
  },
  {
    id: 'k03',
    category: 'Health Monitoring',
    title: 'HRV as a Physiological Stress Indicator',
    source: 'SIMULATED — Spaceflight Medicine Reference (Demonstration Only)',
    keywords: ['hrv', 'heart rate variability', 'autonomic', 'stress', 'recovery'],
    content: `Heart Rate Variability (HRV) reflects autonomic nervous system function.

Clinical significance in spaceflight:
• HRV typically decreases with fatigue, illness, stress, and physiological strain
• Declining HRV over 24–72 hours may precede clinical symptoms
• Personal baseline important — inter-individual variation is high

Action thresholds (versus personal baseline):
• HRV decline >15%: Increase monitoring frequency
• HRV decline >25%: Recommend rest, reduce workload
• HRV decline >40%: Flag for medical assessment

Confounders:
• Exercise timing affects HRV readings
• Recent caffeine, alcohol, and stress affect HRV
• Should always be interpreted alongside other metrics`,
  },
  {
    id: 'k04',
    category: 'Emergency Response',
    title: 'Acute Febrile Illness — In-Flight Protocol',
    source: 'SIMULATED — NASA Flight Medicine Reference (Demonstration Only)',
    keywords: ['fever', 'temperature', 'infection', 'illness', 'febrile'],
    content: `Defined: Core temperature >37.5°C (personal baseline may differ).

Initial assessment:
• Vital signs (HR, BP, RR, SpO2, Temperature)
• Duration of symptoms
• Other symptoms: chills, myalgia, cough, GI symptoms
• Recent exposures: EVA, high workload, crew contacts

Management:
• Hydration — maintain oral fluid intake
• Acetaminophen 500mg–1g for temperature >38°C
• Rest and activity restriction
• Isolate if infectious etiology suspected — inform crew
• Contact flight surgeon within 2 hours for temperature >38.5°C
• Serial temperature monitoring every 2 hours

Escalation criteria:
• Temperature >39°C — immediate flight surgeon contact
• Confusion or altered mental status — emergency
• Falling BP or SpO2 — emergency`,
  },
  {
    id: 'k05',
    category: 'Health Monitoring',
    title: 'Sleep and Circadian Health in Spaceflight',
    source: 'SIMULATED — NASA Human Research Program (Demonstration Only)',
    keywords: ['sleep', 'circadian', 'fatigue', 'performance', 'rest'],
    content: `Sleep is critically important for cognitive performance, immune function, and cardiovascular health.

Spaceflight sleep challenges:
• Microgravity alters sleep architecture
• Multiple sunrise/sunsets per day disrupt circadian rhythm
• Mission noise, stress, and workload affect sleep quality
• Cumulative sleep debt accumulates over mission

Recommended: 8 hours per 24-hour period

Action thresholds:
• Sleep <6 hours: Monitor cognitive performance, consider workload reduction
• Cumulative sleep debt >2 hours: Significant performance risk
• Sleep <5 hours/night for >2 consecutive nights: Medical review

Performance impact:
• Each 1-hour sleep deficit reduces performance by ~10%
• 24 hours without sleep equivalent to 0.10% blood alcohol impairment
• EVA not recommended after <6 hours sleep`,
  },
  {
    id: 'k06',
    category: 'Mission Readiness',
    title: 'EVA Medical Clearance Criteria',
    source: 'SIMULATED — NASA EVA Operations (Demonstration Only)',
    keywords: ['eva', 'readiness', 'clearance', 'spacewalk', 'criteria'],
    content: `Pre-EVA medical clearance criteria (all must be met):

Physiological:
• HR: within 15% of personal baseline
• BP: within 10% of personal baseline
• SpO2: ≥97% (personal baseline minimum)
• Temperature: <37.5°C
• No active symptoms (nausea, dizziness, headache)

Sleep/Recovery:
• Minimum 6 hours sleep in prior 24 hours
• Recovery Score ≥70/100 (recommended ≥80)

Cognitive:
• Reaction time within 10% of baseline
• No cognitive impairment reported
• Fatigue ≤5/10 self-reported

Other:
• No active medication affecting consciousness
• No recent GI illness (within 12 hours)
• Flight surgeon sign-off required for any borderline criteria`,
  },
  {
    id: 'k07',
    category: 'Environmental',
    title: 'Spacecraft CO₂ Exposure — Health Effects',
    source: 'SIMULATED — NASA Environmental Health (Demonstration Only)',
    keywords: ['co2', 'carbon dioxide', 'environmental', 'headache', 'cognitive'],
    content: `CO₂ exposure levels and health effects:

< 700 ppm: Nominal — no significant effects
700–1000 ppm: May contribute to headache, reduced concentration in sensitive individuals
1000–2000 ppm: Headache, drowsiness, cognitive impairment risk
> 2000 ppm: Significant health risk — evacuate module, activate CO₂ scrubbers

Action thresholds:
• >800 ppm: Investigate source, inspect CO₂ scrubbers
• >1000 ppm: Reduce crew activity in module, replace scrubber cartridge
• >1500 ppm: Evacuate module if possible, emergency scrubber protocol

Note: Microgravity impairs the natural convection that disperses CO₂ on Earth — crewmembers near sleeping areas may have locally elevated CO₂ exposure.`,
  },
  {
    id: 'k08',
    category: 'Medications',
    title: 'Ondansetron (Antiemetic) — Spaceflight Use',
    source: 'SIMULATED — Spaceflight Pharmacology Reference (Demonstration Only)',
    keywords: ['ondansetron', 'antiemetic', 'nausea', 'vomiting', 'medication'],
    content: `Ondansetron 4 mg — approved for use in spaceflight for nausea and vomiting.

Indications: Nausea, vomiting associated with space motion sickness, illness, or post-EVA

Dosing: 4 mg orally or sublingually — may repeat after 4 hours. Maximum 8 mg per 24-hour period.

Contraindications: Hypersensitivity to ondansetron. Use with caution in cardiac arrhythmia.

Space-specific notes:
• Sublingual formulation preferred in severe nausea
• Monitor for cardiac effects in dehydrated patients
• May be used prophylactically before EVA in motion-sickness-prone individuals

Available in onboard medical kit: 12 tablets (4mg each)`,
  },
];

export function searchKnowledge(query: string): KnowledgeEntry[] {
  const q = query.toLowerCase();
  return KNOWLEDGE_BASE.filter(entry =>
    entry.keywords.some(k => q.includes(k)) ||
    entry.title.toLowerCase().includes(q) ||
    entry.content.toLowerCase().includes(q)
  );
}
