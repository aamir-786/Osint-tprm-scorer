import { useState } from 'react';
import type { AssessmentInput, CategoryKey, Severity, SignalStatus, FindingRecord } from '../types/tprm';
import { CATEGORIES } from '../engine/constants';
import { Shield, Lock, FileCheck, TrendingUp, AlertTriangle, Scale, Plus, Server, CheckSquare, Square, Search, HelpCircle, Trash2, Clock } from 'lucide-react';

interface Props {
  input: AssessmentInput;
  onChange: (updated: AssessmentInput) => void;
}

const CATEGORY_ICONS: Record<CategoryKey, any> = {
  cybersecurity: Shield,
  compliance: Lock,
  stability: TrendingUp,
  reputation: AlertTriangle,
  resilience: FileCheck,
  legal: Scale,
  maturity: Clock,
};

const SEVERITY_GUIDANCE: Record<CategoryKey, string[]> = {
  maturity: [
    'Informational: Domain age > 5 years. Proven track record.',
    'Low (-10): Domain age 2-5 years. Relatively young.',
    'Medium (-30): Domain age 6 months - 2 years. Recent startup territory.',
    'High (-70): Domain age < 6 months. Brand new entity. Unproven.'
  ],
  cybersecurity: [
    'Critical (-150): SSL grade D/F or exposed critical service/database (Elastic, RDP, SSH, DB port)',
    'High (-70): Expired SSL certificate or exposed non-critical service',
    'Medium (-30): SSL grade C or missing DMARC/DNS security headers',
    'Low (-10): Missing security header (HSTS, CSP, X-Frame) or no security.txt file',
  ],
  compliance: [
    'Medium (-30): No privacy policy at all or no ISO 27001 / CSA STAR listing',
    'Low (-10): No Data Processing Addendum (DPA) available',
    'Informational (0): SOC 2 claims on vendor own site (unverified, log only)',
  ],
  stability: [
    'Critical (-150): Active bankruptcy or insolvency filings',
    'High (-70): Reported mass layoffs or funding collapse news',
    'Medium (-30): Declining headcount trend',
    'Low (-10): Very new company with minimal digital track record footprint',
  ],
  reputation: [
    'Critical (-150): Confirmed data breach disclosed in credible news sources',
    'High (-70): Sustained negative coverage (multiple reports over 6+ months)',
    'Medium (-30): Isolated negative mention',
    'Low (-10): Minor or dated negative media mention',
  ],
  resilience: [
    'High (-70): Frequent or serious major outages/incidents in available history',
    'Medium (-30): No public status page found at all',
    'Low (-10): One-off minor service incident',
  ],
  legal: [
    'Critical (-150): Direct sanctions/watchlist match (also triggers Grade F Override)',
    'High (-70): Active regulatory investigation or export restriction flag (BIS Entity List)',
    'Medium (-30): Historical resolved regulatory action or fine',
    'Low (-10): Related-entity or partial name match on sanctions list (also triggers Grade C Soft Cap)',
  ],
};

