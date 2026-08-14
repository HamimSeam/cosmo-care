'use client';

import { AppProvider, useApp } from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import DemoControls from '@/components/DemoControls';
import MissionOverview from '@/components/views/MissionOverview';
import CrewHealth from '@/components/views/CrewHealth';
import HealthIntelligence from '@/components/views/HealthIntelligence';
import MissionReadiness from '@/components/views/MissionReadiness';
import MedicalEvents from '@/components/views/MedicalEvents';
import RecoveryView from '@/components/views/RecoveryView';
import MedicalResources from '@/components/views/MedicalResources';
import AIAssistant from '@/components/views/AIAssistant';
import HealthTimeline from '@/components/views/HealthTimeline';

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

  return (
    <div className="app-root">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar />
        <div className="main-content">
          {renderView()}
        </div>
      </div>
      <DemoControls />
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
