'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef, useState } from 'react';
import type { Astronaut, AppState, NavSection, CommStatus, MetricWithBaseline, ScenarioType, AIAlert } from '@/types';
import { ASTRONAUTS, MAYA_CHEN } from '@/data/astronauts';
import { MEDICAL_RESOURCES } from '@/data/medicalResources';
import { getScenario, type DemoScenario } from '@/data/simulations';

// ─── Simulation State ─────────────────────────────────────────────────────────

export interface SimState {
  running: boolean;
  scenarioId: DemoScenario['id'] | null;
  tick: number;
  /** Alert IDs that have already been fired (prevents re-firing) */
  firedAlertIds: Set<string>;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialComm: CommStatus = {
  connected: true,
  delayMinutes: 0,
  mode: 'NOMINAL',
  lastContactTimestamp: new Date().toISOString(),
};

const initialState: AppState = {
  selectedAstronautId: 'maya-chen',
  activeNav: 'mission-overview',
  commStatus: initialComm,
  scenario: 'NORMAL',
  missionDay: 147,
  emergencyMode: false,
  medicalResources: MEDICAL_RESOURCES,
};

const initialSim: SimState = {
  running: false,
  scenarioId: null,
  tick: 0,
  firedAlertIds: new Set(),
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SELECT_ASTRONAUT'; id: string }
  | { type: 'SET_NAV'; section: NavSection }
  | { type: 'SET_COMM'; status: CommStatus }
  | { type: 'SET_SCENARIO'; scenario: ScenarioType }
  | { type: 'SET_EMERGENCY_MODE'; active: boolean }
  | { type: 'ACKNOWLEDGE_ALERT'; astronautId: string; alertId: string }
  | { type: 'APPROVE_MEDICAL_EVENT'; astronautId: string; eventId: string }
  | { type: 'ESCALATE_MEDICAL_EVENT'; astronautId: string; eventId: string }
  | { type: 'CONSUME_RESOURCE'; resourceId: string; qty: number };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SELECT_ASTRONAUT':
      return { ...state, selectedAstronautId: action.id };
    case 'SET_NAV':
      return { ...state, activeNav: action.section };
    case 'SET_COMM':
      return { ...state, commStatus: action.status };
    case 'SET_SCENARIO':
      return { ...state, scenario: action.scenario };
    case 'SET_EMERGENCY_MODE':
      return { ...state, emergencyMode: action.active };
    case 'CONSUME_RESOURCE':
      return {
        ...state,
        medicalResources: state.medicalResources.map(r =>
          r.id === action.resourceId
            ? { ...r, quantity: Math.max(0, r.quantity - action.qty), available: r.quantity - action.qty > 0 }
            : r
        ),
      };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  astronauts: Astronaut[];
  selectedAstronaut: Astronaut;
  dispatch: React.Dispatch<Action>;
  setNav: (section: NavSection) => void;
  selectAstronaut: (id: string) => void;
  triggerScenario: (scenario: ScenarioType, astronautId?: string) => void;
  simulateCommDelay: (minutes: number) => void;
  resumeComm: () => void;
  setEmergencyMode: (active: boolean) => void;
  // Simulation
  sim: SimState;
  startSim: (scenarioId: DemoScenario['id']) => void;
  stopSim: () => void;
  /** Active sim alerts derived from threshold rules */
  simAlerts: AIAlert[];
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Scenario Modifier ────────────────────────────────────────────────────────

function applyScenario(base: Astronaut, scenario: ScenarioType): Astronaut {
  if (scenario === 'NORMAL' || base.scenario === scenario) return base;

  const a: Astronaut = JSON.parse(JSON.stringify(base));
  a.scenario = scenario;

  if (scenario === 'FATIGUE_BUILDUP') {
    a.physiological.restingHR.current = Math.round(a.physiological.restingHR.baseline.mean * 1.17);
    a.physiological.restingHR.deviationPct = 17;
    a.physiological.restingHR.trend = [
      a.physiological.restingHR.baseline.mean,
      a.physiological.restingHR.baseline.mean + 2,
      a.physiological.restingHR.baseline.mean + 4,
      a.physiological.restingHR.baseline.mean + 6,
      a.physiological.restingHR.baseline.mean + 8,
      a.physiological.restingHR.baseline.mean + 10,
      a.physiological.restingHR.current,
    ];
    a.physiological.hrv.current = Math.round(a.physiological.hrv.baseline.mean * 0.78);
    a.physiological.hrv.deviationPct = -22;
    a.physiological.hrv.trend = a.physiological.hrv.trend.map((v, i) => Math.round(v * (1 - i * 0.03)));
    a.recovery.sleepDuration.current = a.recovery.sleepDuration.baseline.mean * 0.77;
    a.recovery.sleepDuration.deviationPct = -23;
    a.recovery.sleepDuration.trend = a.recovery.sleepDuration.trend.map((v, i) => parseFloat((v * (1 - i * 0.04)).toFixed(1)));
    a.symptoms.fatigue = 6;
    a.cognitive.reactionTime.current = Math.round(a.cognitive.reactionTime.baseline.mean * 1.11);
    a.cognitive.reactionTime.deviationPct = 11;
    a.cognitive.cognitiveReadiness = 71;
    a.recovery.recoveryScore = 62;
    a.recovery.recoveryStatus = 'REDUCED';
    a.healthStatus = 'YELLOW';
    a.overallHealthScore = 71;
    a.missionReadiness.score = 63;
    a.missionReadiness.status = 'NOT_RECOMMENDED';
    a.missionReadiness.recommendation = 'EVA not recommended due to emerging fatigue pattern. Reassess after 6–8 hours of rest.';
  }

  if (scenario === 'MEDICAL_EMERGENCY') {
    a.physiological.heartRate.current = 118;
    a.physiological.heartRate.deviationPct = 58;
    a.physiological.systolicBP.current = 96;
    a.physiological.systolicBP.deviationPct = -21;
    a.physiological.diastolicBP.current = 62;
    a.physiological.spo2.current = 93;
    a.physiological.spo2.deviationPct = -5;
    a.physiological.temperature.current = 37.9;
    a.physiological.hrv.current = 20;
    a.physiological.hrv.deviationPct = -70;
    a.physiological.hydration.current = 68;
    a.physiological.hydration.deviationPct = -25;
    a.symptoms.dizziness = 9;
    a.symptoms.nausea = 8;
    a.symptoms.fatigue = 10;
    a.symptoms.shortnessOfBreath = 7;
    a.recovery.recoveryScore = 18;
    a.recovery.recoveryStatus = 'POOR';
    a.healthStatus = 'RED';
    a.overallHealthScore = 22;
    a.missionReadiness.score = 0;
    a.missionReadiness.status = 'PROHIBITED';
  }

  if (scenario === 'RECOVERY') {
    a.physiological.restingHR.current = Math.round(a.physiological.restingHR.baseline.mean * 1.08);
    a.physiological.restingHR.deviationPct = 8;
    a.physiological.hrv.current = Math.round(a.physiological.hrv.baseline.mean * 0.88);
    a.physiological.hrv.deviationPct = -12;
    a.physiological.spo2.current = Math.max(96, a.physiological.spo2.baseline.mean - 1);
    a.physiological.temperature.current = parseFloat((a.physiological.temperature.baseline.mean + 0.2).toFixed(1));
    a.physiological.hydration.current = a.physiological.hydration.baseline.mean * 0.92;
    a.recovery.recoveryScore = 52;
    a.recovery.recoveryStatus = 'REDUCED';
    a.symptoms.fatigue = 4;
    a.symptoms.dizziness = 2;
    a.symptoms.nausea = 1;
    a.cognitive.reactionTime.current = Math.round(a.cognitive.reactionTime.baseline.mean * 1.09);
    a.cognitive.reactionTime.deviationPct = 9;
    a.cognitive.cognitiveReadiness = 78;
    a.healthStatus = 'YELLOW';
    a.overallHealthScore = 62;
    a.missionReadiness.score = 48;
    a.missionReadiness.status = 'NOT_RECOMMENDED';
    a.missionReadiness.recommendation = 'Recovery in progress. Physiological metrics returning toward baseline. Re-assess in 12–24 hours.';
  }

  return a;
}

function seedFromId(id: string) {
  return id.split('').reduce((seed, character) => seed + character.charCodeAt(0), 0);
}

function updateMetric(metric: MetricWithBaseline, current: number): MetricWithBaseline {
  const deviationPct = Math.round(((current - metric.baseline.mean) / metric.baseline.mean) * 100);
  const statusFn = (pct: number) => {
    const abs = Math.abs(pct);
    if (abs <= 10) return 'GREEN' as const;
    if (abs <= 20) return 'YELLOW' as const;
    if (abs <= 30) return 'ORANGE' as const;
    return 'RED' as const;
  };
  return {
    ...metric,
    current,
    deviationPct,
    status: statusFn(deviationPct),
    trend: [...metric.trend.slice(1), current],
  };
}

function applySimulatedTelemetry(astronaut: Astronaut, tick: number): Astronaut {
  const seed = seedFromId(astronaut.id);
  const primaryWave = Math.sin((tick + seed) * 1.17);
  const secondaryWave = Math.sin((tick + seed * 0.37) * 1.83);
  const scoreWave = Math.sin((tick + seed) * 0.71);
  const restingHR = Math.round(astronaut.physiological.restingHR.current + primaryWave * 2);
  const hrv = Math.max(1, Math.round(astronaut.physiological.hrv.current + secondaryWave * 3));
  const heartRate = Math.max(35, Math.round(astronaut.physiological.heartRate.current + primaryWave * 2.5));

  return {
    ...astronaut,
    overallHealthScore: Math.max(0, Math.min(100, Math.round(astronaut.overallHealthScore + scoreWave))),
    physiological: {
      ...astronaut.physiological,
      restingHR: updateMetric(astronaut.physiological.restingHR, restingHR),
      hrv: updateMetric(astronaut.physiological.hrv, hrv),
      heartRate: updateMetric(astronaut.physiological.heartRate, heartRate),
    },
  };
}

// ─── Apply a simulation frame on top of the base astronaut data ───────────────

function applySimFrame(
  astronaut: Astronaut,
  scenario: DemoScenario,
  tick: number,
): Astronaut {
  const frameIdx = Math.min(tick, scenario.frames.length - 1);
  const frame = scenario.frames[frameIdx];
  if (!frame) return astronaut;

  const v = frame.vitals;

  // Helper to patch a metric by key
  const patch = (metric: MetricWithBaseline, value: number): MetricWithBaseline =>
    updateMetric(metric, value);

  const physio = {
    ...astronaut.physiological,
    heartRate:       patch(astronaut.physiological.heartRate,       v.heartRate),
    restingHR:       patch(astronaut.physiological.restingHR,       v.restingHR),
    spo2:            patch(astronaut.physiological.spo2,            v.spo2),
    temperature:     patch(astronaut.physiological.temperature,     v.temperature),
    systolicBP:      patch(astronaut.physiological.systolicBP,      v.systolicBP),
    diastolicBP:     patch(astronaut.physiological.diastolicBP,     v.diastolicBP),
    respiratoryRate: patch(astronaut.physiological.respiratoryRate, v.respiratoryRate),
    hrv:             patch(astronaut.physiological.hrv,             v.hrv),
    hydration:       patch(astronaut.physiological.hydration,       v.hydration),
  };

  // Derive health status from overallHealthScore
  const score = Math.round(v.overallHealthScore);
  const healthStatus =
    score >= 80 ? 'GREEN' : score >= 65 ? 'YELLOW' : score >= 45 ? 'ORANGE' : 'RED';

  // Recovery status
  const recScore = Math.round(v.recoveryScore);
  const recoveryStatus =
    recScore >= 80 ? 'PEAK' : recScore >= 65 ? 'GOOD' : recScore >= 45 ? 'REDUCED' : recScore >= 30 ? 'LOW' : 'POOR';

  return {
    ...astronaut,
    physiological: physio,
    overallHealthScore: score,
    healthStatus,
    cognitive: {
      ...astronaut.cognitive,
      cognitiveReadiness: Math.round(v.cognitiveReadiness),
    },
    recovery: {
      ...astronaut.recovery,
      recoveryScore: recScore,
      recoveryStatus,
    },
  };
}

// ─── Derive active alerts from threshold rules ────────────────────────────────

function deriveSimAlerts(
  scenario: DemoScenario,
  tick: number,
  firedIds: Set<string>,
): { alerts: AIAlert[]; newFired: Set<string> } {
  // Get the current vital values for this tick
  const frameIdx = Math.min(tick, scenario.frames.length - 1);
  const frame = scenario.frames[frameIdx];
  if (!frame) return { alerts: [], newFired: firedIds };

  const newFired = new Set(firedIds);
  const alerts: AIAlert[] = [];

  for (const rule of scenario.alertRules) {
    if (rule.minTick !== undefined && tick < rule.minTick) continue;
    const value = frame.vitals[rule.vital];
    const triggered =
      rule.direction === 'above' ? value >= rule.threshold : value <= rule.threshold;
    if (triggered) {
      newFired.add(rule.id);
      alerts.push({
        id: rule.id,
        riskLevel: rule.severity === 'MODERATE' ? 'MODERATE'
          : rule.severity === 'ELEVATED' ? 'ELEVATED' : 'CRITICAL',
        title: rule.title,
        summary: rule.summary,
        confidence: rule.severity === 'CRITICAL' ? 96 : rule.severity === 'ELEVATED' ? 89 : 78,
        contributingFactors: [],
        recommendation: rule.recommendation,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }
  }

  return { alerts, newFired };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [telemetryTick, setTelemetryTick] = useState(0);
  const [sim, setSim] = useState<SimState>(initialSim);
  const [simAlerts, setSimAlerts] = useState<AIAlert[]>([]);

  // Background telemetry wiggle (when no sim is running)
  useEffect(() => {
    if (sim.running) return; // sim takes over when active
    const interval = window.setInterval(() => {
      setTelemetryTick(t => t + 1);
    }, 1800);
    return () => window.clearInterval(interval);
  }, [sim.running]);

  // Simulation tick engine
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopSim = useCallback(() => {
    if (simIntervalRef.current !== null) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    setSim(initialSim);
    setSimAlerts([]);
    // revert app scenario state
    dispatch({ type: 'SET_SCENARIO', scenario: 'NORMAL' });
    dispatch({ type: 'SET_EMERGENCY_MODE', active: false });
  }, []);

  const startSim = useCallback((scenarioId: DemoScenario['id']) => {
    // Stop any running sim first
    if (simIntervalRef.current !== null) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }

    const scenario = getScenario(scenarioId);

    setSim({ running: true, scenarioId, tick: 0, firedAlertIds: new Set() });
    setSimAlerts([]);

    // Select the appropriate astronaut and set app scenario
    dispatch({ type: 'SELECT_ASTRONAUT', id: scenario.astronautId });
    dispatch({ type: 'SET_SCENARIO', scenario: scenarioId as ScenarioType });
    if (scenarioId === 'MEDICAL_EMERGENCY') {
      dispatch({ type: 'SET_EMERGENCY_MODE', active: true });
    } else {
      dispatch({ type: 'SET_EMERGENCY_MODE', active: false });
    }

    let currentTick = 0;
    const totalFrames = scenario.frames.length;

    simIntervalRef.current = setInterval(() => {
      currentTick += 1;

      setSim(prev => {
        const { alerts, newFired } = deriveSimAlerts(scenario, currentTick, prev.firedAlertIds);
        setSimAlerts(alerts);
        return { ...prev, tick: currentTick, firedAlertIds: newFired };
      });

      // Stop when we reach the last frame
      if (currentTick >= totalFrames - 1) {
        if (simIntervalRef.current !== null) {
          clearInterval(simIntervalRef.current);
          simIntervalRef.current = null;
        }
        setSim(prev => ({ ...prev, running: false }));
      }
    }, scenario.tickMs);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (simIntervalRef.current !== null) {
        clearInterval(simIntervalRef.current);
      }
    };
  }, []);

  const astronauts = React.useMemo(() => {
    const base = ASTRONAUTS.map(astronaut =>
      applySimulatedTelemetry(applyScenario(astronaut, state.scenario), telemetryTick)
    );

    // Apply sim frame while running OR after completion (tick > 0 means a sim ran/is running)
    if (sim.scenarioId === null || sim.tick === 0) return base;

    const scenario = getScenario(sim.scenarioId);
    return base.map(astronaut => {
      if (astronaut.id !== scenario.astronautId) return astronaut;
      // Apply sim frame vitals and inject sim alerts
      const withFrame = applySimFrame(astronaut, scenario, sim.tick);
      return {
        ...withFrame,
        alerts: simAlerts,
      };
    });
  }, [state.scenario, telemetryTick, sim.running, sim.scenarioId, sim.tick, simAlerts]);

  const selectedAstronaut = astronauts.find(a => a.id === state.selectedAstronautId) ?? astronauts[0] ?? MAYA_CHEN;

  const setNav = useCallback((section: NavSection) => {
    dispatch({ type: 'SET_NAV', section });
  }, []);

  const selectAstronaut = useCallback((id: string) => {
    dispatch({ type: 'SELECT_ASTRONAUT', id });
  }, []);

  const triggerScenario = useCallback((scenario: ScenarioType, astronautId?: string) => {
    dispatch({ type: 'SET_SCENARIO', scenario });
    if (scenario === 'MEDICAL_EMERGENCY') {
      dispatch({ type: 'SET_EMERGENCY_MODE', active: true });
      if (astronautId) dispatch({ type: 'SELECT_ASTRONAUT', id: astronautId });
    } else {
      dispatch({ type: 'SET_EMERGENCY_MODE', active: false });
    }
  }, []);

  const simulateCommDelay = useCallback((minutes: number) => {
    dispatch({
      type: 'SET_COMM',
      status: {
        connected: false,
        delayMinutes: minutes,
        mode: minutes > 0 ? 'DELAYED' : 'NOMINAL',
        lastContactTimestamp: new Date().toISOString(),
      },
    });
  }, []);

  const resumeComm = useCallback(() => {
    dispatch({
      type: 'SET_COMM',
      status: {
        connected: true,
        delayMinutes: 0,
        mode: 'NOMINAL',
        lastContactTimestamp: new Date().toISOString(),
      },
    });
  }, []);

  const setEmergencyMode = useCallback((active: boolean) => {
    dispatch({ type: 'SET_EMERGENCY_MODE', active });
  }, []);

  return (
    <AppContext.Provider value={{
      state,
      astronauts,
      selectedAstronaut,
      dispatch,
      setNav,
      selectAstronaut,
      triggerScenario,
      simulateCommDelay,
      resumeComm,
      setEmergencyMode,
      sim,
      startSim,
      stopSim,
      simAlerts,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
