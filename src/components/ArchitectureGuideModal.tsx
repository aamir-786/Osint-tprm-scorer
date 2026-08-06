import { useState } from 'react';
import { X, ShieldCheck, Cpu, Layers, HelpCircle, Award } from 'lucide-react';

interface ArchitectureGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ArchitectureGuideModal({ isOpen, onClose }: ArchitectureGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'mental_model' | 'confidence' | 'executive_frame' | 'scoring_math'>('mental_model');

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        maxWidth: '960px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-[#1e293b]',
          alignItems: 'center',
          backgroundColor: '#0f172a',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Cpu size={22} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>System Architecture & User Mental Model</h2>
              <p style={{ fontSize: '0.84rem', margin: 0, color: '#94a3b8' }}>Core Engine Design, Confidence Framework & Executive Defense Model</p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          padding: '0 28px'
        }}>
          {[
            { id: 'mental_model', label: '1. User Mental Model', icon: Layers },
            { id: 'confidence', label: '2. Confidence Framework', icon: ShieldCheck },
            { id: 'executive_frame', label: '3. What? So What? Now What?', icon: HelpCircle },
            { id: 'scoring_math', label: '4. Engine Math & Overrides', icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 18px',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#2563eb' : '#64748b',
                  borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div style={{ padding: '28px', overflowY: 'auto', flex: 1, backgroundColor: '#ffffff' }}>
          
          {/* TAB 1: USER MENTAL MODEL */}
          {activeTab === 'mental_model' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>The 4-Pillar User Mental Model</h3>
                <p style={{ fontSize: '0.9rem', color: '#475569', margin: 0 }}>
                  How any user (Procurement Officer, CISO, or Board Member) understands and interacts with the system from search to contract decision.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {/* Pillar 1 */}
                <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ backgroundColor: '#2563eb', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>PILLAR 1</span>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Identity & Parent Resolution</h4>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    <strong>"Who is this vendor?"</strong><br />
                    • Disambiguates product domain (e.g. <code>wahidai.com</code>) from parent company (<code>effectiverm.com</code>).<br />
                    • Validates live WHOIS age (0.6 yrs vs 2.8 yrs vs 15 yrs).<br />
                    • Catches non-existent domains (<code>ENOTFOUND</code>) to trigger Hard Override Grade F.
                  </p>
                </div>

                {/* Pillar 2 */}
                <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ backgroundColor: '#059669', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>PILLAR 2</span>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Dual-Metric Evaluation</h4>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    <strong>"How safe are they &amp; how confident are we?"</strong><br />
                    • <strong>Defensible Risk Score (0–950) + Grade (A–F)</strong>: Technical security &amp; track record.<br />
                    • <strong>Data Confidence Badge</strong>: High, Medium, or Low.<br />
                    • Young vendors (&lt; 1–3 yrs) naturally display <code>LOW</code> or <code>MEDIUM CONFIDENCE</code> to flag track record limits.
                  </p>
                </div>

                {/* Pillar 3 */}
                <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ backgroundColor: '#d97706', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>PILLAR 3</span>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Uniform 21-Signal Matrix</h4>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    <strong>"What evidence was gathered?"</strong><br />
                    Audits every vendor against 5 fixed categories:<br />
                    • Security &amp; Privacy (30%), Reliability &amp; Maturity (25%), Financial Health (15%), Reputation (15%), Legal (15%).<br />
                    • Guarantees 100% equal treatment for all vendors.
                  </p>
                </div>

                {/* Pillar 4 */}
                <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ backgroundColor: '#7c3aed', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>PILLAR 4</span>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Actionable Contract Decision</h4>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    <strong>"What action do I take?"</strong><br />
                    • <strong>Grade A (801-950)</strong>: Fast-Track Approval.<br />
                    • <strong>Grade B (601-800)</strong>: Standard Approval (e.g. Wahid AI 750/950).<br />
                    • <strong>Grade C/D (201-600)</strong>: Demand Security Remediation.<br />
                    • <strong>Grade F / Override (0-200)</strong>: Immediate Block.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONFIDENCE FRAMEWORK */}
          {activeTab === 'confidence' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>Profile-Scaled Confidence &amp; Maturity Caps</h3>
                <p style={{ fontSize: '0.9rem', color: '#475569', margin: 0 }}>
                  Confidence measures evidence completeness relative to vendor age cohort—not flat penalties.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Cohort 1 */}
                <div style={{ padding: '16px 20px', borderRadius: '12px', borderLeft: '4px solid #ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#991b1b', margin: 0 }}>Cohort 1: Early-Stage Startup (&lt; 1.0 Year Old)</h4>
                    <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>LOW CONFIDENCE BADGE</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#7f1d1d', margin: 0, lineHeight: 1.4 }}>
                    Evaluates <strong>Day-1 Baseline Signals</strong> (SSL, DMARC, DNS, Privacy Policy, Sanctions). Young domain track record (&lt; 1 yr) automatically caps confidence at <strong>LOW</strong> to alert procurement of limited historical operational data (e.g. <code>wahidai.com</code>).
                  </p>
                </div>

                {/* Cohort 2 */}
                <div style={{ padding: '16px 20px', borderRadius: '12px', borderLeft: '4px solid #f59e0b', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#92400e', margin: 0 }}>Cohort 2: Young / Mid-Stage Vendor (1.0 to 3.0 Years Old)</h4>
                    <span style={{ backgroundColor: '#f59e0b', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>MEDIUM CONFIDENCE BADGE</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#78350f', margin: 0, lineHeight: 1.4 }}>
                    Evaluates Day-1 Signals + Status Page + Layoff/Insolvency News + Adverse Media. Track record (1-3 yrs) caps confidence at <strong>MEDIUM</strong> (e.g. <code>effectiverm.com</code> ~ 2.8 yrs).
                  </p>
                </div>

                {/* Cohort 3 */}
                <div style={{ padding: '16px 20px', borderRadius: '12px', borderLeft: '4px solid #10b981', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#065f46', margin: 0 }}>Cohort 3: Established Enterprise (&ge; 5.0 Years Old)</h4>
                    <span style={{ backgroundColor: '#10b981', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>HIGH CONFIDENCE BADGE</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#047857', margin: 0, lineHeight: 1.4 }}>
                    Evaluates full 21-signal matrix including Wikipedia corporate standing, public stock market ticker, and ESG reporting. Proven 15-year history achieves <strong>HIGH CONFIDENCE</strong> (e.g. <code>stripe.com</code>).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXECUTIVE FRAME */}
          {activeTab === 'executive_frame' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>The Executive Defense Frame</h3>
                <p style={{ fontSize: '0.9rem', color: '#475569', margin: 0 }}>
                  Three core answers to present to supervisors, CISOs, and board members.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#2563eb', margin: '0 0 6px 0' }}>🔍 WHAT? (System Description)</h4>
                  <p style={{ fontSize: '0.88rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                    An <strong>Automated Real-Time OSINT Third-Party Risk Management (TPRM) Platform</strong> that audits vendor security, WHOIS maturity, financial stability, news reputation, and OFAC sanctions across 21 live signals in under 5 seconds—with zero questionnaires and zero vendor dependency.
                  </p>
                </div>

                <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#059669', margin: '0 0 6px 0' }}>⚡ SO WHAT? (Business Impact & Value)</h4>
                  <p style={{ fontSize: '0.88rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                    Replaces <strong>3-to-4-week manual survey questionnaires</strong> with instant, credit-bureau style defensible risk scoring (0–950), A–F Grades, and automated Hard Overrides that intercept non-existent shell companies and sanctioned entities instantly.
                  </p>
                </div>

                <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#7c3aed', margin: '0 0 6px 0' }}>🎯 NOW WHAT? (Contract Action Directive)</h4>
                  <p style={{ fontSize: '0.88rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                    • <strong>Grade A (801–950)</strong>: Fast-track approval (e.g. Stripe 950, EffectiveRM 889).<br />
                    • <strong>Grade B (601–800)</strong>: Approve with standard operational clauses (e.g. Wahid AI 750).<br />
                    • <strong>Grade F / Hard Override</strong>: Immediate contract block (e.g. unregistered domain 0/950).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SCORING MATH */}
          {activeTab === 'scoring_math' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>Engine Mathematics & Hard Overrides</h3>
                <p style={{ fontSize: '0.9rem', color: '#475569', margin: 0 }}>
                  Credit-bureau style 950-point mathematical engine with zero non-deterministic fluctuation.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 10px 0' }}>Score & Grade Scale</h4>
                  <ul style={{ fontSize: '0.85rem', color: '#475569', margin: 0, paddingLeft: '18px', lineHeight: 1.6 }}>
                    <li><strong>Grade A (801 – 950)</strong>: Low Risk / Pristine Security</li>
                    <li><strong>Grade B (601 – 800)</strong>: Moderate Risk / Established Startup</li>
                    <li><strong>Grade C (401 – 600)</strong>: Elevated Risk / Soft Cap Limit</li>
                    <li><strong>Grade D (201 – 400)</strong>: High Risk / Major Security Gaps</li>
                    <li><strong>Grade F (0 – 200)</strong>: Critical Risk / Hard Override</li>
                  </ul>
                </div>

                <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#991b1b', margin: '0 0 10px 0' }}>Hard Override Protection</h4>
                  <p style={{ fontSize: '0.85rem', color: '#7f1d1d', margin: 0, lineHeight: 1.5 }}>
                    If a vendor domain fails DNS resolution (<code>ENOTFOUND</code>) or matches direct OFAC/UN sanctions:
                    <br /><br />
                    • <strong>Final Score</strong>: Forces <code>0 / 950</code> Grade F.<br />
                    • <strong>Category Scores</strong>: All 5 category bars zero out (0/950 Red).<br />
                    • <strong>AI Score Badge</strong>: Renders Red <code>0 / 950 Grade F</code>.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Deterministic LLM Engine (Temp = 0.0) • 21 OSINT Telemetry Signals</span>
          <button
            className="btn btn-primary"
            onClick={onClose}
            style={{ fontSize: '0.85rem', padding: '8px 20px' }}
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
}
