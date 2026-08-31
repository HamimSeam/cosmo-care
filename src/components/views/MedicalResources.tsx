'use client';

import { useApp } from '@/context/AppContext';
import { RESOURCE_CATEGORIES } from '@/data/medicalResources';

export default function MedicalResources() {
  const { state } = useApp();
  const resources = state.medicalResources;

  const totalAvailable = resources.filter(r => r.available && r.quantity > 0).length;
  const lowStock = resources.filter(r => r.quantity > 0 && r.quantity <= 2);
  const depleted = resources.filter(r => r.quantity === 0);

  return (
    <div className="content-area">
      <div className="view-header">
        <div className="view-title">Medical Resources</div>
        <div className="view-subtitle">Onboard medical inventory · resource-aware AI recommendations</div>
      </div>

      {/* Summary */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Items', value: resources.length, color: '#60a5fa' },
          { label: 'Available', value: totalAvailable, color: '#34d399' },
          { label: 'Low Stock', value: lowStock.length, color: '#fbbf24' },
          { label: 'Depleted', value: depleted.length, color: '#f87171' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '12px 16px' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Resource grid by category */}
      {RESOURCE_CATEGORIES.map(category => {
        const items = resources.filter(r => r.category === category);
        return (
          <div key={category} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              {category}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
              {items.map(resource => {
                const stockStatus = resource.quantity === 0 ? 'depleted' : resource.quantity <= 2 ? 'low' : 'ok';
                const stockColor = stockStatus === 'depleted' ? '#f87171' : stockStatus === 'low' ? '#fbbf24' : '#34d399';
                const maxBar = resource.id === 'r10' ? 50 : resource.id === 'r12' ? 50 : 20;
                const barPct = Math.min(100, (resource.quantity / maxBar) * 100);

                return (
                  <div key={resource.id} className="hud-data-panel" style={{
                    borderColor: resource.quantity === 0 ? 'rgba(248,113,113,0.3)' : undefined,
                    padding: '12px 14px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 500, flex: 1, paddingRight: 8 }}>{resource.name}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: stockColor, flexShrink: 0 }}>
                        {resource.quantity}
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: '#475569', marginBottom: 6 }}>{resource.unit}</div>
                    {/* Stock bar */}
                    <div style={{ height: 3, background: '#1e2a3a', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                      <div style={{ height: '100%', width: `${barPct}%`, background: stockColor, borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 9, color: stockColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {stockStatus === 'depleted' ? 'DEPLETED' : stockStatus === 'low' ? 'LOW STOCK' : 'AVAILABLE'}
                      </span>
                      {resource.expiryDays && (
                        <span style={{ fontSize: 9, color: '#334155' }}>Exp: {resource.expiryDays}d</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* AI awareness note */}
      <div className="card" style={{ background: 'rgba(30,45,69,0.4)', border: '1px solid #1e2d45', marginTop: 8 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ color: '#3b82f6', fontSize: 12, flexShrink: 0 }}>◆</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#60a5fa', marginBottom: 4 }}>AI Resource Awareness</div>
            <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
              CosmoCare AI cross-references available inventory when generating decision-support recommendations. Resources with zero availability are excluded from recommendations. Low-stock resources are flagged for mission control awareness.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
