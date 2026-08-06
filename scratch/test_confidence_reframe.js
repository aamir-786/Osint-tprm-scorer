/**
 * Comparison Test Suite:
 * Model A: Flat Missing Data Penalties (Old System)
 * Model B: Pure Expectation Engine (Zero age distinction in Risk Score)
 * Model C: Calibrated Expectation Engine (100% Confidence + Operational Track Record Distinction)
 */

const SIGNALS = [
  // ALWAYS EXPECTED (Day 1) - Total Weight: 50
  { id: 'cs_ssl', name: 'SSL Grade & TLS Config', category: 'Security & Privacy', weight: 10, tier: 'ALWAYS_EXPECTED', ageThreshold: 0 },
  { id: 'cs_headers', name: 'Security Headers (DMARC/SPF)', category: 'Security & Privacy', weight: 10, tier: 'ALWAYS_EXPECTED', ageThreshold: 0 },
  { id: 'cs_exposed_services', name: 'Exposed Database Ports', category: 'Security & Privacy', weight: 10, tier: 'ALWAYS_EXPECTED', ageThreshold: 0 },
  { id: 'cp_privacy_policy', name: 'Privacy Policy Presence', category: 'Security & Privacy', weight: 5, tier: 'ALWAYS_EXPECTED', ageThreshold: 0 },
  { id: 'bm_domain_age', name: 'Domain / WHOIS Record', category: 'Reliability & Maturity', weight: 5, tier: 'ALWAYS_EXPECTED', ageThreshold: 0 },
  { id: 'lr_fines', name: 'Sanctions Screening', category: 'Legal & Geopolitical', weight: 10, tier: 'ALWAYS_EXPECTED', ageThreshold: 0 },

  // SCALES WITH AGE / SIZE - Total Weight: 50
  { id: 'res_status_page', name: 'Public Status Page', category: 'Reliability & Maturity', weight: 5, tier: 'SCALES_WITH_AGE', ageThreshold: 2.0 },
  { id: 'bm_wikipedia', name: 'Wikipedia / Global Notability', category: 'Reliability & Maturity', weight: 10, tier: 'SCALES_WITH_AGE', ageThreshold: 3.0 },
  { id: 'bm_public_market', name: 'Public Market Ticker', category: 'Reliability & Maturity', weight: 5, tier: 'SCALES_WITH_AGE', ageThreshold: 5.0 },
  { id: 'bs_bankruptcy', name: 'Insolvency & Bankruptcy', category: 'Financial Health', weight: 10, tier: 'SCALES_WITH_AGE', ageThreshold: 2.0 },
  { id: 'bs_layoffs', name: 'Layoffs & Funding News', category: 'Financial Health', weight: 5, tier: 'SCALES_WITH_AGE', ageThreshold: 2.0 },
  { id: 'rep_negative_news', name: 'Adverse Media Screening', category: 'Reputation & Ethics', weight: 10, tier: 'SCALES_WITH_AGE', ageThreshold: 2.0 },
  { id: 'rep_breach_history', name: 'Breach Disclosure Check', category: 'Reputation & Ethics', weight: 5, tier: 'SCALES_WITH_AGE', ageThreshold: 2.0 }
];

const TEST_VENDORS = [
  {
    id: 'enterprise_stripe',
    name: 'Stripe, Inc. (stripe.com)',
    domain: 'stripe.com',
    ageInYears: 14.9,
    isRegistered: true,
    description: '15-year enterprise tech giant. Proven operational longevity & full public filings.',
    findings: {
      cs_ssl: 'FOUND_PASS', cs_headers: 'FOUND_PASS', cs_exposed_services: 'FOUND_PASS',
      cp_privacy_policy: 'FOUND_PASS', bm_domain_age: 'FOUND_PASS', lr_fines: 'FOUND_PASS',
      res_status_page: 'FOUND_PASS', bm_wikipedia: 'FOUND_PASS', bm_public_market: 'FOUND_PASS',
      bs_bankruptcy: 'FOUND_PASS', bs_layoffs: 'FOUND_PASS', rep_negative_news: 'FOUND_PASS', rep_breach_history: 'FOUND_PASS'
    }
  },
  {
    id: 'effectiverm_enterprise',
    name: 'Effective Risk Management Inc. (effectiverm.com)',
    domain: 'effectiverm.com',
    ageInYears: 2.8,
    isRegistered: true,
    description: 'Established 2.8-year-old enterprise company. Active status page, zero negative media.',
    findings: {
      cs_ssl: 'FOUND_PASS', cs_headers: 'FOUND_PASS', cs_exposed_services: 'FOUND_PASS',
      cp_privacy_policy: 'FOUND_PASS', bm_domain_age: 'FOUND_PASS', lr_fines: 'FOUND_PASS',
      res_status_page: 'FOUND_PASS', bm_wikipedia: 'NOT_FOUND', bm_public_market: 'NOT_FOUND',
      bs_bankruptcy: 'FOUND_PASS', bs_layoffs: 'FOUND_PASS', rep_negative_news: 'FOUND_PASS', rep_breach_history: 'FOUND_PASS'
    }
  },
  {
    id: 'startup_clean',
    name: 'Wahid AI (wahidai.com)',
    domain: 'wahidai.com',
    ageInYears: 0.6,
    isRegistered: true,
    description: 'Clean early-stage startup (~7 months old). Perfect DNS/TLS/DMARC security posture.',
    findings: {
      cs_ssl: 'FOUND_PASS', cs_headers: 'FOUND_PASS', cs_exposed_services: 'FOUND_PASS',
      cp_privacy_policy: 'FOUND_PASS', bm_domain_age: 'FOUND_PASS', lr_fines: 'FOUND_PASS',
      res_status_page: 'NOT_FOUND', bm_wikipedia: 'NOT_FOUND', bm_public_market: 'NOT_FOUND',
      bs_bankruptcy: 'NOT_FOUND', bs_layoffs: 'NOT_FOUND', rep_negative_news: 'NOT_FOUND', rep_breach_history: 'NOT_FOUND'
    }
  },
  {
    id: 'suspicious_legacy',
    name: 'Opaque Legacy Corp (legacy-shell.com)',
    domain: 'legacy-shell.com',
    ageInYears: 12.0,
    isRegistered: true,
    description: '12-year-old company. Missing expected filings, no Wikipedia, broken DMARC headers.',
    findings: {
      cs_ssl: 'FOUND_PASS', cs_headers: 'FOUND_FAIL', cs_exposed_services: 'FOUND_PASS',
      cp_privacy_policy: 'FOUND_PASS', bm_domain_age: 'FOUND_PASS', lr_fines: 'FOUND_PASS',
      res_status_page: 'NOT_FOUND', bm_wikipedia: 'NOT_FOUND', bm_public_market: 'NOT_FOUND',
      bs_bankruptcy: 'NOT_FOUND', bs_layoffs: 'NOT_FOUND', rep_negative_news: 'NOT_FOUND', rep_breach_history: 'NOT_FOUND'
    }
  }
];

