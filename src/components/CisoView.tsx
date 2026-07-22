import { useState } from 'react';
import type { ScoringResult, FindingRecord } from '../types/tprm';
import { ShieldAlert, ShieldCheck, AlertOctagon, CheckCircle2, Lock, AlertTriangle, FileCheck, Zap } from 'lucide-react';

interface Props {
  result: ScoringResult;
}

export function CisoView({ result }: Props) {
  const [cisoApprovalState, setCisoApprovalState] = useState<'pending' | 'approved' | 'rejected' | 'waived'>('pending');
  const [cisoNotes, setCisoNotes] = useState('');

  const {
    identity,
    overallScore,
    overallGrade,
    overallConfidence,
    hardOverrideApplied,
    softCapApplied,
    overrideExplanation,
    categoryResults,
    keyFindings,
    isInsufficientData,
  } = result;

  const csRes = categoryResults.cybersecurity;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* CISO Header Badge */}
      <div className="card" style={{ borderLeft: '4px solid #dc2626', background: 'linear-gradient(135deg, #ffffff, #f8fafc)', border: '1px solid #cbd5e1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span className="badge badge-low" style={{ fontSize: '0.72rem', marginBottom: '4px' }}>CISO EXECUTIVE DASHBOARD</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              {identity.companyName} ({identity.confirmedDomain})
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
              Defensible Technical Risk Score: <strong>{isInsufficientData ? 'N/A' : `${overallScore}/950`}</strong> • Grade: <strong>{overallGrade}</strong> • Confidence: <strong>{overallConfidence}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ textAlign: 'right', background: '#f8fafc', padding: '10px 16px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Cybersecurity Category</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: csRes.rawScore >= 800 ? '#10b981' : '#dc2626' }}>
                {csRes.rawScore}/950
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Overrides & Threat Warnings */}
      {(hardOverrideApplied || softCapApplied || isInsufficientData) && (
        <div className="card" style={{ border: '1px solid rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: 700, color: '#fca5a5', marginBottom: '8px' }}>
            <AlertOctagon size={20} />
            <span>CISO MANDATORY ATTENTION ITEM</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#f3f4f6', lineHeight: 1.5 }}>
            {isInsufficientData
              ? 'Insufficient data coverage (<40% floor). Production interconnects must be BLOCKED until vendor completes vendor security questionnaire.'
              : hardOverrideApplied
              ? `Hard Risk Override: ${overrideExplanation}. Vendor cannot be granted production network or customer PII access under standard authorization.`
              : `Soft Cap Applied: ${overrideExplanation}. Require mandatory legal waiver.`}
          </p>
        </div>
      )}

      {/* 2-Grid: Threat Matrix & Remediation Roadmap */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Threat Exposure Breakdown */}
        <div className="card">
          <div className="card-title" style={{ fontSize: '1rem' }}>
            <ShieldAlert size={18} color="#ef4444" />
            <span>Critical Technical Threat Exposure</span>
          </div>

          {keyFindings.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#34d399', background: 'rgba(16,185,129,0.06)', borderRadius: '10px' }}>
              <CheckCircle2 size={32} style={{ margin: '0 auto 8px' }} />
              <strong>Zero Critical/High Severity Vulnerabilities Detected</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                No active breach indicators, open DB ports, or expired SSL certificates flagged in public OSINT scan.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {keyFindings.map((f: FindingRecord) => (
                <div key={f.id} style={{ background: 'rgba(15,23,42,0.8)', borderLeft: `4px solid ${f.severity === 'Critical' ? '#ef4444' : '#f97316'}`, padding: '10px 14px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{f.title}</span>
                    <span className={`badge badge-${f.severity.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>{f.severity}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Category: {f.category} • Source: {f.source}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Required CISO Remediation Mandates */}
        <div className="card">
          <div className="card-title" style={{ fontSize: '1rem' }}>
            <Lock size={18} color="#818cf8" />
            <span>Mandatory Security Controls Roadmap</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <Zap size={16} color="#818cf8" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong>TLS & HTTP Security Headers</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Enforce HSTS (min 1 year), CSP headers, and disable TLS 1.0/1.1 on external endpoints.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <FileCheck size={16} color="#818cf8" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong>Third-Party Certification Verification</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Require independent ISO 27001 certificate audit or SOC 2 Type II report validation.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <AlertTriangle size={16} color="#818cf8" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong>Incident Response SLA</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Include 24-hour mandatory breach notification clause in commercial vendor contract.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive CISO Sign-off Workflow */}
      <div className="card" style={{ border: '1px solid rgba(99, 102, 241, 0.3)', background: 'rgba(15, 23, 42, 0.9)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div className="card-title" style={{ margin: 0, fontSize: '1rem' }}>
            <ShieldCheck size={18} color="#34d399" />
            <span>CISO Risk Authorization Sign-Off</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`btn ${cisoApprovalState === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ background: cisoApprovalState === 'approved' ? '#10b981' : undefined, fontSize: '0.8rem' }}
              onClick={() => setCisoApprovalState('approved')}
            >
              Approve Onboarding
            </button>
            <button
              type="button"
              className={`btn ${cisoApprovalState === 'waived' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ background: cisoApprovalState === 'waived' ? '#f59e0b' : undefined, fontSize: '0.8rem' }}
              onClick={() => setCisoApprovalState('waived')}
            >
              Grant Risk Waiver
            </button>
            <button
              type="button"
              className={`btn ${cisoApprovalState === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ background: cisoApprovalState === 'rejected' ? '#ef4444' : undefined, fontSize: '0.8rem' }}
              onClick={() => setCisoApprovalState('rejected')}
            >
              Reject / Block Vendor
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CISO Executive Rationale / Conditions:</label>
          <textarea
            rows={2}
            value={cisoNotes}
            onChange={e => setCisoNotes(e.target.value)}
            placeholder="e.g. Vendor approved conditionally subject to SOC 2 Type II report submission within 45 days."
            style={{ width: '100%', fontSize: '0.85rem' }}
          />
        </div>
      </div>
    </div>
  );
}
