const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { validateDomain } = require('./utils/domainValidator');
const { scanCybersecurity } = require('./scanners/cybersecurity');
const { scanCompliance } = require('./scanners/compliance');
const { scanBusinessStability } = require('./scanners/businessStability');
const { scanReputation } = require('./scanners/reputation');
const { scanLegal } = require('./scanners/legal');
const { scanMaturity } = require('./scanners/maturity');
const { scanESG } = require('./scanners/esg');
const { scanGeopolitical } = require('./scanners/geopolitical');
const { scanNthParty } = require('./scanners/nth_party');
const { scanResilience } = require('./scanners/resilience');
const { generateAIScore } = require('./routes/aiScorer');

const path = require('path');

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const scanCache = new Map();

// Real-Time OSINT Scan Endpoint
app.get('/api/scan', async (req, res) => {
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  const cleanDomain = domain.toLowerCase();

  // Return cached result if already scanned for 100% deterministic consistency
  if (scanCache.has(cleanDomain)) {
    console.log(`[OSINT Backend] Returning cached deterministic scan for: ${cleanDomain}`);
    return res.json(scanCache.get(cleanDomain));
  }

  try {
    console.log(`[OSINT Backend] Starting full scan for: ${cleanDomain}`);

    // Pre-validate domain existence, WHOIS registration, and HTTP reachability
    const domainValidation = await validateDomain(cleanDomain);
    console.log(`[OSINT Backend] Domain validation for ${domain}: isValid=${domainValidation.isValid}, isRegistered=${domainValidation.isRegistered}, age=${domainValidation.whoisData?.ageInYears} yrs`);

    // Run all scanners concurrently, passing domainValidation context
    const [
      cyberResults,
      complianceResults,
      stabilityResults,
      reputationResults,
      legalResults,
      maturityResults,
      esgResults,
      geoResults,
      nthPartyResults,
      resilienceResults
    ] = await Promise.all([
      scanCybersecurity(domain, domainValidation),
      scanCompliance(domain, domainValidation),
      scanBusinessStability(domain, domainValidation),
      scanReputation(domain, domainValidation),
      scanLegal(domain, domainValidation),
      scanMaturity(domain, domainValidation),
      scanESG(domain, domainValidation),
      scanGeopolitical(domain, domainValidation),
      scanNthParty(domain, domainValidation),
      scanResilience(domain, domainValidation)
    ]);

    // Combine all findings
    const allFindings = [
      ...cyberResults,
      ...complianceResults,
      ...stabilityResults,
      ...reputationResults,
      ...legalResults,
      ...maturityResults,
      ...esgResults,
      ...geoResults,
      ...nthPartyResults,
      ...resilienceResults
    ];

    console.log(`[OSINT Backend] Scan complete for ${domain}. Total findings: ${allFindings.length}`);

    // Map the array of findings to an object keyed by signalId for the frontend
    const signalStatuses = {};
    allFindings.forEach(finding => {
      signalStatuses[finding.signalId] = {
        signalId: finding.signalId,
        checked: true,
        hasFinding: finding.hasFinding,
        severity: finding.severity,
        findingDetails: finding.findingDetails,
        source: finding.source
      };
    });

    const scanResult = {
      domain: cleanDomain,
      domainValidation,
      signalStatuses
    };
    scanCache.set(cleanDomain, scanResult);

    res.json(scanResult);
  } catch (error) {
    console.error(`[OSINT Backend] Scan failed for ${domain}:`, error.message);
    res.status(500).json({ error: 'Internal Server Error during OSINT scan' });
  }
});

// AI Scoring Endpoint
app.get('/api/ai-score', async (req, res) => {
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  try {
    console.log(`[AI Scorer] Generating AI score for: ${domain}`);
    const result = await generateAIScore(domain);
    res.json(result);
  } catch (error) {
    console.error(`[AI Scorer] Failed for ${domain}:`, error.message);
    res.status(500).json({ error: 'Failed to generate AI score' });
  }
});

app.listen(PORT, () => {
  console.log(`OSINT Backend Server running on http://localhost:${PORT}`);
});
