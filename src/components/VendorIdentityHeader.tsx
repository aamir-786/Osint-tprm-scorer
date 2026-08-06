import { useState } from 'react';
import type { VendorIdentity, Confidence, AssessmentInput } from '../types/tprm';
import { runRealtimeOSINTScan, type ScanProgressStep } from '../services/osintScannerService';
import { Building2, Globe, ShieldCheck, AlertTriangle, Search, Loader2, Sparkles } from 'lucide-react';

interface Props {
  identity: VendorIdentity;
  onChange: (identity: VendorIdentity) => void;
  onScanComplete: (input: AssessmentInput) => void;
  hasScanned?: boolean;
}

export function VendorIdentityHeader({ identity, onChange, onScanComplete, hasScanned = true }: Props) {
  const [targetUrl, setTargetUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanSteps, setScanSteps] = useState<ScanProgressStep[]>([]);
  
  const heroMode = !hasScanned;

  const handleConfidenceToggle = (conf: Confidence) => {
    onChange({
      ...identity,
      resolutionConfidence: conf,
      resolutionReason: conf === 'Low' 
        ? identity.resolutionReason || 'Multiple matching entities found (disambiguation required)' 
        : undefined,
    });
  };

  const handleStartScan = async (overrideInput?: string) => {
    const inputToUse = overrideInput || targetUrl || identity.confirmedDomain || identity.companyName;
    if (!inputToUse.trim()) return;

    setIsScanning(true);
    try {
      const assessment = await runRealtimeOSINTScan(inputToUse, (steps) => {
        setScanSteps(steps);
      });
      onScanComplete(assessment);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className={heroMode ? "" : "card"} style={heroMode ? {} : { borderLeft: '4px solid #10b981' }}>
      {/* Realtime Scan Bar */}
      <div style={heroMode ? {
        background: '#ffffff', 
        padding: '32px', 
        borderRadius: '16px', 
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      } : { 
        background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)', 
        border: '1px solid #a7f3d0', 
        padding: '18px', 
        borderRadius: '14px', 
        marginBottom: '20px' 
      }}>
        
        {heroMode && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', color: '#047857', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '16px', border: '1px solid #a7f3d0' }}>
              <Sparkles size={14} /> OSINT TPRM Engine Active
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              Analyze any vendor in seconds.
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '480px', margin: '0 auto' }}>
              Enter a website URL or company name to instantly scan DNS, Dark Web, Legal, and Cybersecurity telemetry.
            </p>
          </div>
        )}

        {!heroMode && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.98rem', color: '#047857', marginBottom: '6px' }}>
              <Sparkles size={18} color="#10b981" />
              <span>RiskMate OSINT Telemetry Scanner</span>
              <span className="version-badge" style={{ marginLeft: 'auto', background: '#d1fae5', color: '#065f46', borderColor: '#a7f3d0' }}>Live OSINT Mode</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '12px' }}>
              Enter any website URL or vendor name to run a new scan:
            </p>
          </>
        )}

        <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: heroMode ? '600px' : '100%', flexWrap: heroMode ? 'nowrap' : 'wrap', flexDirection: heroMode ? 'row' : 'row' }}>
          <div style={{ flex: 1, position: 'relative', minWidth: '260px' }}>
            <Search size={heroMode ? 20 : 16} style={{ position: 'absolute', left: heroMode ? '16px' : '12px', top: heroMode ? '16px' : '10px', color: '#64748b' }} />
            <input
              type="text"
              value={targetUrl}
              onChange={e => setTargetUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStartScan()}
              placeholder={heroMode ? "e.g., stripe.com, openai.com, or Acme Corp" : "Enter Website URL or Vendor Name..."}
              style={{ 
                width: '100%', 
                paddingLeft: heroMode ? '48px' : '38px', 
                paddingTop: heroMode ? '14px' : '9px',
                paddingBottom: heroMode ? '14px' : '9px',
                fontSize: heroMode ? '1.05rem' : '0.88rem',
                background: '#ffffff', 
                borderColor: '#cbd5e1', 
                color: '#0f172a',
                borderRadius: heroMode ? '12px' : '8px',
                boxShadow: heroMode ? '0 2px 4px rgba(0,0,0,0.02)' : 'none'
              }}
            />
          </div>

          <button
            type="button"
            className="btn btn-primary"
            disabled={isScanning}
            onClick={() => handleStartScan()}
            style={{ 
              padding: heroMode ? '14px 28px' : '9px 18px', 
              fontSize: heroMode ? '1rem' : '0.85rem',
              borderRadius: heroMode ? '12px' : '8px',
              whiteSpace: 'nowrap',
              height: heroMode ? '54px' : 'auto'
            }}
          >
            {isScanning ? <Loader2 size={heroMode ? 20 : 16} className="spin-anim" /> : <Search size={heroMode ? 20 : 16} />}
            {isScanning ? 'Scanning...' : 'Run Analysis'}
          </button>
        </div>

        {/* Quick Demo Target Chips */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: heroMode ? 'center' : 'flex-start', gap: '8px', flexWrap: 'wrap', marginTop: heroMode ? '20px' : '12px', fontSize: '0.78rem' }}>
          <span style={{ color: 'var(--text-tertiary)' }}>Quick targets:</span>
          {['stripe.com', 'github.com', 'openai.com', 'vulnerable-vendor.com'].map(dom => (
            <button
              key={dom}
              type="button"
              className="preset-pill"
              style={{ 
                padding: '4px 12px', 
                fontSize: '0.75rem', 
                background: '#f1f5f9', 
                border: '1px solid #e2e8f0', 
                color: '#475569', 
                borderRadius: '16px',
                cursor: 'pointer'
              }}
              onClick={() => {
                setTargetUrl(dom);
                handleStartScan(dom);
              }}
            >
              {dom}
            </button>
          ))}
        </div>

        {/* Live Progress Indicators */}
        {isScanning && (
          <div style={{ width: '100%', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', fontSize: '0.8rem', textAlign: 'left' }}>
            <div style={{ fontWeight: 700, color: '#2563eb', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader2 size={16} className="spin-anim" /> Gathering 20+ OSINT Telemetry Signals...
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
              {scanSteps.map(step => (
                <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '6px' }}>
                  {step.status === 'completed' ? (
                    <ShieldCheck size={16} color="#10b981" />
                  ) : (
                    <Loader2 size={16} color="#2563eb" className="spin-anim" />
                  )}
                  <span style={{ color: step.status === 'completed' ? '#0f172a' : '#475569', fontSize: '0.75rem', fontWeight: 600 }}>
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {hasScanned && (
        <>
          {/* Identity Resolution Summary Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', marginTop: '24px' }}>
            <div className="card-title" style={{ margin: 0 }}>
              <Building2 size={22} color="#10b981" />
              <span>STEP 0 — Vendor Identity Resolution</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Resolution Confidence:</span>
              <button
                type="button"
                className={`btn ${identity.resolutionConfidence === 'High' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                onClick={() => handleConfidenceToggle('High')}
              >
                <ShieldCheck size={14} /> High
              </button>
              <button
                type="button"
                className={`btn ${identity.resolutionConfidence === 'Low' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 10px', fontSize: '0.8rem', background: identity.resolutionConfidence === 'Low' ? '#f59e0b' : undefined }}
                onClick={() => handleConfidenceToggle('Low')}
              >
                <AlertTriangle size={14} /> Low
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Company Legal Name
              </label>
              <div style={{ position: 'relative' }}>
                <Building2 size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#6b7280' }} />
                <input
                  type="text"
                  value={identity.companyName}
                  onChange={e => onChange({ ...identity, companyName: e.target.value })}
                  placeholder="e.g. Acme Corporation"
                  style={{ width: '100%', paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Confirmed Primary Domain
              </label>
              <div style={{ position: 'relative' }}>
                <Globe size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#6b7280' }} />
                <input
                  type="text"
                  value={identity.confirmedDomain}
                  onChange={e => onChange({ ...identity, confirmedDomain: e.target.value })}
                  placeholder="e.g. acme.com"
                  style={{ width: '100%', paddingLeft: '38px' }}
                />
              </div>
            </div>
          </div>

          {identity.resolutionReason && (
            <div style={{
              marginTop: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: identity.resolutionReason.includes('CRITICAL') || identity.resolutionReason.includes('Non-Existent') ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${identity.resolutionReason.includes('CRITICAL') || identity.resolutionReason.includes('Non-Existent') ? '#fecaca' : '#bbf7d0'}`,
              color: identity.resolutionReason.includes('CRITICAL') || identity.resolutionReason.includes('Non-Existent') ? '#991b1b' : '#166534',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {identity.resolutionReason.includes('CRITICAL') || identity.resolutionReason.includes('Non-Existent') ? (
                <AlertTriangle size={16} />
              ) : (
                <ShieldCheck size={16} />
              )}
              <span>{identity.resolutionReason}</span>
            </div>
          )}

          {identity.productBelongsTo && (
            <div style={{
              marginTop: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
              border: '1px solid #c7d2fe',
              color: '#1e1b4b',
              fontSize: '0.84rem',
              lineHeight: '1.4'
            }}>
              <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: '#4338ca' }}>
                <Building2 size={16} color="#4f46e5" />
                <span>PRODUCT & PARENT ENTERPRISE RELATIONSHIP</span>
              </div>
              <div>
                <strong>{identity.confirmedDomain}</strong> is an enterprise product belonging to parent company <strong>{identity.productBelongsTo.parentName}</strong> ({identity.productBelongsTo.parentDomain}). {identity.productBelongsTo.explanation}
              </div>
            </div>
          )}

          {identity.resolutionConfidence === 'Low' && (
            <div style={{ marginTop: '14px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px 14px', borderRadius: '8px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600, marginBottom: '4px' }}>
                Disambiguation / Reason for Low Resolution Confidence
              </label>
              <input
                type="text"
                value={identity.resolutionReason || ''}
                onChange={e => onChange({ ...identity, resolutionReason: e.target.value })}
                placeholder="e.g. Disambiguation needed between Acme Inc (US) vs Acme Ltd (UK)"
                style={{ width: '100%', background: '#ffffff', borderColor: 'rgba(245, 158, 11, 0.4)', marginBottom: '10px' }}
              />

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Candidate Matching Domains (comma-separated):
                <input
                  type="text"
                  value={(identity.candidateDomains || []).join(', ')}
                  onChange={e => {
                    const candidates = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    onChange({ ...identity, candidateDomains: candidates });
                  }}
                  placeholder="e.g. acme.com, acme.net, acme-corp.io"
                  style={{ width: '100%', marginTop: '4px', fontSize: '0.8rem', background: '#ffffff' }}
                />
              </div>
              {identity.candidateDomains && identity.candidateDomains.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#b45309' }}>Confirm domain:</span>
                  {identity.candidateDomains.map(d => (
                    <button
                      key={d}
                      type="button"
                      className="preset-pill"
                      style={{
                        padding: '2px 8px',
                        fontSize: '0.75rem',
                        background: identity.confirmedDomain === d ? '#eff6ff' : undefined,
                        borderColor: identity.confirmedDomain === d ? '#2563eb' : undefined,
                        color: identity.confirmedDomain === d ? '#1d4ed8' : undefined,
                      }}
                      onClick={() => onChange({ ...identity, confirmedDomain: d })}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
