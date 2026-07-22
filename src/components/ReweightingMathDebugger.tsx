import { useState } from 'react';
import type { ScoringResult, CategoryKey } from '../types/tprm';
import { CATEGORIES } from '../engine/constants';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  result: ScoringResult;
}

export const ReweightingMathDebugger: React.FC<Props> = ({ result }) => {
  const [isOpen, setIsOpen] = useState(false);
  const categoryKeys = Object.keys(CATEGORIES) as CategoryKey[];

  const undercoveredCategories = categoryKeys.filter(
    catKey => result.categoryResults[catKey].coverage < 0.5
  );

  return (
    <div className="card" style={{ margin: 0 }}>
      <button
        type="button"
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          color: 'var(--text-primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          padding: 0,
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, fontSize: '0.95rem' }}>
          <Calculator size={18} color="#2563eb" />
          <span>Weight Redistribution Math Debugger</span>
          {undercoveredCategories.length > 0 ? (
            <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>
              {undercoveredCategories.length} Category &lt; 50% Coverage
            </span>
          ) : (
            <span className="badge badge-safe" style={{ fontSize: '0.72rem' }}>
              All Categories &ge; 50% Coverage
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
            <strong>Rule Specification:</strong> If a category coverage is &lt; 50%, its effective weight is reduced to:
            <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', color: '#0f172a' }}>
              Effective Weight = Original Weight × (Coverage ÷ 0.5)
            </code>
            <br />
            The lost weight is proportionally redistributed across all remaining categories according to their original weights.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table className="wahid-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Orig Wt.</th>
                  <th>Coverage</th>
                  <th>Base Eff. Math</th>
                  <th>Redistributed</th>
                  <th>Final Wt.</th>
                </tr>
              </thead>
              <tbody>
                {categoryKeys.map(catKey => {
                  const cat = result.categoryResults[catKey];
                  const origPct = (cat.meta.weight * 100).toFixed(0) + '%';
                  const covPct = Math.round(cat.coverage * 100) + '%';
                  const isUnder = cat.coverage < 0.5;

                  return (
                    <tr key={catKey} style={{ background: isUnder ? '#fef2f2' : undefined }}>
                      <td style={{ fontWeight: 600 }}>{cat.meta.name}</td>
                      <td>{origPct}</td>
                      <td style={{ color: isUnder ? '#ef4444' : '#10b981', fontWeight: isUnder ? 700 : 400 }}>
                        {covPct} ({cat.signalsChecked}/{cat.signalsPlanned})
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                        {isUnder ? (
                          <span style={{ color: '#ef4444' }}>
                            {origPct} × ({covPct} / 50%) = {((cat.meta.weight * (cat.coverage / 0.5)) * 100).toFixed(1)}%
                          </span>
                        ) : (
                          <span>{origPct} (Full)</span>
                        )}
                      </td>
                      <td style={{ color: cat.weightRedistributedFromOthers > 0 ? '#10b981' : 'var(--text-tertiary)' }}>
                        {cat.weightRedistributedFromOthers > 0 ? `+${(cat.weightRedistributedFromOthers * 100).toFixed(1)}%` : '0%'}
                      </td>
                      <td style={{ fontWeight: 800, color: '#0f172a' }}>
                        {(cat.effectiveWeight * 100).toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
