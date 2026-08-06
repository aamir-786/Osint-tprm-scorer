import { useState, useMemo } from 'react';
import type { AssessmentInput, ScoringResult, VendorIdentity, AIScoreResult } from '../types/tprm';
import { calculateTPRMScore } from '../engine/tprmEngine';

import type { ScenarioPreset } from '../engine/presets';
import { VendorIdentityHeader } from './VendorIdentityHeader';
import { CategorySignalMatrix } from './CategorySignalMatrix';
import { ScorecardView } from './ScorecardView';
import { AIScorecardView } from './AIScorecardView';
import { EvidenceModal } from './EvidenceModal';
import { PresetSelector } from './PresetSelector';
import { ArchitectureGuideModal } from './ArchitectureGuideModal';
import { runAIScore } from '../services/osintScannerService';
import { Download, LayoutGrid, FileText, X, BookOpen } from 'lucide-react';

export function TprmModuleDashboard() {
  const [hasScanned, setHasScanned] = useState<boolean>(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [aiScoreResult, setAiScoreResult] = useState<AIScoreResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | undefined>(undefined);

  // Initialize with an empty default for pristine start
  const [input, setInput] = useState<AssessmentInput>({
    identity: {
      companyName: '',
      confirmedDomain: '',
      resolutionConfidence: 'High'
    },
    multiAsset: false,
    assets: [],
    signalStatuses: {},
    customFindings: [],
    overrideDirectSanctionsOrBreach: false,
    overridePartialSanctions: false,
  });

  const scoringResult: ScoringResult | null = useMemo(() => {
    // Prevent scoring engine from crashing on empty init data if needed
    if (!hasScanned) return null;
    return calculateTPRMScore(input);
  }, [input, hasScanned]);

  const handleSelectPreset = (preset: ScenarioPreset) => {
    setInput(preset.input);
    setHasScanned(true);
  };

  const handleIdentityChange = (identity: VendorIdentity) => {
    setInput(prev => ({ ...prev, identity }));
  };

  const handleScanComplete = async (scannedInput: AssessmentInput) => {
    setInput(scannedInput);
    setHasScanned(true);

    const domain = scannedInput.identity.confirmedDomain;
    if (domain) {
      setIsAiLoading(true);
      setAiError(undefined);
      try {
        const aiResult = await runAIScore(domain);
        setAiScoreResult(aiResult);
      } catch (err: any) {
        setAiError(err.message);
      } finally {
        setIsAiLoading(false);
      }
    }
  };

  const handleToggleDirectSanctions = (overrideDirectSanctionsOrBreach: boolean) => {
    setInput(prev => ({
      ...prev,
      overrideDirectSanctionsOrBreach,
      overrideDetails: overrideDirectSanctionsOrBreach
        ? 'Direct sanctions/watchlist match or confirmed active breach event detected.'
        : prev.overrideDetails,
    }));
  };

  const handleTogglePartialSanctions = (overridePartialSanctions: boolean) => {
    setInput(prev => ({
      ...prev,
      overridePartialSanctions,
      overrideDetails: overridePartialSanctions
        ? 'Related-entity / partial sanctions match triggers soft cap (Grade C max).'
        : prev.overrideDetails,
    }));
  };

  const handleExportBoardPack = () => {
    window.print();
  };

  return (
    <div>
      {/* Module Title Banner & Top Action Buttons */}
      <div className="module-header-banner">
        <div className="module-title-group">
          <div className="module-icon-box">
            <LayoutGrid size={22} color="#ffffff" />
          </div>
          <div>
            <h1>Third-Party Risk Module</h1>
            <p>Governance posture, OSINT telemetry, actions and value — across the vendor estate.</p>
            <div className="module-title-meta">As at 2026-07-22 • 36 registered</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => setIsGuideOpen(true)} style={{ fontSize: '0.84rem', gap: '6px', display: 'flex', alignItems: 'center' }}>
            <BookOpen size={14} /> System Architecture & Mental Model
          </button>
          {hasScanned && (
            <button type="button" className="btn btn-secondary" onClick={handleExportBoardPack} style={{ fontSize: '0.84rem' }}>
              <Download size={14} /> Export PDF Report
            </button>
          )}
        </div>
      </div>

      {/* Main Container - Adjusted based on scan state */}
      <div className={hasScanned ? "dashboard-middle-grid" : ""} style={{ gap: '24px', display: hasScanned ? 'grid' : 'flex', justifyContent: hasScanned ? undefined : 'center' }}>

        {/* Left Column (or Center Screen if Not Scanned) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: hasScanned ? '100%' : '800px', width: '100%', margin: hasScanned ? '0' : '40px auto 0' }}>

          <div>
            {hasScanned && (
              <PresetSelector
                selectedPresetId={hasScanned ? "custom" : ""}
                onSelectScenario={handleSelectPreset}
              />
            )}

            <VendorIdentityHeader
              identity={input.identity}
              onChange={handleIdentityChange}
              onScanComplete={handleScanComplete}
              hasScanned={hasScanned}
            />

            {!hasScanned && (
              <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <PresetSelector
                  selectedPresetId={""}
                  onSelectScenario={handleSelectPreset}
                />
              </div>
            )}
          </div>

          {hasScanned && (
            <div className="wahid-card">
              <CategorySignalMatrix
                input={input}
                onChange={setInput}
              />
            </div>
          )}
        </div>

        {/* Right Column: Only show if Scanned */}
        {hasScanned && scoringResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="wahid-card">
              <ScorecardView
                result={scoringResult}
                inputOverrides={{
                  overrideDirectSanctionsOrBreach: input.overrideDirectSanctionsOrBreach,
                  overridePartialSanctions: input.overridePartialSanctions,
                  overrideDetails: input.overrideDetails,
                }}
                onToggleDirectSanction={handleToggleDirectSanctions}
                onTogglePartialSanction={handleTogglePartialSanctions}
                aiScoreResult={aiScoreResult}
                isAiLoading={isAiLoading}
                aiError={aiError}
                onOpenAiModal={() => setIsAiModalOpen(true)}
              />
              <div style={{ padding: '0 20px 20px 20px', marginTop: '-10px' }}>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => setIsEvidenceModalOpen(true)}
                  style={{ width: '100%', padding: '14px', fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: '8px', background: '#0f172a' }}
                >
                  <FileText size={18} /> View Evidence Drill-Down
                </button>
              </div>
            </div>
            {isAiModalOpen && (
              <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 9999, padding: '24px'
              }}>
                <div style={{
                  background: '#ffffff', width: '100%', maxWidth: '900px', height: '90vh',
                  borderRadius: '24px', display: 'flex', flexDirection: 'column',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden',
                  animation: 'slideUp 0.3s ease-out'
                }}>
                  <div style={{ padding: '20px 32px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>AI Drill-Down</h2>
                    <button onClick={() => setIsAiModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', color: '#64748b' }}>
                      <X size={24} />
                    </button>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    <AIScorecardView result={aiScoreResult} isLoading={isAiLoading} error={aiError} />
                  </div>
                </div>
              </div>
            )}
            <EvidenceModal 
              result={scoringResult} 
              isOpen={isEvidenceModalOpen} 
              onClose={() => setIsEvidenceModalOpen(false)} 
            />
          </div>
        )}

        <ArchitectureGuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
        />
      </div>
    </div>
  );
}