export const CategorySignalMatrix: React.FC<Props> = ({ input, onChange }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('cybersecurity');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSeverityHelp, setShowSeverityHelp] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');
  const [newFinding, setNewFinding] = useState<{ title: string; severity: Severity; source: string }>({
    title: '',
    severity: 'Medium',
    source: 'OSINT Report',
  });

  const categoryKeys = Object.keys(CATEGORIES) as CategoryKey[];

  const handleToggleMultiAsset = (multiAsset: boolean) => {
    if (multiAsset && input.assets.length === 0) {
      const defaultAssets = [
        {
          assetId: 'asset_1',
          name: `primary.${input.identity.confirmedDomain || 'vendor.com'}`,
          score: 950,
          cybersecurityPenalties: [],
        },
        {
          assetId: 'asset_2',
          name: `api.${input.identity.confirmedDomain || 'vendor.com'}`,
          score: 880,
          cybersecurityPenalties: [
            {
              id: 'f_api_header',
              category: 'cybersecurity' as CategoryKey,
              signalId: 'cs_headers',
              title: 'Missing HSTS header on API endpoint',
              severity: 'Medium' as Severity,
              source: 'TLS Scanner',
              confirmed: true,
            },
            {
              id: 'f_api_sectxt',
              category: 'cybersecurity' as CategoryKey,
              signalId: 'cs_security_txt',
              title: 'Missing security.txt',
              severity: 'Low' as Severity,
              source: 'HTTP Crawl',
              confirmed: true,
            }
          ],
        }
      ];
      onChange({ ...input, multiAsset, assets: defaultAssets });
    } else {
      onChange({ ...input, multiAsset });
    }
  };

  const handleAddAsset = () => {
    if (!newAssetName.trim()) return;
    const newAsset = {
      assetId: `asset_${Date.now()}`,
      name: newAssetName.trim(),
      score: 950,
      cybersecurityPenalties: [],
    };
    onChange({
      ...input,
      assets: [...input.assets, newAsset],
    });
    setNewAssetName('');
  };

  const handleRemoveAsset = (assetId: string) => {
    onChange({
      ...input,
      assets: input.assets.filter(a => a.assetId !== assetId),
    });
  };

  const handleSignalToggle = (signalId: string, checked: boolean) => {
    const updatedStatuses = { ...input.signalStatuses };
    const current = updatedStatuses[signalId] || { signalId, checked: false, hasFinding: false };
    updatedStatuses[signalId] = {
      ...current,
      checked,
      hasFinding: checked ? current.hasFinding : false,
    };
    onChange({ ...input, signalStatuses: updatedStatuses });
  };

  const handleFindingToggle = (signalId: string, hasFinding: boolean, defaultSev?: Severity) => {
    const updatedStatuses = { ...input.signalStatuses };
    const current = updatedStatuses[signalId] || { signalId, checked: true, hasFinding: false };
    updatedStatuses[signalId] = {
      ...current,
      checked: true,
      hasFinding,
      severity: hasFinding ? (current.severity || defaultSev || 'Medium') : undefined,
    };
    onChange({ ...input, signalStatuses: updatedStatuses });
  };

  const handleSeverityChange = (signalId: string, severity: Severity) => {
    const updatedStatuses = { ...input.signalStatuses };
    const current = updatedStatuses[signalId];
    if (current) {
      updatedStatuses[signalId] = { ...current, severity };
      onChange({ ...input, signalStatuses: updatedStatuses });
    }
  };

  const handleFindingDetailsChange = (signalId: string, findingDetails: string) => {
    const updatedStatuses = { ...input.signalStatuses };
    const current = updatedStatuses[signalId];
    if (current) {
      updatedStatuses[signalId] = { ...current, findingDetails };
      onChange({ ...input, signalStatuses: updatedStatuses });
    }
  };

  const handleAddCustomFinding = () => {
    if (!newFinding.title.trim()) return;
    const custom: FindingRecord = {
      id: `custom_${Date.now()}`,
      category: activeCategory,
      title: newFinding.title.trim(),
      severity: newFinding.severity,
      source: newFinding.source || 'Manual OSINT Finding',
      confirmed: newFinding.severity !== 'Informational',
    };
    onChange({
      ...input,
      customFindings: [...input.customFindings, custom],
    });
    setNewFinding({ title: '', severity: 'Medium', source: 'OSINT Report' });
    setShowAddCustom(false);
  };

  const handleRemoveCustomFinding = (id: string) => {
    onChange({
      ...input,
      customFindings: input.customFindings.filter(f => f.id !== id),
    });
  };

  const currentCategoryMeta = CATEGORIES[activeCategory];
  const IconComp = CATEGORY_ICONS[activeCategory];

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="card-title" style={{ margin: 0 }}>
          <Shield size={20} color="#818cf8" />
          <span>OSINT Signal & Findings Assessment</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
        {categoryKeys.map(catKey => {
          const meta = CATEGORIES[catKey];
          const Icon = CATEGORY_ICONS[catKey];
          const checkedCount = meta.signals.filter(s => input.signalStatuses[s.id]?.checked).length;
          const isActive = activeCategory === catKey;

          return (
            <button
              key={catKey}
              type="button"
              className={`preset-pill ${isActive ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '10px',
                padding: '8px 14px',
              }}
              onClick={() => setActiveCategory(catKey)}
            >
              <Icon size={16} />
              <span>{meta.name}</span>
              <span style={{
                background: checkedCount >= Math.ceil(meta.plannedSignalsCount / 2) ? '#ecfdf5' : '#fef2f2',
                color: checkedCount >= Math.ceil(meta.plannedSignalsCount / 2) ? '#047857' : '#b91c1c',
                padding: '2px 6px',
                borderRadius: '12px',
                fontSize: '0.72rem',
                fontWeight: 700,
                border: checkedCount >= Math.ceil(meta.plannedSignalsCount / 2) ? '1px solid #a7f3d0' : '1px solid #fca5a5'
              }}>
                {checkedCount}/{meta.plannedSignalsCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Category Description & Weight */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IconComp size={22} color="#818cf8" />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{currentCategoryMeta.name}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Weight: <strong>{(currentCategoryMeta.weight * 100).toFixed(0)}%</strong> • {currentCategoryMeta.plannedSignalsCount} Planned Signals
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            onClick={() => setShowSeverityHelp(!showSeverityHelp)}
          >
            <HelpCircle size={14} color="#818cf8" /> Severity Guidance
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            onClick={() => setShowAddCustom(true)}
          >
            <Plus size={14} /> Add Custom Finding
          </button>
        </div>
      </div>

      {/* Severity Guidance Helper Accordion */}
      {showSeverityHelp && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.8rem' }}>
          <div style={{ fontWeight: 700, color: '#1d4ed8', marginBottom: '6px' }}>
            Model Severity Guidance: {currentCategoryMeta.name}
          </div>
          <ul style={{ paddingLeft: '18px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {SEVERITY_GUIDANCE[activeCategory].map((guide, idx) => (
              <li key={idx}>{guide}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Multi-Asset Control Panel for Cybersecurity */}
      {activeCategory === 'cybersecurity' && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px 16px', borderRadius: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontWeight: 600, fontSize: '0.9rem' }}>
              <Server size={18} /> Multi-Asset Evaluation Mode
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', color: '#0f172a' }}>
              <input
                type="checkbox"
                checked={input.multiAsset}
                onChange={e => handleToggleMultiAsset(e.target.checked)}
              />
              <span>Enable Multi-Asset Scope</span>
            </label>
          </div>

          {input.multiAsset && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Rule: Weakest (lowest) Cybersecurity score among all in-scope assets will be assigned as vendor's Cybersecurity category score.
              </p>

              {/* Asset List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {input.assets.map((asset) => (
                  <div key={asset.assetId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{asset.name}</span>
                      <span style={{ marginLeft: '10px', fontSize: '0.75rem', color: asset.score < 800 ? '#b91c1c' : '#047857', fontWeight: 700 }}>
                        Score: {asset.score}/950
                      </span>
                      {asset.cybersecurityPenalties.length > 0 && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Penalties: {asset.cybersecurityPenalties.map(p => `${p.title} (${p.severity})`).join(', ')}
                        </div>
                      )}
                    </div>
                    {input.assets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset(asset.assetId)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Asset Input */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="e.g. app.domain.com or 192.168.1.1"
                  value={newAssetName}
                  onChange={e => setNewAssetName(e.target.value)}
                  style={{ flex: 1, fontSize: '0.82rem', padding: '6px 10px' }}
                />
                <button type="button" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={handleAddAsset}>
                  <Plus size={14} /> Add Domain/IP
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Signal Search Bar */}
      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#6b7280' }} />
        <input
          type="text"
          placeholder={`Search ${currentCategoryMeta.name} signals...`}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ width: '100%', paddingLeft: '36px', fontSize: '0.85rem' }}
        />
      </div>

      {/* Signal List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {currentCategoryMeta.signals
          .filter(sig => 
            !searchQuery.trim() || 
            sig.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            sig.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(sig => {
          const status: SignalStatus = input.signalStatuses[sig.id] || {
            signalId: sig.id,
            checked: false,
            hasFinding: false,
          };

          return (
            <div
              key={sig.id}
              style={{
                background: status.checked ? '#ffffff' : '#f8fafc',
                border: `1px solid ${status.hasFinding ? '#fde68a' : status.checked ? '#bfdbfe' : '#e2e8f0'}`,
                boxShadow: status.checked ? '0 2px 4px rgba(0,0,0,0.02)' : 'none',
                borderRadius: '12px',
                padding: '14px 16px',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: status.checked ? '#2563eb' : '#94a3b8', padding: 0, marginTop: '2px' }}
                    onClick={() => handleSignalToggle(sig.id, !status.checked)}
                  >
                    {status.checked ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', color: status.checked ? '#0f172a' : '#64748b' }}>
                      {sig.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {sig.description}
                    </div>
                  </div>
                </div>

                {/* Finding toggle */}
                {status.checked && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer', color: status.hasFinding ? '#b45309' : 'var(--text-muted)' }}>
                      <input
                        type="checkbox"
                        checked={status.hasFinding}
                        onChange={e => handleFindingToggle(sig.id, e.target.checked, sig.defaultSeverityIfFailed)}
                      />
                      Flag Finding
                    </label>

                    {status.hasFinding && (
                      <select
                        value={status.severity || 'Medium'}
                        onChange={e => handleSeverityChange(sig.id, e.target.value as Severity)}
                        style={{ 
                          padding: '4px 8px', 
                          fontSize: '0.78rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#0f172a',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Critical">Critical (-150 pts)</option>
                        <option value="High">High (-70 pts)</option>
                        <option value="Medium">Medium (-30 pts)</option>
                        <option value="Low">Low (-10 pts)</option>
                        <option value="Informational">Informational (0 pts)</option>
                      </select>
                    )}
                  </div>
                )}
              </div>

              {/* Finding details text */}
              {status.checked && status.hasFinding && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                  <input
                    type="text"
                    value={status.findingDetails || ''}
                    onChange={e => handleFindingDetailsChange(sig.id, e.target.value)}
                    placeholder="Specific finding description & evidence details..."
                    style={{ 
                      width: '100%', 
                      fontSize: '0.82rem', 
                      padding: '8px 12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      color: '#0f172a'
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Findings List for this category */}
      {input.customFindings.filter(f => f.category === activeCategory).length > 0 && (
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Custom Findings in {currentCategoryMeta.name}</h4>
          {input.customFindings.filter(f => f.category === activeCategory).map(f => (
            <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '8px', marginBottom: '8px' }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{f.title}</span>
                <span style={{ marginLeft: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>({f.source})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`badge badge-${f.severity.toLowerCase()}`}>{f.severity}</span>
                <button type="button" onClick={() => handleRemoveCustomFinding(f.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Finding Modal/Form */}
      {showAddCustom && (
        <div style={{ marginTop: '16px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '16px', borderRadius: '12px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: '#0f172a' }}>Add Custom Finding to {currentCategoryMeta.name}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Finding title (e.g. Unencrypted S3 Bucket)"
              value={newFinding.title}
              onChange={e => setNewFinding({ ...newFinding, title: e.target.value })}
            />
            <select
              value={newFinding.severity}
              onChange={e => setNewFinding({ ...newFinding, severity: e.target.value as Severity })}
            >
              <option value="Critical">Critical (-150)</option>
              <option value="High">High (-70)</option>
              <option value="Medium">Medium (-30)</option>
              <option value="Low">Low (-10)</option>
              <option value="Informational">Informational (0)</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Evidence Source (e.g. Dark Web Intelligence)"
            value={newFinding.source}
            onChange={e => setNewFinding({ ...newFinding, source: e.target.value })}
            style={{ width: '100%', marginBottom: '12px' }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddCustom(false)}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={handleAddCustomFinding}>Add Finding</button>
          </div>
        </div>
      )}
    </div>
  );
};
