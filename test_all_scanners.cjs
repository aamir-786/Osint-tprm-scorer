const fs = require('fs');
const path = require('path');

// Manually parse .env since dotenv might not be properly resolving in this context
try {
  const envFile = fs.readFileSync('.env', 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1]] = match[2].replace(/"/g, '').trim();
    }
  });
} catch (e) {
  console.log("No .env file found or failed to parse");
}

const { scanCybersecurity } = require('./server/scanners/cybersecurity');
const { scanCompliance } = require('./server/scanners/compliance');
const { scanBusinessStability } = require('./server/scanners/businessStability');
const { scanReputation } = require('./server/scanners/reputation');
const { scanLegal } = require('./server/scanners/legal');
const { scanMaturity } = require('./server/scanners/maturity');
const { scanESG } = require('./server/scanners/esg');
const { scanGeopolitical } = require('./server/scanners/geopolitical');
const { scanNthParty } = require('./server/scanners/nth_party');
const { scanResilience } = require('./server/scanners/resilience');

const testDomains = [
  'github.com',
  'devsinc.com',
  'effectiverm.com',
  'thisisafakedomain12345.xyz'
];

async function runComprehensiveTests() {
  console.log('Starting Comprehensive Scanners Test...');
  let mdContent = `# Comprehensive Scanner Test Results\n\n`;
  mdContent += `**Date:** ${new Date().toISOString()}\n\n`;
  mdContent += `Testing all categories and signals across multiple domains.\n\n`;

  for (const domain of testDomains) {
    console.log(`\nTesting Domain: ${domain}`);
    mdContent += `## Domain: \`${domain}\`\n\n`;

    const categories = [
      { name: 'Cybersecurity', fn: scanCybersecurity },
      { name: 'Compliance', fn: scanCompliance },
      { name: 'Business Stability', fn: scanBusinessStability },
      { name: 'Reputation', fn: scanReputation },
      { name: 'Legal', fn: scanLegal },
      { name: 'Maturity', fn: scanMaturity },
      { name: 'ESG', fn: scanESG },
      { name: 'Geopolitical', fn: scanGeopolitical },
      { name: 'Nth-Party', fn: scanNthParty },
      { name: 'Resilience', fn: scanResilience }
    ];

    for (const cat of categories) {
      console.log(`  -> Running ${cat.name}...`);
      mdContent += `### Category: ${cat.name}\n`;
      try {
        const startTime = Date.now();
        
        // Add a timeout of 15 seconds to prevent hanging
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Scanner timeout after 15s')), 15000));
        const findings = await Promise.race([cat.fn(domain), timeoutPromise]);
        
        const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
        mdContent += `- **Status:** ✅ Success (${timeTaken}s)\n`;
        
        if (findings && findings.length > 0) {
          mdContent += `- **Findings:** ${findings.length}\n`;
          findings.forEach(f => {
            const icon = f.severity === 'Informational' ? '🟢' : (f.severity === 'Low' ? '🟡' : '🔴');
            mdContent += `  - ${icon} **[${f.signalId}]** ${f.findingDetails} (Source: ${f.source})\n`;
          });
        } else {
          mdContent += `- **Findings:** 0\n`;
        }
      } catch (err) {
        console.log(`     [Error] ${err.message}`);
        mdContent += `- **Status:** ❌ Error\n`;
        mdContent += `- **Error Details:** \`${err.message}\`\n`;
      }
      mdContent += '\n';
    }
    
    // Add a small delay between domains to respect rate limits
    await new Promise(res => setTimeout(res, 3000));
  }

  const outPath = path.resolve(__dirname, 'docs', 'TEST_RESULTS.md');
  
  // Ensure docs dir exists
  const docsDir = path.resolve(__dirname, 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir);
  }

  fs.writeFileSync(outPath, mdContent);
  console.log(`\nTesting complete! Results saved to ${outPath}`);
}

runComprehensiveTests();
