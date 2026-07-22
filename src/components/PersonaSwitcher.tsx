import type { BusinessPersona } from '../types/tprm';
import { UserCheck, ShieldAlert, FileText, LayoutDashboard } from 'lucide-react';

interface Props {
  activePersona: BusinessPersona;
  onSelectPersona: (persona: BusinessPersona) => void;
}

export const PERSONA_CONFIG: Record<BusinessPersona, {
  id: BusinessPersona;
  title: string;
  role: string;
  icon: any;
  description: string;
  badgeColor: string;
}> = {
  analyst: {
    id: 'analyst',
    title: 'TPRM Analyst View',
    role: 'Risk Assessor / Analyst',
    icon: UserCheck,
    description: 'Full signal checklist matrix, raw severity scoring math, coverage redistribution, custom findings.',
    badgeColor: '#818cf8',
  },
  ciso: {
    id: 'ciso',
    title: 'CISO Leadership View',
    role: 'Chief Information Security Officer',
    icon: ShieldAlert,
    description: 'Threat exposure radar, breach risk overrides, required security controls & CISO sign-off status.',
    badgeColor: '#ef4444',
  },
  procurement: {
    id: 'procurement',
    title: 'Procurement & Legal View',
    role: 'Vendor Risk & Legal Counsel',
    icon: FileText,
    description: 'Vendor onboarding approval decision, SLA guidelines, OFAC sanctions status & DPA compliance audit.',
    badgeColor: '#f59e0b',
  },
  executive: {
    id: 'executive',
    title: 'Board & Executive View',
    role: 'Executive Committee / Board',
    icon: LayoutDashboard,
    description: 'High-level risk gauge, category scorecard overview, 1-click executive risk memo export.',
    badgeColor: '#10b981',
  },
};

export function PersonaSwitcher({ activePersona, onSelectPersona }: Props) {
  return (
    <div className="card" style={{ padding: '16px 20px', marginBottom: '24px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
            RISKMATE STAKEHOLDER PERSONA SWITCHER
          </span>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
            Tailored Vendor Risk Intelligence for Your Organization
          </h2>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#047857', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '4px 12px', borderRadius: '20px', fontWeight: 600 }}>
          Active View: {PERSONA_CONFIG[activePersona].title}
        </div>
      </div>

      <div className="persona-grid">
        {(Object.keys(PERSONA_CONFIG) as BusinessPersona[]).map(pKey => {
          const config = PERSONA_CONFIG[pKey];
          const Icon = config.icon;
          const isActive = activePersona === pKey;

          return (
            <button
              key={pKey}
              type="button"
              className={`persona-card ${isActive ? 'active' : ''}`}
              onClick={() => onSelectPersona(pKey)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <div className="persona-icon" style={{ background: isActive ? config.badgeColor : 'rgba(255,255,255,0.06)' }}>
                  <Icon size={18} color={isActive ? '#ffffff' : '#9ca3af'} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isActive ? '#ffffff' : '#e5e7eb' }}>
                    {config.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {config.role}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, textAlign: 'left' }}>
                {config.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
