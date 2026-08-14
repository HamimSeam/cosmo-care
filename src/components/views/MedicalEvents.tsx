'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { generateEmergencySupport } from '@/lib/aiEngine';
import type { MedicalEvent } from '@/types';

export default function MedicalEvents() {
  const { astronauts, selectedAstronaut: a, state, setEmergencyMode, dispatch } = useApp();
  const [selectedEvent, setSelectedEvent] = useState<MedicalEvent | null>(
    a.medicalEvents[0] || null
  );
  const [activeAstronaut, setActiveAstronaut] = useState(a);

  // Collect all events across crew
  const allEvents = astronauts.flatMap(ast =>
    ast.medicalEvents.map(e => ({ ...e, astronautName: ast.name, astronaut: ast }))
  );

  const emergencySupport = selectedEvent
    ? generateEmergencySupport(activeAstronaut)
    : null;

  const severityColors = {
    LOW:      { bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.3)',  text: '#34d399' },
    MODERATE: { bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)',  text: '#fbbf24' },
    HIGH:     { bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.3)',  text: '#fb923c' },
    CRITICAL: { bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', text: '#f87171' },
  };

  if (allEvents.length === 0) {
    return (
      <div className="content-area">
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>Medical Events</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Active and historical medical events</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>✓</div>
          <div style={{ fontSize: 14, color: '#34d399', fontWeight: 600 }}>No Active Medical Events</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>All crew members are currently healthy. No medical events recorded for this mission period.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>Medical Events</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>Active and historical medical events requiring medical review</div>
      </div>

      {/* Emergency banner */}
      {state.emergencyMode && (
        <div className="emergency-banner" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="pulse-red" style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f87171', marginBottom: 2 }}>MEDICAL EMERGENCY ACTIVE — DECISION SUPPORT MODE</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                CosmoCare AI is providing decision support. All recommendations require review by a qualified medical professional.
                {state.commStatus.mode !== 'NOMINAL' && ` Earth communication delayed ${state.commStatus.delayMinutes} minutes — local support active.`}
              </div>
            </div>
            <button
              onClick={() => setEmergencyMode(false)}
              style={{ fontSize: 10, color: '#64748b', background: 'none', border: '1px solid #1e2a3a', borderRadius: 3, padding: '3px 8px', cursor: 'pointer' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="grid-main-side">
        {/* Left: Event list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {allEvents.map(event => {
            const sc = severityColors[event.severity];
            const isSelected = selectedEvent?.id === event.id;
            return (
              <div
                key={event.id}
                onClick={() => { setSelectedEvent(event); setActiveAstronaut(event.astronaut); }}
                style={{
                  background: isSelected ? sc.bg : 'var(--surface)',
                  border: `1px solid ${isSelected ? sc.border : 'var(--border)'}`,
                  borderRadius: 6, padding: 16, cursor: 'pointer',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text, borderRadius: 3, padding: '1px 7px', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em' }}>
                        {event.severity}
                      </span>
                      <span style={{ fontSize: 10, color: '#64748b' }}>Mission Day {event.missionDay}</span>
                      <span style={{ fontSize: 10, color: event.currentStatus === 'ACTIVE' ? '#f87171' : '#34d399' }}>
                        {event.currentStatus}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>{event.astronautName}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{event.symptoms.slice(0, 3).join(', ')}{event.symptoms.length > 3 ? ` +${event.symptoms.length - 3} more` : ''}</div>
                  </div>
                </div>

                {/* Vital changes */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {event.vitalChanges.slice(0, 3).map((vc, i) => (
                    <span key={i} style={{ fontSize: 10, color: '#94a3b8', background: '#0d1320', border: '1px solid #1e2a3a', borderRadius: 3, padding: '2px 6px' }}>
                      {vc.metric}: {vc.change}
                    </span>
                  ))}
                </div>

                {/* Flight surgeon status */}
                <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#475569' }}>Flight Surgeon Review:</span>
                  <span style={{ fontSize: 10, color: event.flightSurgeonStatus === 'PENDING' ? '#fbbf24' : '#34d399', fontWeight: 600 }}>
                    {event.flightSurgeonStatus}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Event detail */}
        {selectedEvent && emergencySupport && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Current vitals */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>Current Vitals</div>
              {selectedEvent.vitalChanges.map((vc, i) => (
                <div key={i} className="data-row">
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{vc.metric}</span>
                  <span style={{ fontSize: 11, color: '#f87171', fontWeight: 500 }}>{vc.change}</span>
                </div>
              ))}
            </div>

            {/* AI Assessment */}
            <div className="card" style={{ background: 'rgba(30,45,69,0.5)', border: '1px solid #1e2d45' }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: '#3b82f6', fontSize: 13 }}>◆</span>
                <div className="card-title">AI Assessment</div>
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.7, marginBottom: 12 }}>
                {emergencySupport.assessment}
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Possible Contributing Conditions</div>
                {selectedEvent.possibleConditions.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                    <span style={{ color: '#475569', fontSize: 8, marginTop: 3, flexShrink: 0 }}>▶</span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{c}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10, color: '#334155', fontStyle: 'italic' }}>
                ⚠ Assessment requires confirmation by a qualified flight surgeon. This is decision support only.
              </div>
            </div>

            {/* Immediate actions */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>Decision Support — Immediate Actions</div>
              {emergencySupport.immediateActions.map((action, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#1e2a3a', border: '1px solid #243045', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#60a5fa', flexShrink: 0, marginTop: 1 }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>{action}</span>
                </div>
              ))}
            </div>

            {/* Actions taken */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>Actions Taken</div>
              {selectedEvent.actionsTaken.map((action, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                  <span style={{ color: '#34d399', fontSize: 10, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{action}</span>
                </div>
              ))}
            </div>

            {/* Flight Surgeon Handoff */}
            <FlightSurgeonHandoff event={selectedEvent} astronautName={activeAstronaut.name} />
          </div>
        )}
      </div>
    </div>
  );
}

function FlightSurgeonHandoff({ event, astronautName }: { event: MedicalEvent; astronautName: string }) {
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState(event.flightSurgeonStatus);

  const statusColors = {
    PENDING:   '#fbbf24',
    APPROVED:  '#34d399',
    MODIFIED:  '#60a5fa',
    ESCALATED: '#f87171',
  };

  return (
    <div className="card" style={{ border: '1px solid #1e2d45' }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 12 }}>
        <span style={{ color: '#60a5fa', fontSize: 12 }}>⬡</span>
        <div className="card-title">Flight Surgeon Handoff</div>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: statusColors[status], fontWeight: 600 }}>
          {status}
        </span>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6, marginBottom: 12 }}>
        <strong style={{ color: '#e2e8f0' }}>Medical Event #{event.id.split('-').pop()?.padStart(4, '0')}</strong>{' '}
        — {astronautName} — Mission Day {event.missionDay}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[
          { label: 'Severity', value: event.severity },
          { label: 'Status', value: event.currentStatus },
        ].map(item => (
          <div key={item.label} style={{ background: '#0d1320', borderRadius: 3, padding: '6px 10px' }}>
            <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{item.value}</div>
          </div>
        ))}
      </div>

      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Flight surgeon notes..."
        style={{
          width: '100%', background: '#0d1320', border: '1px solid #1e2a3a', borderRadius: 4,
          color: '#94a3b8', fontSize: 11, padding: '8px 10px', resize: 'vertical', minHeight: 60,
          outline: 'none', fontFamily: 'inherit', marginBottom: 10,
        }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {(['APPROVED', 'MODIFIED', 'ESCALATED'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            style={{
              padding: '6px', borderRadius: 3, cursor: 'pointer', fontSize: 10, fontWeight: 600,
              letterSpacing: '0.05em', border: `1px solid ${status === s ? statusColors[s] : '#1e2a3a'}`,
              background: status === s ? `${statusColors[s]}20` : 'transparent',
              color: status === s ? statusColors[s] : '#475569',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 8, fontSize: 9, color: '#334155', textAlign: 'center' }}>
        Human-in-the-loop: All AI recommendations require flight surgeon authorization
      </div>
    </div>
  );
}
