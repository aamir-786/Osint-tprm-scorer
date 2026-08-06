/**
 * Standalone Conditional Signal Engine Test Suite
 * 
 * Logic:
 * - Cohort 1: Early Startup (Age < 2 yrs): Only evaluate Necessary Day-1 Signals (6 signals).
 * - Cohort 2: Mid-Stage (Age 2-5 yrs): Evaluate Necessary + Mid-Stage Signals (10 signals).
 * - Cohort 3: Enterprise (Age >= 5 yrs): Evaluate Full Signal Matrix (13 signals).
 */

const SIGNAL_DATABASE = [
  // NECESSARY DAY-1 SIGNALS (Always Evaluated for ALL cohorts)
  { id: 'cs_ssl', name: 'SSL Grade & TLS Config', category: 'Security & Privacy', weight: 30, cohortMinAge: 0 },
  { id: 'cs_headers', name: 'Security Headers (DMARC/SPF)', category: 'Security & Privacy', weight: 20, cohortMinAge: 0 },
  { id: 'cs_exposed_services', name: 'Exposed Database Ports', category: 'Security & Privacy', weight: 30, cohortMinAge: 0 },
  { id: 'cp_privacy_policy', name: 'Privacy Policy Presence', category: 'Security & Privacy', weight: 10, cohortMinAge: 0 },
  { id: 'bm_domain_age', name: 'Domain WHOIS Registration', category: 'Reliability & Maturity', weight: 10, cohortMinAge: 0 },
  { id: 'lr_fines', name: 'OFAC & UN Sanctions Watchlist', category: 'Legal & Geopolitical', weight: 50, cohortMinAge: 0 },

  // MID-STAGE SIGNALS (Evaluated for Age >= 2 yrs)
  { id: 'res_status_page', name: 'Public Status Page', category: 'Reliability & Maturity', weight: 15, cohortMinAge: 2.0 },
  { id: 'bs_bankruptcy', name: 'Insolvency & Bankruptcy News', category: 'Financial Health', weight: 25, cohortMinAge: 2.0 },
  { id: 'bs_layoffs', name: 'Mass Layoffs & Funding Collapse', category: 'Financial Health', weight: 15, cohortMinAge: 2.0 },
  { id: 'rep_negative_news', name: 'Adverse Media Screening', category: 'Reputation & Ethics', weight: 20, cohortMinAge: 2.0 },

  // ENTERPRISE SIGNALS (Evaluated ONLY for Age >= 5 yrs)
  { id: 'bm_wikipedia', name: 'Global Corporate Wikipedia Page', category: 'Reliability & Maturity', weight: 25, cohortMinAge: 5.0 },
  { id: 'bm_public_market', name: 'Public Market Stock Ticker', category: 'Reliability & Maturity', weight: 15, cohortMinAge: 5.0 },
  { id: 'esg_sustainability', name: 'ESG & Sustainability Reporting', category: 'Reputation & Ethics', weight: 10, cohortMinAge: 5.0 },
];

