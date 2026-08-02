const puppeteer = require('puppeteer');

const domainsToTest = [
  'google.com',
  'microsoft.com',
  'apple.com',
  'github.com',
  'slack.com',
  'stripe.com',
  'asana.com',
  'dropbox.com',
  'box.com',
  'zoom.us',
  'effectiverm.com',
  'archerirm.com',
  'example.com',
  'neverssl.com',
  'perdu.com'
];

async function runAdvancedAlternativeTests() {
  console.log('Testing ADVANCED Alternative Compliance Signals...');
  console.log('==================================================\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });

    for (const domain of domainsToTest) {
      console.log(`[Testing] Domain: ${domain}`);
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

      const results = {
        tosFound: false,
        cookieBannerFound: false,
        gdprCcpaFound: false,
        timeTaken: 0
      };

      const startTime = Date.now();
      try {
        await page.goto(`https://${domain}`, { waitUntil: 'networkidle2', timeout: 15000 });
      } catch (e) {
        // ignore timeout
      }

      // Evaluate Homepage for ToS, Privacy, Cookie
      const homeEval = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a'));
        let tosUrls = [];
        let privacyUrls = [];

        anchors.forEach(a => {
          const text = (a.innerText || '').toLowerCase().trim();
          const href = (a.href || '').toLowerCase();
          
          // ADVANCED ToS KEYWORDS
          const tosKeywords = ['terms of service', 'terms of use', 'terms & conditions', 'user agreement', 'customer agreement', 'legal terms', 'legal hub', 'service agreement'];
          const tosHrefKeywords = ['/terms', '/legal', '/user-agreement', '/tos', '/customer-agreement', '/policies/terms'];
          
          if (tosKeywords.some(kw => text.includes(kw)) || tosHrefKeywords.some(kw => href.includes(kw))) {
            if (!text.includes('privacy')) { // avoid confusing with privacy policy
               tosUrls.push(a.href);
            }
          }
          
          if (text.includes('privacy policy') || text.includes('privacy notice') || text.includes('privacy statement') || text.includes('privacy') || href.includes('privacy-policy')) {
            privacyUrls.push(a.href);
          }
        });

        // ADVANCED COOKIE BANNER DETECTION
        let hasCookieBanner = false;
        
        // 1. Check Scripts for Providers
        const scripts = Array.from(document.querySelectorAll('script'));
        const providers = ['onetrust', 'cookiebot', 'osano', 'trustarc', 'cookieyes', 'quantcast', 'usercentrics', 'didomi'];
        if (scripts.some(s => providers.some(p => s.src && s.src.toLowerCase().includes(p)))) {
           hasCookieBanner = true;
        }
        
        // 2. Check Global Variables
        if (window.OneTrust || window.Cookiebot || window.OnetrustActiveGroups) {
           hasCookieBanner = true;
        }

        // 3. Deep DOM Check for common banner IDs/Classes
        if (document.querySelector('#onetrust-consent-sdk') || document.querySelector('#CybotCookiebotDialog') || document.querySelector('.osano-cm-window')) {
           hasCookieBanner = true;
        }

        return { tosUrls, privacyUrls, hasCookieBanner };
      });

      if (homeEval.tosUrls.length > 0) results.tosFound = true;
      if (homeEval.hasCookieBanner) results.cookieBannerFound = true;

      // Deep Scan Privacy Policy for GDPR/CCPA
      const uniquePrivacy = [...new Set(homeEval.privacyUrls)].filter(u => u && u.startsWith('http')).slice(0, 1);
      
      if (uniquePrivacy.length > 0) {
        try {
          await page.goto(uniquePrivacy[0], { waitUntil: 'networkidle2', timeout: 15000 });
          
          // Scroll down to trigger lazy loading
          await page.evaluate(async () => {
              await new Promise((resolve) => {
                  let totalHeight = 0;
                  const distance = 100;
                  const timer = setInterval(() => {
                      const scrollHeight = document.body.scrollHeight;
                      window.scrollBy(0, distance);
                      totalHeight += distance;
                      if(totalHeight >= scrollHeight - window.innerHeight || totalHeight > 5000){
                          clearInterval(timer);
                          resolve();
                      }
                  }, 50);
              });
          });

          // Evaluate main document and all iframes
          const privacyEval = await page.evaluate(() => {
            const keywords = ['gdpr', 'general data protection regulation', 'ccpa', 'california consumer privacy act', 'cpra', 'vcdpa'];
            
            let allText = document.body ? document.body.innerText.toLowerCase() : '';
            
            // Try to extract text from iframes (same-origin only)
            const frames = document.querySelectorAll('iframe');
            frames.forEach(f => {
               try {
                   if (f.contentDocument && f.contentDocument.body) {
                       allText += ' ' + f.contentDocument.body.innerText.toLowerCase();
                   }
               } catch(e) { /* CORS error */ }
            });

            return keywords.some(kw => allText.includes(kw));
          });
          if (privacyEval) results.gdprCcpaFound = true;
        } catch (e) {
          // ignore deep scan timeout
        }
      }

      await page.close();
      results.timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`  => ✅ Terms of Service: ${results.tosFound ? 'FOUND' : 'MISSING'}`);
      console.log(`  => ✅ Cookie Banner:    ${results.cookieBannerFound ? 'DETECTED' : 'MISSING'}`);
      console.log(`  => ✅ GDPR/CCPA Text:   ${results.gdprCcpaFound ? 'FOUND in Privacy Policy' : 'MISSING'}`);
      console.log(`  => (Scan completed in ${results.timeTaken}s)\n`);
    }

  } catch (err) {
    console.log(`FATAL ERROR: ${err.message}`);
  } finally {
    if (browser) await browser.close();
  }
}

runAdvancedAlternativeTests();
