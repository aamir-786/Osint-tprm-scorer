const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { scanCybersecurity } = require('./scanners/cybersecurity');
const { scanCompliance } = require('./scanners/compliance');
const { scanBusinessStability } = require('./scanners/businessStability');
const { scanReputation } = require('./scanners/reputation');
const { scanLegal } = require('./scanners/legal');

const path = require('path');

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Real-Time OSINT Scan Endpoint
app.get('/api/scan', async (req, res) => {
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  try {
    console.log(`[OSINT Backend] Starting full scan for: ${domain}`);

    // Run all scanners concurrently
    const [
      cyberResults,
      complianceResults,
      stabilityResults,
      reputationResults,
      legalResults
    ] = await Promise.all([
      scanCybersecurity(domain),
      scanCompliance(domain),
      scanBusinessStability(domain),
      scanReputation(domain),
      scanLegal(domain)
    ]);

    // Combine all findings
    const allFindings = [
      ...cyberResults,
      ...complianceResults,
      ...stabilityResults,
      ...reputationResults,
      ...legalResults
    ];

    console.log(`[OSINT Backend] Scan complete for ${domain}. Total findings: ${allFindings.length}`);

    // Map the array of findings to an object keyed by signalId for the frontend
    const signalStatuses = {};
    allFindings.forEach(finding => {
      // Find the corresponding signalId
      signalStatuses[finding.signalId] = {
        signalId: finding.signalId,
        checked: true,
        hasFinding: finding.hasFinding,
        severity: finding.severity,
        findingDetails: finding.findingDetails,
        source: finding.source
      };
    });

    res.json({
      domain,
      signalStatuses
    });
  } catch (error) {
    console.error(`[OSINT Backend] Scan failed for ${domain}:`, error.message);
    res.status(500).json({ error: 'Internal Server Error during OSINT scan' });
  }
});

app.listen(PORT, () => {
  console.log(`OSINT Backend Server running on http://localhost:${PORT}`);
});