const TEST_VENDOR_PROFILES = [
  {
    id: 'wahidai',
    name: 'Wahid AI (wahidai.com)',
    domain: 'wahidai.com',
    ageInYears: 0.6,
    isRegistered: true,
    findings: {
      cs_ssl: 'PASS', cs_headers: 'PASS', cs_exposed_services: 'PASS', cp_privacy_policy: 'PASS',
      bm_domain_age: 'PASS', lr_fines: 'PASS', res_status_page: 'FAIL', bs_bankruptcy: 'FAIL',
      bs_layoffs: 'FAIL', rep_negative_news: 'FAIL', bm_wikipedia: 'FAIL', bm_public_market: 'FAIL',
      esg_sustainability: 'FAIL'
    }
  },
  {
    id: 'effectiverm',
    name: 'Effective Risk Management (effectiverm.com)',
    domain: 'effectiverm.com',
    ageInYears: 2.8,
    isRegistered: true,
    findings: {
      cs_ssl: 'PASS', cs_headers: 'PASS', cs_exposed_services: 'PASS', cp_privacy_policy: 'PASS',
      bm_domain_age: 'PASS', lr_fines: 'PASS', res_status_page: 'PASS', bs_bankruptcy: 'PASS',
      bs_layoffs: 'PASS', rep_negative_news: 'PASS', bm_wikipedia: 'FAIL', bm_public_market: 'FAIL',
      esg_sustainability: 'FAIL'
    }
  },
  {
    id: 'stripe',
    name: 'Stripe, Inc. (stripe.com)',
    domain: 'stripe.com',
    ageInYears: 14.9,
    isRegistered: true,
    findings: {
      cs_ssl: 'PASS', cs_headers: 'PASS', cs_exposed_services: 'PASS', cp_privacy_policy: 'PASS',
      bm_domain_age: 'PASS', lr_fines: 'PASS', res_status_page: 'PASS', bs_bankruptcy: 'PASS',
      bs_layoffs: 'PASS', rep_negative_news: 'PASS', bm_wikipedia: 'PASS', bm_public_market: 'PASS',
      esg_sustainability: 'PASS'
    }
  },
  {
    id: 'opaque_legacy',
    name: 'Opaque Shell Corp (legacy-opaque.com)',
    domain: 'legacy-opaque.com',
    ageInYears: 12.0,
    isRegistered: true,
    findings: {
      cs_ssl: 'PASS', cs_headers: 'FAIL', cs_exposed_services: 'PASS', cp_privacy_policy: 'PASS',
      bm_domain_age: 'PASS', lr_fines: 'PASS', res_status_page: 'FAIL', bs_bankruptcy: 'FAIL',
      bs_layoffs: 'FAIL', rep_negative_news: 'FAIL', bm_wikipedia: 'FAIL', bm_public_market: 'FAIL',
      esg_sustainability: 'FAIL'
    }
  }
];

function runConditionalEngine(vendor) {
  if (!vendor.isRegistered) {
    return { score: 0, grade: 'F', cohort: 'Unregistered Domain', signalsEvaluated: 0, penalties: 950 };
  }

  let cohortName = '';
  if (vendor.ageInYears < 2.0) {
    cohortName = 'Early-Stage Startup (Age < 2 yrs)';
  } else if (vendor.ageInYears < 5.0) {
    cohortName = 'Mid-Stage Company (Age 2 - 5 yrs)';
  } else {
    cohortName = 'Enterprise Company (Age >= 5 yrs)';
  }

  // Filter signals conditionally by age cohort
  const activeSignals = SIGNAL_DATABASE.filter(sig => vendor.ageInYears >= sig.cohortMinAge);

  let baseScore = 950;
  let totalPenalties = 0;
  let passedCount = 0;

  activeSignals.forEach(sig => {
    const status = vendor.findings[sig.id];
    if (status === 'PASS') {
      passedCount++;
    } else {
      totalPenalties += sig.weight;
    }
  });

  const finalScore = Math.max(0, baseScore - totalPenalties);
  let grade = 'F';
  if (finalScore >= 801) grade = 'A';
  else if (finalScore >= 601) grade = 'B';
  else if (finalScore >= 401) grade = 'C';
  else if (finalScore >= 201) grade = 'D';

  return {
    score: finalScore,
    grade,
    cohort: cohortName,
    activeSignalCount: activeSignals.length,
    passedCount,
    failedCount: activeSignals.length - passedCount,
    totalPenalties
  };
}

console.log('========================================================================================');
console.log('                  CONDITIONAL SIGNAL ENGINE TEST RESULTS (STANDALONE)                   ');
console.log('========================================================================================\n');

TEST_VENDOR_PROFILES.forEach((vendor, index) => {
  const result = runConditionalEngine(vendor);
  console.log(`[VENDOR ${index + 1}] ${vendor.name}`);
  console.log(`  Domain Age:          ${vendor.ageInYears} yrs`);
  console.log(`  Assigned Cohort:     ${result.cohort}`);
  console.log(`  Signals Evaluated:   ${result.activeSignalCount} Signals (${result.passedCount} Passed, ${result.failedCount} Penalized)`);
  console.log(`  Calculated Score:    ${result.score} / 950 (Grade ${result.grade})`);
  console.log(`  Applied Penalties:   -${result.totalPenalties} pts\n`);
});
