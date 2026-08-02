import type { 
  AssessmentInput, 
  ScoringResult, 
  CategoryKey, 
  CategoryResult, 
  Confidence, 
  Grade, 
  FindingRecord
} from '../types/tprm';
import { CATEGORIES, SEVERITY_PENALTIES, TOTAL_PLANNED_SIGNALS, getGradeFromScore } from './constants';

export function calculateTPRMScore(input: AssessmentInput): ScoringResult {
  const categoryKeys = Object.keys(CATEGORIES) as CategoryKey[];
  
  // 1. Gather signal statuses and findings per category
  const categoryCheckedCounts: Record<CategoryKey, number> = {} as any;
  const categoryFindings: Record<CategoryKey, FindingRecord[]> = {} as any;

  categoryKeys.forEach(k => {
    categoryCheckedCounts[k] = 0;
    categoryFindings[k] = [];
  });

  const unavailableSignals: { signalName: string; categoryName: string; reason: string }[] = [];

  // Process standard signals
  categoryKeys.forEach(catKey => {
    const meta = CATEGORIES[catKey];
    meta.signals.forEach(sig => {
      const status = input.signalStatuses[sig.id];
      if (status && status.checked) {
        categoryCheckedCounts[catKey]++;
        if (status.hasFinding && status.severity) {
          categoryFindings[catKey].push({
            id: `finding_${sig.id}`,
            category: catKey,
            signalId: sig.id,
            title: status.findingDetails || `${sig.name} finding detected`,
            severity: status.severity,
            source: status.source || 'OSINT Automated Check',
            confirmed: status.severity !== 'Informational',
            evidencePayload: status.evidencePayload,
          });
        }
      } else {
        unavailableSignals.push({
          signalName: sig.name,
          categoryName: meta.name,
          reason: status?.reasonIfUnavailable || 'Signal not checked or data unavailable',
        });
      }
    });
  });

  // Process custom findings
  input.customFindings.forEach(f => {
    if (categoryFindings[f.category]) {
      categoryFindings[f.category].push(f);
    }
  });

  let weakestAssetInfo: { assetId: string; name: string; score: number; reason: string } | undefined;

  // Multi-asset cybersecurity override rule
  if (input.multiAsset && input.assets.length > 0) {
    const evaluatedAssets = input.assets.map(asset => {
      let penaltySum = 0;
      asset.cybersecurityPenalties.forEach(p => {
        if (p.confirmed && p.severity !== 'Informational') {
          penaltySum += SEVERITY_PENALTIES[p.severity];
        }
      });
      const calcScore = Math.max(0, 950 - penaltySum);
      return { ...asset, score: calcScore };
    });

    let weakestAsset = evaluatedAssets[0];
    evaluatedAssets.forEach(asset => {
      if (asset.score < weakestAsset.score) {
        weakestAsset = asset;
      }
    });

    categoryFindings.security_privacy = weakestAsset.cybersecurityPenalties;
    weakestAssetInfo = {
      assetId: weakestAsset.assetId,
      name: weakestAsset.name,
      score: weakestAsset.score,
      reason: weakestAsset.cybersecurityPenalties.length > 0
        ? weakestAsset.cybersecurityPenalties.map(p => `${p.title} (${p.severity})`).join('; ')
        : 'Pristine evaluation with zero confirmed findings',
    };
  }

  // 2. Calculate category raw scores, coverage, and initial raw effective weights
  const totalSignalsChecked = Object.values(categoryCheckedCounts).reduce((a, b) => a + b, 0);
  const overallCoverage = totalSignalsChecked / TOTAL_PLANNED_SIGNALS;
  const isInsufficientData = overallCoverage < 0.40;
  const initialEffectiveWeights: Record<CategoryKey, number> = {} as any;
  const weightLostPerCat: Record<CategoryKey, number> = {} as any;

  categoryKeys.forEach(k => {
    initialEffectiveWeights[k] = 0;
    weightLostPerCat[k] = 0;
  });

  categoryKeys.forEach(catKey => {
    const meta = CATEGORIES[catKey];
    const checked = categoryCheckedCounts[catKey];
    const coverage = checked / meta.plannedSignalsCount;
    
    if (coverage >= 0.5) {
      initialEffectiveWeights[catKey] = meta.weight;
      weightLostPerCat[catKey] = 0;
    } else {
      const reducedWeight = meta.weight * (coverage / 0.5);
      initialEffectiveWeights[catKey] = reducedWeight;
      weightLostPerCat[catKey] = meta.weight - reducedWeight;
    }
  });

  const totalLostWeight = Object.values(weightLostPerCat).reduce((a, b) => a + b, 0);

  const finalEffectiveWeights: Record<CategoryKey, number> = { ...initialEffectiveWeights };
  const redistributedWeightGained: Record<CategoryKey, number> = {} as any;
  
  categoryKeys.forEach(k => redistributedWeightGained[k] = 0);

  if (totalLostWeight > 0) {
    categoryKeys.forEach(targetCat => {
      let gained = 0;
      categoryKeys.forEach(sourceCat => {
        if (targetCat !== sourceCat && weightLostPerCat[sourceCat] > 0) {
          const sourceLost = weightLostPerCat[sourceCat];
          const otherOriginalWeightsSum = 1.0 - CATEGORIES[sourceCat].weight;
          const proportion = CATEGORIES[targetCat].weight / otherOriginalWeightsSum;
          gained += sourceLost * proportion;
        }
      });
      redistributedWeightGained[targetCat] = gained;
      finalEffectiveWeights[targetCat] += gained;
    });
  }

  // Build Category Results
  const categoryResults: Record<CategoryKey, CategoryResult> = {} as any;

  categoryKeys.forEach(catKey => {
    const meta = CATEGORIES[catKey];
    const findings = categoryFindings[catKey];
    
    let totalPenalties = 0;
    findings.forEach(f => {
      if (f.confirmed && f.severity !== 'Informational') {
        totalPenalties += SEVERITY_PENALTIES[f.severity];
      }
    });

    const rawScore = Math.max(0, 950 - totalPenalties);
    const checked = categoryCheckedCounts[catKey];
    const coverage = checked / meta.plannedSignalsCount;
    
    let confidence: Confidence = 'Low';
    if (coverage > 0.90) confidence = 'High';
    else if (coverage >= 0.70) confidence = 'Medium';
    else confidence = 'Low';

    const effectiveWeight = finalEffectiveWeights[catKey];
    const contribution = rawScore * effectiveWeight;

    categoryResults[catKey] = {
      meta,
      signalsChecked: checked,
      signalsPlanned: meta.plannedSignalsCount,
      coverage,
      findings,
      totalPenalties,
      rawScore,
      effectiveWeight,
      weightLost: weightLostPerCat[catKey],
      weightRedistributedFromOthers: redistributedWeightGained[catKey],
      contribution,
      confidence,
    };
  });

  // 3. Un-overridden overall score
  const unoverriddenScoreFloat = Object.values(categoryResults).reduce((sum, res) => sum + res.contribution, 0);
  const unoverriddenScore = Math.round(unoverriddenScoreFloat);
  const unoverriddenGrade = getGradeFromScore(unoverriddenScore);

  // 4. Determine overall confidence (Weakest link rule)
  const confidenceOrder: Record<Confidence, number> = { High: 3, Medium: 2, Low: 1 };
  let weakestConfidence: Confidence = 'High';
  let weakestCategoryName = CATEGORIES.security_privacy.name;
  let minConfScore = 99;

  categoryKeys.forEach(catKey => {
    const res = categoryResults[catKey];
    const confVal = confidenceOrder[res.confidence];
    if (confVal < minConfScore) {
      minConfScore = confVal;
      weakestConfidence = res.confidence;
      weakestCategoryName = res.meta.name;
    }
  });

  // 5. Overrides
  let hardOverrideApplied = false;
  let softCapApplied = false;
  let finalGrade = unoverriddenGrade;
  let finalScore = unoverriddenScore;
  let overrideExplanation = '';

  const hasDirectSanctionOrBreachFinding = input.overrideDirectSanctionsOrBreach || categoryKeys.some(c => 
    categoryResults[c].findings.some(f => 
      f.severity === 'Critical' && (f.signalId === 'lr_sanctions' || f.signalId === 'rep_breach_history')
    )
  );

  const hasPartialSanctionFinding = input.overridePartialSanctions;

  if (hasDirectSanctionOrBreachFinding) {
    hardOverrideApplied = true;
    finalGrade = 'F';
    overrideExplanation = input.overrideDetails || 'Direct sanctions/watchlist match or confirmed active breach/ransomware event detected.';
  } else if (hasPartialSanctionFinding) {
    softCapApplied = true;
    if (unoverriddenGrade === 'A' || unoverriddenGrade === 'B') {
      finalGrade = 'C';
      overrideExplanation = input.overrideDetails || 'Related-entity / partial sanctions match triggers soft cap (Grade capped at C max).';
    } else {
      overrideExplanation = 'Related-entity / partial sanctions match flag active (Calculated grade is already C or lower).';
    }
  }

  const keyFindings: FindingRecord[] = [];
  categoryKeys.forEach(catKey => {
    categoryResults[catKey].findings.forEach(f => {
      if (f.severity === 'Critical' || f.severity === 'High') {
        keyFindings.push(f);
      }
    });
  });

  const formattedMarkdown = buildStandardMarkdownReport({
    identity: input.identity,
    isInsufficientData,
    overallScore: finalScore,
    overallGrade: finalGrade,
    unoverriddenScore,
    unoverriddenGrade,
    overallConfidence: weakestConfidence,
    weakestCategoryName,
    multiAssetActive: input.multiAsset,
    weakestAssetInfo,
    hardOverrideApplied,
    softCapApplied,
    overrideExplanation,
    categoryResults,
    keyFindings,
    unavailableSignals,
    totalSignalsChecked,
    totalSignalsPlanned: TOTAL_PLANNED_SIGNALS,
  });

  return {
    identity: input.identity,
    totalSignalsChecked,
    totalSignalsPlanned: TOTAL_PLANNED_SIGNALS,
    overallCoverage,
    isInsufficientData,
    categoryResults,
    unoverriddenScore,
    unoverriddenGrade,
    overallScore: finalScore,
    overallGrade: finalGrade,
    overallConfidence: weakestConfidence,
    weakestCategoryName,
    multiAssetActive: input.multiAsset,
    weakestAssetInfo,
    hardOverrideApplied,
    softCapApplied,
    overrideExplanation,
    keyFindings,
    unavailableSignals,
    formattedMarkdown,
  };
}

