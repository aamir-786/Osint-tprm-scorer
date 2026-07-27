const { scanCompliance } = require('./scanners/compliance');

async function runTests() {
  console.log("===========================================");
  console.log("   PUPPETEER COMPLIANCE SCANNER TESTS      ");
  console.log("===========================================\n");

  const domainsToTest = [
    'stripe.com', // Expected: Should find Privacy Policy
    'openai.com', // Expected: Should find Privacy Policy
    'vulnerable-vendor.com' // Expected: Likely won't find anything
  ];

  for (const domain of domainsToTest) {
    console.log(`\n[+] Testing Domain: ${domain}`);
    console.log(`    Launching headless browser...`);
    
    try {
      const startTime = Date.now();
      const findings = await scanCompliance(domain);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log(`    Scan Completed in ${duration}s`);
      
      findings.forEach(f => {
        const status = f.hasFinding ? `[FAIL: ${f.severity}]` : '[PASS]';
        console.log(`    -> ${status} ${f.signalId}`);
        console.log(`       Details: ${f.findingDetails}`);
        if (f.evidencePayload && f.evidencePayload.length > 0) {
          console.log(`       Extracted Links:`);
          f.evidencePayload.forEach(e => console.log(`         - ${e.url}`));
        }
      });
    } catch (err) {
      console.error(`    [ERROR] Failed to test ${domain}:`, err.message);
    }
  }

  console.log("\n===========================================");
  console.log("              TEST RUN FINISHED            ");
  console.log("===========================================");
}

runTests();
