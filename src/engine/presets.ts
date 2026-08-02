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
        // Undercover security_privacy: 3 out of 7 checked
        cs_ssl: { signalId: 'cs_ssl', checked: true, hasFinding: false },
        cs_cert_validity: { signalId: 'cs_cert_validity', checked: true, hasFinding: false },
        cp_privacy_policy: { signalId: 'cp_privacy_policy', checked: true, hasFinding: false },
        
        // Fully cover reliability_maturity: 6 out of 6
        bm_domain_age: { signalId: 'bm_domain_age', checked: true, hasFinding: false },
        bm_public_market: { signalId: 'bm_public_market', checked: true, hasFinding: false },
        bm_wikipedia: { signalId: 'bm_wikipedia', checked: true, hasFinding: false },
        res_status_page: { signalId: 'res_status_page', checked: true, hasFinding: false },
        nth_cloud_hosting: { signalId: 'nth_cloud_hosting', checked: true, hasFinding: false },
        nth_email_provider: { signalId: 'nth_email_provider', checked: true, hasFinding: false },

        // Fully cover financial_health: 2 out of 2
        bs_bankruptcy: { signalId: 'bs_bankruptcy', checked: true, hasFinding: false },
        bs_layoffs: { signalId: 'bs_layoffs', checked: true, hasFinding: false },
        
        // Fully cover reputation_ethics: 4 out of 4
        rep_negative_news: { signalId: 'rep_negative_news', checked: true, hasFinding: false },
        rep_breach_history: { signalId: 'rep_breach_history', checked: true, hasFinding: false },
        esg_sustainability: { signalId: 'esg_sustainability', checked: true, hasFinding: false },
        esg_modern_slavery: { signalId: 'esg_modern_slavery', checked: true, hasFinding: false },
        
        // Fully cover legal_geopolitical: 2 out of 2
        lr_fines: { signalId: 'lr_fines', checked: true, hasFinding: false },
        geo_hosting_location: { signalId: 'geo_hosting_location', checked: true, hasFinding: false },
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
              category: 'security_privacy',
              signalId: 'cs_cves',
              title: 'Exposed unpatched CVE-2024-3094 on web app server',
              severity: 'High',
              source: 'OpenVAS Scan',
              confirmed: true,
              assetId: 'asset_2',
            },
            {
              id: 'f_legacy_headers',
              category: 'security_privacy',
              signalId: 'cs_headers',
              title: 'Missing HSTS & Content-Security-Policy headers',
              severity: 'Medium',
              source: 'Mozilla Observatory',
              confirmed: true,
              assetId: 'asset_2',
            },
            {
              id: 'f_no_sectxt',
              category: 'security_privacy',
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
