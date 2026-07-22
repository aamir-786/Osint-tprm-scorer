const axios = require('axios');

async function scanBusinessStability(domain) {
  const findings = [];
  const newsApiKey = process.env.NEWS_API_KEY;
  const companyName = domain.split('.')[0];

  if (newsApiKey) {
    try {
      // 1. Check for Bankruptcy
      const bankRes = await axios.get(`https://newsapi.org/v2/everything?q="${companyName}" AND bankruptcy&apiKey=${newsApiKey}`);
      if (bankRes.data.totalResults > 0) {
        findings.push({
          signalId: 'bs_bankruptcy',
          hasFinding: true,
          severity: 'Critical',
          findingDetails: `News found regarding potential bankruptcy (${bankRes.data.totalResults} articles).`,
          source: 'NewsAPI'
        });
      } else {
        findings.push({
          signalId: 'bs_bankruptcy',
          hasFinding: false,
          severity: 'Informational',
          findingDetails: 'No recent bankruptcy news detected.',
          source: 'NewsAPI'
        });
      }

      // 2. Check for Mass Layoffs
      const layoffRes = await axios.get(`https://newsapi.org/v2/everything?q="${companyName}" AND layoffs&apiKey=${newsApiKey}`);
      if (layoffRes.data.totalResults > 0) {
        findings.push({
          signalId: 'bs_layoffs',
          hasFinding: true,
          severity: 'High',
          findingDetails: `News found regarding mass layoffs (${layoffRes.data.totalResults} articles).`,
          source: 'NewsAPI'
        });
      } else {
        findings.push({
          signalId: 'bs_layoffs',
          hasFinding: false,
          severity: 'Informational',
          findingDetails: 'No recent mass layoff news detected.',
          source: 'NewsAPI'
        });
      }
    } catch (err) {
      console.error(`NewsAPI error for ${domain}:`, err.message);
    }
  } else {
    console.log(`[Stability] Skipping NewsAPI scan for ${domain} (No Key)`);
  }

  return findings;
}

module.exports = { scanBusinessStability };
