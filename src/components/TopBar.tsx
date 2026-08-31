'use client';

import Image from 'next/image';
import { LiveNumber } from '@/components/core/live-number';
import { useApp } from '@/context/AppContext';

export default function TopBar() {
  const { state, astronauts, simulateCommDelay, resumeComm } = useApp();
  const delayed = state.commStatus.mode !== 'NOMINAL';
  const alertCount = astronauts.filter(astronaut => astronaut.healthStatus !== 'GREEN').length;

  return (
    <header className="topbar figma-topbar">
      <div className="figma-brand">
        <Image
          className="figma-brand-logo"
          src="/cosmo-care-logo.png"
          alt="CosmoCare logo"
          width={68}
          height={68}
          priority
        />
        <div>
          <div className="figma-brand-name font-mono">COSMOCARE</div>
          <div className="figma-brand-subtitle font-mono">AI MEDICAL INTELLIGENCE</div>
        </div>
      </div>

      <div className="figma-mission-identity">
        <div className="figma-mission-name font-mono">ARTEMIS FORWARD</div>
        <div className="figma-mission-meta font-mono">
          MISSION DAY <LiveNumber value={state.missionDay} /> · DEEP SPACE TRANSIT
        </div>
      </div>

      <div className="figma-topbar-status">
        {alertCount > 0 && (
          <div className={`figma-alert-count font-mono${alertCount > 2 ? ' critical' : ''}`}>
            <LiveNumber value={alertCount} /> ACTIVE ALERT{alertCount === 1 ? '' : 'S'}
          </div>
        )}
        <button
          className={`figma-earth-link${delayed ? ' delayed' : ''}`}
          onClick={delayed ? resumeComm : () => simulateCommDelay(18)}
          aria-label={delayed ? 'Resume nominal Earth communications' : 'Simulate an 18 minute Earth communication delay'}
        >
          <span className="figma-earth-dot pulse" />
          <span>
            <span className="font-mono">{delayed ? '⚠ EARTH LINK DELAYED' : 'EARTH LINKED'}</span>
            {delayed && <span className="figma-earth-delay font-mono">18:00 RESPONSE DELAY</span>}
          </span>
        </button>
      </div>
    </header>
  );
}
