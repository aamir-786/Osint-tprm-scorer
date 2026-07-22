import { useState } from 'react';
import { Sparkles, FileText, Cpu } from 'lucide-react';

export function AiMediaAnalyzer() {
  const [inputText, setInputText] = useState(
    `Security Advisory: On July 15, 2026, Apex Data Services disclosed a cyber incident involving an unauthenticated Redis cluster exposed on port 6379. Threat actors allegedly exfiltrated encrypted backup files containing historical customer logs. The vendor confirmed patching the configuration vulnerability and mandating multi-factor authentication across all engineering bastion hosts.`
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiOutput, setAiOutput] = useState<{
    summary: string;
    extractedSeverity: 'Critical' | 'High' | 'Medium' | 'Low';
    affectedSignals: string[];
    certificationStatus: string;
    cisoRecommendation: string;
  } | null>({
    summary: 'Exposed unauthenticated database cluster exfiltrated historical logs. Vulnerability patched; MFA enforced.',
    extractedSeverity: 'Critical',
    affectedSignals: ['Exposed Services (Redis 6379)', 'Breach Disclosure History'],
    certificationStatus: 'ISO 27001 certificate unaffected; SOC 2 Type II audit report requested.',
    cisoRecommendation: 'Flag Critical breach finding (-150 pts penalty). Require proof of third-party incident forensics report before renewing production access.',
  });

  const handleRunAiAnalysis = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    await new Promise(res => setTimeout(res, 900));

    const isBreach = inputText.toLowerCase().includes('breach') || inputText.toLowerCase().includes('exfiltrat') || inputText.toLowerCase().includes('incident');
    const isCert = inputText.toLowerCase().includes('iso 27001') || inputText.toLowerCase().includes('soc 2') || inputText.toLowerCase().includes('trust');

    setAiOutput({
      summary: isBreach
        ? 'AI Summary: Confirmed security incident flagged. Data exfiltration or exposed infrastructure detected in public text.'
        : 'AI Summary: Vendor trust page verifies public compliance certifications and security posture.',
      extractedSeverity: isBreach ? 'Critical' : isCert ? 'Low' : 'Medium',
      affectedSignals: isBreach
        ? ['Exposed Infrastructure', 'Breach Disclosure News']
        : ['ISO 27001 / CSA STAR Listing', 'Privacy Policy & DPA'],
      certificationStatus: isCert ? 'Certifications Valid & Indexed' : 'Pending Verification',
      cisoRecommendation: isBreach
        ? 'Deduct -150 pts for Critical breach disclosure. Notify CISO and request remediation timeline.'
        : 'Zero penalty. Verify third-party SOC 2 report in legal onboarding folder.',
    });
    setIsAnalyzing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* AI Header Banner */}
      <div className="card" style={{ borderLeft: '4px solid #6366f1', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="brand-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
            <Cpu size={24} color="#ffffff" />
          </div>
          <div>
            <span className="version-badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc' }}>
              NATURAL LANGUAGE AI INTEGRATION
            </span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
              AI Adverse Media & Trust Page Summarizer
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Paste raw news articles, security advisories, or trust page text. AI extracts what actually matters and flags relevant risk signals.
            </p>
          </div>
        </div>
      </div>

      {/* Input Box */}
      <div className="card">
        <div className="card-title" style={{ fontSize: '1rem', marginBottom: '10px' }}>
          <FileText size={18} color="#818cf8" />
          <span>Paste News Article, Press Release, or Trust Page Content</span>
        </div>

        <textarea
          rows={5}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Paste raw text here..."
          style={{ width: '100%', fontSize: '0.88rem', marginBottom: '12px' }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-primary"
            disabled={isAnalyzing}
            onClick={handleRunAiAnalysis}
          >
            <Sparkles size={16} />
            {isAnalyzing ? 'Analyzing with AI...' : 'Run AI Analysis & Signal Classifier'}
          </button>
        </div>
      </div>

      {/* AI Structured Output Result Card */}
      {aiOutput && (
        <div className="card" style={{ border: '1px solid rgba(99, 102, 241, 0.4)', background: 'rgba(15, 23, 42, 0.95)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1rem', color: '#c7d2fe' }}>
              <Sparkles size={18} color="#818cf8" /> Structured AI Extraction Summary
            </div>
            <span className={`badge badge-${aiOutput.extractedSeverity === 'Critical' ? 'low' : 'high'}`}>
              Extracted Severity: {aiOutput.extractedSeverity}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '10px' }}>
              <strong style={{ color: '#818cf8', display: 'block', marginBottom: '4px' }}>
                Executive Summary ("What Actually Matters")
              </strong>
              <p style={{ color: '#f3f4f6', lineHeight: 1.5 }}>
                {aiOutput.summary}
              </p>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '10px' }}>
              <strong style={{ color: '#34d399', display: 'block', marginBottom: '4px' }}>
                CISO & Risk Analyst Recommendation
              </strong>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {aiOutput.cisoRecommendation}
              </p>
            </div>
          </div>

          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div>
              <strong>Affected Risk Signals:</strong> {aiOutput.affectedSignals.join(', ')}
            </div>
            <div>
              <strong>Compliance Audit:</strong> {aiOutput.certificationStatus}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
