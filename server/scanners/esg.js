async function fetchUrl(url, timeoutMs = 8000, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function scanESG(domain) {
  const findings = [];
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    findings.push({
      signalId: 'esg_sustainability',
      hasFinding: false,
      severity: 'Informational',
      findingDetails: 'API request limit exhausted or unavailable (No Key). Cannot verify this signal.',
      source: 'Gemini AI (ESG)'
    });
    return findings;
  }

  const prompt = `You are a Third-Party Risk Management (TPRM) analyst. Perform a targeted web search to determine if the company at domain "${domain}" has any publicly available Environmental, Social, and Governance (ESG) reports, Sustainability statements, or Modern Slavery statements. Reply ONLY in valid JSON format: { "hasESG": boolean, "details": "1-sentence summary" }`;
  
  try {
    const res = await fetchUrl(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, 15000, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (res.status === 429) {
      findings.push({
        signalId: 'esg_sustainability',
        hasFinding: false,
        severity: 'Informational',
        findingDetails: 'API request limit exhausted or unavailable. Cannot verify this signal.',
        source: 'Gemini AI'
      });
      return findings;
    }

    const data = await res.json();
    let resultJson;
    try {
      const text = data.candidates[0].content.parts[0].text;
      resultJson = JSON.parse(text);
    } catch(e) {
      resultJson = { hasESG: false, details: 'Failed to parse AI response.' };
    }

    if (resultJson.hasESG) {
      findings.push({
        signalId: 'esg_sustainability',
        hasFinding: false,
        severity: 'Informational',
        findingDetails: `ESG/Sustainability reporting verified: ${resultJson.details}`,
        source: 'Gemini AI (ESG)'
      });
      findings.push({
        signalId: 'esg_modern_slavery',
        hasFinding: false,
        severity: 'Informational',
        findingDetails: 'Assumed covered under corporate ethics/ESG umbrella.',
        source: 'Gemini AI (Ethics)'
      });
    } else {
      findings.push({
        signalId: 'esg_sustainability',
        hasFinding: true,
        severity: 'Medium',
        findingDetails: 'No public ESG, Sustainability, or Modern Slavery reports found. May pose a supply chain ethics risk.',
        source: 'Gemini AI (ESG)'
      });
    }
  } catch (err) {
    console.warn(`[ESG] AI scan failed for ${domain}:`, err.message);
    findings.push({
      signalId: 'esg_sustainability',
      hasFinding: false,
      severity: 'Informational',
      findingDetails: 'API request limit exhausted or unavailable. Cannot verify this signal.',
      source: 'Gemini AI (ESG)'
    });
  }

  return findings;
}

module.exports = { scanESG };
