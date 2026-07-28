export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export type Confidence = 'High' | 'Medium' | 'Low';

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export type BusinessPersona = 'analyst' | 'ciso' | 'procurement' | 'executive';

export interface SignalDefinition {
  id: string;
  name: string;
  category: CategoryKey;
  description: string;
  defaultSeverityIfFailed?: Severity;
}

export type CategoryKey = 
  | 'cybersecurity'
  | 'compliance'
  | 'stability'
  | 'reputation'
  | 'resilience'
  | 'legal'
  | 'maturity';

export interface CategoryMeta {
  key: CategoryKey;
  name: string;
  weight: number; // Decimal (e.g., 0.30)
  plannedSignalsCount: number;
  signals: SignalDefinition[];
}

export interface SignalStatus {
  signalId: string;
  checked: boolean;
  hasFinding: boolean;
  severity?: Severity;
  findingDetails?: string;
  source?: string;
  reasonIfUnavailable?: string;
  evidencePayload?: any[];
}

export interface AssetScore {
  assetId: string;
  name: string; // e.g. domain or IP
  cybersecurityPenalties: FindingRecord[];
  score: number;
}

export interface FindingRecord {
  id: string;
  category: CategoryKey;
  signalId?: string;
  title: string;
  severity: Severity;
  source: string;
  confirmed: boolean;
  assetId?: string;
  evidencePayload?: any[];
}

export interface CategoryResult {
  meta: CategoryMeta;
  signalsChecked: number;
  signalsPlanned: number;
  coverage: number; // 0..1
  findings: FindingRecord[];
  totalPenalties: number;
  rawScore: number; // floored at 0
  effectiveWeight: number; // 0..1
  weightRedistributedFromOthers: number;
  weightLost: number;
  contribution: number; // rawScore * effectiveWeight
  confidence: Confidence;
}

export interface VendorIdentity {
  companyName: string;
  confirmedDomain: string;
  resolutionConfidence: Confidence;
  resolutionReason?: string;
  candidateDomains?: string[];
}

export interface AssessmentInput {
  identity: VendorIdentity;
  multiAsset: boolean;
  assets: AssetScore[]; // If multiAsset is true
  signalStatuses: Record<string, SignalStatus>;
  customFindings: FindingRecord[];
  overrideDirectSanctionsOrBreach: boolean;
  overridePartialSanctions: boolean;
  overrideDetails?: string;
}

export interface ScoringResult {
  identity: VendorIdentity;
  totalSignalsChecked: number;
  totalSignalsPlanned: number;
  overallCoverage: number; // 0..1
  isInsufficientData: boolean; // coverage < 0.40
  
  categoryResults: Record<CategoryKey, CategoryResult>;
  
  unoverriddenScore: number;
  unoverriddenGrade: Grade;
  
  overallScore: number;
  overallGrade: Grade;
  
  overallConfidence: Confidence;
  weakestCategoryName: string;
  
  multiAssetActive?: boolean;
  weakestAssetInfo?: {
    assetId: string;
    name: string;
    score: number;
    reason: string;
  };
  
  hardOverrideApplied: boolean;
  softCapApplied: boolean;
  overrideExplanation?: string;
  
  keyFindings: FindingRecord[];
  unavailableSignals: { signalName: string; categoryName: string; reason: string }[];
  
  formattedMarkdown: string;
}

export interface AICategoryFinding {
  name: string;
  findings: string;
  penaltyApplied: number;
}

export interface AIScoreResult {
  finalScore: number;
  grade: Grade;
  summary: string;
  categories: AICategoryFinding[];
}
