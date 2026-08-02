const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { scanCybersecurity } = require('./scanners/cybersecurity');
const { scanCompliance } = require('./scanners/compliance');
const { scanBusinessStability } = require('./scanners/businessStability');
const { scanReputation } = require('./scanners/reputation');
const { scanLegal } = require('./scanners/legal');
const { scanMaturity } = require('./scanners/maturity');

async function runTests() {
  const vendors = [
    'openai.com', 
    'yandex.ru', 
    'ftx.com', 
    'very-new-startup-xyz123.io'
  ];

  const results = {};

  for (const domain of vendors) {
    console.log(`\n--- Scanning ${domain} ---`);
    results[domain] = {
      cybersecurity: [],
      compliance: [],
      businessStability: [],
      reputation: [],
      legal: [],
      maturity: []
    };

    try {
      console.log('  -> Cybersecurity...');
      results[domain].cybersecurity = await scanCybersecurity(domain);
      
      console.log('  -> Compliance...');
      results[domain].compliance = await scanCompliance(domain);
      
      console.log('  -> Business Stability...');
      results[domain].businessStability = await scanBusinessStability(domain);
      
      console.log('  -> Reputation...');
      results[domain].reputation = await scanReputation(domain);
      
      console.log('  -> Legal & Geopolitical...');
      results[domain].legal = await scanLegal(domain);
      
      console.log('  -> Maturity...');
      results[domain].maturity = await scanMaturity(domain);
      
    } catch (e) {
      console.error(`Error scanning ${domain}:`, e.message);
    }
  }

  const outPath = path.join(__dirname, 'test-results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nTest results written to ${outPath}`);
}

runTests();
