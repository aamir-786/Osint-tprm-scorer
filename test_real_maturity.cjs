const fs = require('fs');
const envFile = fs.readFileSync('.env', 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1]] = match[2].replace(/"/g, '');
  }
});

const { scanMaturity } = require('./server/scanners/maturity');

async function testRealEngine() {
  console.log('Testing Core Engine: Business Maturity Scanner');
  console.log('==============================================\n');

  const domains = ['devsinc.com'];

  for (const domain of domains) {
    console.log(`[Scanning] ${domain}...`);
    const startTime = Date.now();
    
    // Call the actual engine logic
    const findings = await scanMaturity(domain);
    
    const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`Scan completed in ${timeTaken}s\nFindings:`);
    
    findings.forEach(finding => {
      let icon = finding.severity === 'Informational' ? '🟢' : (finding.severity === 'Low' ? '🟡' : '🔴');
      console.log(`  ${icon} [${finding.signalId}] Severity: ${finding.severity}`);
      console.log(`     Details: ${finding.findingDetails}`);
      console.log(`     Source:  ${finding.source}`);
    });
    console.log('\n----------------------------------------------\n');
  }
}

testRealEngine();
