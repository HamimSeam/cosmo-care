import type { MedicalResource } from '@/types';

export const MEDICAL_RESOURCES: MedicalResource[] = [
  { id: 'r01', name: 'Oral Rehydration Solution', category: 'Fluids', quantity: 14, unit: 'packets', available: true, expiryDays: 380 },
  { id: 'r02', name: 'IV Fluids (Normal Saline)', category: 'Fluids', quantity: 2, unit: 'bags (1L)', available: true, expiryDays: 412 },
  { id: 'r03', name: 'Supplemental Oxygen', category: 'Respiratory', quantity: 4, unit: 'cylinders', available: true, expiryDays: null as unknown as number },
  { id: 'r04', name: 'Pulse Oximeter', category: 'Monitoring Equipment', quantity: 2, unit: 'units', available: true },
  { id: 'r05', name: 'Automated BP Monitor', category: 'Monitoring Equipment', quantity: 1, unit: 'unit', available: true },
  { id: 'r06', name: 'ECG Monitor', category: 'Monitoring Equipment', quantity: 1, unit: 'unit', available: true },
  { id: 'r07', name: 'Thermometer (Tympanic)', category: 'Monitoring Equipment', quantity: 2, unit: 'units', available: true },
  { id: 'r08', name: 'Broad Spectrum Antibiotic (Ciprofloxacin 500mg)', category: 'Medication', quantity: 20, unit: 'tablets', available: true, expiryDays: 600 },
  { id: 'r09', name: 'Antiemetic (Ondansetron 4mg)', category: 'Medication', quantity: 12, unit: 'tablets', available: true, expiryDays: 550 },
  { id: 'r10', name: 'Analgesic / Antipyretic (Acetaminophen 500mg)', category: 'Medication', quantity: 40, unit: 'tablets', available: true, expiryDays: 720 },
  { id: 'r11', name: 'Electrolyte Supplement', category: 'Fluids', quantity: 30, unit: 'sachets', available: true, expiryDays: 480 },
  { id: 'r12', name: 'Adhesive Dressings / Bandages', category: 'Wound Care', quantity: 50, unit: 'units', available: true },
  { id: 'r13', name: 'Sterile Gloves', category: 'PPE', quantity: 20, unit: 'pairs', available: true },
  { id: 'r14', name: 'Defibrillator (AED)', category: 'Emergency Equipment', quantity: 1, unit: 'unit', available: true },
  { id: 'r15', name: 'Surgical Stapler', category: 'Surgical', quantity: 1, unit: 'unit', available: true },
  { id: 'r16', name: 'Urinalysis Strips', category: 'Diagnostic', quantity: 25, unit: 'strips', available: true, expiryDays: 300 },
  { id: 'r17', name: 'Blood Glucose Monitor', category: 'Diagnostic', quantity: 1, unit: 'unit', available: true },
  { id: 'r18', name: 'Diphenhydramine (Antihistamine)', category: 'Medication', quantity: 10, unit: 'tablets', available: true, expiryDays: 500 },
  { id: 'r19', name: 'Antacid (Omeprazole 20mg)', category: 'Medication', quantity: 14, unit: 'tablets', available: true, expiryDays: 440 },
  { id: 'r20', name: 'CO2 Scrubber Cartridge', category: 'Environmental', quantity: 3, unit: 'cartridges', available: true },
];

export const RESOURCE_CATEGORIES = [...new Set(MEDICAL_RESOURCES.map(r => r.category))];
