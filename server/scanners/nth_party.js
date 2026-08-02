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

async function resolveDns(domain, type) {
  // Use Google DNS-over-HTTPS for reliable resolution regardless of host environment
  const url = `https://dns.google/resolve?name=${domain}&type=${type}`;
  const res = await fetchUrl(url);
  const data = await res.json();
  if (!data.Answer) return [];
  return data.Answer.map(a => a.data);
}

async function scanNthParty(domain) {
  const findings = [];

  try {
    // 1. Email Provider (MX)
    const mxRecords = await resolveDns(domain, 'MX');
    let emailProvider = 'Unknown or Private Mail Server (Higher Risk)';
    let emailSeverity = 'Low';
    
    if (mxRecords.length > 0) {
      const mxString = mxRecords.join(' ').toLowerCase();
      if (mxString.includes('google.com') || mxString.includes('aspmx')) {
        emailProvider = 'Google Workspace';
        emailSeverity = 'Informational';
      } else if (mxString.includes('outlook.com') || mxString.includes('protection.outlook.com')) {
        emailProvider = 'Microsoft 365';
        emailSeverity = 'Informational';
      } else if (mxString.includes('mimecast')) {
        emailProvider = 'Mimecast';
        emailSeverity = 'Informational';
      } else if (mxString.includes('proofpoint')) {
        emailProvider = 'Proofpoint';
        emailSeverity = 'Informational';
      } else {
        emailProvider = 'Custom/Private Mail Server (Requires scrutiny)';
        emailSeverity = 'Low';
      }
    } else {
      emailProvider = 'No MX records found. Domain does not receive email.';
      emailSeverity = 'Informational';
    }

    findings.push({
      signalId: 'nth_email_provider',
      hasFinding: emailSeverity !== 'Informational',
      severity: emailSeverity,
      findingDetails: `Corporate Email Provider: ${emailProvider}`,
      source: 'DNS MX (Google DoH)'
    });

    // 2. Cloud/DNS/WAF Provider (NS)
    const nsRecords = await resolveDns(domain, 'NS');
    let cloudProvider = 'Custom or Small DNS Provider (Potential concentration risk)';
    let cloudSeverity = 'Low';

    if (nsRecords.length > 0) {
      const nsString = nsRecords.join(' ').toLowerCase();
      if (nsString.includes('cloudflare')) {
        cloudProvider = 'Cloudflare (DDoS/WAF Protection active)';
        cloudSeverity = 'Informational';
      } else if (nsString.includes('awsdns')) {
        cloudProvider = 'AWS Route53 / Amazon Web Services';
        cloudSeverity = 'Informational';
      } else if (nsString.includes('googledomains') || nsString.includes('google.com')) {
        cloudProvider = 'Google Cloud DNS (GCP)';
        cloudSeverity = 'Informational';
      } else if (nsString.includes('azure-dns')) {
        cloudProvider = 'Azure DNS / Microsoft Cloud';
        cloudSeverity = 'Informational';
      } else if (nsString.includes('nsone')) {
        cloudProvider = 'NS1 (Enterprise DNS)';
        cloudSeverity = 'Informational';
      } else if (nsString.includes('domaincontrol') || nsString.includes('godaddy')) {
        cloudProvider = 'GoDaddy DNS';
        cloudSeverity = 'Informational';
      } else {
        cloudProvider = 'Small/Private DNS Provider';
        cloudSeverity = 'Low';
      }
    } else {
      cloudProvider = 'No NS records found.';
      cloudSeverity = 'Informational';
    }

    findings.push({
      signalId: 'nth_cloud_hosting',
      hasFinding: cloudSeverity !== 'Informational',
      severity: cloudSeverity,
      findingDetails: `Cloud Infrastructure / DNS: ${cloudProvider}`,
      source: 'DNS NS (Google DoH)'
    });

  } catch (err) {
    findings.push({
      signalId: 'nth_email_provider',
      hasFinding: false,
      severity: 'Informational',
      findingDetails: 'API request limit exhausted or unavailable. Cannot verify this signal.',
      source: 'Google DoH'
    });
    findings.push({
      signalId: 'nth_cloud_hosting',
      hasFinding: false,
      severity: 'Informational',
      findingDetails: 'API request limit exhausted or unavailable. Cannot verify this signal.',
      source: 'Google DoH'
    });
  }

  return findings;
}

module.exports = { scanNthParty };
