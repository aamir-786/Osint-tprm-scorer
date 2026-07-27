import React from 'react';
import { X, ShieldAlert, AlertTriangle, FileText, ExternalLink, Sparkles } from 'lucide-react';
import type { ScoringResult, CategoryKey } from '../types/tprm';
import { CATEGORIES } from '../engine/constants';

interface Props {
  result: ScoringResult;
  isOpen: boolean;
  onClose: () => void;
}

export const EvidenceModal: React.FC<Props> = ({ result, isOpen, onClose }) => {
  if (!isOpen) return null;

  const categoryKeys = Object.keys(CATEGORIES) as CategoryKey[];

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '24px'
    }}>
      <div style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: '900px',
        height: '90vh',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '24px 32px', 
          borderBottom: '1px solid #e2e8f0', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: '#f8fafc'
        }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText color="#3b82f6" /> Evidence & Signal Drill-Down
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
              Detailed OSINT findings for {result.identity.companyName}
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '8px', borderRadius: '50%', color: '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', backgroundColor: '#ffffff' }}>
          
          <div style={{ marginBottom: '32px', background: 'linear-gradient(to right, #ecfdf5, #f0fdf4)', padding: '16px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#047857', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} /> AI-ASSISTED SUMMARIZATION ACTIVE
            </div>
            <div style={{ fontSize: '0.85rem', color: '#065f46', marginTop: '4px' }}>
              Raw adverse media and intelligence payloads are automatically summarized by Gemini 2.5 where applicable to provide immediate executive context.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {categoryKeys.map(catKey => {
              const catRes = result.categoryResults[catKey];
              if (catRes.findings.length === 0) return null;

              return (
                <div key={catKey} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', margin: 0 }}>
                      {CATEGORIES[catKey].name}
                    </h3>
                    <span className="badge" style={{ background: '#e2e8f0', color: '#475569' }}>
                      {catRes.findings.length} Findings
                    </span>
                  </div>

                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {catRes.findings.map((finding, idx) => {
                      const isCritical = finding.severity === 'Critical' || finding.severity === 'High';
                      
                      return (
                        <div key={idx} style={{ 
                          padding: '16px', 
                          borderLeft: `4px solid ${isCritical ? '#ef4444' : finding.severity === 'Medium' ? '#f59e0b' : '#3b82f6'}`,
                          background: isCritical ? '#fef2f2' : finding.severity === 'Medium' ? '#fffbeb' : '#eff6ff',
                          borderRadius: '0 8px 8px 0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
                              {isCritical ? <ShieldAlert size={16} color="#ef4444" /> : <AlertTriangle size={16} color={finding.severity === 'Medium' ? '#f59e0b' : '#3b82f6'} />}
                              {finding.title}
                            </div>
                            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 600 }}>
                              Source: {finding.source}
                            </span>
                          </div>

                          {/* Raw Evidence Payload Rendering */}
                          {finding.evidencePayload && finding.evidencePayload.length > 0 && (
                            <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
                                Raw Evidence Payload / Articles
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {finding.evidencePayload.map((ev, eIdx) => (
                                  <div key={eIdx} style={{ fontSize: '0.8rem', background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                    {ev.title && (
                                      <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                                        {ev.url ? (
                                          <a href={ev.url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {ev.title} <ExternalLink size={12} />
                                          </a>
                                        ) : (
                                          ev.title
                                        )}
                                      </div>
                                    )}
                                    {ev.description && (
                                      <div style={{ color: '#475569' }}>{ev.description}</div>
                                    )}
                                    {ev.port && (
                                      <div style={{ color: '#ef4444', fontFamily: 'monospace' }}>
                                        Exposed Port: {ev.port} ({ev.product || 'Unknown Service'})
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {categoryKeys.every(k => result.categoryResults[k].findings.length === 0) && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <ShieldAlert size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                <h3>No Adverse Findings</h3>
                <p>No critical, high, or medium severity risks were detected across any OSINT signals.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>
        {`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};
