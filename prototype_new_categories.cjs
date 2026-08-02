const dns = require('dns').promises;
const https = require('https');
const whois = require('whois-json');

async function fetchUrl(url, timeoutMs = 5000) {
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

async function testGeopolitical(domain) {
  console.log(`\n--- Testing Geopolitical for ${domain} ---`);
  try {
    const { address } = await dns.lookup(domain);
    console.log(`IP: ${address}`);
    
    // Free IP geolocation API
    try {
      const geoRes = await fetchUrl(`http://ip-api.com/json/${address}`);
      const geoData = await geoRes.json();
      if (geoData && geoData.status === 'success') {
        console.log(`Country: ${geoData.country} (${geoData.countryCode})`);
        console.log(`ISP/Host: ${geoData.isp}`);
      } else {
        console.log('Failed to get IP geolocation from ip-api.');
      }
    } catch (apiErr) {
      console.log('API Error for geo:', apiErr.message);
    }

    // Try WHOIS as backup
    const whoisRes = await whois(domain);
    const registrantCountry = whoisRes.registrantCountry || whoisRes.country || 'Unknown';
    console.log(`WHOIS Country: ${registrantCountry}`);
  } catch (e) {
    console.error('Geo error:', e.message);
  }
}

async function testNthParty(domain) {
  console.log(`\n--- Testing Nth-Party (Cloud/DNS) for ${domain} ---`);
  try {
    // 1. Check MX records (Email Provider)
    const mxRecords = await dns.resolveMx(domain).catch(() => []);
    if (mxRecords.length > 0) {
      console.log('MX Records found:');
      mxRecords.forEach(mx => console.log(` - ${mx.exchange}`));
      
      const mxString = mxRecords.map(m => m.exchange).join(' ').toLowerCase();
      if (mxString.includes('google.com')) console.log(' -> Identified: Google Workspace');
      else if (mxString.includes('outlook.com') || mxString.includes('protection.outlook.com')) console.log(' -> Identified: Microsoft 365');
      else if (mxString.includes('mimecast')) console.log(' -> Identified: Mimecast');
      else if (mxString.includes('proofpoint')) console.log(' -> Identified: Proofpoint');
    } else {
      console.log('No MX records found.');
    }

    // 2. Check NS records (DNS/WAF Provider)
    const nsRecords = await dns.resolveNs(domain).catch(() => []);
    if (nsRecords.length > 0) {
      console.log('NS Records found:');
      nsRecords.forEach(ns => console.log(` - ${ns}`));
      
      const nsString = nsRecords.join(' ').toLowerCase();
      if (nsString.includes('cloudflare')) console.log(' -> Identified: Cloudflare');
      else if (nsString.includes('awsdns')) console.log(' -> Identified: AWS Route53');
      else if (nsString.includes('googledomains')) console.log(' -> Identified: Google Cloud DNS');
      else if (nsString.includes('azure-dns')) console.log(' -> Identified: Azure DNS');
    } else {
      console.log('No NS records found.');
    }
  } catch (e) {
    console.error('Nth-party error:', e.message);
  }
}

async function testResilience(domain) {
  console.log(`\n--- Testing Resilience (Status Pages) for ${domain} ---`);
  
  const subdomains = ['status', 'trust', 'uptime'];
  
  for (const sub of subdomains) {
    const url = `https://${sub}.${domain}`;
    try {
      // Just check if it resolves first to avoid hanging on non-existent domains
      await dns.lookup(`${sub}.${domain}`);
      
      const res = await fetchUrl(url, 3000);
      if (res.status >= 200 && res.status < 400) {
         console.log(`[SUCCESS] Found status page at: ${url} (Status: ${res.status})`);
         return; // Found one, no need to check others
      } else {
         console.log(`Found domain but returned status ${res.status}: ${url}`);
      }
    } catch (e) {
      if (e.code === 'ENOTFOUND') {
        console.log(`No DNS record for: ${sub}.${domain}`);
      } else {
        console.log(`Failed to connect to: ${url} (${e.message})`);
      }
    }
  }
  console.log('No common status pages found.');
}

async function runPrototypes() {
  const domains = ['github.com', 'devsinc.com', 'effectiverm.com'];
  
  for (const domain of domains) {
    console.log(`\n==========================================`);
    console.log(`PROTOTYPING FOR: ${domain}`);
    console.log(`==========================================`);
    
    await testGeopolitical(domain);
    await testNthParty(domain);
    await testResilience(domain);
  }
}

runPrototypes();
