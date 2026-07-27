const puppeteer = require('puppeteer');

async function scanCompliance(domain) {
  const findings = [];
  let browser;

  try {
    // Launch headless browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set user agent to avoid basic bot blocks
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

    // Go to domain and wait for network to be idle (so SPAs render)
    try {
      await page.goto(`https://${domain}`, { waitUntil: 'networkidle2', timeout: 15000 });
    } catch (_navErr) {
      console.warn(`[Compliance] networkidle2 timeout for ${domain}, proceeding with loaded content.`);
    }

    // Evaluate DOM to find Privacy Policy and DPA links
    const extractedLinks = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      const results = {
        privacyUrls: [],
        dpaUrls: []
      };

      anchors.forEach(a => {
        const text = (a.innerText || '').toLowerCase();
        const href = (a.href || '').toLowerCase();
        
        // Look for Privacy Policy
        if (text.includes('privacy policy') || text.includes('privacy notice') || text.includes('privacy') || href.includes('privacy-policy')) {
          results.privacyUrls.push(a.href);
        }
        
        // Look for DPA / Data Processing
        if (text.includes('dpa') || text.includes('data processing') || href.includes('dpa') || href.includes('data-processing')) {
          results.dpaUrls.push(a.href);
        }
      });

      return results;
    });

    const uniquePrivacy = [...new Set(extractedLinks.privacyUrls)].filter(u => u && u.startsWith('http')).slice(0, 3);
    const uniqueDpa = [...new Set(extractedLinks.dpaUrls)].filter(u => u && u.startsWith('http')).slice(0, 3);

    // 1. Privacy Policy Assessment
    if (uniquePrivacy.length > 0) {
      findings.push({
        signalId: 'cp_privacy_policy',
        hasFinding: false,
        severity: 'Informational',
        findingDetails: `Privacy Policy links successfully extracted via Headless DOM Rendering.`,
        source: 'Puppeteer DOM Scraper',
        evidencePayload: uniquePrivacy.map(url => ({ title: 'Privacy Policy Document', url }))
      });
    } else {
      findings.push({
        signalId: 'cp_privacy_policy',
        hasFinding: true,
        severity: 'Medium',
        findingDetails: `No Privacy Policy links detected in the rendered DOM.`,
        source: 'Puppeteer DOM Scraper'
      });
    }

    // 2. DPA Assessment
    if (uniqueDpa.length > 0) {
      findings.push({
        signalId: 'cp_dpa',
        hasFinding: false,
        severity: 'Informational',
        findingDetails: `Data Processing Addendum (DPA) links successfully extracted.`,
        source: 'Puppeteer DOM Scraper',
        evidencePayload: uniqueDpa.map(url => ({ title: 'Data Processing Agreement', url }))
      });
    } else {
      findings.push({
        signalId: 'cp_dpa',
        hasFinding: true,
        severity: 'Low',
        findingDetails: `No explicit DPA mentions or links detected in the rendered DOM.`,
        source: 'Puppeteer DOM Scraper'
      });
    }

  } catch (err) {
    findings.push({
      signalId: 'cp_privacy_policy',
      hasFinding: true,
      severity: 'Medium',
      findingDetails: `Browser automation failed to scan homepage: ${err.message}`,
      source: 'Puppeteer Engine'
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return findings;
}

module.exports = { scanCompliance };
