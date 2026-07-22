import { useState, useMemo } from 'react';
import type { AssessmentInput, ScoringResult, VendorIdentity } from '../types/tprm';
import { calculateTPRMScore } from '../engine/tprmEngine';

import type { ScenarioPreset } from '../engine/presets';
import { VendorIdentityHeader } from './VendorIdentityHeader';
import { CategorySignalMatrix } from './CategorySignalMatrix';
import { ScorecardView } from './ScorecardView';
import { PresetSelector } from './PresetSelector';
import { Download, Plus, LayoutGrid } from 'lucide-react';

export function TprmModuleDashboard() {
  const [hasScanned, setHasScanned] = useState<boolean>(false);

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

  const handleScanComplete = (scannedInput: AssessmentInput) => {
    setInput(scannedInput);
    setHasScanned(true);
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
          {hasScanned && (
            <button type="button" className="btn btn-secondary" onClick={handleExportBoardPack} style={{ fontSize: '0.84rem' }}>
              <Download size={14} /> Export PDF Report
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={() => window.scrollTo({ top: 220, behavior: 'smooth' })} style={{ fontSize: '0.84rem' }}>
            <Plus size={14} /> Register Vendor Initiative
          </button>
        </div>
      </div>

      {/* Main Container - Adjusted based on scan state */}
      <div className={hasScanned ? "dashboard-middle-grid" : ""} style={{ gap: '24px', display: hasScanned ? 'grid' : 'flex', justifyContent: hasScanned ? undefined : 'center' }}>

        {/* Left Column (or Center Screen if Not Scanned) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: hasScanned ? '100%' : '800px', width: '100%', margin: hasScanned ? '0' : '40px auto 0' }}>

          <div className={hasScanned ? "wahid-card" : ""}>
            {hasScanned && (
              <div className="wahid-card-header" style={{ marginBottom: '16px' }}>
                <div>
                  <div className="wahid-card-title">OSINT Telemetry Scanner</div>
                  <div className="wahid-card-subtitle">Select a preset or enter a domain to scan public records.</div>
                </div>
              </div>
            )}

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
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
