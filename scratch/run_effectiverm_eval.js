const { validateDomain } = require('./server/utils/domainValidator.js');
const { scanMaturity } = require('./server/scanners/maturity.js');
const { scanBusinessStability } = require('./server/scanners/businessStability.js');
const { scanCybersecurity } = require('./server/scanners/cybersecurity.js');

async function testEffectiverm() {
  const domain = 'effectiverm.com';
  const domainValidation = await validateDomain(domain);
  
  console.log('--- DOMAIN VALIDATION ---');
  console.log(domainValidation);

  const maturityFindings = await scanMaturity(domain, domainValidation);
  const stabilityFindings = await scanBusinessStability(domain, domainValidation);
  const cyberFindings = await scanCybersecurity(domain, domainValidation);

  console.log('\n--- MATURITY FINDINGS ---');
  console.log(maturityFindings);

  console.log('\n--- STABILITY FINDINGS ---');
  console.log(stabilityFindings);

  console.log('\n--- CYBER FINDINGS ---');
  console.log(cyberFindings);
}

testEffectiverm();