function buildStandardMarkdownReport(params: {
  identity: { companyName: string; confirmedDomain: string; resolutionConfidence: Confidence; resolutionReason?: string };
  isInsufficientData: boolean;
  overallScore: number;
  overallGrade: Grade;
  unoverriddenScore: number;
  unoverriddenGrade: Grade;
  overallConfidence: Confidence;
  weakestCategoryName: string;
  multiAssetActive?: boolean;
  weakestAssetInfo?: { assetId: string; name: string; score: number; reason: string };
  hardOverrideApplied: boolean;
  softCapApplied: boolean;
  overrideExplanation?: string;
  categoryResults: Record<CategoryKey, CategoryResult>;
  keyFindings: FindingRecord[];
  unavailableSignals: { signalName: string; categoryName: string; reason: string }[];
  totalSignalsChecked: number;
  totalSignalsPlanned: number;
}): string {
  const {
    identity,
    isInsufficientData,
    overallScore,
    overallGrade,
    unoverriddenScore,
    overallConfidence,
    weakestCategoryName,
    hardOverrideApplied,
    softCapApplied,
    overrideExplanation,
    categoryResults,
    keyFindings,
    unavailableSignals,
  } = params;

  let report = `VENDOR: ${identity.companyName} — ${identity.confirmedDomain}\n`;
  report += `IDENTITY RESOLUTION CONFIDENCE: ${identity.resolutionConfidence}`;
  if (identity.resolutionConfidence === 'Low' && identity.resolutionReason) {
    report += ` — ${identity.resolutionReason}`;
  }
  report += `\n\n`;

  if (isInsufficientData) {
    report += `OVERALL SCORE: Insufficient Public Data — unable to produce a reliable score for this vendor.\n`;
    report += `OVERALL CONFIDENCE: Low — overall coverage is below the 40% minimum threshold.\n\n`;
    report += `CATEGORY BREAKDOWN:\n`;
    report += `| Category | Findings | Score | Coverage | Effective Weight | Contribution | Confidence |\n`;
    report += `|----------|----------|-------|----------|-------------------|---------------|------------|\n`;
    (Object.keys(CATEGORIES) as CategoryKey[]).forEach(catKey => {
      const cat = categoryResults[catKey];
      const covPct = Math.round(cat.coverage * 100);
      report += `| ${cat.meta.name} | ${cat.findings.length} | ${cat.rawScore}/950 | ${covPct}% (${cat.signalsChecked}/${cat.signalsPlanned}) | ${(cat.effectiveWeight * 100).toFixed(1)}% | ${Math.round(cat.contribution)} | ${cat.confidence} |\n`;
    });
    report += `\nEVIDENCE NOT AVAILABLE:\n`;
    unavailableSignals.forEach(u => {
      report += `- [${u.categoryName}] ${u.signalName}: ${u.reason}\n`;
    });
    report += `\nMODEL VERSION: v2.0`;
    return report;
  }

  report += `OVERALL SCORE: ${overallScore}/950 — GRADE ${overallGrade}\n`;
  report += `OVERALL CONFIDENCE: ${overallConfidence} — lowest category confidence is in ${weakestCategoryName}\n`;
  
  if (hardOverrideApplied) {
    report += `OVERRIDE APPLIED: yes — ${overrideExplanation} (Un-overridden score: ${unoverriddenScore}/950, Grade ${params.unoverriddenGrade})\n`;
  } else if (softCapApplied) {
    report += `OVERRIDE APPLIED: yes — ${overrideExplanation} (Un-overridden score: ${unoverriddenScore}/950, Grade ${params.unoverriddenGrade})\n`;
  } else {
    report += `OVERRIDE APPLIED: no\n`;
  }

  if (params.multiAssetActive && params.weakestAssetInfo) {
    report += `MULTI-ASSET EVALUATION: Weakest asset applied for Cybersecurity is "${params.weakestAssetInfo.name}" (${params.weakestAssetInfo.score}/950) — ${params.weakestAssetInfo.reason}\n`;
  }

  report += `\nCATEGORY BREAKDOWN:\n`;
  report += `| Category | Findings | Score | Coverage | Effective Weight | Contribution | Confidence |\n`;
  report += `|----------|----------|-------|----------|-------------------|---------------|------------|\n`;

  (Object.keys(CATEGORIES) as CategoryKey[]).forEach(catKey => {
    const cat = categoryResults[catKey];
    const covPct = Math.round(cat.coverage * 100);
    const effWtPct = (cat.effectiveWeight * 100).toFixed(1);
    report += `| ${cat.meta.name} | ${cat.findings.length} | ${cat.rawScore}/950 | ${covPct}% (${cat.signalsChecked}/${cat.signalsPlanned}) | ${effWtPct}% | ${Math.round(cat.contribution)} | ${cat.confidence} |\n`;
  });

  report += `\nKEY FINDINGS:\n`;
  if (keyFindings.length === 0) {
    report += `- None identified\n`;
  } else {
    keyFindings.forEach(f => {
      report += `- [${f.severity}] ${f.title} (Source: ${f.source}, Category: ${CATEGORIES[f.category].name})\n`;
    });
  }

  report += `\nEVIDENCE NOT AVAILABLE:\n`;
  if (unavailableSignals.length === 0) {
    report += `- None, 100% of signals checked\n`;
  } else {
    unavailableSignals.forEach(u => {
      report += `- [${u.categoryName}] ${u.signalName}: ${u.reason}\n`;
    });
  }

  report += `\nMODEL VERSION: v2.0`;
  return report;
}
