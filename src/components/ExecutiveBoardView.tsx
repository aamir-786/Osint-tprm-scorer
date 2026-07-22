import { useState } from 'react';
import type { ScoringResult, CategoryKey } from '../types/tprm';
import { CATEGORIES } from '../engine/constants';
import { Award, FileSpreadsheet, Download, Copy, Check } from 'lucide-react';

interface Props {
  result: ScoringResult;
}

export function ExecutiveBoardView({ result }: Props) {
  const [copiedMemo, setCopiedMemo] = useState(false);

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
  } = result;

  const categoryKeys = Object.keys(CATEGORIES) as CategoryKey[];

  const executiveMemoContent = `
===================================================================
EXECUTIVE RISK MEMORANDUM — BOARD OF DIRECTORS
===================================================================
SUBJECT: Third-Party Risk Assessment — ${identity.companyName} (${identity.confirmedDomain})
ASSESSMENT DATE: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
MODEL VERSION: OSINT TPRM Engine v2.0 (Defensible Risk Framework)

OVERALL EXECUTIVE SCORE: ${isInsufficientData ? 'INSUFFICIENT PUBLIC DATA' : `${overallScore} / 950 (GRADE ${overallGrade})`}
OVERALL CONFIDENCE RATING: ${overallConfidence} (Weakest link: ${weakestCategoryName})
RISK OVERRIDE STATUS: ${hardOverrideApplied ? `CRITICAL OVERRIDE APPLIED (${overrideExplanation})` : softCapApplied ? `CAP APPLIED (${overrideExplanation})` : 'None'}

CATEGORY RISK BREAKDOWN:
${categoryKeys.map(k => {
  const cat = categoryResults[k];
  return `- ${cat.meta.name}: ${cat.rawScore}/950 | Coverage: ${Math.round(cat.coverage * 100)}% | Confidence: ${cat.confidence}`;
}).join('\n')}

KEY THREAT & COMPLIANCE FINDINGS:
${keyFindings.length === 0 ? '- No critical/high severity vulnerabilities flagged.' : keyFindings.map(f => `- [${f.severity}] ${f.title} (${f.source})`).join('\n')}

BOARD RECOMMENDATION:
${isInsufficientData
  ? 'DO NOT ONBOARD. Data coverage is below the 40% minimum threshold.'
  : hardOverrideApplied
  ? 'REJECT VENDOR. Direct sanctions or active security breach detected.'
  : overallGrade === 'A' || overallGrade === 'B'
  ? 'APPROVED FOR ONBOARDING. Standard annual reassessment schedule.'
  : 'CONDITIONAL ONBOARDING. Mandatory remediation plan required.'}
===================================================================
`.trim();

  const handleCopyMemo = () => {
    navigator.clipboard.writeText(executiveMemoContent);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2000);
  };

  const handleDownloadMemo = () => {
    const filename = `${identity.companyName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_executive_memo.txt`;
    const blob = new Blob([executiveMemoContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Executive Hero Gauge */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              BOARD OF DIRECTORS EXECUTIVE DASHBOARD
            </span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px' }}>
              {identity.companyName}
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#a5b4fc', marginTop: '2px' }}>
              Confirmed Domain: <strong>{identity.confirmedDomain}</strong> • Model Version 2.0
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Score</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, color: hardOverrideApplied ? '#ef4444' : '#ffffff' }}>
                {isInsufficientData ? 'N/A' : overallScore}
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/950</span>
              </div>
            </div>

            {!isInsufficientData && (
              <div className={`grade-badge-huge grade-${overallGrade}`}>
                {overallGrade}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6 Category Progress Bars Grid */}
      <div className="card">
        <div className="card-title" style={{ fontSize: '1rem', marginBottom: '16px' }}>
          <Award size={18} color="#818cf8" />
          <span>Category Performance Radar</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {categoryKeys.map(catKey => {
            const cat = categoryResults[catKey];
            const pct = Math.round((cat.rawScore / 950) * 100);
            const barColor = cat.rawScore >= 800 ? '#10b981' : cat.rawScore >= 600 ? '#3b82f6' : cat.rawScore >= 400 ? '#f59e0b' : '#ef4444';

            return (
              <div key={catKey} style={{ background: 'rgba(15,23,42,0.6)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{cat.meta.name}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: barColor }}>{cat.rawScore}/950 ({pct}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>Coverage: {Math.round(cat.coverage * 100)}%</span>
                  <span>Confidence: {cat.confidence}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Board Executive Memo Export Box */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div className="card-title" style={{ margin: 0, fontSize: '1rem' }}>
            <FileSpreadsheet size={18} color="#34d399" />
            <span>Executive Risk Memorandum for Board Distribution</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={handleCopyMemo} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              {copiedMemo ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
              {copiedMemo ? 'Copied Memo!' : 'Copy Text'}
            </button>
            <button type="button" className="btn btn-primary" onClick={handleDownloadMemo} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              <Download size={14} /> Download Memo (.txt)
            </button>
          </div>
        </div>

        <div className="markdown-box" style={{ background: '#070a12', fontSize: '0.8rem' }}>
          {executiveMemoContent}
        </div>
      </div>
    </div>
  );
}
