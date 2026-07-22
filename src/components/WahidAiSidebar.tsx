import { ShieldCheck, LayoutDashboard, Settings } from 'lucide-react';

interface Props {
  activeModule: string;
  onSelectModule: (module: string) => void;
}

export function WahidAiSidebar({ activeModule, onSelectModule }: Props) {
  return (
    <aside className="wahid-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand" style={{ padding: '24px 18px 20px', display: 'flex', justifyContent: 'center' }}>
        <img 
          src="/wahid-logo.png" 
          alt="Wahid AI Enterprise Governance" 
          style={{ width: '100%', maxWidth: '180px', height: 'auto', objectFit: 'contain' }} 
        />
      </div>

      {/* Main Navigation Items */}
      <ul className="sidebar-menu">
        <li>
          <a className="sidebar-item" href="#home">
            <span className="sidebar-item-icon"><LayoutDashboard size={18} /></span>
            Home
          </a>
        </li>
      </ul>

      {/* MODULES Section - SINGLE MODULE ONLY: THIRD-PARTY RISK */}
      <div className="sidebar-section-title">Modules</div>
      <ul className="sidebar-menu">
        {/* Third-Party Risk Module - THE ONLY MODULE */}
        <li>
          <div
            className={`sidebar-item ${activeModule === 'tprm' ? 'active' : ''}`}
            onClick={() => onSelectModule('tprm')}
            style={{ fontWeight: 700 }}
          >
            <span className="sidebar-item-icon"><ShieldCheck size={18} color="#3b82f6" /></span>
            Third-Party Risk
          </div>
          <ul className="sidebar-sub-menu">
            <li className="sidebar-sub-item active">• Vendor Risk Dashboard</li>
            <li className="sidebar-sub-item">• Real-Time OSINT Scan</li>
            <li className="sidebar-sub-item">• Legal ToS Register</li>
            <li className="sidebar-sub-item">• AI Re-Check Monitor</li>
          </ul>
        </li>
      </ul>

      {/* ADMINISTRATION Section */}
      <div className="sidebar-section-title" style={{ marginTop: '24px' }}>Administration</div>
      <ul className="sidebar-menu" style={{ marginBottom: '24px' }}>
        <li>
          <div className="sidebar-item">
            <span className="sidebar-item-icon"><Settings size={18} /></span>
            User & Admin Panel
          </div>
        </li>
      </ul>

      {/* Bottom Footer */}
      <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.72rem', color: '#475569' }}>
        <span style={{ color: '#94a3b8', fontWeight: 600 }}>WAHID AI Platform</span> v3.4.1<br />
        Third-Party Risk Module
      </div>
    </aside>
  );
}
