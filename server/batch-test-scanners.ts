import { scanCybersecurity } from './scanners/cybersecurity';
import { scanCompliance } from './scanners/compliance';
import { scanBusinessStability } from './scanners/businessStability';
import { scanReputation } from './scanners/reputation';
import { scanLegal } from './scanners/legal';
import { calculateTPRMScore } from '../src/engine/tprmEngine';
import type { AssessmentInput, SignalStatus } from '../src/types/tprm';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const testCases = [
  { domain: 'google.com', category: 'Tech Giant (Easy)' },
  { domain: 'openai.com', category: 'Startup (Medium)' },
  { domain: 'ftx.com', category: 'Bankrupt/Scandal (Hard)' },
  { domain: 'solarwinds.com', category: 'Breach History (Medium)' },
  { domain: 'this-domain-is-fake-12345.xyz', category: 'Non-existent (Edge)' }
];

async function runBatchTests() {
  console.log(`Starting Scored Batch Test for ${testCases.length} domains...\n`);
  let csvContent = "Domain,Category,Status,Total Findings,Final Score,Grade,Confidence,Insufficient Data,Error\n";

  for (const test of testCases) {
    console.log(`Scanning & Scoring [${test.domain}]...`);
    
    let result = {
      domain: test.domain,
      category: test.category,
      status: 'Success',
      totalFindings: 0,
      score: 0,
      grade: '-',
      confidence: '-',
      insufficientData: false,
      error: ''
    };

    try {
      // 10s timeout wrapper
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Scanner timeout')), 10000));
      
      const scanPromise = Promise.all([
        scanCybersecurity(test.domain).catch(e => { result.error += `Cyber Err; `; return []; }),
        scanCompliance(test.domain).catch(e => { result.error += `Compliance Err; `; return []; }),
        scanBusinessStability(test.domain).catch(e => { result.error += `Stability Err; `; return []; }),
        scanReputation(test.domain).catch(e => { result.error += `Reputation Err; `; return []; }),
        scanLegal(test.domain).catch(e => { result.error += `Legal Err; `; return []; })
      ]);

      const [cyber, compliance, stability, reputation, legal] = await Promise.race([scanPromise, timeoutPromise]) as any[];

      const allFindings = [...cyber, ...compliance, ...stability, ...reputation, ...legal];
      result.totalFindings = allFindings.length;

      // Map to SignalStatuses
      const signalStatuses: Record<string, SignalStatus> = {};
      allFindings.forEach((f: any) => {
        signalStatuses[f.signalId] = {
          signalId: f.signalId,
          checked: true,
          hasFinding: f.hasFinding,
          severity: f.severity,
          findingDetails: f.findingDetails,
          source: f.source
        };
      });

      // Construct Assessment Input for Engine
      const input: AssessmentInput = {
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

      // RUN ENGINE SCORING
      const scoringResult = calculateTPRMScore(input);
      
      result.score = scoringResult.overallScore;
      result.grade = scoringResult.overallGrade;
      result.confidence = scoringResult.overallConfidence;
      result.insufficientData = scoringResult.isInsufficientData;

    } catch (e: any) {
      result.status = 'Failed';
      result.error = e.message;
    }

    console.log(`  -> Status: ${result.status} | Score: ${result.score}/100 | Grade: ${result.grade} | Confidence: ${result.confidence}`);
    
    csvContent += `"${result.domain}","${result.category}","${result.status}",${result.totalFindings},${result.score},"${result.grade}","${result.confidence}",${result.insufficientData},"${result.error}"\n`;
    
    // 5s delay to survive rate limits
    await new Promise(res => setTimeout(res, 5000));
  }

  const outPath = path.resolve(__dirname, '../scored_test_results.csv');
  fs.writeFileSync(outPath, csvContent);
  console.log(`\nEnd-to-End Scored Test Complete! Results saved to ${outPath}`);
}

runBatchTests();
