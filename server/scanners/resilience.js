const dns = require('dns').promises;

async function fetchUrl(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function scanResilience(domain) {
  const findings = [];
  const subdomains = ['status', 'trust', 'uptime'];
  let foundPage = false;
  let statusUrl = '';

  for (const sub of subdomains) {
    const url = `https://${sub}.${domain}`;
    try {
      // DNS lookup first to fail fast if subdomain doesn't exist
      await dns.lookup(`${sub}.${domain}`);
      
      const res = await fetchUrl(url, 4000);
      if (res.status >= 200 && res.status < 400) {
         foundPage = true;
         statusUrl = url;
         break;
      }
    } catch (e) {
      // Ignore ENOTFOUND and timeout errors, continue checking others
    }
  }

  if (foundPage) {
    findings.push({
      signalId: 'res_status_page',
      hasFinding: false,
      severity: 'Informational',
      findingDetails: `Public status/uptime page verified at: ${statusUrl}`,
      source: 'HTTP Prober'
    });
  } else {
    findings.push({
      signalId: 'res_status_page',
      hasFinding: true,
      severity: 'Low',
      findingDetails: 'No public status page (status.*, trust.*, uptime.*) detected. May indicate lower operational transparency.',
      source: 'HTTP Prober'
    });
  }

  return findings;
}

module.exports = { scanResilience };
