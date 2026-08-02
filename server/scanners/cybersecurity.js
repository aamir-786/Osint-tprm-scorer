const axios = require('axios');
const https = require('https');

async function scanCybersecurity(domain) {
  const findings = [];

  // 1. SSL/TLS Check (Native Node.js)
  try {
    const daysRemaining = await checkSSLCertificate(domain);
    if (daysRemaining < 30) {
      findings.push({
        signalId: 'cs_ssl',
        hasFinding: true,
        severity: 'High',
        findingDetails: `SSL Certificate expires in ${daysRemaining} days.`,
        source: 'Native TLS Check'
      });
    } else {
      findings.push({
        signalId: 'cs_ssl',
        hasFinding: false,
        severity: 'Informational',
        findingDetails: `SSL Certificate is valid for ${daysRemaining} days.`,
        source: 'Native TLS Check'
      });
    }
  } catch (err) {
    if (err.message && err.message.includes('ENOTFOUND')) {
      findings.push({
        signalId: 'cs_ssl',
        hasFinding: false,
        severity: 'Informational',
        findingDetails: `Domain does not resolve to an IP (${err.message}). Cannot verify SSL.`,
        source: 'Native TLS Check'
      });
    } else {
      findings.push({
        signalId: 'cs_ssl',
        hasFinding: true,
        severity: 'Critical',
        findingDetails: `Failed to establish secure TLS connection: ${err.message}`,
        source: 'Native TLS Check'
      });
    }
  }

  // 2. Exposed Services Check (Shodan API)
  const shodanKey = process.env.SHODAN_API_KEY;
  if (shodanKey) {
    try {
      const dns = require('dns').promises;
      let address;
      try {
        const lookupRes = await dns.lookup(domain);
        address = lookupRes.address;
      } catch (dnsErr) {
        if (dnsErr.code === 'ENOTFOUND') {
          findings.push({
            signalId: 'cs_exposed_services',
            hasFinding: false,
            severity: 'Informational',
            findingDetails: 'Domain does not resolve to an IP. Cannot run Shodan scan.',
            source: 'Shodan API'
          });
        } else {
          throw dnsErr;
        }
      }
      
      if (address) {
        const ip = address;
        try {
          const response = await axios.get(`https://api.shodan.io/shodan/host/${ip}?key=${shodanKey}`);
          
          if (response.data && response.data.ports) {
            const ports = response.data.ports;
            
            // Validate data maps to vendor
            let vendorVerified = false;
            if (response.data.hostnames && response.data.hostnames.some(h => h.includes(domain))) {
              vendorVerified = true;
            } else if (response.data.domains && response.data.domains.some(d => d.includes(domain))) {
              vendorVerified = true;
            }
            const verificationNote = vendorVerified ? '(Verified via Shodan Hostnames)' : '(Verified via DNS IP Resolution)';

            const safePorts = [80, 443, 8080, 8443];
            const criticalPorts = [3389, 22, 23, 21, 1433, 3306, 27017, 9200];
            
            const exposedCritical = ports.filter(p => criticalPorts.includes(p));
            const exposedOther = ports.filter(p => !safePorts.includes(p) && !criticalPorts.includes(p));

            if (exposedCritical.length > 0) {
              findings.push({
                signalId: 'cs_exposed_services',
                hasFinding: true,
                severity: 'High',
                findingDetails: `Unnecessary critical ports (closed ones) are OPEN on ${ip}: ${exposedCritical.join(', ')} ${verificationNote}`,
                source: 'Shodan API'
              });
            } else if (exposedOther.length > 0) {
              findings.push({
                signalId: 'cs_exposed_services',
                hasFinding: true,
                severity: 'Low',
                findingDetails: `Unnecessary non-standard ports (closed ones) are OPEN on ${ip}: ${exposedOther.join(', ')} ${verificationNote}`,
                source: 'Shodan API'
              });
            } else {
              // Only necessary open ports found (e.g. 80, 443) -> No penalty
              findings.push({
                signalId: 'cs_exposed_services',
                hasFinding: false,
                severity: 'Informational',
                findingDetails: `Only necessary open web ports exposed on ${ip} (No Penalty): ${ports.join(', ')} ${verificationNote}`,
                source: 'Shodan API'
              });
            }
          } else {
            // All ports closed -> No penalty
            findings.push({
              signalId: 'cs_exposed_services',
              hasFinding: false,
              severity: 'Informational',
              findingDetails: `All unnecessary ports are properly closed on ${ip} (No Penalty).`,
              source: 'Shodan API'
            });
          }
        } catch (shodanErr) {
            if (shodanErr.response && shodanErr.response.status === 404) {
               findings.push({
                 signalId: 'cs_exposed_services',
                 hasFinding: false,
                 severity: 'Informational',
                 findingDetails: `No Shodan records found for ${ip}.`,
                 source: 'Shodan API'
               });
            } else if (shodanErr.response && [401, 403, 429].includes(shodanErr.response.status)) {
               // Per user instruction: Explicitly state API is exhausted/unavailable. No fallbacks.
               findings.push({
                 signalId: 'cs_exposed_services',
                 hasFinding: false,
                 severity: 'Informational',
                 findingDetails: `API request limit exhausted or unavailable. Cannot verify this signal.`,
                 source: 'Shodan API'
               });
            } else {
               throw shodanErr;
            }
        }
      }
    } catch (err) {
      console.warn(`[Cyber] Shodan API scan failed for ${domain}:`, err.message);
      findings.push({
        signalId: 'cs_exposed_services',
        hasFinding: false,
        severity: 'Informational',
        findingDetails: `API request failed: ${err.message}. Cannot verify this signal.`,
        source: 'Shodan API'
      });
    }
  } else {
    findings.push({
      signalId: 'cs_exposed_services',
      hasFinding: false,
      severity: 'Informational',
      findingDetails: `API request limit exhausted or unavailable (No Key). Cannot verify this signal.`,
      source: 'Shodan API'
    });
  }

  // 3. Security.txt check
  try {
    await axios.get(`https://${domain}/.well-known/security.txt`, { timeout: 3000 });
    findings.push({
      signalId: 'cs_security_txt',
      hasFinding: false,
      severity: 'Informational',
      findingDetails: 'security.txt is published.',
      source: 'HTTP GET /.well-known/security.txt'
    });
  } catch (_err) {
    findings.push({
      signalId: 'cs_security_txt',
      hasFinding: true,
      severity: 'Low',
      findingDetails: 'Missing security.txt file.',
      source: 'HTTP GET /.well-known/security.txt'
    });
  }

  return findings;
}

// Helper for SSL check
function checkSSLCertificate(domain) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      host: domain,
      port: 443,
      method: 'HEAD',
      rejectUnauthorized: true,
      agent: new https.Agent({ maxCachedSessions: 0 })
    }, (res) => {
      const cert = res.socket.getPeerCertificate();
      if (!cert || !Object.keys(cert).length) {
        reject(new Error('No certificate provided'));
      } else {
        const validTo = new Date(cert.valid_to);
        const now = new Date();
        const daysRemaining = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));
        resolve(daysRemaining);
      }
    });
    
    req.on('error', (e) => reject(e));
    req.setTimeout(5000, () => req.destroy(new Error('Timeout checking SSL')));
    req.end();
  });
}

module.exports = { scanCybersecurity };
