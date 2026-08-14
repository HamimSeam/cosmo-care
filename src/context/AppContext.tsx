'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { Astronaut, AppState, NavSection, CommStatus, ScenarioType } from '@/types';
import { ASTRONAUTS, MAYA_CHEN } from '@/data/astronauts';
import { MEDICAL_RESOURCES } from '@/data/medicalResources';

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
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Scenario Modifier ────────────────────────────────────────────────────────
// Returns a modified copy of astronaut data for a given scenario

function applyScenario(base: Astronaut, scenario: ScenarioType): Astronaut {
  if (scenario === 'NORMAL' || base.scenario === scenario) return base;

  // Deep clone via JSON (acceptable for demo data)
  const a: Astronaut = JSON.parse(JSON.stringify(base));
  a.scenario = scenario;

  if (scenario === 'FATIGUE_BUILDUP') {
    // Gradual fatigue progression
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
    // Recovery from a previous event — gradual improvement
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

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [astronauts] = React.useState<Astronaut[]>(ASTRONAUTS);

  const selectedAstronaut = astronauts.find(a => a.id === state.selectedAstronautId) ?? MAYA_CHEN;

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
