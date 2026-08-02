const dns = require('dns').promises;
const whois = require('whois-json');

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

// Simple mapping for high-risk regions (e.g., sanctioned or FATF black/grey lists)
const HIGH_RISK_COUNTRIES = ['KP', 'IR', 'SY', 'CU', 'RU', 'BY']; // Examples

async function scanGeopolitical(domain) {
  const findings = [];
  let countryCode = 'Unknown';
  let countryName = 'Unknown';
  let source = 'IP-API / WHOIS';

  try {
    // 1. Try IP Geolocation
    const { address } = await dns.lookup(domain);
    try {
      const geoRes = await fetchUrl(`http://ip-api.com/json/${address}`);
      const geoData = await geoRes.json();
      if (geoData && geoData.status === 'success') {
        countryCode = geoData.countryCode;
        countryName = geoData.country;
        source = 'IP Geolocation';
      }
    } catch (e) {
      // Fallback to WHOIS if IP lookup fails
      const whoisRes = await whois(domain);
      countryCode = whoisRes.registrantCountry || whoisRes.country || 'Unknown';
      countryName = countryCode; // WHOIS usually just gives code
      source = 'WHOIS';
    }

    if (countryCode !== 'Unknown') {
      const isHighRisk = HIGH_RISK_COUNTRIES.includes(countryCode.toUpperCase());
      
      findings.push({
        signalId: 'geo_hosting_location',
        hasFinding: isHighRisk,
        severity: isHighRisk ? 'Critical' : 'Informational',
        findingDetails: isHighRisk 
          ? `Infrastructure mapped to High-Risk/Sanctioned Jurisdiction: ${countryName} (${countryCode})`
          : `Infrastructure mapped to Jurisdiction: ${countryName} (${countryCode})`,
        source: source
      });
    } else {
      findings.push({
        signalId: 'geo_hosting_location',
        hasFinding: false,
        severity: 'Informational',
        findingDetails: 'Could not confidently determine geographic jurisdiction.',
        source: 'Geo / WHOIS'
      });
    }
  } catch (err) {
    if (err.code === 'ENOTFOUND') {
      findings.push({
        signalId: 'geo_hosting_location',
        hasFinding: false,
        severity: 'Informational',
        findingDetails: 'Domain does not resolve to an IP. Cannot determine location.',
        source: 'DNS'
      });
    } else {
      findings.push({
        signalId: 'geo_hosting_location',
        hasFinding: false,
        severity: 'Informational',
        findingDetails: 'API request limit exhausted or unavailable. Cannot verify this signal.',
        source: 'Geo API'
      });
    }
  }

  return findings;
}

module.exports = { scanGeopolitical };
