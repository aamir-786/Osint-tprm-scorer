// Attempt to load yahoo-finance2
process.env.YF_SUPPRESS_NOTICES = 'true';
let yahooFinance;
try {
  yahooFinance = require('yahoo-finance2').default;
} catch (e) {
  console.log("yahoo-finance2 not installed yet, skipping finance checks.");
}

const domainsToTest = [
  'salesforce.com',
  'crowdstrike.com',
  'tesla.com',
  'vercel.com',
  'notion.so',
  'linear.app',
  'anthropic.com',
  'ycombinator.com',
  'baseten.co',
  'acmecorp-fake123.com'
];

// Helper to extract company name
function getCompanyName(domain) {
  const namePart = domain.split('.')[0];
  if (namePart.toLowerCase() === 'ycombinator') return 'Y Combinator';
  return namePart.charAt(0).toUpperCase() + namePart.slice(1);
}

async function testMaturitySignals() {
  console.log('Testing NEW Business Maturity & Financial Signals...');
  console.log('=====================================================\n');

  for (const domain of domainsToTest) {
    const companyName = getCompanyName(domain);
    console.log(`[Testing] Domain: ${domain} (Company: ${companyName})`);
    const startTime = Date.now();

    // 1. Wikipedia Notability Check
    let wikiFound = false;
    let wikiTitle = '';
    try {
      const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch="${encodeURIComponent(companyName)}"&utf8=&format=json`, {
        headers: { 'User-Agent': 'Wahid-OSINT-Scorer/1.0 (wahid@example.com)' }
      });
      const wikiData = await wikiRes.json();
      if (wikiData && wikiData.query && wikiData.query.search.length > 0) {
        const firstHit = wikiData.query.search[0];
        if (firstHit.title.toLowerCase().includes(companyName.toLowerCase()) || firstHit.snippet.toLowerCase().includes('company')) {
            wikiFound = true;
            wikiTitle = firstHit.title;
        }
      }
    } catch (e) {
      console.log(`  [Error] Wiki fetch failed: ${e.message}`);
    }

    // 2. Yahoo Finance (Public Ticker & Market Cap)
    let financeFound = false;
    let tickerStr = '';
    if (yahooFinance) {
      try {
        const searchRes = await yahooFinance.search(companyName);
        if (searchRes.quotes && searchRes.quotes.length > 0) {
          const topQuote = searchRes.quotes.find(q => q.isYahooFinance === true && q.quoteType === 'EQUITY');
          if (topQuote) {
            financeFound = true;
            tickerStr = `${topQuote.symbol} (${topQuote.shortname || topQuote.longname || 'Unknown'})`;
          }
        }
      } catch (e) {
        console.log(`  [Error] Finance fetch failed: ${e.message}`);
      }
    }

    const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`  => ✅ Wikipedia: ${wikiFound ? 'FOUND (' + wikiTitle + ')' : 'MISSING (No Notability)'}`);
    if (yahooFinance) console.log(`  => ✅ Public Market: ${financeFound ? 'FOUND Ticker ' + tickerStr : 'MISSING (Private/Startup)'}`);
    console.log(`  => (Fetched in ${timeTaken}s)\n`);
  }
}

testMaturitySignals();
