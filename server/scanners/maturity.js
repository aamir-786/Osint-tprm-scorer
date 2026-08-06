const whois = require('whois-json');
const axios = require('axios');

// Suppress yahoo-finance2 notices and load gracefully
process.env.YF_SUPPRESS_NOTICES = 'true';
let yahooFinance;
try {
  const YahooFinance = require('yahoo-finance2').default;
  yahooFinance = new YahooFinance();
} catch (e) {
  console.warn('[Maturity] yahoo-finance2 not installed, financial checks will be skipped.');
}

// Known enterprise Wikipedia standing map
const KNOWN_WIKI_ENTITIES = {
  'stripe.com': 'Stripe, Inc. (Global Payments Infrastructure)',
  'google.com': 'Google LLC (Alphabet Inc.)',
  'microsoft.com': 'Microsoft Corporation',
  'github.com': 'GitHub, Inc. (Microsoft Subsidiary)',
  'slack.com': 'Slack Technologies LLC (Salesforce)',
  'openai.com': 'OpenAI OpCo LLC',
  'apple.com': 'Apple Inc.',
  'effectiverm.com': 'Effective Risk Management Inc. (Enterprise TPRM Governance Provider)',
  'wahidai.com': 'Wahid AI (Product of Effective Risk Management Inc.)'
};

// Helper to extract company name
function getCompanyName(domain) {
  const knownEntities = {
    'openai.com': 'OpenAI',
    'google.com': 'Google',
    'stripe.com': 'Stripe',
    'github.com': 'GitHub',
    'slack.com': 'Slack',
    'apple.com': 'Apple',
    'microsoft.com': 'Microsoft',
    'effectiverm.com': 'Effective Risk Management',
    'wahidai.com': 'Wahid AI'
  };
  if (knownEntities[domain]) return knownEntities[domain];
  
  const namePart = domain.split('.')[0];
  return namePart.charAt(0).toUpperCase() + namePart.slice(1);
}

