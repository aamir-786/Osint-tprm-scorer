const { scanCompliance } = require('../server/scanners/compliance.js');

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

async function runTests() {
  console.log('Starting Full Compliance Scraper Validation...');
  console.log('==============================================\n');
  
  for (const domain of domainsToTest) {
    console.log(`[Testing] Domain: ${domain}`);
    try {
      const startTime = Date.now();
      const findings = await scanCompliance(domain);
      const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`  => Scan completed in ${timeTaken}s\n`);
      
      const signals = ['cp_privacy_policy', 'cp_dpa', 'cp_iso_csa'];
      
      for (const sig of signals) {
        const finding = findings.find(f => f.signalId === sig);
        if (finding) {
          if (!finding.hasFinding) {
            console.log(`    ✅ [${sig}]: Found! (${finding.severity})`);
            if (finding.evidencePayload) {
               console.log(`       Links: ${finding.evidencePayload.map(e => e.url).join(', ')}`);
            }
          } else {
            console.log(`    ❌ [${sig}]: Not Found! Penalty applied (${finding.severity})`);
            console.log(`       Details: ${finding.findingDetails}`);
          }
        } else {
          console.log(`    ⚠️ [${sig}]: Signal missing from response!`);
        }
      }
    } catch (err) {
      console.log(`  => 💥 FATAL ERROR during scan: ${err.message}`);
    }
    console.log('\n----------------------------------------------\n');
  }
  
  console.log('Validation Completed.');
}

runTests();
