const whois = require('whois-json');

async function scanMaturity(domain) {
  const findings = [];
  try {
    const results = await whois(domain);
    
    // Whois output can vary a lot, we try to grab creationDate or similar fields
    const creationDateStr = results.creationDate || results.domainNameExtDt || results.createdDate || results.creationdate || results.registered;
    
    if (creationDateStr) {
      const creationDate = new Date(creationDateStr);
      if (!isNaN(creationDate)) {
        const ageInMs = Date.now() - creationDate.getTime();
        const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
        
        if (ageInYears > 5) {
          findings.push({
            signalId: 'bm_domain_age',
            hasFinding: false,
            severity: 'Informational',
            findingDetails: `Domain is established (${ageInYears.toFixed(1)} years old).`,
            source: 'WHOIS'
          });
        } else if (ageInYears >= 2) {
          findings.push({
            signalId: 'bm_domain_age',
            hasFinding: true,
            severity: 'Low',
            findingDetails: `Domain is relatively young (${ageInYears.toFixed(1)} years old).`,
            source: 'WHOIS'
          });
        } else if (ageInYears >= 0.5) {
          findings.push({
            signalId: 'bm_domain_age',
            hasFinding: true,
            severity: 'Medium',
            findingDetails: `Domain is recent startup territory (${ageInYears.toFixed(1)} years old).`,
            source: 'WHOIS'
          });
        } else {
          findings.push({
            signalId: 'bm_domain_age',
            hasFinding: true,
            severity: 'High',
            findingDetails: `Domain is extremely new (less than 6 months old). High risk of immaturity.`,
            source: 'WHOIS'
          });
        }
      } else {
         pushFallback(findings);
      }
    } else {
       pushFallback(findings);
    }
  } catch (err) {
    console.warn(`[Maturity] WHOIS scan failed for ${domain}:`, err.message);
    pushFallback(findings);
  }
  
  return findings;
}

function pushFallback(findings) {
  findings.push({
    signalId: 'bm_domain_age',
    hasFinding: false,
    severity: 'Informational',
    findingDetails: 'Could not determine domain age via WHOIS. Assuming established.',
    source: 'WHOIS'
  });
}

module.exports = { scanMaturity };
