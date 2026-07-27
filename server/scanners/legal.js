const axios = require('axios');

async function scanLegal(domain) {
  const findings = [];
  const openSanctionsKey = process.env.OPENSANCTIONS_API_KEY;
  const companyName = domain.split('.')[0];

  if (openSanctionsKey) {
    try {
      // The OpenSanctions API allows searching for entities by name
      const response = await axios.get(`https://api.opensanctions.org/search/default?q=${companyName}`, {
        headers: { 'Authorization': `ApiKey ${openSanctionsKey}` }
      });

      // Filter results where the schema is an Organization/Company
      const entities = response.data.results.filter(e => e.schema === 'Company' || e.schema === 'Organization');
      
      if (entities.length > 0) {
        // High probability of sanction or PEP exposure
        findings.push({
          signalId: 'lr_fines',
          hasFinding: true,
          severity: 'Critical',
          findingDetails: `Possible match on global watchlists: ${entities[0].caption}`,
          source: 'OpenSanctions API'
        });
      } else {
        findings.push({
          signalId: 'lr_fines',
          hasFinding: false,
          severity: 'Informational',
          findingDetails: 'No matches found on global watchlists.',
          source: 'OpenSanctions API'
        });
      }
    } catch (err) {
      if (err.response && [401, 403, 429].includes(err.response.status)) {
         findings.push({
           signalId: 'lr_fines',
           hasFinding: false,
           severity: 'Informational',
           findingDetails: 'OpenSanctions API rate limited or invalid key. Skipping scan.',
           source: 'OpenSanctions API'
         });
      }
      console.warn(`[Legal] OpenSanctions API scan failed for ${domain}:`, err.message);
    }
  } else {
    // If no key, we assume no hit, or we can leave it empty
    console.log(`[Legal] Skipping OpenSanctions scan for ${domain} (No API Key)`);
  }

  return findings;
}

module.exports = { scanLegal };