// MODEL C: CALIBRATED EXPECTATION ENGINE (Profile Confidence + Operational Track Record Distinction)
function runModelC(vendor) {
  if (!vendor.isRegistered) {
    return { score: 0, grade: 'F', confidence: '100% (Non-Existent)', maturityDeduction: 950 };
  }

  let baseScore = 950;
  let penalties = 0;

  // 1. Calibrated Domain Track Record Adjustment (Pure Operational History Distinction)
  // Reflects inherent track record difference between 15-yr enterprise vs 2.8-yr company vs 0.6-yr startup
  let trackRecordAdjustment = 0;
  if (vendor.ageInYears < 1.0) {
    trackRecordAdjustment = 70; // Startup Operational History Adjustment (-70 pts)
  } else if (vendor.ageInYears < 3.0) {
    trackRecordAdjustment = 30; // Mid-stage Adjustment (-30 pts)
  } else if (vendor.ageInYears < 5.0) {
    trackRecordAdjustment = 10; // Slight Adjustment (-10 pts)
  } // >= 5 yrs = 0 adjustment (Fully established enterprise track record)

  let expectedWeightsTotal = 0;
  let expectedAndFoundWeightsTotal = 0;

  SIGNALS.forEach(sig => {
    const isExpectedForProfile = sig.tier === 'ALWAYS_EXPECTED' || vendor.ageInYears >= sig.ageThreshold;
    const resultState = vendor.findings[sig.id];

    if (isExpectedForProfile) {
      expectedWeightsTotal += sig.weight;
      if (resultState === 'FOUND_PASS') {
        expectedAndFoundWeightsTotal += sig.weight;
      } else if (resultState === 'NOT_FOUND') {
        // Red Flag: Expected for this profile, but missing!
        penalties += (sig.tier === 'ALWAYS_EXPECTED' ? 70 : 150);
      } else if (resultState === 'FOUND_FAIL') {
        penalties += 70;
      }
    }
  });

  const confidenceValue = expectedWeightsTotal > 0 ? (expectedAndFoundWeightsTotal / expectedWeightsTotal) : 1.0;
  const confidencePct = Math.round(confidenceValue * 100);
  const confidenceStr = `${confidencePct}% (${expectedAndFoundWeightsTotal}/${expectedWeightsTotal} Expected Pts)`;

  const finalScore = Math.max(0, baseScore - trackRecordAdjustment - penalties);

  let grade = 'F';
  if (finalScore >= 801) grade = 'A';
  else if (finalScore >= 601) grade = 'B';
  else if (finalScore >= 401) grade = 'C';
  else if (finalScore >= 201) grade = 'D';

  return {
    score: finalScore,
    grade,
    confidence: confidenceStr,
    trackRecordAdjustment,
    penalties
  };
}

console.log('========================================================================================');
console.log('       MODEL C: CALIBRATED EXPECTATION ENGINE (CONFIDENCE + OPERATIONAL LONGEVITY)     ');
console.log('========================================================================================\n');

TEST_VENDORS.forEach((v, index) => {
  const resC = runModelC(v);
  console.log(`[${index + 1}] ${v.name}`);
  console.log(`    Age: ${v.ageInYears} yrs`);
  console.log(`    Defensible Risk Score:  ${resC.score} / 950 (Grade ${resC.grade})`);
  console.log(`    Confidence Score:       ${resC.confidence}`);
  console.log(`    Track Record Adj:       -${resC.trackRecordAdjustment} pts (Operational Longevity)`);
  console.log(`    Missing Expected Penalty:-${resC.penalties} pts\n`);
});
