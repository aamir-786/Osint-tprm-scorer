const axios = require('axios');

async function scanReputation(domain) {
  const findings = [];
  const newsApiKey = process.env.NEWS_API_KEY;
  const mediaStackApiKey = process.env.MEDIASTACK_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const companyName = domain.split('.')[0];

  // 1. Negative News
  if (newsApiKey || mediaStackApiKey) {
    try {
      let totalResults = 0;
      let rawArticles = [];
      
      if (newsApiKey) {
        const negativeRes = await axios.get(`https://newsapi.org/v2/everything?q="${companyName}" AND ("scandal" OR "fraud" OR "lawsuit" OR "breach")&apiKey=${newsApiKey}`);
        totalResults = negativeRes.data.totalResults || 0;
        rawArticles = negativeRes.data.articles || [];
      } else if (mediaStackApiKey) {
        const negativeRes = await axios.get(`http://api.mediastack.com/v1/news?access_key=${mediaStackApiKey}&keywords=${companyName} scandal,fraud,lawsuit,breach`);
        totalResults = negativeRes.data.pagination ? negativeRes.data.pagination.total : 0;
        rawArticles = negativeRes.data.data || [];
      }

      if (totalResults > 0 && rawArticles.length > 0) {
        const evidencePayload = rawArticles.slice(0, 5).map(a => ({
          title: a.title,
          description: a.description || 'No description available',
          url: a.url,
          source: a.source?.name || a.source || 'Unknown Publisher'
        }));

        let findingDetails = `Adverse media detected: ${totalResults} articles mentioning scandal, fraud, or lawsuits.`;

        // Gemini AI Summarization
        if (geminiApiKey) {
          try {
            const prompt = `You are a Third-Party Risk Management (TPRM) analyst. Write a highly concise, professional 1-2 sentence executive summary of the following adverse news articles about ${companyName}. Only state facts based on the articles. Articles: ${JSON.stringify(evidencePayload)}`;
            
            const geminiRes = await axios.post(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
              {
                contents: [{ parts: [{ text: prompt }] }]
              },
              { headers: { 'Content-Type': 'application/json' } }
            );

            const summary = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (summary) {
              findingDetails = `AI Summary: ${summary.trim()}`;
            }
          } catch (aiErr) {
            console.error(`Gemini API error for ${domain}:`, aiErr.message);
            findingDetails += ` Top headline: ${evidencePayload[0].title}`;
          }
        } else {
          findingDetails += ` Top headline: ${evidencePayload[0].title}`;
        }

        findings.push({
          signalId: 'rep_negative_news',
          hasFinding: true,
          severity: 'High',
          findingDetails,
          source: newsApiKey ? 'NewsAPI' : 'MediaStack API',
          evidencePayload
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

  // 2. Data Breach baseline
  findings.push({
    signalId: 'rep_breach_history',
    hasFinding: false,
    severity: 'Informational',
    findingDetails: 'Data breach verification requires an external API integration. Assuming no known breaches.',
    source: 'Heuristic Baseline'
  });

  return findings;
}

module.exports = { scanReputation };
