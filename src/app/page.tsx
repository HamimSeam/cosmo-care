'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import StartScreen from '@/components/StartScreen';
import DemoControls from '@/components/DemoControls';
import MissionOverview from '@/components/views/MissionOverview';
import CrewHealth from '@/components/views/CrewHealth';
import HealthIntelligence from '@/components/views/HealthIntelligence';
import MissionReadiness from '@/components/views/MissionReadiness';
import MedicalEvents from '@/components/views/MedicalEvents';
import RecoveryView from '@/components/views/RecoveryView';
import MedicalResources from '@/components/views/MedicalResources';
import AIAssistant from '@/components/views/AIAssistant';
function AppShell() {
  const { state } = useApp();

  const renderView = () => {
    switch (state.activeNav) {
      case 'mission-overview':   return <MissionOverview />;
      case 'crew-health':        return <CrewHealth />;
      case 'health-intelligence':return <HealthIntelligence />;
      case 'mission-readiness':  return <MissionReadiness />;
      case 'medical-events':     return <MedicalEvents />;
      case 'recovery':           return <RecoveryView />;
      case 'medical-resources':  return <MedicalResources />;
      case 'ai-assistant':       return <AIAssistant />;
      default:                   return <MissionOverview />;
    }
  };

  const isMissionOverview = state.activeNav === 'mission-overview';

  return (
    <div className="app-root" data-view={state.activeNav} data-scenario={state.scenario}>
      <TopBar />
      <div className="app-body">
        <Sidebar />
        <div className="app-workspace" style={{ background: isMissionOverview ? 'transparent' : undefined }}>
          <div
            className={isMissionOverview ? 'mission-overview-shell' : 'main-content'}
            style={isMissionOverview ? { flex: 1, overflow: 'hidden', position: 'relative' } : undefined}
          >
            <div key={`${state.activeNav}-${state.scenario}`} className="view-stage">
              {renderView()}
            </div>
          </div>
        </div>
        {isMissionOverview && <DemoControls />}
      </div>
    </div>
  );
}

export default function Page() {
  const [phase, setPhase] = useState<'start' | 'leaving' | 'ready'>('start');

  const handleStart = useCallback(() => {
    if (phase !== 'start') return;
    setPhase('leaving');
  }, [phase]);

  useEffect(() => {
    if (phase !== 'leaving') return;
    const timer = window.setTimeout(() => setPhase('ready'), 820);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const showMain = phase === 'leaving' || phase === 'ready';
  const showStart = phase === 'start' || phase === 'leaving';

  return (
    <AppProvider>
      <div className="app-bootstrap">
        {showMain && (
          <div className={`app-enter-layer${phase === 'leaving' ? ' app-enter-layer--active' : ''}${phase === 'ready' ? ' app-enter-layer--settled' : ''}`}>
            <AppShell />
          </div>
        )}
        {showStart && (
          <StartScreen onStart={handleStart} exiting={phase === 'leaving'} />
        )}
        {phase === 'leaving' && <div className="app-transition-scan" aria-hidden />}
      </div>
    </AppProvider>
  );
}
