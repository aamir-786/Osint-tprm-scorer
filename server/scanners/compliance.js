const axios = require('axios');

async function scanCompliance(domain) {
  const findings = [];
  
  try {
    // Attempt to fetch the homepage
    const response = await axios.get(`https://${domain}`, { timeout: 5000 });
    const html = response.data.toLowerCase();

    // 1. Privacy Policy Check
    if (html.includes('privacy policy') || html.includes('privacy-policy')) {
      findings.push({
        signalId: 'cp_privacy_policy',
        hasFinding: false,
        severity: 'Informational',
        findingDetails: 'Privacy Policy link found on homepage.',
        source: 'Homepage Crawl'
      });
    } else {
      findings.push({
        signalId: 'cp_privacy_policy',
        hasFinding: true,
        severity: 'Medium',
        findingDetails: 'No obvious Privacy Policy link detected on homepage.',
        source: 'Homepage Crawl'
      });
    }

    // 2. DPA Check
    if (html.includes('data processing') || html.includes('dpa')) {
      findings.push({
        signalId: 'cp_dpa',
        hasFinding: false,
        severity: 'Informational',
        findingDetails: 'DPA or Data Processing terms found.',
        source: 'Homepage Crawl'
      });
    } else {
      findings.push({
        signalId: 'cp_dpa',
        hasFinding: true,
        severity: 'Low',
        findingDetails: 'No explicit DPA mentions on homepage.',
        source: 'Homepage Crawl'
      });
    }

  } catch (err) {
    findings.push({
      signalId: 'cp_privacy_policy',
      hasFinding: true,
      severity: 'Medium',
      findingDetails: `Could not crawl homepage: ${err.message}`,
      source: 'Homepage Crawl'
    });
  }

  return findings;
}

module.exports = { scanCompliance };
