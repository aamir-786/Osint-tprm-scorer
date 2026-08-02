const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function scanCompliance(domain) {
  const findings = [];
  let browser;

  try {
    // Launch headless browser with stealth mode
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const page = await browser.newPage();
    
    // Set user agent to avoid basic bot blocks
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

    // Go to domain and wait for DOM to load (prevent hanging on blocked network requests)
    try {
      await page.goto(`https://${domain}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    } catch (_navErr) {
      console.warn(`[Compliance] Timeout or navigation error for ${domain}, proceeding with loaded content.`);
    }

    // Evaluate DOM to find Privacy Policy links
    const extractedLinks = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      const results = {
        privacyUrls: []
      };

      anchors.forEach(a => {
        const text = (a.innerText || '').toLowerCase().trim();
        const href = (a.href || '').toLowerCase();
        
        // Look for Privacy Policy
        if (text.includes('privacy policy') || text.includes('privacy notice') || text.includes('privacy statement') || text.includes('privacy') || href.includes('privacy-policy')) {
          results.privacyUrls.push(a.href);
        }
      });

      return results;
    });

    const uniquePrivacy = [...new Set(extractedLinks.privacyUrls)].filter(u => u && (u.startsWith('http') || u.startsWith('/'))).map(u => u.startsWith('/') ? `https://${domain}${u}` : u).slice(0, 3);

    // Fallback: If no links found in DOM, try checking common paths
    if (uniquePrivacy.length === 0) {
      const commonPaths = ['/privacy', '/privacy-policy', '/policies/privacy-policy', '/legal/privacy'];
      for (const path of commonPaths) {
        try {
          const fallbackUrl = `https://${domain}${path}`;
          const response = await page.goto(fallbackUrl, { waitUntil: 'domcontentloaded', timeout: 5000 });
          if (response && response.status() === 200) {
            uniquePrivacy.push(fallbackUrl);
            break; // Found one, no need to check others
          }
        } catch (e) {
          // Ignore navigation errors for fallbacks
        }
      }
    }

    // 1. Privacy Policy Assessment (Only signal used for high-reliability OSINT scoring)
    if (uniquePrivacy.length > 0) {
      findings.push({
        signalId: 'cp_privacy_policy',
        hasFinding: false,
        severity: 'Informational',
        findingDetails: `Privacy Policy links successfully extracted.`,
        source: 'Puppeteer DOM Scraper',
        evidencePayload: uniquePrivacy.map(url => ({ title: 'Privacy Policy Document', url }))
      });
    } else {
      findings.push({
        signalId: 'cp_privacy_policy',
        hasFinding: true,
        severity: 'Medium',
        findingDetails: `No Privacy Policy links detected in the rendered DOM or common paths.`,
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
