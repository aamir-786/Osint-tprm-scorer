import { useState } from 'react';
import type { ScoringResult } from '../types/tprm';
import { Scale, FileText, CheckSquare, Square, AlertTriangle, ShieldCheck, DollarSign, Clock, ShieldX } from 'lucide-react';

interface Props {
  result: ScoringResult;
}

export function ProcurementLegalView({ result }: Props) {
  const [contractClauses, setContractClauses] = useState({
    dpaRequired: true,
    dpaSigned: false,
    breachSla24h: true,
    cyberInsurance5M: false,
    rightToAudit: true,
    ofacCleared: !result.hardOverrideApplied && !result.softCapApplied,
  });

  const {
    overallGrade,
    hardOverrideApplied,
    softCapApplied,
    overrideExplanation,
    categoryResults,
    isInsufficientData,
  } = result;

  const legalRes = categoryResults.legal;
  const complianceRes = categoryResults.compliance;

  // Onboarding decision recommendation engine
  let recommendationBadge = { text: 'APPROVED FOR ONBOARDING', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: ShieldCheck };
  let recommendationDetails = 'Vendor satisfies standard risk thresholds. Proceed with standard procurement contract.';

  if (isInsufficientData) {
    recommendationBadge = { text: 'ONBOARDING PAUSED (INSUFFICIENT DATA)', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: AlertTriangle };
    recommendationDetails = 'Public OSINT signal coverage is under 40%. Mandatory Vendor Security Questionnaire (VSQ) required before contract execution.';
  } else if (hardOverrideApplied || overallGrade === 'F') {
    recommendationBadge = { text: 'PROCUREMENT BLOCKED (HIGH RISK REJECTION)', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: ShieldX };
    recommendationDetails = `Critical Risk Override: ${overrideExplanation || 'Active breach or sanctions match detected'}. Immediate procurement hold.`;
  } else if (softCapApplied || overallGrade === 'C' || overallGrade === 'D') {
    recommendationBadge = { text: 'CONDITIONAL ONBOARDING (RESTRICTED DATA)', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: AlertTriangle };
    recommendationDetails = 'Vendor approved for non-sensitive data only. Contractual remediation plan required within 60 days.';
  }

  const toggleClause = (key: keyof typeof contractClauses) => {
    setContractClauses(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const IconComp = recommendationBadge.icon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Onboarding Recommendation Card */}
      <div className="card" style={{ borderLeft: `4px solid ${recommendationBadge.color}`, background: 'linear-gradient(135deg, #ffffff, #f8fafc)', border: '1px solid #cbd5e1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: recommendationBadge.color }}>
              PROCUREMENT & LEGAL ONBOARDING DECISION ENGINE
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
              <IconComp size={24} color={recommendationBadge.color} />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                {recommendationBadge.text}
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '6px', maxWidth: '800px' }}>
              {recommendationDetails}
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px 18px', borderRadius: '12px', border: '1px solid #cbd5e1', textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Vendor Legal Standing</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: legalRes.rawScore >= 800 ? '#10b981' : '#dc2626' }}>
              Legal Score: {legalRes.rawScore}/950
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Compliance Radar & Contractual SLA Guidelines */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Compliance & Privacy Audit */}
        <div className="card">
          <div className="card-title" style={{ fontSize: '1rem' }}>
            <FileText size={18} color="#818cf8" />
            <span>Compliance & Privacy Verification</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px' }}>
              <div>
                <strong>ISO 27001 / CSA STAR Listing</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Third-party independent security certification registry</div>
              </div>
              <span className={`badge ${complianceRes.findings.some(f => f.signalId === 'cp_iso_csa') ? 'badge-low' : 'badge-high'}`}>
                {complianceRes.findings.some(f => f.signalId === 'cp_iso_csa') ? 'Missing' : 'Verified'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px' }}>
              <div>
                <strong>Public Privacy Policy</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Publicly accessible GDPR / CCPA privacy disclosure</div>
              </div>
              <span className={`badge ${complianceRes.findings.some(f => f.signalId === 'cp_privacy_policy') ? 'badge-low' : 'badge-high'}`}>
                {complianceRes.findings.some(f => f.signalId === 'cp_privacy_policy') ? 'Missing' : 'Verified'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px' }}>
              <div>
                <strong>Data Processing Addendum (DPA)</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Standard DPA available for customer data processing</div>
              </div>
              <span className={`badge ${complianceRes.findings.some(f => f.signalId === 'cp_dpa') ? 'badge-medium' : 'badge-high'}`}>
                {complianceRes.findings.some(f => f.signalId === 'cp_dpa') ? 'Missing' : 'Available'}
              </span>
            </div>
          </div>
        </div>

        {/* Legal & Watchlist Clearance Status */}
        <div className="card">
          <div className="card-title" style={{ fontSize: '1rem' }}>
            <Scale size={18} color="#f59e0b" />
            <span>Watchlist & Regulatory Clearance</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px' }}>
              <div>
                <strong>OFAC / UN Sanctions Watchlist</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Direct sanctions match verification</div>
              </div>
              <span className={`badge ${hardOverrideApplied ? 'badge-low' : 'badge-high'}`}>
                {hardOverrideApplied ? 'FLAGGED MATCH' : 'CLEARED'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px' }}>
              <div>
                <strong>Related-Entity / Partial Match</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Soft cap trigger on affiliated entity search</div>
              </div>
              <span className={`badge ${softCapApplied ? 'badge-medium' : 'badge-high'}`}>
                {softCapApplied ? 'PARTIAL MATCH' : 'CLEARED'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px' }}>
              <div>
                <strong>Export Restrictions & Regulator Actions</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BIS entity list & regulatory fines history</div>
              </div>
              <span className={`badge ${legalRes.findings.some(f => f.signalId === 'lr_export_regulatory') ? 'badge-medium' : 'badge-high'}`}>
                {legalRes.findings.some(f => f.signalId === 'lr_export_regulatory') ? 'Action Flagged' : 'No Action Flagged'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contractual SLA & Terms Checklist */}
      <div className="card">
        <div className="card-title" style={{ fontSize: '1rem', marginBottom: '14px' }}>
          <FileText size={18} color="#34d399" />
          <span>Recommended Contractual Terms & Safeguards Checklist</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(15,23,42,0.6)', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>
            <button type="button" style={{ background: 'none', border: 'none', color: contractClauses.dpaSigned ? '#34d399' : '#6b7280', padding: 0 }} onClick={() => toggleClause('dpaSigned')}>
              {contractClauses.dpaSigned ? <CheckSquare size={18} /> : <Square size={18} />}
            </button>
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Executed DPA with Standard Contractual Clauses (SCCs)</span>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mandatory for GDPR / CCPA data transfers.</div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(15,23,42,0.6)', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>
            <button type="button" style={{ background: 'none', border: 'none', color: contractClauses.breachSla24h ? '#34d399' : '#6b7280', padding: 0 }} onClick={() => toggleClause('breachSla24h')}>
              {contractClauses.breachSla24h ? <CheckSquare size={18} /> : <Square size={18} />}
            </button>
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>24-Hour Mandatory Security Incident SLA</span>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}><Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />Requires vendor to notify within 24h of suspected breach.</div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(15,23,42,0.6)', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>
            <button type="button" style={{ background: 'none', border: 'none', color: contractClauses.cyberInsurance5M ? '#34d399' : '#6b7280', padding: 0 }} onClick={() => toggleClause('cyberInsurance5M')}>
              {contractClauses.cyberInsurance5M ? <CheckSquare size={18} /> : <Square size={18} />}
            </button>
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>$5 Million Cyber Liability Insurance Certificate</span>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}><DollarSign size={12} style={{ display: 'inline', marginRight: '4px' }} />Minimum policy limit for third-party technology providers.</div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(15,23,42,0.6)', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>
            <button type="button" style={{ background: 'none', border: 'none', color: contractClauses.rightToAudit ? '#34d399' : '#6b7280', padding: 0 }} onClick={() => toggleClause('rightToAudit')}>
              {contractClauses.rightToAudit ? <CheckSquare size={18} /> : <Square size={18} />}
            </button>
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Annual Right-to-Audit & Penetration Test Mandate</span>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Grants buyer permission to request annual third-party pen test summaries.</div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
