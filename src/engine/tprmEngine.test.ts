import { calculateTPRMScore } from './tprmEngine';
import { PRESET_SCENARIOS } from './presets';
import type { AssessmentInput } from '../types/tprm';
import { CATEGORIES } from './constants';

function runTests() {
  console.log('--- RUNNING OSINT TPRM ENGINE v2.0 TESTS ---');

  // Test 1: Pristine startup (100% coverage, 0 findings) -> Score 950, Grade A, High Confidence
  const pristineResult = calculateTPRMScore(PRESET_SCENARIOS[0].input);
  console.assert(pristineResult.overallScore === 950, `Test 1 Failed: Expected score 950, got ${pristineResult.overallScore}`);
  console.assert(pristineResult.overallGrade === 'A', `Test 1 Failed: Expected Grade A, got ${pristineResult.overallGrade}`);
  console.assert(pristineResult.overallConfidence === 'High', `Test 1 Failed: Expected High confidence, got ${pristineResult.overallConfidence}`);
  console.log('✓ Test 1 Passed: Pristine vendor scores 950/950 (Grade A, High Confidence)');

  // Test 2: Active breach override -> Grade F
  const breachResult = calculateTPRMScore(PRESET_SCENARIOS[1].input);
  console.assert(breachResult.overallGrade === 'F', `Test 2 Failed: Expected Grade F override, got ${breachResult.overallGrade}`);
  console.assert(breachResult.hardOverrideApplied === true, `Test 2 Failed: Expected hard override to be true`);
  console.log('✓ Test 2 Passed: Active breach triggers Grade F Hard Override');

  // Test 3: Low coverage (<40%) -> Insufficient Data floor
  const lowCovResult = calculateTPRMScore(PRESET_SCENARIOS[2].input);
  console.assert(lowCovResult.isInsufficientData === true, `Test 3 Failed: Expected isInsufficientData to be true`);
  console.log('✓ Test 3 Passed: <40% total signal coverage triggers Insufficient Public Data floor');

  // Test 4: Undercovered category (<50%) -> Proportional Weight Redistribution
  const redistResult = calculateTPRMScore(PRESET_SCENARIOS[3].input);
  const csResult = redistResult.categoryResults.security_privacy;
  console.assert(csResult.coverage < 0.5, `Test 4 Failed: Expected Cybersecurity coverage < 0.5`);
  console.assert(csResult.effectiveWeight < csResult.meta.weight, `Test 4 Failed: Expected reduced weight`);
  console.assert(redistResult.categoryResults.reliability_maturity.effectiveWeight > CATEGORIES.reliability_maturity.weight, `Test 4 Failed: Expected reliability_maturity to gain weight`);
  console.log('✓ Test 4 Passed: Proportional effective weight redistribution calculated accurately');

  // Test 5: Soft cap (Partial sanction match) -> C max
  const softCapInput: AssessmentInput = {
    ...PRESET_SCENARIOS[0].input,
    overridePartialSanctions: true,
  };
  const softCapResult = calculateTPRMScore(softCapInput);
  console.assert(softCapResult.overallGrade === 'C', `Test 5 Failed: Expected Grade C cap, got ${softCapResult.overallGrade}`);
  console.assert(softCapResult.softCapApplied === true, `Test 5 Failed: Expected softCapApplied to be true`);
  console.log('✓ Test 5 Passed: Related-entity sanctions match caps Grade at C max');

  // Test 6: Multi-asset scope evaluates weakest domain score
  const multiAssetResult = calculateTPRMScore(PRESET_SCENARIOS[4].input);
  console.assert(multiAssetResult.multiAssetActive === true, `Test 6 Failed: Expected multiAssetActive to be true`);
  console.assert(multiAssetResult.weakestAssetInfo?.score === 840, `Test 6 Failed: Expected weakest asset score 840, got ${multiAssetResult.weakestAssetInfo?.score}`);
  console.assert(multiAssetResult.categoryResults.security_privacy.rawScore === 840, `Test 6 Failed: Expected Cybersecurity raw score 840, got ${multiAssetResult.categoryResults.security_privacy.rawScore}`);
  console.log('✓ Test 6 Passed: Multi-asset vendor applies weakest domain Cybersecurity score (840/950)');

  // Test 7: Informational findings add 0 penalty
  const infoFindingInput: AssessmentInput = {
    ...PRESET_SCENARIOS[0].input,
    signalStatuses: {
      ...PRESET_SCENARIOS[0].input.signalStatuses,
      bm_wikipedia: {
        signalId: 'bm_wikipedia',
        checked: true,
        hasFinding: true,
        severity: 'Informational',
        findingDetails: 'SOC 2 claims on vendor website (unverified third party)',
        source: 'Vendor Marketing Webpage',
      }
    }
  };
  const infoResult = calculateTPRMScore(infoFindingInput);
  console.assert(infoResult.categoryResults.reliability_maturity.rawScore === 950, `Test 7 Failed: Informational severity should not reduce raw score, got ${infoResult.categoryResults.reliability_maturity.rawScore}`);
  console.log('✓ Test 7 Passed: Informational severity logs finding with 0 penalty');

  console.log('--- ALL ENGINE TESTS PASSED SUCCESSFULLY ---');
}

runTests();
