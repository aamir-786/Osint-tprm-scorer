import { useState } from 'react';
import type { ScoringResult, CategoryKey } from '../types/tprm';
import { CATEGORIES } from '../engine/constants';
import { ShieldCheck, ShieldAlert, Award, Download, Copy, Check, ChevronDown, ChevronUp, AlertTriangle, Info } from 'lucide-react';

interface Props {
  result: ScoringResult;
  onToggleTechnicalView: () => void;
  showTechnicalView: boolean;
}

export function BusinessExecutiveDashboard({ result, onToggleTechnicalView, showTechnicalView }: Props) {
  const [copied, setCopied] = useState(false);

  const {
    identity,
    overallScore,
    overallGrade,
    overallConfidence,
    weakestCategoryName,
    hardOverrideApplied,
    softCapApplied,
    overrideExplanation,
    categoryResults,
    keyFindings,
    isInsufficientData,
    formattedMarkdown,
  } = result;

  const categoryKeys = Object.keys(CATEGORIES) as CategoryKey[];

  // HCI System Status Badge Decision Logic
  let decisionBadge = { text: 'APPROVED FOR ONBOARDING', class: 'badge-safe', icon: ShieldCheck };
  let decisionRationale = 'Vendor meets all required cybersecurity, compliance, and legal standards. Recommended for standard procurement approval.';

  if (isInsufficientData) {
    decisionBadge = { text: 'ONBOARDING PAUSED (INSUFFICIENT DATA)', class: 'badge-warning', icon: AlertTriangle };
    decisionRationale = 'Public signal coverage is under the 40% model floor. Full vendor security questionnaire required before execution.';
  } else if (hardOverrideApplied || overallGrade === 'F') {
    decisionBadge = { text: 'PROCUREMENT REJECTED (HIGH RISK)', class: 'badge-danger', icon: ShieldAlert };
    decisionRationale = `Critical Risk Flag: ${overrideExplanation || 'Active breach or sanctions match detected'}. Immediate CISO intervention required.`;
  } else if (softCapApplied || overallGrade === 'C' || overallGrade === 'D') {
    decisionBadge = { text: 'CONDITIONAL APPROVAL (RESTRICTED ACCESS)', class: 'badge-warning', icon: AlertTriangle };
    decisionRationale = 'Approved for low-sensitivity workloads only. Vendor must remediate open security findings within 60 days.';
  }

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(formattedMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const filename = `${identity.companyName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_risk_scorecard.md`;
    const blob = new Blob([formattedMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const IconComp = decisionBadge.icon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* HCI Primary Hero Scorecard Panel */}
      <div className="score-hero-container">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span className={`badge ${decisionBadge.class}`}>
              <IconComp size={14} /> {decisionBadge.text}
            </span>
            <span className={`badge badge-${overallConfidence.toLowerCase()}`}>
              {overallConfidence} Confidence
            </span>
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {identity.companyName}
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--status-safe-text)', fontWeight: 600, marginTop: '2px' }}>
            Domain: <strong>{identity.confirmedDomain}</strong> • Model Version 2.0
          </p>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '780px', lineHeight: 1.5 }}>
            {decisionRationale}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Vendor Risk Score
            </div>
            <div className="score-main">
              <span className="score-number" style={{ color: hardOverrideApplied ? 'var(--status-danger)' : softCapApplied ? 'var(--status-warning)' : 'var(--text-primary)' }}>
                {isInsufficientData ? 'N/A' : overallScore}
              </span>
              <span style={{ fontSize: '1.1rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>/ 950</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              Weakest Category: <strong>{weakestCategoryName}</strong>
            </div>
          </div>

          {!isInsufficientData && (
            <div className={`grade-badge-huge grade-${overallGrade}`} title={`Grade ${overallGrade}`}>
              {overallGrade}
            </div>
          )}
        </div>
      </div>

      {/* HCI Category Health Cards (Heuristic #6: Recognition over Recall) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            6-Category Risk Overview
          </h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Info size={14} /> Higher score indicates lower risk profile (Base 950)
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {categoryKeys.map(catKey => {
            const cat = categoryResults[catKey];
            const pct = Math.round((cat.rawScore / 950) * 100);
            const statusColor = cat.rawScore >= 800 ? 'var(--status-safe)' : cat.rawScore >= 600 ? 'var(--status-warning)' : 'var(--status-danger)';

            return (
              <div key={catKey} className="card" style={{ padding: '18px 20px', margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{cat.meta.name}</span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: statusColor }}>
                    {cat.rawScore} <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>/ 950</span>
                  </div>
                </div>

                <div style={{ width: '100%', height: '7px', background: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: statusColor, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <span>Weight: {(cat.effectiveWeight * 100).toFixed(0)}%</span>
                  <span>Coverage: {Math.round(cat.coverage * 100)}%</span>
                  <span>Confidence: {cat.confidence}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HCI Actionable Risks Panel */}
      <div className="card">
        <div className="card-title">
          <Award size={18} color="var(--status-safe)" />
          <span>Key Findings & Required Action Items</span>
        </div>

        {keyFindings.length === 0 ? (
          <div style={{ padding: '14px 18px', background: 'var(--status-safe-bg)', border: '1px solid var(--status-safe-border)', borderRadius: '10px', color: 'var(--status-safe-text)', fontSize: '0.88rem', fontWeight: 600 }}>
            ✓ No critical or high-severity vulnerabilities flagged in public OSINT records.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {keyFindings.map(f => (
              <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-subtle)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', borderLeft: `4px solid ${f.severity === 'Critical' ? 'var(--status-danger)' : 'var(--status-warning)'}` }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{f.title}</span>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Source: {f.source} • Category: {CATEGORIES[f.category].name}
                  </div>
                </div>
                <span className={`badge badge-${f.severity.toLowerCase()}`}>{f.severity}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Toolbar & Advanced Technical Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" className="btn btn-primary" onClick={handleDownloadReport}>
            <Download size={16} /> Download Executive Report (.md)
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleCopyMarkdown}>
            {copied ? <Check size={16} color="var(--status-safe)" /> : <Copy size={16} />}
            {copied ? 'Copied Markdown!' : 'Copy Summary'}
          </button>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onToggleTechnicalView}
          style={{ fontSize: '0.84rem' }}
        >
          {showTechnicalView ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {showTechnicalView ? 'Hide Technical Analyst Matrix' : 'Show Advanced Technical Signal Matrix'}
        </button>
      </div>
    </div>
  );
}
