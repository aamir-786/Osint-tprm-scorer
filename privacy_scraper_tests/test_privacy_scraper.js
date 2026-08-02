const { scanCompliance } = require('../server/scanners/compliance');

const domainsToTest = [
  // With Privacy Policies
  'google.com',
  'microsoft.com',
  'apple.com',
  'amazon.com',
  'github.com',
  
  // Without / Unlikely to have parseable Privacy Policies
  'example.com',
  'neverssl.com',
  'httpstat.us',
  'perdu.com',
  'blank.org'
];

async function runTests() {
  console.log('Starting Privacy Scraper Validation...');
  console.log('======================================\n');
  
  for (const domain of domainsToTest) {
    console.log(`[Testing] Domain: ${domain}`);
    try {
      const startTime = Date.now();
      const findings = await scanCompliance(domain);
      const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
      
      const privacyFinding = findings.find(f => f.signalId === 'cp_privacy_policy');
      if (privacyFinding) {
        if (!privacyFinding.hasFinding) {
          console.log(`  => ✅ SUCCESS (Found Privacy Policy) in ${timeTaken}s`);
          console.log(`     Links extracted: ${privacyFinding.evidencePayload.map(e => e.url).join(', ')}`);
        } else {
          console.log(`  => ❌ NO PRIVACY POLICY FOUND in ${timeTaken}s`);
          console.log(`     Details: ${privacyFinding.findingDetails}`);
        }
      } else {
        console.log(`  => ⚠️ ERROR: cp_privacy_policy signal not returned by scanner!`);
      }
    } catch (err) {
      console.log(`  => 💥 FATAL ERROR during scan: ${err.message}`);
    }
    console.log('--------------------------------------');
  }
  
  console.log('\nValidation Completed.');
}

runTests();
