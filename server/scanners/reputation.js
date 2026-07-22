const axios = require('axios');

async function scanReputation(domain) {
  const findings = [];
  const newsApiKey = process.env.NEWS_API_KEY;
  const mediaStackApiKey = process.env.MEDIASTACK_API_KEY;
  const hibpApiKey = process.env.HIBP_API_KEY;
  const companyName = domain.split('.')[0];

  // 1. Negative News (NewsAPI or MediaStack)
  if (newsApiKey || mediaStackApiKey) {
    try {
      let totalResults = 0;
      
      if (newsApiKey) {
        const negativeRes = await axios.get(`https://newsapi.org/v2/everything?q="${companyName}" AND ("scandal" OR "fraud" OR "lawsuit" OR "breach")&apiKey=${newsApiKey}`);
        totalResults = negativeRes.data.totalResults;
      } else if (mediaStackApiKey) {
        // Fallback to MediaStack
        const negativeRes = await axios.get(`http://api.mediastack.com/v1/news?access_key=${mediaStackApiKey}&keywords=${companyName} scandal,fraud,lawsuit,breach`);
        totalResults = negativeRes.data.pagination ? negativeRes.data.pagination.total : 0;
      }

      if (totalResults > 0) {
        findings.push({
          signalId: 'rep_negative_news',
          hasFinding: true,
          severity: 'High',
          findingDetails: `Adverse media detected: ${totalResults} articles mentioning scandal, fraud, or lawsuits.`,
          source: newsApiKey ? 'NewsAPI' : 'MediaStack API'
        });
      } else {
        findings.push({
          signalId: 'rep_negative_news',
          hasFinding: false,
          severity: 'Informational',
          findingDetails: 'No adverse media found in recent news.',
          source: newsApiKey ? 'NewsAPI' : 'MediaStack API'
        });
      }
    } catch (err) {
      console.error(`Negative News API error for ${domain}:`, err.message);
    }
  } else {
    console.log(`[Reputation] Skipping News scan for ${domain} (No NewsAPI or MediaStack Key)`);
  }

  // 2. Data Breach (HIBP or mock)
  if (hibpApiKey) {
    try {
      const hibpRes = await axios.get(`https://haveibeenpwned.com/api/v3/breaches?domain=${domain}`, {
        headers: { 'hibp-api-key': hibpApiKey }
      });
      if (hibpRes.data && hibpRes.data.length > 0) {
        findings.push({
          signalId: 'rep_breach_history',
          hasFinding: true,
          severity: 'Critical',
          findingDetails: `Domain found in ${hibpRes.data.length} known data breaches.`,
          source: 'HaveIBeenPwned API'
        });
      } else {
        findings.push({
          signalId: 'rep_breach_history',
          hasFinding: false,
          severity: 'Informational',
          findingDetails: 'No known data breaches for this domain.',
          source: 'HaveIBeenPwned API'
        });
      }
    } catch (err) {
      console.error(`HIBP error for ${domain}:`, err.message);
    }
  }

  return findings;
}

module.exports = { scanReputation };
