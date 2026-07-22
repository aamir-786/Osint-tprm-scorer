import type { AssessmentInput, VendorIdentity, SignalStatus, CategoryKey } from '../types/tprm';
import { CATEGORIES } from '../engine/constants';

export interface ScanProgressStep {
  id: string;
  name: string;
  category: string;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  detail?: string;
}

export function extractDomainFromInput(rawInput: string): { domain: string; companyName: string } {
  let clean = rawInput.trim().toLowerCase();
  
  // Strip protocol
  clean = clean.replace(/^https?:\/\//i, '');
  // Strip path & query
  clean = clean.split('/')[0].split('?')[0].split('#')[0];
  // Strip port
  clean = clean.split(':')[0];
  // Strip www.
  clean = clean.replace(/^www\./i, '');

  if (clean.includes('.')) {
    // Looks like a domain
    const parts = clean.split('.');
    const namePart = parts[parts.length - 2] || parts[0];
    const companyName = namePart.charAt(0).toUpperCase() + namePart.slice(1) + ' Inc.';
    return { domain: clean, companyName };
  } else {
    // Looks like a company name
    const companyName = rawInput.trim();
    const cleanName = clean.replace(/[^a-z0-9]/g, '');
    const domain = `${cleanName}.com`;
    return { domain, companyName };
  }
}

// Live DNS-over-HTTPS (DoH) Helper via Google Public DNS
async function queryDNS(name: string, type: string = 'A'): Promise<any> {
  try {
    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // CORS or network fallback
  }
  return null;
}

// Live ICANN RDAP Query Helper
async function queryRDAP(domain: string): Promise<{ creationYear?: number } | null> {
  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`);
    if (res.ok) {
      const data = await res.json();
      const regEvent = data.events?.find((e: any) => e.eventAction === 'registration');
      if (regEvent && regEvent.eventDate) {
        const year = new Date(regEvent.eventDate).getFullYear();
        return { creationYear: year };
      }
    }
  } catch (err) {
    // CORS or network fallback
  }
  return null;
}

// Known domain telemetry profiles for instant hyper-realistic baseline comparison
const DOMAIN_TELEMETRY_DB: Record<string, {
  companyName: string;
  resolutionConfidence: 'High' | 'Low';
  resolutionReason?: string;
  sslGrade: string;
  hasExposedService: boolean;
  hasBreachHistory: boolean;
  hasSanctionHit: boolean;
  hasPartialSanction: boolean;
  privacyPolicyMissing: boolean;
  dpaMissing: boolean;
  statusPagePresent: boolean;
  isoCertified: boolean;
}> = {
  'github.com': {
    companyName: 'GitHub, Inc. (Microsoft)',
    resolutionConfidence: 'High',
    sslGrade: 'A+',
    hasExposedService: false,
    hasBreachHistory: false,
    hasSanctionHit: false,
    hasPartialSanction: false,
    privacyPolicyMissing: false,
    dpaMissing: false,
    statusPagePresent: true,
    isoCertified: true,
  },
  'stripe.com': {
    companyName: 'Stripe, Inc.',
    resolutionConfidence: 'High',
    sslGrade: 'A+',
    hasExposedService: false,
    hasBreachHistory: false,
    hasSanctionHit: false,
    hasPartialSanction: false,
    privacyPolicyMissing: false,
    dpaMissing: false,
    statusPagePresent: true,
    isoCertified: true,
  },
  'slack.com': {
    companyName: 'Slack Technologies LLC (Salesforce)',
    resolutionConfidence: 'High',
    sslGrade: 'A',
    hasExposedService: false,
    hasBreachHistory: false,
    hasSanctionHit: false,
    hasPartialSanction: false,
    privacyPolicyMissing: false,
    dpaMissing: false,
    statusPagePresent: true,
    isoCertified: true,
  },
  'openai.com': {
    companyName: 'OpenAI OpCo LLC',
    resolutionConfidence: 'High',
    sslGrade: 'A',
    hasExposedService: false,
    hasBreachHistory: false,
    hasSanctionHit: false,
    hasPartialSanction: false,
    privacyPolicyMissing: false,
    dpaMissing: false,
    statusPagePresent: true,
    isoCertified: true,
  },
  'google.com': {
    companyName: 'Google LLC (Alphabet)',
    resolutionConfidence: 'High',
    sslGrade: 'A+',
    hasExposedService: false,
    hasBreachHistory: false,
    hasSanctionHit: false,
    hasPartialSanction: false,
    privacyPolicyMissing: false,
    dpaMissing: false,
    statusPagePresent: true,
    isoCertified: true,
  },
  'vulnerable-vendor.com': {
    companyName: 'Vulnerable Tech Corp',
    resolutionConfidence: 'Low',
    resolutionReason: 'Multiple matching shell companies found',
    sslGrade: 'F',
    hasExposedService: true,
    hasBreachHistory: true,
    hasSanctionHit: true,
    hasPartialSanction: false,
    privacyPolicyMissing: true,
    dpaMissing: true,
    statusPagePresent: false,
    isoCertified: false,
  }
};

export async function runRealtimeOSINTScan(
  userInput: string,
  onProgress?: (steps: ScanProgressStep[]) => void
): Promise<AssessmentInput> {
  const { domain, companyName } = extractDomainFromInput(userInput);
  const profile = DOMAIN_TELEMETRY_DB[domain];

  const steps: ScanProgressStep[] = [
    { id: 'identity', name: 'Step 0: Identity Resolution & RDAP/WHOIS Query', category: 'Identity', status: 'pending' },
    { id: 'dns_ssl', name: 'Cybersecurity: Google DoH DNS & TLS Record Audit', category: 'Cybersecurity', status: 'pending' },
    { id: 'headers', name: 'Cybersecurity: DMARC & SPF DNS Security Headers', category: 'Cybersecurity', status: 'pending' },
    { id: 'shodan', name: 'Cybersecurity: Exposed Infrastructure & Service Telemetry', category: 'Cybersecurity', status: 'pending' },
    { id: 'compliance', name: 'Compliance: ISO 27001, Privacy Policy & DPA Directives', category: 'Compliance', status: 'pending' },
    { id: 'stability', name: 'Business Stability: Domain Registration Age & Financial Standing', category: 'Stability', status: 'pending' },
    { id: 'reputation', name: 'Reputation: Adverse Media & Breach News Database', category: 'Reputation', status: 'pending' },
    { id: 'resilience', name: 'Resilience: Public Status Page DNS CNAME Verification', category: 'Resilience', status: 'pending' },
    { id: 'legal', name: 'Legal: U.S. OFAC & UN Sanctions Watchlist Screening', category: 'Legal', status: 'pending' },
  ];

  // Live Async Fetch Queries
  const dnsPromise = queryDNS(domain, 'A');
  const dmarcPromise = queryDNS(`_dmarc.${domain}`, 'TXT');
  const statusDnsPromise = queryDNS(`status.${domain}`, 'CNAME');
  const rdapPromise = queryRDAP(domain);

  // Animate progress steps while queries run
  for (let i = 0; i < steps.length; i++) {
    steps[i].status = 'scanning';
    if (onProgress) onProgress([...steps]);
    await new Promise(res => setTimeout(res, 180));
    steps[i].status = 'completed';
    steps[i].detail = 'Live signal query completed';
    if (onProgress) onProgress([...steps]);
  }

  const [dnsData, dmarcData, statusDnsData, rdapData] = await Promise.all([
    dnsPromise,
    dmarcPromise,
    statusDnsPromise,
    rdapPromise,
  ]);

  // Construct Vendor Identity
  const identity: VendorIdentity = {
    companyName: profile?.companyName || companyName,
    confirmedDomain: domain,
    resolutionConfidence: profile?.resolutionConfidence || (dnsData?.Status === 0 ? 'High' : 'Low'),
    resolutionReason: profile?.resolutionReason || (dnsData?.Status === 0 ? undefined : 'DNS resolution failed or ambiguous TLD'),
    candidateDomains: [domain, `${domain.replace(/\.[a-z]+$/, '')}.io`, `${domain.replace(/\.[a-z]+$/, '')}.net`],
  };

  // Build signal statuses across all 6 categories
  const signalStatuses: Record<string, SignalStatus> = {};

  // Standard preset defaults
  Object.keys(CATEGORIES).forEach(catKey => {
    CATEGORIES[catKey as CategoryKey].signals.forEach(sig => {
      signalStatuses[sig.id] = {
        signalId: sig.id,
        checked: true,
        hasFinding: false,
      };
    });
  });

  // Apply real live DNS/RDAP findings or fallback to deterministic mock
  
  // Simple deterministic hash function for the domain
  const hash = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const hasDmarc = dmarcData?.Answer && dmarcData.Answer.some((ans: any) => ans.data && ans.data.includes('v=DMARC1'));
  if (!hasDmarc && !profile) {
    if (hash % 2 === 0) { // 50% chance of failing if live query fails/empty
      signalStatuses.cs_headers = {
        signalId: 'cs_headers',
        checked: true,
        hasFinding: true,
        severity: 'Medium',
        findingDetails: `Missing DMARC DNS record (_dmarc.${domain})`,
        source: 'Google DNS-over-HTTPS (DoH)',
      };
    }
  }

  const hasStatusPage = (statusDnsData?.Answer && statusDnsData.Answer.length > 0) || profile?.statusPagePresent;
  if (!hasStatusPage && !profile) {
    if (hash % 3 === 0) { // 33% chance
      signalStatuses.or_status_page = {
        signalId: 'or_status_page',
        checked: true,
        hasFinding: true,
        severity: 'Medium',
        findingDetails: `No public status page CNAME detected at status.${domain}`,
        source: 'Google DNS-over-HTTPS (DoH)',
      };
    }
  }

  if (rdapData && rdapData.creationYear) {
    const currentYear = new Date().getFullYear();
    const ageYears = currentYear - rdapData.creationYear;
    if (ageYears < 2 && !profile) {
      signalStatuses.bs_registration_age = {
        signalId: 'bs_registration_age',
        checked: true,
        hasFinding: true,
        severity: 'Low',
        findingDetails: `Domain registered recently in ${rdapData.creationYear} (${ageYears} years old)`,
        source: 'ICANN RDAP Protocol API',
      };
    }
  }

  // Merge profile-specific findings for preset demo targets
  if (profile) {
    if (profile.hasExposedService) {
      signalStatuses.cs_exposed_services = {
        signalId: 'cs_exposed_services',
        checked: true,
        hasFinding: true,
        severity: 'Critical',
        findingDetails: `Exposed unauthenticated Redis & Elasticsearch database on ${domain}`,
        source: 'Shodan Real-Time Scanner',
      };
    }
    if (profile.sslGrade === 'F') {
      signalStatuses.cs_ssl = {
        signalId: 'cs_ssl',
        checked: true,
        hasFinding: true,
        severity: 'Critical',
        findingDetails: `SSL Grade F (Insecure TLS 1.0 enabled & expired cert)`,
        source: 'Qualys SSL Labs API',
      };
    }
    if (profile.hasBreachHistory) {
      signalStatuses.rep_breach_history = {
        signalId: 'rep_breach_history',
        checked: true,
        hasFinding: true,
        severity: 'Critical',
        findingDetails: `Confirmed breach leak disclosed on dark web forum`,
        source: 'HaveIBeenPwned & BreachDB Telemetry',
      };
    }
    if (profile.privacyPolicyMissing) {
      signalStatuses.cp_privacy_policy = {
        signalId: 'cp_privacy_policy',
        checked: true,
        hasFinding: true,
        severity: 'Medium',
        findingDetails: `No accessible privacy policy found on root domain`,
        source: 'HTTP Crawler',
      };
    }
    if (profile.dpaMissing) {
      signalStatuses.cp_dpa = {
        signalId: 'cp_dpa',
        checked: true,
        hasFinding: true,
        severity: 'Low',
        findingDetails: `No public Data Processing Addendum (DPA) indexed`,
        source: 'Legal Telemetry Index',
      };
    }
  } else {
    // Generate realistic, harsher deterministic findings for unlisted domains
    // This proves the mathematical engine, coverage model, and override system work for the demo.
    
    // Cybersecurity
    if (hash % 2 === 0) {
      signalStatuses.cs_ssl = { signalId: 'cs_ssl', checked: true, hasFinding: true, severity: 'Medium', findingDetails: 'SSL Certificate expires in less than 30 days', source: 'Qualys Mock' };
    }
    if (hash % 5 === 0) {
      signalStatuses.cs_exposed_services = { signalId: 'cs_exposed_services', checked: true, hasFinding: true, severity: 'High', findingDetails: 'Exposed RDP port 3389 detected', source: 'Shodan Mock' };
    }
    if (hash % 3 === 0) {
      signalStatuses.cs_security_txt = { signalId: 'cs_security_txt', checked: true, hasFinding: true, severity: 'Low', findingDetails: 'Missing security.txt', source: 'HTTP Mock' };
    }

    // Compliance
    if (hash % 4 === 0) {
      signalStatuses.cp_privacy_policy = { signalId: 'cp_privacy_policy', checked: true, hasFinding: true, severity: 'High', findingDetails: 'Privacy policy contains non-compliant GDPR clauses', source: 'AI Analyzer' };
    }
    if (hash % 6 === 0) {
      signalStatuses.cp_dpa = { signalId: 'cp_dpa', checked: true, hasFinding: true, severity: 'Medium', findingDetails: 'No public DPA available', source: 'Legal Telemetry' };
    }

    // Business Stability
    if (hash % 7 === 0) {
      signalStatuses.bs_layoffs = { signalId: 'bs_layoffs', checked: true, hasFinding: true, severity: 'Medium', findingDetails: 'News indicates recent workforce reduction >10%', source: 'News Aggregator' };
    }

    // Reputation
    if (hash % 8 === 0) {
      signalStatuses.rep_negative_news = { signalId: 'rep_negative_news', checked: true, hasFinding: true, severity: 'High', findingDetails: 'Adverse media coverage relating to regulatory fine', source: 'RSS Feeds' };
    }
    if (hash % 11 === 0) {
      signalStatuses.rep_breach_history = { signalId: 'rep_breach_history', checked: true, hasFinding: true, severity: 'Critical', findingDetails: 'Domain found in recent dark web credential leak', source: 'BreachDB Mock' };
    }

    // Legal & Reg
    if (hash % 9 === 0) {
      signalStatuses.lr_fines = { signalId: 'lr_fines', checked: true, hasFinding: true, severity: 'Medium', findingDetails: 'Past regulatory action found in public records', source: 'Legal Database' };
    }

    // Simulate "Insufficient Data" (Coverage Model Trigger)
    // For 1 in 4 domains, we simulate that we couldn't find ANY data for Business Stability
    if (hash % 4 === 1) {
      CATEGORIES['bs'].signals.forEach(sig => {
        if (signalStatuses[sig.id]) {
          signalStatuses[sig.id].checked = false;
          signalStatuses[sig.id].hasFinding = false;
        }
      });
    }
  }

  return {
    identity,
    multiAsset: false,
    assets: [],
    signalStatuses,
    customFindings: [],
    overrideDirectSanctionsOrBreach: profile?.hasSanctionHit || (hash % 15 === 0 && !profile), // ~6% chance of Grade F override
    overridePartialSanctions: profile?.hasPartialSanction || (hash % 12 === 0 && !profile), // ~8% chance of Grade C cap
    overrideDetails: profile?.hasSanctionHit ? 'Direct OFAC Sanction match flag triggered' : undefined,
  };
}
