import type { CategoryMeta, CategoryKey, Severity, Grade } from '../types/tprm';

export const SEVERITY_PENALTIES: Record<Severity, number> = {
  Critical: 150,
  High: 70,
  Medium: 30,
  Low: 10,
  Informational: 0, // logged only, 0 penalty
};

export const CATEGORIES: Record<CategoryKey, CategoryMeta> = {
  cybersecurity: {
    key: 'cybersecurity',
    name: 'Cybersecurity',
    weight: 0.30,
    plannedSignalsCount: 6,
    signals: [
      { id: 'cs_ssl', name: 'SSL Grade & Cert', category: 'cybersecurity', description: 'SSL grade (A-F) and TLS configuration', defaultSeverityIfFailed: 'Critical' },
      { id: 'cs_cert_validity', name: 'Certificate Validity', category: 'cybersecurity', description: 'Expiration date and trust chain', defaultSeverityIfFailed: 'High' },
      { id: 'cs_headers', name: 'Security Headers', category: 'cybersecurity', description: 'HSTS, CSP, X-Frame-Options, missing DMARC/DNS', defaultSeverityIfFailed: 'Medium' },
      { id: 'cs_cves', name: 'Known Vulnerabilities (CVEs)', category: 'cybersecurity', description: 'Unpatched or exposed public CVEs', defaultSeverityIfFailed: 'High' },
      { id: 'cs_exposed_services', name: 'Exposed Services', category: 'cybersecurity', description: 'Exposed databases (Elastic, RDP, SSH, DB ports)', defaultSeverityIfFailed: 'Critical' },
      { id: 'cs_security_txt', name: 'security.txt Presence', category: 'cybersecurity', description: 'Standard security contact disclosure file', defaultSeverityIfFailed: 'Low' },
    ],
  },
  compliance: {
    key: 'compliance',
    name: 'Compliance & Privacy',
    weight: 0.20,
    plannedSignalsCount: 3,
    signals: [
      { id: 'cp_iso_csa', name: 'ISO 27001 / CSA STAR Listing', category: 'compliance', description: 'Verifiable third-party security certification registry', defaultSeverityIfFailed: 'Medium' },
      { id: 'cp_privacy_policy', name: 'Privacy Policy Presence', category: 'compliance', description: 'Publicly accessible, comprehensive privacy policy', defaultSeverityIfFailed: 'Medium' },
      { id: 'cp_dpa', name: 'Data Processing Addendum (DPA)', category: 'compliance', description: 'Available public/standard DPA for customer data', defaultSeverityIfFailed: 'Low' },
    ],
  },
  stability: {
    key: 'stability',
    name: 'Business Stability',
    weight: 0.15,
    plannedSignalsCount: 3,
    signals: [
      { id: 'bs_registration_age', name: 'Company Age & Registration', category: 'stability', description: 'Corporate entity standing & track record', defaultSeverityIfFailed: 'Low' },
      { id: 'bs_insolvency', name: 'Insolvency & Bankruptcy Check', category: 'stability', description: 'Public filings, active bankruptcy or legal receivership', defaultSeverityIfFailed: 'Critical' },
      { id: 'bs_layoffs_funding', name: 'Layoffs & Funding News', category: 'stability', description: 'Mass layoffs, funding collapse, or sudden headcount drop', defaultSeverityIfFailed: 'High' },
    ],
  },
  reputation: {
    key: 'reputation',
    name: 'Reputation',
    weight: 0.15,
    plannedSignalsCount: 3,
    signals: [
      { id: 'rep_breach_history', name: 'Breach Disclosure Check', category: 'reputation', description: 'Confirmed data breach disclosed in credible news', defaultSeverityIfFailed: 'Critical' },
      { id: 'rep_sustained_negative', name: 'Sustained Negative News', category: 'reputation', description: 'Multiple negative reports over 6+ months', defaultSeverityIfFailed: 'High' },
      { id: 'rep_isolated_mention', name: 'Isolated Negative Mention', category: 'reputation', description: 'One-off negative media or customer complaint', defaultSeverityIfFailed: 'Medium' },
    ],
  },
  resilience: {
    key: 'resilience',
    name: 'Operational Resilience',
    weight: 0.10,
    plannedSignalsCount: 2,
    signals: [
      { id: 'or_status_page', name: 'Public Status Page Presence', category: 'resilience', description: 'Dedicated status page (e.g. status.domain.com)', defaultSeverityIfFailed: 'Medium' },
      { id: 'or_incident_history', name: 'Incident History & Uptime', category: 'resilience', description: 'Major outages, frequency of incidents in history', defaultSeverityIfFailed: 'High' },
    ],
  },
  legal: {
    key: 'legal',
    name: 'Legal & Regulatory',
    weight: 0.10,
    plannedSignalsCount: 3,
    signals: [
      { id: 'lr_sanctions', name: 'Sanctions & Watchlist Check', category: 'legal', description: 'OFAC, EU, UN sanctions list verification', defaultSeverityIfFailed: 'Critical' },
      { id: 'lr_export_regulatory', name: 'Export Restrictions & Active Investigations', category: 'legal', description: 'BIS entity list or active regulator investigation', defaultSeverityIfFailed: 'High' },
      { id: 'lr_historical_action', name: 'Historical Regulatory Actions', category: 'legal', description: 'Resolved past regulatory fines or enforcement', defaultSeverityIfFailed: 'Medium' },
    ],
  },
};

export const TOTAL_PLANNED_SIGNALS = 20;

export function getGradeFromScore(score: number): Grade {
  if (score >= 801) return 'A';
  if (score >= 601) return 'B';
  if (score >= 401) return 'C';
  if (score >= 201) return 'D';
  return 'F';
}
