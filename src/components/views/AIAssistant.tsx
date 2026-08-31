'use client';

import { useState } from 'react';
import { queryAIAssistant } from '@/lib/aiEngine';
import { KNOWLEDGE_BASE } from '@/data/knowledgeBase';

const SUGGESTED_QUERIES = [
  'EVA clearance criteria and medical requirements',
  'Dehydration assessment and treatment protocol',
  'HRV interpretation and spaceflight significance',
  'Sleep deprivation effects on performance',
  'Fever management protocol in spaceflight',
  'CO₂ exposure health effects',
  'Ondansetron dosing and contraindications',
  'Post-EVA medical assessment protocol',
];

export default function AIAssistant() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<ReturnType<typeof queryAIAssistant> | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ q: string; r: ReturnType<typeof queryAIAssistant> }[]>([]);

  const handleQuery = (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setQuery(q);

    // Simulate brief processing delay
    setTimeout(() => {
      const res = queryAIAssistant(q);
      setResult(res);
      setHistory(prev => [{ q, r: res }, ...prev.slice(0, 4)]);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="content-area">
      <div className="view-header">
        <div className="view-title">AstroTriage</div>
        <div className="view-subtitle">Protocol-grounded onboard decision support · Demonstration knowledge base</div>
      </div>

      <div className="grid-main-side">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Search */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 10 }}>Query Medical Knowledge Base</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleQuery(query)}
                placeholder="Ask about spaceflight medical protocols, medications, emergency procedures..."
                style={{
                  flex: 1, background: '#0d1320', border: '1px solid #1e2a3a', borderRadius: 4,
                  color: '#e2e8f0', fontSize: 12, padding: '8px 12px',
                  outline: 'none', fontFamily: 'inherit',
                }}
              />
              <button
                onClick={() => handleQuery(query)}
                style={{
                  padding: '8px 16px', background: '#1e3a5f', border: '1px solid #3b82f6',
                  borderRadius: 4, color: '#60a5fa', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                Query
              </button>
            </div>
          </div>

          {/* Suggested queries */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 10 }}>Suggested Queries</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUGGESTED_QUERIES.map(q => (
                <button
                  key={q}
                  onClick={() => handleQuery(q)}
                  style={{
                    padding: '4px 10px', background: '#111827', border: '1px solid #1e2a3a',
                    borderRadius: 3, color: '#64748b', fontSize: 11, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseOver={e => { (e.target as HTMLElement).style.borderColor = '#3b82f6'; (e.target as HTMLElement).style.color = '#60a5fa'; }}
                  onMouseOut={e => { (e.target as HTMLElement).style.borderColor = '#1e2a3a'; (e.target as HTMLElement).style.color = '#64748b'; }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Result */}
          {loading && (
            <div className="card" style={{ textAlign: 'center', padding: 30 }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>Processing query...</div>
            </div>
          )}

          {result && !loading && (
            <div className="card">
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ color: '#3b82f6', fontSize: 14 }}>◆</span>
                  <div className="card-title">AI Response</div>
                </div>
                <div style={{ background: '#0d1320', borderRadius: 4, padding: '8px 12px', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, color: '#475569' }}>Query: </span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{query}</span>
                </div>
              </div>

              {/* Answer */}
              <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.8, whiteSpace: 'pre-line', marginBottom: 12 }}>
                {result.answer}
              </div>

              {/* Sources */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Sources</div>
                {result.sources.map((s, i) => (
                  <div key={i} style={{ fontSize: 10, color: '#334155', marginBottom: 3 }}>· {s}</div>
                ))}
              </div>

              {/* Confidence */}
              <div style={{ fontSize: 10, color: '#475569', marginBottom: 8 }}>
                Confidence basis: {result.confidence}
              </div>

              {/* Disclaimer */}
              <div style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: 4, padding: '8px 10px' }}>
                <div style={{ fontSize: 10, color: '#fb923c', lineHeight: 1.5 }}>{result.disclaimer}</div>
              </div>
            </div>
          )}

          {/* Query history */}
          {history.length > 1 && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>Recent Queries</div>
              {history.slice(1).map((h, i) => (
                <button
                  key={i}
                  onClick={() => { setQuery(h.q); setResult(h.r); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '6px 8px', background: 'none', border: '1px solid #1e2a3a',
                    borderRadius: 3, color: '#64748b', fontSize: 11, cursor: 'pointer',
                    marginBottom: 4,
                  }}
                >
                  {h.q}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Knowledge base overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Knowledge Base</div>
            {KNOWLEDGE_BASE.map(entry => (
              <div key={entry.id}
                onClick={() => handleQuery(entry.title)}
                style={{
                  padding: '8px 10px', border: '1px solid #1e2a3a', borderRadius: 4,
                  marginBottom: 6, cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseOver={e => (e.currentTarget.style.borderColor = '#3b82f6')}
                onMouseOut={e => (e.currentTarget.style.borderColor = '#1e2a3a')}
              >
                <div style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 500, marginBottom: 2 }}>{entry.title}</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 9, background: '#1e2d45', color: '#60a5fa', borderRadius: 2, padding: '1px 5px' }}>
                    {entry.category}
                  </span>
                  <span style={{ fontSize: 9, color: '#334155' }}>{entry.source.split('—')[0].trim()}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ background: 'rgba(251,146,60,0.05)', border: '1px solid rgba(251,146,60,0.2)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#fb923c', marginBottom: 6 }}>Demonstration Knowledge Base</div>
            <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
              All protocols in this demonstration are labeled as SIMULATED data for MVP purposes. A production deployment would integrate with NASA flight medicine protocols, spaceflight medical literature, and approved medication references.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
