import { useState } from 'react';
import { BookOpen, Scale, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

interface SourceLegalPos {
  sourceName: string;
  category: string;
  dataTypes: string;
  reliability: 'High' | 'Medium' | 'Low';
  legalPosition: string;
  tosCompliance: string;
  limitations: string;
}

const SOURCES_LEGAL_REGISTER: SourceLegalPos[] = [
  {
    sourceName: 'Qualys SSL Labs & Public TLS Handshake API',
    category: 'Cybersecurity',
    dataTypes: 'SSL/TLS Grade (A-F), Cert Expiration, Cipher Suites, HSTS Status',
    reliability: 'High',
    legalPosition: 'Lawful public passive network observation. No intrusive scanning or rate limit violation.',
    tosCompliance: 'Complies with Qualys SSL Labs API terms. Public passive DNS/TLS query.',
    limitations: 'Only checks port 443 public endpoints. Cannot inspect internal private TLS tunnels.',
  },
  {
    sourceName: 'Mozilla Observatory & SecurityHeaders.com Query',
    category: 'Cybersecurity',
    dataTypes: 'Content-Security-Policy (CSP), HSTS, X-Frame-Options, X-Content-Type-Options',
    reliability: 'High',
    legalPosition: 'Public HTTP GET header inspection. Zero payload injection or non-public access.',
    tosCompliance: 'Respects standard HTTP crawler user-agent headers and robots.txt directives.',
    limitations: 'Evaluates root domain headers only; subdomains may employ differing header policies.',
  },
  {
    sourceName: 'ICANN WHOIS / RDAP Protocol Query',
    category: 'Business Stability / Cyber',
    dataTypes: 'Domain registration date, expiration date, registrar name, WHOIS privacy status',
    reliability: 'High',
    legalPosition: 'Official RFC 7480 RDAP public domain registration query.',
    tosCompliance: 'Fully compliant with ICANN RDAP public access rate limits.',
    limitations: 'WHOIS privacy protection (GDPR masking) conceals registrant physical addresses.',
  },
  {
    sourceName: 'U.S. OFAC SDN & UN Sanctions Search API',
    category: 'Legal & Regulatory',
    dataTypes: 'Specially Designated Nationals (SDN) list, UN Consolidated Sanctions match',
    reliability: 'High',
    legalPosition: 'Official U.S. Department of the Treasury public domain sanctions dataset.',
    tosCompliance: 'Public domain government dataset, no ToS restrictions on automated screening.',
    limitations: 'Name transliteration variations may require fuzzy match disambiguation.',
  },
  {
    sourceName: 'Google News RSS & Public Adverse Media Query',
    category: 'Reputation / Stability',
    dataTypes: 'Breach disclosures, mass layoff reports, regulatory fines, litigation news',
    reliability: 'Medium',
    legalPosition: 'Public RSS feed aggregation. Fair use indexing of public news headlines.',
    tosCompliance: 'Uses official Google News RSS feed format without automated paywall scraping.',
    limitations: 'Media coverage may suffer from reporting lag or unconfirmed rumor articles.',
  },
  {
    sourceName: 'DNS Status Page & Uptime Telemetry (status.domain.com)',
    category: 'Operational Resilience',
    dataTypes: 'Public status page presence, incident history logs, uptime percentage',
    reliability: 'High',
    legalPosition: 'Public Statuspage.io / Cachet DNS CNAME record inspection.',
    tosCompliance: 'Public DNS CNAME query and public HTTP status page fetch.',
    limitations: 'Vendors without a dedicated public status page may still maintain internal uptime monitors.',
  },
];

export function ResearchMethodologyView() {
  const [selectedSource, setSelectedSource] = useState<SourceLegalPos | null>(SOURCES_LEGAL_REGISTER[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="card" style={{ borderLeft: '4px solid #10b981', background: 'linear-gradient(135deg, #ffffff, #f8fafc)', border: '1px solid #cbd5e1' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="brand-icon" style={{ background: '#10b981' }}>
            <BookOpen size={22} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#047857' }}>
              RISKMATE METHODOLOGY SPECIFICATION
            </span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
              Research Methodology & Legal ToS Position Register
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
              Defensible scoring model, data source legality, reliability limits, and Terms-of-Service compliance position.
            </p>
          </div>
        </div>
      </div>

      {/* Model Defensibility Principles */}
      <div className="card">
        <div className="card-title" style={{ fontSize: '1.05rem', marginBottom: '14px' }}>
          <Scale size={20} color="#34d399" />
          <span>Core Scoring Model Defensibility Rationale</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#34d399', marginBottom: '4px' }}>
              1. Mechanical Severity Penalties (950 Base)
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Every category starts at 950 points. Confirmed findings deduct exact severity penalties: Critical (-150), High (-70), Medium (-30), Low (-10). Unconfirmed findings score 0 (Informational).
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#818cf8', marginBottom: '4px' }}>
              2. Coverage-Based Weight Redistribution
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Categories with &lt;50% signal coverage suffer proportional weight reduction. The lost weight is redistributed across remaining categories based on their original relative weights.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f59e0b', marginBottom: '4px' }}>
              3. Independent Confidence & Overrides
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Confidence is never averaged—it equals the weakest category coverage rating. Direct sanctions or active breaches trigger Grade F Hard Overrides regardless of numeric score.
            </p>
          </div>
        </div>
      </div>

      {/* Sources & Legal Register Table */}
      <div className="card">
        <div className="card-title" style={{ fontSize: '1.05rem', marginBottom: '14px' }}>
          <ShieldCheck size={20} color="#818cf8" />
          <span>Data Sources, Legality & Terms-of-Service Position Register</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Source Name</th>
                <th>Category</th>
                <th>Data Signals</th>
                <th>Reliability</th>
                <th>Legal & ToS Position</th>
              </tr>
            </thead>
            <tbody>
              {SOURCES_LEGAL_REGISTER.map((src, idx) => (
                <tr
                  key={idx}
                  style={{
                    cursor: 'pointer',
                    background: selectedSource?.sourceName === src.sourceName ? 'rgba(99, 102, 241, 0.15)' : undefined,
                  }}
                  onClick={() => setSelectedSource(src)}
                >
                  <td style={{ fontWeight: 600, color: '#f3f4f6' }}>{src.sourceName}</td>
                  <td><span className="version-badge" style={{ fontSize: '0.7rem' }}>{src.category}</span></td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{src.dataTypes}</td>
                  <td>
                    <span className={`badge badge-${src.reliability === 'High' ? 'high' : 'medium'}`}>
                      {src.reliability}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: '#34d399' }}>
                    <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    {src.legalPosition.substring(0, 45)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal / Panel for Selected Source */}
      {selectedSource && (
        <div className="card" style={{ border: '1px solid rgba(99, 102, 241, 0.4)', background: 'rgba(15, 23, 42, 0.95)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#c7d2fe' }}>
              Source Deep-Dive: {selectedSource.sourceName}
            </h3>
            <span className="badge badge-high">{selectedSource.reliability} Reliability</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.84rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
              <strong style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} /> Legal & Terms-of-Service Position
              </strong>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                {selectedSource.legalPosition}
              </p>
              <div style={{ fontSize: '0.78rem', color: '#a5b4fc', marginTop: '6px' }}>
                ToS Compliance: {selectedSource.tosCompliance}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
              <strong style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={14} /> Source Limits & Data Boundaries
              </strong>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                {selectedSource.limitations}
              </p>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Signal Category: {selectedSource.category}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
