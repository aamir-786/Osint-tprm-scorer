const { scanCybersecurity } = require('./scanners/cybersecurity');
const { scanCompliance } = require('./scanners/compliance');
const { scanBusinessStability } = require('./scanners/businessStability');
const { scanReputation } = require('./scanners/reputation');
const { scanLegal } = require('./scanners/legal');
const { calculateTPRMScore } = require('../src/engine/tprmEngine');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const testCases = [
  { domain: 'google.com', category: 'Tech Giant (Easy)' },
  { domain: 'microsoft.com', category: 'Tech Giant (Easy)' },
  { domain: 'apple.com', category: 'Tech Giant (Easy)' },
  { domain: 'openai.com', category: 'Startup (Medium)' },
  { domain: 'binance.com', category: 'Crypto (Medium/Hard)' },
  { domain: 'ftx.com', category: 'Bankrupt/Scandal (Hard)' },
  { domain: 'solarwinds.com', category: 'Breach History (Medium)' },
  { domain: 'enron.com', category: 'Bankrupt History (Medium)' },
  { domain: 'kaspersky.com', category: 'Regulatory/Sanctions Risk (Hard)' },
  { domain: 'yandex.ru', category: 'International/Sanctions (Hard)' },
  { domain: 'github.com', category: 'Duplicate Vendor (Easy)' },
  { domain: 'github.com', category: 'Duplicate Vendor (Easy)' },
  { domain: 'equifax.com', category: 'Breach History (Medium)' },
  { domain: 'tiktok.com', category: 'Regulatory Scrutiny (Medium)' },
  { domain: 'target.com', category: 'Retailer Breach (Medium)' },
  { domain: 'theranos.com', category: 'Scandal (Hard)' },
  { domain: 'this-domain-is-fake-12345.xyz', category: 'Non-existent (Edge Case)' },
  { domain: 'localhost', category: 'Localhost (Edge Case)' }
];

async function runBatchTests() {
  console.log(`Starting Batch Test with Scoring for ${testCases.length} domains...\n`);
  
  const results = [];
  let csvContent = "Domain,Category,Status,Cyber,Compliance,Stability,Reputation,Legal,Total Findings,Final Score,Grade,Confidence,Insufficient Data,Error Details\n";

  for (const test of testCases) {
    console.log(`Scanning & Scoring [${test.domain}]...`);
    let result = {
      domain: test.domain,
      category: test.category,
      status: 'Success',
      cyber: 0,
      compliance: 0,
      stability: 0,
      reputation: 0,
      legal: 0,
      total: 0,
      score: 0,
      grade: '-',
      confidence: '-',
      insufficientData: false,
      error: ''
    };

    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Scanner timeout')), 10000));
      const scanPromise = Promise.all([
        scanCybersecurity(test.domain).catch(e => { result.error += `Cyber Error; `; return []; }),
        scanCompliance(test.domain).catch(e => { result.error += `Compliance Error; `; return []; }),
        scanBusinessStability(test.domain).catch(e => { result.error += `Stability Error; `; return []; }),
        scanReputation(test.domain).catch(e => { result.error += `Reputation Error; `; return []; }),
        scanLegal(test.domain).catch(e => { result.error += `Legal Error; `; return []; })
      ]);

      const [cyber, compliance, stability, reputation, legal] = await Promise.race([scanPromise, timeoutPromise]);

      result.cyber = cyber.length;
      result.compliance = compliance.length;
      result.stability = stability.length;
      result.reputation = reputation.length;
      result.legal = legal.length;
      
      const allFindings = [...cyber, ...compliance, ...stability, ...reputation, ...legal];
      result.total = allFindings.length;
      
      // Convert to signalStatuses
      const signalStatuses = {};
      allFindings.forEach(f => {
        signalStatuses[f.signalId] = {
          signalId: f.signalId,
          checked: true,
          hasFinding: f.hasFinding,
          severity: f.severity,
          findingDetails: f.findingDetails,
          source: f.source
        };
      });

      // Calculate Score
      const input = {
        identity: {
          companyName: test.domain.split('.')[0].toUpperCase(),
          confirmedDomain: test.domain,
          resolutionConfidence: 'High'
        },
        multiAsset: false,
        assets: [],
        signalStatuses,
        customFindings: [],
        overrideDirectSanctionsOrBreach: false,
        overridePartialSanctions: false
      };

      const scoringResult = calculateTPRMScore(input);
      result.score = scoringResult.overallScore;
      result.grade = scoringResult.overallGrade;
      result.confidence = scoringResult.overallConfidence;
      result.insufficientData = scoringResult.isInsufficientData;

      if (result.error !== '') {
        result.status = 'Partial Success';
      }
    } catch (e) {
      result.status = 'Failed';
      result.error = e.message;
      console.error(`  -> Failed: ${e.message}`);
    }

    console.log(`  -> Status: ${result.status} | Findings: ${result.total} | Score: ${result.score} | Grade: ${result.grade}`);
    
    csvContent += `"${result.domain}","${result.category}","${result.status}",${result.cyber},${result.compliance},${result.stability},${result.reputation},${result.legal},${result.total},${result.score},"${result.grade}","${result.confidence}",${result.insufficientData},"${result.error}"\n`;
    
    // 3s delay to survive rate limits
    await new Promise(res => setTimeout(res, 3000));
  }

  const outPath = path.resolve(__dirname, '../test_results.csv');
  fs.writeFileSync(outPath, csvContent);
  console.log(`\nBatch test complete! Results saved to ${outPath}`);
}

runBatchTests();
