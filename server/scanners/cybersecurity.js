const axios = require('axios');
const tls = require('tls');
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
    findings.push({
      signalId: 'cs_ssl',
      hasFinding: true,
      severity: 'Critical',
      findingDetails: `Failed to establish secure TLS connection: ${err.message}`,
      source: 'Native TLS Check'
    });
  }

  // 2. Exposed Services Check (Shodan API)
  const shodanKey = process.env.SHODAN_API_KEY;
  if (shodanKey) {
    try {
      // Free Shodan Dev API keys cannot use /shodan/host/search. 
      // We must resolve the domain to an IP first, then use /shodan/host/{ip}
      const dns = require('dns').promises;
      const { address } = await dns.lookup(domain);
      
      if (address) {
        const ip = address;
        try {
          const response = await axios.get(`https://api.shodan.io/shodan/host/${ip}?key=${shodanKey}`);
          
          if (response.data && response.data.ports) {
            const ports = response.data.ports;
            const criticalPorts = [3389, 22, 23, 21, 1433, 3306, 27017, 9200];
            const exposedCritical = ports.filter(p => criticalPorts.includes(p));

            if (exposedCritical.length > 0) {
              findings.push({
                signalId: 'cs_exposed_services',
                hasFinding: true,
                severity: 'High',
                findingDetails: `Exposed critical ports detected on ${ip}: ${exposedCritical.join(', ')}`,
                source: 'Shodan API'
              });
            } else {
              findings.push({
                signalId: 'cs_exposed_services',
                hasFinding: true,
                severity: 'Low',
                findingDetails: `Exposed non-standard ports detected on ${ip}: ${ports.join(', ')}`,
                source: 'Shodan API'
              });
            }
          } else {
            findings.push({
              signalId: 'cs_exposed_services',
              hasFinding: false,
              severity: 'Informational',
              findingDetails: `No exposed ports found on ${ip}.`,
              source: 'Shodan API'
            });
          }
        } catch (shodanErr) {
            if (shodanErr.response && shodanErr.response.status === 404) {
               // 404 just means Shodan hasn't scanned this IP or found nothing
               findings.push({
                 signalId: 'cs_exposed_services',
                 hasFinding: false,
                 severity: 'Informational',
                 findingDetails: `No Shodan records found for ${ip}.`,
                 source: 'Shodan API'
               });
            } else {
               throw shodanErr;
            }
        }
      }
    } catch (err) {
      console.error(`Shodan API error for ${domain}:`, err.message);
    }
  } else {
    console.log(`[Cyber] Skipping Shodan scan for ${domain} (No API Key)`);
  }

  // 3. Security.txt check
  try {
    const response = await axios.get(`https://${domain}/.well-known/security.txt`, { timeout: 3000 });
    findings.push({
      signalId: 'cs_security_txt',
      hasFinding: false,
      severity: 'Informational',
      findingDetails: 'security.txt is published.',
      source: 'HTTP GET /.well-known/security.txt'
    });
  } catch (err) {
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
