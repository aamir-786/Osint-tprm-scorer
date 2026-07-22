import { ShieldCheck } from 'lucide-react';

interface Props {
  activeModule: string;
  onSelectModule: (module: string) => void;
}

export function WahidAiSidebar({ activeModule, onSelectModule }: Props) {
  return (
    <aside className="wahid-sidebar">
      {/* Brand Logo */}
      <div className="sidebar-brand" style={{ padding: '12px 18px 20px', display: 'flex', justifyContent: 'center' }}>
        <img
          src="/wahid-logo.png"
          alt="Wahid AI Enterprise Governance"
          style={{
            width: '100%',
            maxWidth: '180px',
            height: 'auto',
            objectFit: 'contain'
          }}
        />
      </div>



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
          </ul>
        </li>
      </ul>


      {/* Bottom Footer */}
      <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid rgba(0,0,0,0.1)', fontSize: '0.72rem', color: '#475569' }}>
        <span style={{ color: '#64748b', fontWeight: 700 }}>WAHID AI Platform</span> v3.4.1<br />
        Third-Party Risk Module
      </div>
    </aside>
  );
}
