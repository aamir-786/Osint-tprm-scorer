import type { ScoringResult, CategoryKey } from '../types/tprm';
import { CATEGORIES } from '../engine/constants';
import { ShieldAlert, AlertTriangle, Award, Scale } from 'lucide-react';

interface Props {
  result: ScoringResult;
  inputOverrides: {
    overrideDirectSanctionsOrBreach: boolean;
    overridePartialSanctions: boolean;
    overrideDetails?: string;
  };
  onToggleDirectSanction: (val: boolean) => void;
  onTogglePartialSanction: (val: boolean) => void;
}

export const ScorecardView: React.FC<Props> = ({
  result,
  inputOverrides,
  onToggleDirectSanction,
  onTogglePartialSanction,
}) => {
  const {
    isInsufficientData,
    overallScore,
    overallGrade,
    unoverriddenScore,
    unoverriddenGrade,
    overallConfidence,
    weakestCategoryName,
    hardOverrideApplied,
    softCapApplied,
    overrideExplanation,
    categoryResults,
    overallCoverage,
  } = result;

  const categoryKeys = Object.keys(CATEGORIES) as CategoryKey[];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Overrides & Floor Settings Bar */}
      <div className="card" style={{ padding: '16px 20px', margin: 0 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Scale size={16} color="#818cf8" /> OVERRIDE & SPECIAL CLAUSE CONTROLS
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={inputOverrides.overrideDirectSanctionsOrBreach}
              onChange={e => onToggleDirectSanction(e.target.checked)}
            />
            <span style={{ color: inputOverrides.overrideDirectSanctionsOrBreach ? '#ef4444' : undefined, fontWeight: inputOverrides.overrideDirectSanctionsOrBreach ? 600 : 400 }}>
              Direct Sanction / Active Ransomware (Force Grade F)
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={inputOverrides.overridePartialSanctions}
              onChange={e => onTogglePartialSanction(e.target.checked)}
            />
            <span style={{ color: inputOverrides.overridePartialSanctions ? '#f59e0b' : undefined, fontWeight: inputOverrides.overridePartialSanctions ? 600 : 400 }}>
              Related-Entity Sanction Match (Cap Grade C)
            </span>
          </label>
        </div>
      </div>

      {/* Hero Scorecard Box */}
      <div className="score-hero">
        <div>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Final Defensible Risk Score
          </div>

          {isInsufficientData ? (
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171', marginTop: '6px' }}>
                Insufficient Public Data
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Total coverage is {(overallCoverage * 100).toFixed(0)}% (less than 40% floor). Unable to score.
              </div>
            </div>
          ) : (
            <div>
              <div className="score-main">
                <span className="score-number" style={{ color: hardOverrideApplied ? '#ef4444' : softCapApplied ? '#f59e0b' : '#0f172a' }}>
                  {overallScore}
                </span>
                <span className="score-max">/ 950</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center' }}>
                <span className={`badge badge-${overallConfidence.toLowerCase()}`}>
                  {overallConfidence} Confidence
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  (Weakest category: {weakestCategoryName})
                </span>
              </div>
            </div>
          )}
        </div>

        {!isInsufficientData && (
          <div className={`grade-badge-huge grade-${overallGrade}`}>
            {overallGrade}
          </div>
        )}
      </div>

      {/* Insufficient Data Alert */}
      {isInsufficientData && (
        <div className="alert alert-danger" style={{ margin: 0 }}>
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>INSUFFICIENT-DATA FLOOR APPLIED</strong>
            <div style={{ fontSize: '0.82rem', marginTop: '2px' }}>
              Total evidence coverage across all six categories is only {(overallCoverage * 100).toFixed(0)}% (less than 40% threshold). Pursuant to model hard rules, numeric scoring is suppressed.
            </div>
          </div>
        </div>
      )}

      {/* Hard Override Alert */}
      {hardOverrideApplied && !isInsufficientData && (
        <div className="alert alert-danger" style={{ margin: 0 }}>
          <ShieldAlert size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>HARD OVERRIDE APPLIED — FINAL GRADE F</strong>
            <div style={{ fontSize: '0.82rem', marginTop: '2px' }}>
              {overrideExplanation}. Calculated score was <strong>{unoverriddenScore}/950 (Grade {unoverriddenGrade})</strong>.
            </div>
          </div>
        </div>
      )}

      {/* Soft Cap Alert */}
      {softCapApplied && !hardOverrideApplied && !isInsufficientData && (
        <div className="alert alert-warning" style={{ margin: 0 }}>
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>SOFT CAP APPLIED — GRADE C MAX</strong>
            <div style={{ fontSize: '0.82rem', marginTop: '2px' }}>
              {overrideExplanation}. Calculated score was <strong>{unoverriddenScore}/950 (Grade {unoverriddenGrade})</strong>.
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown Table */}
      <div className="card" style={{ margin: 0 }}>
        <div className="card-title" style={{ fontSize: '1rem', marginBottom: '12px', marginTop: '16px' }}>
          <Award size={18} color="#818cf8" />
          <span>Category Performance Breakdown</span>
        </div>

        {/* Visual Bar Chart (Explainable in one eye) */}
        <div style={{ marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Visual Risk Profile
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categoryKeys.map(catKey => {
              const cat = categoryResults[catKey];
              const scorePct = Math.min(100, Math.max(0, (cat.rawScore / 950) * 100));
              let barColor = '#ef4444'; // Red (High Risk)
              if (cat.rawScore >= 800) barColor = '#10b981'; // Green (Low Risk)
              else if (cat.rawScore >= 500) barColor = '#f59e0b'; // Yellow (Medium Risk)



              return (
                <div key={`visual-${catKey}`} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '160px', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                    {cat.meta.name}
                  </div>
                  <div style={{ flex: 1, height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${scorePct}%`, height: '100%', background: barColor, borderRadius: '5px', transition: 'width 0.5s ease-in-out' }}></div>
                  </div>
                  <div style={{ width: '80px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 700, color: barColor }}>
                    {cat.rawScore} <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 400 }}>/ 950</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="wahid-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Score</th>
                <th>Coverage</th>
                <th>Eff. Wt.</th>
                <th>Contrib.</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {categoryKeys.map(catKey => {
                const cat = categoryResults[catKey];
                const covPct = Math.round(cat.coverage * 100);
                const isUndercovered = cat.coverage < 0.5;

                return (
                  <tr key={catKey}>
                    <td style={{ fontWeight: 600 }}>{cat.meta.name}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span style={{ color: cat.rawScore >= 800 ? '#10b981' : cat.rawScore >= 500 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
                        {cat.rawScore}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/950</span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span style={{ color: isUndercovered ? '#ef4444' : '#475569', fontWeight: 600 }}>
                        {covPct}% ({cat.signalsChecked}/{cat.signalsPlanned})
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{(cat.effectiveWeight * 100).toFixed(1)}%</span>
                      {isUndercovered && (
                        <span style={{ fontSize: '0.7rem', color: '#ef4444', marginLeft: '4px' }} title="Category <50% coverage: Weight reduced & redistributed">
                          (Reduced)
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>{Math.round(cat.contribution)}</td>
                    <td>
                      <span className={`badge badge-${cat.confidence.toLowerCase()}`} style={{ fontSize: '0.65rem', padding: '3px 6px' }}>
                        {cat.confidence}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
