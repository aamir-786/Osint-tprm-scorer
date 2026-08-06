const axios = require('axios');

async function fetchUrl(url, timeoutMs = 8000, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function scanBusinessStability(domain, domainValidation) {
  const findings = [];
  const newsApiKey = process.env.NEWS_API_KEY;
  const mediaStackApiKey = process.env.MEDIASTACK_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const companyName = domain.split('.')[0];

  // Non-existent / Unregistered Domain handling
  if (domainValidation && !domainValidation.isRegistered) {
    findings.push({
      signalId: 'bs_bankruptcy',
      hasFinding: true,
      severity: 'Critical',
      findingDetails: `UNREGISTERED / NON-EXISTENT DOMAIN: '${domain}' has zero financial history or active business presence.`,
      source: 'DNS Validator'
    });
    findings.push({
      signalId: 'bs_layoffs',
      hasFinding: true,
      severity: 'High',
      findingDetails: `UNREGISTERED DOMAIN: Entity is unverified in corporate registries.`,
      source: 'DNS Validator'
    });
    return findings;
  }

  let bankResults = -1; // -1 means failed to fetch
  let layoffResults = -1;

  try {
    // 1. Try fetching from News APIs
    if (newsApiKey) {
      const bankRes = await fetchUrl(`https://newsapi.org/v2/everything?q="${companyName}" AND bankruptcy&apiKey=${newsApiKey}`);
      const bankData = await bankRes.json();
      if (bankData.status === 'ok') bankResults = bankData.totalResults;

      const layoffRes = await fetchUrl(`https://newsapi.org/v2/everything?q="${companyName}" AND layoffs&apiKey=${newsApiKey}`);
      const layoffData = await layoffRes.json();
      if (layoffData.status === 'ok') layoffResults = layoffData.totalResults;
    } else if (mediaStackApiKey) {
      const bankRes = await fetchUrl(`http://api.mediastack.com/v1/news?access_key=${mediaStackApiKey}&keywords=${companyName} bankruptcy`);
      const bankData = await bankRes.json();
      if (bankData.pagination) bankResults = bankData.pagination.total;

      const layoffRes = await fetchUrl(`http://api.mediastack.com/v1/news?access_key=${mediaStackApiKey}&keywords=${companyName} layoffs`);
      const layoffData = await layoffRes.json();
      if (layoffData.pagination) layoffResults = layoffData.pagination.total;
    }
  } catch (e) {
    console.warn(`[Stability] News API fetch failed:`, e.message);
  }

  // 2. Use Gemini AI as fallback / secondary verification
  if (bankResults === -1 && geminiApiKey) {
    try {
      const prompt = `You are a Third-Party Risk Management (TPRM) analyst. Perform a targeted web search to determine if the company at domain "${domain}" has any recent news of bankruptcy or mass layoffs. Reply ONLY in valid JSON format: { "bankruptcyDetected": boolean, "layoffsDetected": boolean, "details": "1-sentence summary" }`;

      const res = await fetchUrl(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, 15000, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (res.status === 200) {
        const data = await res.json();
        const text = data.candidates[0].content.parts[0].text;
        const resultJson = JSON.parse(text);

        bankResults = resultJson.bankruptcyDetected ? 5 : 0;
        layoffResults = resultJson.layoffsDetected ? 5 : 0;
      }
    } catch (err) {
      console.warn(`[Stability] Gemini AI fetch failed:`, err.message);
    }
  }

  // Process Bankruptcy
  if (bankResults > 0) {
    findings.push({
      signalId: 'bs_bankruptcy',
      hasFinding: true,
      severity: 'Critical',
      findingDetails: `News or AI detected potential bankruptcy (multiple signals found).`,
      source: 'News/AI API'
    });
  } else if (bankResults === 0) {
    findings.push({
      signalId: 'bs_bankruptcy',
      hasFinding: false,
      severity: 'Informational',
      findingDetails: 'No recent bankruptcy news detected.',
      source: 'News/AI API'
    });
  } else {
    // If domain is very young (< 1 yr), apply penalty for lack of financial track record
    const ageInYears = domainValidation?.whoisData?.ageInYears;
    const severity = ageInYears !== undefined && ageInYears < 1.0 ? 'High' : 'Medium';
    findings.push({
      signalId: 'bs_bankruptcy',
      hasFinding: true,
      severity,
      findingDetails: ageInYears !== undefined && ageInYears < 1.0
        ? `Early-stage startup domain (${ageInYears.toFixed(1)} yrs old). Unverified financial stability and lack of public filings.`
        : 'Unable to properly fetch financial stability data (Bankruptcy). Applying penalty for lack of transparency.',
      source: 'News/AI API'
    });
  }

  // Process Layoffs
  if (layoffResults > 0) {
    findings.push({
      signalId: 'bs_layoffs',
      hasFinding: true,
      severity: 'High',
      findingDetails: `News or AI detected mass layoffs (multiple signals found).`,
      source: 'News/AI API'
    });
  } else if (layoffResults === 0) {
    findings.push({
      signalId: 'bs_layoffs',
      hasFinding: false,
      severity: 'Informational',
      findingDetails: 'No recent mass layoff news detected.',
      source: 'News/AI API'
    });
  } else {
    const ageInYears = domainValidation?.whoisData?.ageInYears;
    const severity = ageInYears !== undefined && ageInYears < 1.0 ? 'Medium' : 'Low';
    findings.push({
      signalId: 'bs_layoffs',
      hasFinding: true,
      severity,
      findingDetails: ageInYears !== undefined && ageInYears < 1.0
        ? `Early-stage startup domain (${ageInYears.toFixed(1)} yrs old). Unverified workforce stability.`
        : 'Unable to properly fetch financial stability data (Layoffs). Applying penalty for lack of transparency.',
      source: 'News/AI API'
    });
  }

  return findings;
}

module.exports = { scanBusinessStability };