async function scanMaturity(domain, domainValidation) {
  const findings = [];
  const companyName = getCompanyName(domain);

  // --- 0. Non-Existent / Unregistered Domain Check ---
  if (domainValidation && !domainValidation.isRegistered) {
    findings.push({
      signalId: 'bm_domain_age',
      hasFinding: true,
      severity: 'Critical',
      findingDetails: `UNREGISTERED / NON-EXISTENT DOMAIN: Domain '${domain}' does not exist in DNS (ENOTFOUND) or has no WHOIS registration. Cannot establish vendor identity.`,
      source: 'DNS & WHOIS Validator'
    });
    findings.push({
      signalId: 'bm_public_market',
      hasFinding: true,
      severity: 'High',
      findingDetails: `Domain '${domain}' is non-existent/unregistered. Zero public market presence or corporate records found.`,
      source: 'DNS & WHOIS Validator'
    });
    findings.push({
      signalId: 'bm_wikipedia',
      hasFinding: true,
      severity: 'High',
      findingDetails: `UNREGISTERED ENTITY: Domain '${domain}' is non-existent. Lacks all corporate records and Wikipedia notability.`,
      source: 'DNS & WHOIS Validator'
    });
    return findings;
  }

  // --- 1. Domain Registration Age (WHOIS & Validator) ---
  let ageInYears = domainValidation?.whoisData?.ageInYears ?? null;
  let registrar = domainValidation?.whoisData?.registrar ?? null;

  if (ageInYears === null) {
    try {
      const results = await whois(domain);
      const creationDateStr = results.creationDate || results.domainNameExtDt || results.createdDate || results.creationdate || results.registered;
      registrar = results.registrar || registrar;

      if (creationDateStr) {
        const creationDate = new Date(creationDateStr);
        if (!isNaN(creationDate)) {
          const ageInMs = Date.now() - creationDate.getTime();
          ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
        }
      }
    } catch (err) {
      console.warn(`[Maturity] WHOIS scan failed for ${domain}:`, err.message);
    }
  }

  if (ageInYears !== null && !isNaN(ageInYears)) {
    const ageFormatted = ageInYears.toFixed(1);
    if (ageInYears >= 5) {
      findings.push({
        signalId: 'bm_domain_age',
        hasFinding: false,
        severity: 'Informational',
        findingDetails: `Domain is well-established (${ageFormatted} years old, Registrar: ${registrar || 'Public WHOIS'}). Trusted operational record.`,
        source: 'WHOIS'
      });
    } else if (ageInYears >= 3) {
      findings.push({
        signalId: 'bm_domain_age',
        hasFinding: true,
        severity: 'Medium',
        findingDetails: `Domain is moderately established (${ageFormatted} years old, less than 5 yr benchmark). Moderate operational maturity risk.`,
        source: 'WHOIS'
      });
    } else if (ageInYears >= 1) {
      findings.push({
        signalId: 'bm_domain_age',
        hasFinding: true,
        severity: 'High',
        findingDetails: `Domain is young startup territory (${ageFormatted} years old). Major operational immaturity & contract stability risk.`,
        source: 'WHOIS'
      });
    } else {
      const months = Math.round(ageInYears * 12);
      findings.push({
        signalId: 'bm_domain_age',
        hasFinding: true,
        severity: 'Critical',
        findingDetails: `Domain is extremely new (registered recently, ~${months} months / ${ageFormatted} yrs old). Severe immaturity & high shell-company risk.`,
        source: 'WHOIS'
      });
    }
  } else {
    pushWhoisFallback(findings, false);
  }

  // --- 2. Public Market Verification (Yahoo Finance) ---
  if (yahooFinance) {
    try {
      const searchRes = await yahooFinance.search(companyName);
      if (searchRes.quotes && searchRes.quotes.length > 0) {
        const topQuote = searchRes.quotes.find(q => q.isYahooFinance === true && q.quoteType === 'EQUITY');
        if (topQuote) {
          findings.push({
            signalId: 'bm_public_market',
            hasFinding: false,
            severity: 'Informational',
            findingDetails: `Publicly traded verified: Ticker ${topQuote.symbol} (${topQuote.shortname || topQuote.longname}).`,
            source: 'Yahoo Finance API'
          });
        } else {
          findings.push({
            signalId: 'bm_public_market',
            hasFinding: true,
            severity: ageInYears !== null && ageInYears < 3.0 ? 'High' : 'Medium',
            findingDetails: `Company is not publicly traded (Private entity / Startup, Age: ${ageInYears ? ageInYears.toFixed(1) + ' yrs' : 'Unverified'}).`,
            source: 'Yahoo Finance API'
          });
        }
      } else {
        findings.push({
          signalId: 'bm_public_market',
          hasFinding: true,
          severity: ageInYears !== null && ageInYears < 3.0 ? 'High' : 'Medium',
          findingDetails: `Company is not publicly traded (Private entity / Startup, Age: ${ageInYears ? ageInYears.toFixed(1) + ' yrs' : 'Unverified'}).`,
          source: 'Yahoo Finance API'
        });
      }
    } catch (err) {
      console.warn(`[Maturity] Yahoo Finance scan failed for ${domain}:`, err.message);
      pushFinanceFallback(findings, true);
    }
  } else {
    pushFinanceFallback(findings, true);
  }

  // --- 3. Global Notability (Wikipedia & Public Sources Verification) ---
  const knownWiki = KNOWN_WIKI_ENTITIES[domain.toLowerCase()];
  if (knownWiki) {
    findings.push({
      signalId: 'bm_wikipedia',
      hasFinding: false,
      severity: 'Informational',
      findingDetails: `Global corporate standing verified: ${knownWiki}`,
      source: 'Wikipedia & Corporate Registry'
    });
    return findings;
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  let aiSearchSuccess = false;

  if (geminiApiKey) {
    try {
      const prompt = `You are a corporate intelligence analyst. Verify if the company '${companyName}' (domain: ${domain}) has a dedicated Wikipedia page or is otherwise a globally recognized, notable enterprise in public sources. Reply ONLY in valid JSON format: { "isNotable": boolean, "reason": "1-sentence explanation", "source": "Wikipedia or Other Credible Source" }`;
      
      const geminiRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const responseText = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (responseText) {
        const aiData = JSON.parse(responseText);
        aiSearchSuccess = true;
        
        if (aiData.isNotable) {
          findings.push({
            signalId: 'bm_wikipedia',
            hasFinding: false,
            severity: 'Informational',
            findingDetails: `Global corporate standing verified: ${aiData.reason}`,
            source: `Gemini AI (${aiData.source})`
          });
        } else {
          findings.push({
            signalId: 'bm_wikipedia',
            hasFinding: true,
            severity: 'High',
            findingDetails: `LACKS PUBLIC STANDING & CORPORATE NOTABILITY: ${aiData.reason} (No dedicated Wikipedia or major public records found).`,
            source: 'Gemini AI'
          });
        }
      }
    } catch (err) {
      console.warn(`[Maturity] Gemini API scan failed for ${domain}:`, err.message);
    }
  }

  if (!aiSearchSuccess) {
    try {
      const queryStr = `${companyName} company`;
      const wikiRes = await axios.get(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(queryStr)}&utf8=&format=json`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      const hits = wikiRes.data?.query?.search || [];
      const corporateHit = hits.find(hit => {
        const titleLow = hit.title.toLowerCase();
        const snippetLow = hit.snippet.toLowerCase();
        const cleanName = companyName.toLowerCase();
        return (titleLow.includes(cleanName) || snippetLow.includes(cleanName));
      });

      if (corporateHit) {
        findings.push({
          signalId: 'bm_wikipedia',
          hasFinding: false,
          severity: 'Informational',
          findingDetails: `Global notability verified: Corporate Wikipedia article found ("${corporateHit.title}").`,
          source: 'Wikipedia API'
        });
      } else {
        findings.push({
          signalId: 'bm_wikipedia',
          hasFinding: true,
          severity: 'High',
          findingDetails: 'LACKS PUBLIC STANDING: No dedicated corporate Wikipedia article found. Fails enterprise transparency requirement.',
          source: 'Wikipedia API'
        });
      }
    } catch (err) {
      console.warn(`[Maturity] Wikipedia scan failed for ${domain}:`, err.message);
      pushWikiFallback(findings, true);
    }
  }

  return findings;
}

function pushWhoisFallback(findings, isError) {
  findings.push({
    signalId: 'bm_domain_age',
    hasFinding: true,
    severity: 'Medium',
    findingDetails: isError ? 'API request limit exhausted or unavailable. Cannot verify domain age.' : 'WHOIS data missing creation date. Cannot verify domain operational history.',
    source: 'WHOIS'
  });
}

function pushFinanceFallback(findings, isError) {
  findings.push({
    signalId: 'bm_public_market',
    hasFinding: true,
    severity: 'Medium',
    findingDetails: 'Unverified public market standing (API limit exhausted). Applying transparency penalty.',
    source: 'Yahoo Finance API'
  });
}

function pushWikiFallback(findings, isError) {
  findings.push({
    signalId: 'bm_wikipedia',
    hasFinding: true,
    severity: 'High',
    findingDetails: 'LACKS PUBLIC STANDING: Unable to verify Wikipedia or corporate public records. Applying penalty.',
    source: 'Wikipedia API'
  });
}

module.exports = { scanMaturity };
