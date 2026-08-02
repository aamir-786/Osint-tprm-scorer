import type { CategoryMeta, CategoryKey, Severity, Grade } from '../types/tprm';

export const SEVERITY_PENALTIES: Record<Severity, number> = {
  Critical: 150,
  High: 70,
  Medium: 30,
  Low: 10,
  Informational: 0, // logged only, 0 penalty
};

export const CATEGORIES: Record<CategoryKey, CategoryMeta> = {
  security_privacy: {
    key: 'security_privacy',
    name: 'Security & Privacy',
    weight: 0.30,
    plannedSignalsCount: 7,
    signals: [
      { id: 'cs_ssl', name: 'SSL Grade & Cert', category: 'security_privacy', description: 'SSL grade (A-F) and TLS configuration', defaultSeverityIfFailed: 'Critical' },
      { id: 'cs_cert_validity', name: 'Certificate Validity', category: 'security_privacy', description: 'Expiration date and trust chain', defaultSeverityIfFailed: 'High' },
      { id: 'cs_headers', name: 'Security Headers', category: 'security_privacy', description: 'HSTS, CSP, X-Frame-Options, missing DMARC/DNS', defaultSeverityIfFailed: 'Medium' },
      { id: 'cs_cves', name: 'Known Vulnerabilities (CVEs)', category: 'security_privacy', description: 'Unpatched or exposed public CVEs', defaultSeverityIfFailed: 'High' },
      { id: 'cs_exposed_services', name: 'Exposed Services', category: 'security_privacy', description: 'Exposed databases (Elastic, RDP, SSH, DB ports)', defaultSeverityIfFailed: 'Critical' },
      { id: 'cs_security_txt', name: 'security.txt Presence', category: 'security_privacy', description: 'Standard security contact disclosure file', defaultSeverityIfFailed: 'Low' },
      { id: 'cp_privacy_policy', name: 'Privacy Policy Presence', category: 'security_privacy', description: 'Publicly accessible, comprehensive privacy policy', defaultSeverityIfFailed: 'Medium' }
    ],
  },
  reliability_maturity: {
    key: 'reliability_maturity',
    name: 'Reliability & Maturity',
    weight: 0.25,
    plannedSignalsCount: 6,
    signals: [
      { id: 'bm_domain_age', name: 'Domain Registration Age', category: 'reliability_maturity', description: 'Operational history and track record based on domain age', defaultSeverityIfFailed: 'High' },
      { id: 'bm_public_market', name: 'Public Market Verification', category: 'reliability_maturity', description: 'Publicly traded stock ticker presence', defaultSeverityIfFailed: 'Low' },
      { id: 'bm_wikipedia', name: 'Global Notability (AI)', category: 'reliability_maturity', description: 'Presence of verifiable global recognition', defaultSeverityIfFailed: 'Low' },
      { id: 'res_status_page', name: 'Public Status Page Presence', category: 'reliability_maturity', description: 'Dedicated transparent status page (e.g. status.domain.com)', defaultSeverityIfFailed: 'Medium' },
      { id: 'nth_cloud_hosting', name: 'Cloud & DNS Hosting', category: 'reliability_maturity', description: 'Enterprise cloud infrastructure validation (e.g. AWS, Azure, GCP)', defaultSeverityIfFailed: 'Low' },
      { id: 'nth_email_provider', name: 'Corporate Email Provider', category: 'reliability_maturity', description: 'Enterprise-grade email security (e.g. M365, Google Workspace)', defaultSeverityIfFailed: 'Low' },
    ],
  },
  financial_health: {
    key: 'financial_health',
    name: 'Financial Health',
    weight: 0.15,
    plannedSignalsCount: 2,
    signals: [
      { id: 'bs_bankruptcy', name: 'Insolvency & Bankruptcy Check', category: 'financial_health', description: 'Public filings, active bankruptcy or legal receivership', defaultSeverityIfFailed: 'Critical' },
      { id: 'bs_layoffs', name: 'Layoffs & Funding News', category: 'financial_health', description: 'Mass layoffs, funding collapse, or sudden headcount drop', defaultSeverityIfFailed: 'High' },
    ],
  },
  reputation_ethics: {
    key: 'reputation_ethics',
    name: 'Reputation & Ethics',
    weight: 0.15,
    plannedSignalsCount: 4,
    signals: [
      { id: 'rep_negative_news', name: 'Negative Media Screening', category: 'reputation_ethics', description: 'Adverse media mentions in global news', defaultSeverityIfFailed: 'High' },
      { id: 'rep_breach_history', name: 'Breach Disclosure Check', category: 'reputation_ethics', description: 'Confirmed data breach disclosed in credible news', defaultSeverityIfFailed: 'Critical' },
      { id: 'esg_sustainability', name: 'ESG/Sustainability Reporting', category: 'reputation_ethics', description: 'Public commitment to environmental and social governance', defaultSeverityIfFailed: 'Medium' },
      { id: 'esg_modern_slavery', name: 'Modern Slavery Statement', category: 'reputation_ethics', description: 'Modern slavery or supply chain ethics statement', defaultSeverityIfFailed: 'Medium' },
    ],
  },
  legal_geopolitical: {
    key: 'legal_geopolitical',
    name: 'Legal & Geopolitical',
    weight: 0.15,
    plannedSignalsCount: 2,
    signals: [
      { id: 'lr_fines', name: 'Sanctions & Watchlist Check', category: 'legal_geopolitical', description: 'Global sanctions and regulatory fines database checks', defaultSeverityIfFailed: 'Critical' },
      { id: 'geo_hosting_location', name: 'Hosting Jurisdiction', category: 'legal_geopolitical', description: 'Physical location of infrastructure & WHOIS registrant', defaultSeverityIfFailed: 'High' },
    ],
  },
};

export const TOTAL_PLANNED_SIGNALS = Object.values(CATEGORIES).reduce((acc, cat) => acc + cat.plannedSignalsCount, 0);

export function getGradeFromScore(score: number): Grade {
  if (score >= 801) return 'A';
  if (score >= 601) return 'B';
  if (score >= 401) return 'C';
  if (score >= 201) return 'D';
  return 'F';
}
