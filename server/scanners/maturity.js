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

// Helper to extract company name
function getCompanyName(domain) {
  const knownEntities = {
    'openai.com': 'OpenAI',
    'google.com': 'Google',
    'stripe.com': 'Stripe',
    'github.com': 'GitHub',
    'slack.com': 'Slack',
    'apple.com': 'Apple',
    'microsoft.com': 'Microsoft'
  };
  if (knownEntities[domain]) return knownEntities[domain];
  
  const namePart = domain.split('.')[0];
  return namePart.charAt(0).toUpperCase() + namePart.slice(1);
}

async function scanMaturity(domain) {
  const findings = [];
  const companyName = getCompanyName(domain);

  // --- 1. Domain Registration Age (WHOIS) ---
  try {
    const results = await whois(domain);
    const creationDateStr = results.creationDate || results.domainNameExtDt || results.createdDate || results.creationdate || results.registered;
    
    if (creationDateStr) {
      const creationDate = new Date(creationDateStr);
      if (!isNaN(creationDate)) {
        const ageInMs = Date.now() - creationDate.getTime();
        const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
        
        if (ageInYears > 5) {
          findings.push({
            signalId: 'bm_domain_age',
            hasFinding: false,
            severity: 'Informational',
            findingDetails: `Domain is established (${ageInYears.toFixed(1)} years old).`,
            source: 'WHOIS'
          });
        } else if (ageInYears >= 2) {
          findings.push({
            signalId: 'bm_domain_age',
            hasFinding: true,
            severity: 'Low',
            findingDetails: `Domain is relatively young (${ageInYears.toFixed(1)} years old).`,
            source: 'WHOIS'
          });
        } else if (ageInYears >= 0.5) {
          findings.push({
            signalId: 'bm_domain_age',
            hasFinding: true,
            severity: 'Medium',
            findingDetails: `Domain is recent startup territory (${ageInYears.toFixed(1)} years old).`,
            source: 'WHOIS'
          });
        } else {
          findings.push({
            signalId: 'bm_domain_age',
            hasFinding: true,
            severity: 'High',
            findingDetails: `Domain is extremely new (less than 6 months old). High risk of immaturity.`,
            source: 'WHOIS'
          });
        }
      } else {
         pushWhoisFallback(findings, false);
      }
    } else {
       pushWhoisFallback(findings, false);
    }
  } catch (err) {
    console.warn(`[Maturity] WHOIS scan failed for ${domain}:`, err.message);
    pushWhoisFallback(findings, true);
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
            severity: 'Low',
            findingDetails: 'Company is not publicly traded (Private or Startup).',
            source: 'Yahoo Finance API'
          });
        }
      } else {
        findings.push({
          signalId: 'bm_public_market',
          hasFinding: true,
          severity: 'Low',
          findingDetails: 'Company is not publicly traded (Private or Startup).',
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

  // --- 3. Global Notability (Gemini AI + Wikipedia Fallback) ---
  const geminiApiKey = process.env.GEMINI_API_KEY;
  let aiSearchSuccess = false;

  if (geminiApiKey) {
    try {
      const prompt = `You are a corporate intelligence analyst. Verify if the company '${companyName}' (domain: ${domain}) has a dedicated Wikipedia page or is otherwise a globally recognized, notable enterprise. Reply ONLY in valid JSON format: { "isNotable": boolean, "reason": "1-sentence explanation", "source": "Wikipedia or Other Credible Source" }`;
      
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
            findingDetails: `Global notability verified by AI: ${aiData.reason}`,
            source: `Gemini AI (${aiData.source})`
          });
        } else {
          findings.push({
            signalId: 'bm_wikipedia',
            hasFinding: true,
            severity: 'Low',
            findingDetails: `AI analysis: ${aiData.reason}`,
            source: 'Gemini AI'
          });
        }
      }
    } catch (err) {
      console.warn(`[Maturity] Gemini API scan failed for ${domain}:`, err.message);
      // Fallback will execute below since aiSearchSuccess is false
    }
  }

  // Fallback to raw Wikipedia API if Gemini fails or is not configured
  if (!aiSearchSuccess) {
    try {
      const wikiRes = await axios.get(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch="${encodeURIComponent(companyName)}"&utf8=&format=json`, {
        headers: {
          'User-Agent': 'Wahid-OSINT-Scorer/1.0 (wahid@example.com)'
        }
      });
      
      if (wikiRes.data && wikiRes.data.query && wikiRes.data.query.search.length > 0) {
        const firstHit = wikiRes.data.query.search[0];
        if (firstHit.title.toLowerCase().includes(companyName.toLowerCase()) || firstHit.snippet.toLowerCase().includes('company')) {
          findings.push({
            signalId: 'bm_wikipedia',
            hasFinding: false,
            severity: 'Informational',
            findingDetails: `Global notability verified: Wikipedia article found ("${firstHit.title}").`,
            source: 'Wikipedia API'
          });
        } else {
          findings.push({
            signalId: 'bm_wikipedia',
            hasFinding: true,
            severity: 'Low',
            findingDetails: 'No dedicated corporate Wikipedia article found. Lacks global notability.',
            source: 'Wikipedia API'
          });
        }
      } else {
        findings.push({
          signalId: 'bm_wikipedia',
          hasFinding: true,
          severity: 'Low',
          findingDetails: 'No dedicated corporate Wikipedia article found. Lacks global notability.',
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
    hasFinding: false,
    severity: 'Informational',
    findingDetails: isError ? 'API request limit exhausted or unavailable. Cannot verify this signal.' : 'WHOIS data missing creation date. Cannot verify this signal.',
    source: 'WHOIS'
  });
}

function pushFinanceFallback(findings, isError) {
  findings.push({
    signalId: 'bm_public_market',
    hasFinding: false,
    severity: 'Informational',
    findingDetails: 'API request limit exhausted or unavailable. Cannot verify this signal.',
    source: 'Yahoo Finance API'
  });
}

function pushWikiFallback(findings, isError) {
  findings.push({
    signalId: 'bm_wikipedia',
    hasFinding: false,
    severity: 'Informational',
    findingDetails: 'API request limit exhausted or unavailable. Cannot verify this signal.',
    source: 'Wikipedia API'
  });
}

module.exports = { scanMaturity };
