import { Bell, LayoutTemplate } from 'lucide-react';

export function WahidAiDashboardHeader() {
  return (
    <header className="wahid-topbar">
      <div>
        <div className="breadcrumb-trail">
          <LayoutTemplate size={16} color="#64748b" />
          <span style={{ color: '#64748b', fontWeight: 600 }}>Third-Party Risk v2</span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="org-pill">
          <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>ORG</span> 
          <span style={{ color: '#334155', fontWeight: 800 }}>ERM-Demo</span>
        </div>

        <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', margin: '0 8px' }}>
          <Bell size={20} color="#64748b" />
          <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '0.6rem', fontWeight: 800, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #ffffff' }}>
            3+
          </span>
        </div>

        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1e3a8a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
          A
        </div>
      </div>
    </header>
  );
}
