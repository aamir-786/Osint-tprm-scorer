import { Rocket, CheckCircle2 } from 'lucide-react';

export function ProductRoadmapView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="card" style={{ borderLeft: '4px solid #34d399', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="brand-icon" style={{ background: '#10b981' }}>
            <Rocket size={22} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#34d399' }}>
              PRODUCT STRATEGY & ENTERPRISE ARCHITECTURE
            </span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
              TPRM Platform Productization Roadmap
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              How this OSINT Scoring Engine productises and aligns with the enterprise TPRM platform ecosystem.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Phase Roadmap Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Phase 1 */}
        <div className="card" style={{ border: '1px solid rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>PHASE 1 (SHIPPED PoC)</span>
            <span className="badge badge-high"><CheckCircle2 size={12} /> DELIVERED</span>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
            Core Defensible OSINT Engine
          </h3>
          <ul style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '18px' }}>
            <li>6 Core Categories & 20 Planned Signals</li>
            <li>Mechanical 950-point severity penalty math</li>
            <li>Proportional &lt;50% coverage weight redistribution</li>
            <li>Hard Override (Grade F) & Soft Cap (Grade C)</li>
            <li>Stakeholder Personas (Analyst, CISO, Procurement, Executive)</li>
            <li>Real-Time Live Telemetry Scanner for any domain</li>
          </ul>
        </div>

        {/* Phase 2 */}
        <div className="card" style={{ border: '1px solid rgba(99, 102, 241, 0.4)', background: 'rgba(99, 102, 241, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase' }}>PHASE 2 (NEXT 3-6 MONTHS)</span>
            <span className="badge badge-medium">PLANNED</span>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
            Workflow Integration & Webhooks
          </h3>
          <ul style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '18px' }}>
            <li>Jira Vendor Onboarding plugin & auto-ticket creator</li>
            <li>ServiceNow TPRM Risk Register Sync API</li>
            <li>Slack / Microsoft Teams alert webhooks for score deltas</li>
            <li>Automated Vendor Security Questionnaire (VSQ) auto-filler</li>
            <li>Custom risk weight matrix customization per organization</li>
          </ul>
        </div>

        {/* Phase 3 */}
        <div className="card" style={{ border: '1px solid rgba(168, 85, 247, 0.4)', background: 'rgba(168, 85, 247, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#d8b4fe', textTransform: 'uppercase' }}>PHASE 3 (FUTURE DIRECTION)</span>
            <span className="badge badge-medium">FUTURE</span>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
            Continuous Supply Chain Intel
          </h3>
          <ul style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '18px' }}>
            <li>Nth-Party Supply Chain Dependency Graph Mapping</li>
            <li>Commercial Feed Connectors (Bitsight / SecurityScorecard API)</li>
            <li>Dark Web Cyber Threat Intelligence (CTI) breach streaming</li>
            <li>Automated ESG & Geopolitical risk signal collectors</li>
            <li>Agentic AI Auto-Remediation Letter Writer for vendors</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
