const { scanCybersecurity } = require('./scanners/cybersecurity');
const { scanCompliance } = require('./scanners/compliance');
const { scanBusinessStability } = require('./scanners/businessStability');
const { scanReputation } = require('./scanners/reputation');
const { scanLegal } = require('./scanners/legal');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '../.env' });

async function runTests() {
  const testDomains = ['example.com', 'github.com', 'nonexistent-fake-domain123.com'];

  for (const domain of testDomains) {
    console.log(`\n--- Testing domain: ${domain} ---`);
    try {
      console.log('Testing Cybersecurity...');
      const cyber = await scanCybersecurity(domain);
      console.log('Cybersecurity returned', cyber.length, 'findings');

      console.log('Testing Compliance...');
      const compliance = await scanCompliance(domain);
      console.log('Compliance returned', compliance.length, 'findings');

      console.log('Testing Business Stability...');
      const stability = await scanBusinessStability(domain);
      console.log('Stability returned', stability.length, 'findings');

      console.log('Testing Reputation...');
      const reputation = await scanReputation(domain);
      console.log('Reputation returned', reputation.length, 'findings');

      console.log('Testing Legal...');
      const legal = await scanLegal(domain);
      console.log('Legal returned', legal.length, 'findings');

      console.log(`Success for ${domain}`);
    } catch (e) {
      console.error(`Error testing ${domain}:`, e);
    }
  }
}

runTests();
