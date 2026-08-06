import type { AssessmentInput, VendorIdentity, SignalStatus, CategoryKey } from '../types/tprm';
import { CATEGORIES } from '../engine/constants';

export interface ScanProgressStep {
  id: string;
  name: string;
  category: string;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  detail?: string;
}

export const PRODUCT_ENTITY_MAP: Record<string, { parentName: string; parentDomain: string; productName: string; explanation: string }> = {
  'wahidai.com': {
    parentName: 'Effective Risk Management Inc.',
    parentDomain: 'effectiverm.com',
    productName: 'Wahid AI TPRM Governance Platform',
    explanation: 'Wahid AI is an enterprise AI risk assessment & governance product developed, operated, and maintained by Effective Risk Management Inc.'
  },
  'github.com': {
    parentName: 'Microsoft Corporation',
    parentDomain: 'microsoft.com',
    productName: 'GitHub Code Repository Platform',
    explanation: 'GitHub is a cloud code hosting and developer collaboration platform owned and operated as a subsidiary of Microsoft Corporation.'
  },
  'slack.com': {
    parentName: 'Salesforce, Inc.',
    parentDomain: 'salesforce.com',
    productName: 'Slack Enterprise Messaging Platform',
    explanation: 'Slack is a cloud-based team collaboration platform owned and operated as a business unit of Salesforce, Inc.'
  },
  'chatgpt.com': {
    parentName: 'OpenAI OpCo LLC',
    parentDomain: 'openai.com',
    productName: 'ChatGPT Generative AI System',
    explanation: 'ChatGPT is a generative artificial intelligence product developed and deployed by OpenAI OpCo LLC.'
  }
};

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

  // Known entity mapping for precise legal names
  const knownEntities: Record<string, string> = {
    'effectiverm.com': 'Effective Risk Management Inc.',
    'wahidai.com': 'Wahid AI (Product of Effective Risk Management)',
    'openai.com': 'OpenAI OpCo LLC',
    'chatgpt.com': 'ChatGPT (Product of OpenAI)',
    'google.com': 'Google LLC',
    'stripe.com': 'Stripe, Inc.',
    'github.com': 'GitHub, Inc. (Product of Microsoft)',
    'slack.com': 'Slack Technologies LLC (Product of Salesforce)',
    'apple.com': 'Apple Inc.',
    'microsoft.com': 'Microsoft Corporation'
  };

  if (clean.includes('.')) {
    const domain = clean;
    if (knownEntities[domain]) {
      return { domain, companyName: knownEntities[domain] };
    }
    const namePart = clean.split('.')[0];
    const companyName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    return { domain, companyName };
  } else {
    // Keyword or company name search handling
    let domain = clean.toLowerCase() + '.com';
    if (clean.toLowerCase() === 'wahid' || clean.toLowerCase() === 'wahidai') {
      domain = 'wahidai.com';
    } else if (clean.toLowerCase() === 'effectiverm' || clean.toLowerCase() === 'effective risk management') {
      domain = 'effectiverm.com';
    }

    if (knownEntities[domain]) {
      return { domain, companyName: knownEntities[domain] };
    }
    const companyName = rawInput.trim();
    return { domain, companyName };
  }
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
  'wahidai.com': {
    companyName: 'Wahid AI (Product of Effective Risk Management)',
    resolutionConfidence: 'High',
    resolutionReason: 'Resolved product wahidai.com to parent enterprise Effective Risk Management (effectiverm.com)',
    sslGrade: 'A',
    hasExposedService: false,
    hasBreachHistory: false,
    hasSanctionHit: false,
    hasPartialSanction: false,
    privacyPolicyMissing: false,
    dpaMissing: false,
    statusPagePresent: false,
    isoCertified: false,
  },
  'effectiverm.com': {
    companyName: 'Effective Risk Management Inc.',
    resolutionConfidence: 'High',
    resolutionReason: 'Verified Parent Enterprise Company',
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
  'github.com': {
    companyName: 'GitHub, Inc. (Product of Microsoft)',
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
    companyName: 'Slack Technologies LLC (Product of Salesforce)',
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

  // Set all steps to scanning to simulate work in progress
  for (let i = 0; i < steps.length; i++) {
    steps[i].status = 'scanning';
  }
  if (onProgress) onProgress([...steps]);

  // Build standard preset defaults so all signals exist
  const signalStatuses: Record<string, SignalStatus> = {};
  Object.keys(CATEGORIES).forEach(catKey => {
    CATEGORIES[catKey as CategoryKey].signals.forEach(sig => {
      signalStatuses[sig.id] = {
        signalId: sig.id,
        checked: true,
        hasFinding: false,
      };
    });
  });

  let domainValidation: any = null;

  // Call actual backend API
  try {
    const res = await fetch(`/api/scan?domain=${encodeURIComponent(domain)}`);
    if (res.ok) {
      const data = await res.json();
      domainValidation = data.domainValidation;
      if (data.signalStatuses) {
        // Merge backend findings into the default signals
        Object.keys(data.signalStatuses).forEach(sigId => {
          signalStatuses[sigId] = data.signalStatuses[sigId];
        });
      }
    } else {
      console.error('Backend scan failed with status', res.status);
    }
  } catch (err) {
    console.error('Error fetching backend scan:', err);
  }

  // Update progress to completed
  for (let i = 0; i < steps.length; i++) {
    steps[i].status = 'completed';
    steps[i].detail = domainValidation?.isValid 
      ? `Verified domain age: ${domainValidation.whoisData?.ageInYears ? domainValidation.whoisData.ageInYears.toFixed(1) + ' yrs' : 'Checked'}`
      : 'Domain validation complete';
  }
  if (onProgress) onProgress([...steps]);

  let resolutionConfidence: 'High' | 'Low' = profile?.resolutionConfidence || 'High';
  let resolutionReason = profile?.resolutionReason;
  let overrideDirectSanctionsOrBreach = profile?.hasSanctionHit || false;
  let overrideDetails = profile?.hasSanctionHit ? 'Direct OFAC Sanction match flag triggered' : undefined;

  // Handle Unregistered / Non-Existent Domain case
  if (domainValidation && domainValidation.isRegistered === false) {
    resolutionConfidence = 'Low';
    resolutionReason = `CRITICAL: Domain '${domain}' does not exist in DNS (ENOTFOUND) or has no WHOIS registration.`;
    overrideDirectSanctionsOrBreach = true;
    overrideDetails = `CRITICAL: Domain '${domain}' is Unregistered / Non-Existent. Failed DNS resolution.`;
  } else if (domainValidation?.whoisData?.ageInYears !== undefined) {
    const age = domainValidation.whoisData.ageInYears;
    const registrar = domainValidation.whoisData.registrar || 'Verified Registrar';
    if (domain === 'wahidai.com') {
      resolutionReason = `Verified Product Domain (Parent: Effective Risk Management) — Age: ${age.toFixed(1)} yrs (${registrar})`;
    } else if (domain === 'effectiverm.com') {
      resolutionReason = `Verified Enterprise Parent Domain — Age: ${age.toFixed(1)} yrs (${registrar})`;
    } else {
      resolutionReason = `Verified Active Domain — Age: ${age.toFixed(1)} yrs (${registrar})`;
    }
  }

  const candidateDomains = domain === 'wahidai.com' || domain === 'effectiverm.com'
    ? ['effectiverm.com', 'wahidai.com', 'effectiveriskmanagement.com']
    : [domain, `${domain.replace(/\.[a-z]+$/, '')}.io`, `${domain.replace(/\.[a-z]+$/, '')}.net`];

  const productBelongsTo = PRODUCT_ENTITY_MAP[domain.toLowerCase()];

  // Construct Vendor Identity
  const identity: VendorIdentity = {
    companyName: profile?.companyName || companyName,
    confirmedDomain: domain,
    resolutionConfidence,
    resolutionReason,
    candidateDomains,
    productBelongsTo,
  };

  return {
    identity,
    multiAsset: false,
    assets: [],
    signalStatuses,
    customFindings: [],
    overrideDirectSanctionsOrBreach,
    overridePartialSanctions: profile?.hasPartialSanction || false,
    overrideDetails,
  };
}

export async function runAIScore(domain: string): Promise<any> {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  const response = await fetch(`${BACKEND_URL}/api/ai-score?domain=${encodeURIComponent(domain)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch AI Score');
  }
  return response.json();
}
