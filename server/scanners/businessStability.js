const axios = require('axios');

async function scanBusinessStability(domain) {
  const findings = [];
  const newsApiKey = process.env.NEWS_API_KEY;
  const mediaStackApiKey = process.env.MEDIASTACK_API_KEY;
  const companyName = domain.split('.')[0];

  if (newsApiKey || mediaStackApiKey) {
    try {
      // 1. Check for Bankruptcy
      let bankResults = 0;
      if (newsApiKey) {
        const bankRes = await axios.get(`https://newsapi.org/v2/everything?q="${companyName}" AND bankruptcy&apiKey=${newsApiKey}`);
        bankResults = bankRes.data.totalResults;
      } else if (mediaStackApiKey) {
        const bankRes = await axios.get(`http://api.mediastack.com/v1/news?access_key=${mediaStackApiKey}&keywords=${companyName} bankruptcy`);
        bankResults = bankRes.data.pagination ? bankRes.data.pagination.total : 0;
      }

      if (bankResults > 0) {
        findings.push({
          signalId: 'bs_bankruptcy',
          hasFinding: true,
          severity: 'Critical',
          findingDetails: `News found regarding potential bankruptcy (${bankResults} articles).`,
          source: newsApiKey ? 'NewsAPI' : 'MediaStack API'
        });
      } else {
        findings.push({
          signalId: 'bs_bankruptcy',
          hasFinding: false,
          severity: 'Informational',
          findingDetails: 'No recent bankruptcy news detected.',
          source: newsApiKey ? 'NewsAPI' : 'MediaStack API'
        });
      }

      // 2. Check for Mass Layoffs
      let layoffResults = 0;
      if (newsApiKey) {
        const layoffRes = await axios.get(`https://newsapi.org/v2/everything?q="${companyName}" AND layoffs&apiKey=${newsApiKey}`);
        layoffResults = layoffRes.data.totalResults;
      } else if (mediaStackApiKey) {
        const layoffRes = await axios.get(`http://api.mediastack.com/v1/news?access_key=${mediaStackApiKey}&keywords=${companyName} layoffs`);
        layoffResults = layoffRes.data.pagination ? layoffRes.data.pagination.total : 0;
      }

      if (layoffResults > 0) {
        findings.push({
          signalId: 'bs_layoffs',
          hasFinding: true,
          severity: 'High',
          findingDetails: `News found regarding mass layoffs (${layoffResults} articles).`,
          source: newsApiKey ? 'NewsAPI' : 'MediaStack API'
        });
      } else {
        findings.push({
          signalId: 'bs_layoffs',
          hasFinding: false,
          severity: 'Informational',
          findingDetails: 'No recent mass layoff news detected.',
          source: newsApiKey ? 'NewsAPI' : 'MediaStack API'
        });
      }
    } catch (err) {
      if (err.response && [401, 403, 429].includes(err.response.status)) {
         findings.push({
           signalId: 'bs_bankruptcy',
           hasFinding: false,
           severity: 'Informational',
           findingDetails: 'News API rate limited or invalid key. Skipping scan.',
           source: 'News API'
         });
      }
      console.warn(`[Stability] News API scan failed for ${domain}:`, err.message);
    }
  } else {
    console.log(`[Stability] Skipping News scan for ${domain} (No NewsAPI or MediaStack Key)`);
  }

  return findings;
}

module.exports = { scanBusinessStability };
