import type { AssessmentInput } from '../types/tprm';
import { CATEGORIES } from './constants';

export interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  input: AssessmentInput;
}

export const PRESET_SCENARIOS: ScenarioPreset[] = [
  {
    id: 'pristine_startup',
    name: 'Pristine Tech Vendor (Grade A, High Confidence)',
    description: '100% signal coverage, no confirmed security or legal findings. Achieves 950/950 (Grade A) with High overall confidence.',
    input: {
      identity: {
        companyName: 'CloudPulse Analytics Inc.',
        confirmedDomain: 'cloudpulse.io',
        resolutionConfidence: 'High',
      },
      multiAsset: false,
      assets: [],
      signalStatuses: Object.keys(CATEGORIES).reduce((acc, catKey) => {
        CATEGORIES[catKey as keyof typeof CATEGORIES].signals.forEach(sig => {
          acc[sig.id] = { signalId: sig.id, checked: true, hasFinding: false };
        });
        return acc;
      }, {} as AssessmentInput['signalStatuses']),
      customFindings: [],
      overrideDirectSanctionsOrBreach: false,
      overridePartialSanctions: false,
    },
  },
  {
    id: 'high_risk_breached',
    name: 'High Risk Vendor with Active Breach (Grade F Override)',
    description: 'Exposed database, missing privacy policy, and confirmed active breach. Hard override forces Grade F output.',
    input: {
      identity: {
        companyName: 'Apex Data Services Ltd.',
        confirmedDomain: 'apexdata.net',
        resolutionConfidence: 'High',
      },
      multiAsset: false,
      assets: [],
      signalStatuses: {
        ...Object.keys(CATEGORIES).reduce((acc, catKey) => {
          CATEGORIES[catKey as keyof typeof CATEGORIES].signals.forEach(sig => {
            acc[sig.id] = { signalId: sig.id, checked: true, hasFinding: false };
          });
          return acc;
        }, {} as AssessmentInput['signalStatuses']),
        cs_exposed_services: {
          signalId: 'cs_exposed_services',
          checked: true,
          hasFinding: true,
          severity: 'Critical',
          findingDetails: 'Exposed Redis database instance on port 6379 without authentication',
          source: 'Shodan Scan',
        },
        rep_breach_history: {
          signalId: 'rep_breach_history',
          checked: true,
          hasFinding: true,
          severity: 'Critical',
          findingDetails: 'Confirmed ransomware data leak affecting customer records in July 2026',
          source: 'BleepingComputer Disclosure Report',
        },
        cp_privacy_policy: {
          signalId: 'cp_privacy_policy',
          checked: true,
          hasFinding: true,
          severity: 'Medium',
          findingDetails: 'No privacy policy accessible on root domain',
          source: 'HTTP Crawl',
        },
      },
      customFindings: [],
      overrideDirectSanctionsOrBreach: true,
      overridePartialSanctions: false,
      overrideDetails: 'Confirmed active ransomware breach event reported in news.',
    },
  },
  {
    id: 'insufficient_coverage',
    name: 'Low Coverage (<40% Signals Checked - Insufficient Data)',
    description: 'Only 5 out of 20 signals checked (25% overall coverage). Triggers the Insufficient-Data floor rule.',
    input: {
      identity: {
        companyName: 'Stealth AI Labs',
        confirmedDomain: 'stealthailabs.co',
        resolutionConfidence: 'Low',
        resolutionReason: 'Domain registered recently, limited public telemetry available',
      },
      multiAsset: false,
      assets: [],
      signalStatuses: {
        cs_ssl: { signalId: 'cs_ssl', checked: true, hasFinding: false },
        cs_cert_validity: { signalId: 'cs_cert_validity', checked: true, hasFinding: false },
        cp_privacy_policy: { signalId: 'cp_privacy_policy', checked: true, hasFinding: false },
        bs_registration_age: { signalId: 'bs_registration_age', checked: true, hasFinding: true, severity: 'Low', findingDetails: 'Domain registered < 3 months ago', source: 'WHOIS Record' },
        or_status_page: { signalId: 'or_status_page', checked: true, hasFinding: true, severity: 'Medium', findingDetails: 'No public status page found', source: 'DNS / Web search' },
      },
      customFindings: [],
      overrideDirectSanctionsOrBreach: false,
      overridePartialSanctions: false,
    },
  },
  {
    id: 'undercovered_redistribution',
    name: 'Undercovered Category Weight Redistribution Math',
    description: 'Cybersecurity coverage < 50% (only 2/6 checked). Lost weight (18%) is proportionally redistributed across other 5 categories.',
    input: {
      identity: {
        companyName: 'Vanguard Systems Group',
        confirmedDomain: 'vanguard-sys.com',
        resolutionConfidence: 'High',
      },
      multiAsset: false,
      assets: [],
      signalStatuses: {
        cs_ssl: { signalId: 'cs_ssl', checked: true, hasFinding: false },
        cs_cert_validity: { signalId: 'cs_cert_validity', checked: true, hasFinding: false },
        
        cp_iso_csa: { signalId: 'cp_iso_csa', checked: true, hasFinding: false },
        cp_privacy_policy: { signalId: 'cp_privacy_policy', checked: true, hasFinding: false },
        cp_dpa: { signalId: 'cp_dpa', checked: true, hasFinding: false },
        
        bs_registration_age: { signalId: 'bs_registration_age', checked: true, hasFinding: false },
        bs_insolvency: { signalId: 'bs_insolvency', checked: true, hasFinding: false },
        bs_layoffs_funding: { signalId: 'bs_layoffs_funding', checked: true, hasFinding: false },
        
        rep_breach_history: { signalId: 'rep_breach_history', checked: true, hasFinding: false },
        rep_sustained_negative: { signalId: 'rep_sustained_negative', checked: true, hasFinding: false },
        rep_isolated_mention: { signalId: 'rep_isolated_mention', checked: true, hasFinding: false },
        
        or_status_page: { signalId: 'or_status_page', checked: true, hasFinding: false },
        or_incident_history: { signalId: 'or_incident_history', checked: true, hasFinding: false },
        
        lr_sanctions: { signalId: 'lr_sanctions', checked: true, hasFinding: false },
        lr_export_regulatory: { signalId: 'lr_export_regulatory', checked: true, hasFinding: false },
        lr_historical_action: { signalId: 'lr_historical_action', checked: true, hasFinding: false },
      },
      customFindings: [],
      overrideDirectSanctionsOrBreach: false,
      overridePartialSanctions: false,
    },
  },
  {
    id: 'multi_asset_weakest_rule',
    name: 'Multi-Asset Vendor (Weakest Domain Score Applied)',
    description: 'Evaluates api.vendor.com vs app.vendor.com. The lowest Cybersecurity score (app.vendor.com with exposed database) is applied.',
    input: {
      identity: {
        companyName: 'FinServe Global Platform',
        confirmedDomain: 'finserveglobal.com',
        resolutionConfidence: 'High',
      },
      multiAsset: true,
      assets: [
        {
          assetId: 'asset_1',
          name: 'api.finserveglobal.com (API Gateway)',
          score: 950,
          cybersecurityPenalties: [],
        },
        {
          assetId: 'asset_2',
          name: 'app.finserveglobal.com (Legacy Web App)',
          score: 730,
          cybersecurityPenalties: [
            {
              id: 'f_legacy_cve',
              category: 'cybersecurity',
              signalId: 'cs_cves',
              title: 'Exposed unpatched CVE-2024-3094 on web app server',
              severity: 'High',
              source: 'OpenVAS Scan',
              confirmed: true,
              assetId: 'asset_2',
            },
            {
              id: 'f_legacy_headers',
              category: 'cybersecurity',
              signalId: 'cs_headers',
              title: 'Missing HSTS & Content-Security-Policy headers',
              severity: 'Medium',
              source: 'Mozilla Observatory',
              confirmed: true,
              assetId: 'asset_2',
            },
            {
              id: 'f_no_sectxt',
              category: 'cybersecurity',
              signalId: 'cs_security_txt',
              title: 'security.txt missing',
              severity: 'Low',
              source: 'HTTP Request',
              confirmed: true,
              assetId: 'asset_2',
            },
          ],
        },
      ],
      signalStatuses: Object.keys(CATEGORIES).reduce((acc, catKey) => {
        CATEGORIES[catKey as keyof typeof CATEGORIES].signals.forEach(sig => {
          acc[sig.id] = { signalId: sig.id, checked: true, hasFinding: false };
        });
        return acc;
      }, {} as AssessmentInput['signalStatuses']),
      customFindings: [],
      overrideDirectSanctionsOrBreach: false,
      overridePartialSanctions: false,
    },
  },
];
