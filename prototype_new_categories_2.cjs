const dns = require('dns').promises;


async function testDNS(domain) {
  console.log(`\n--- Testing DNS directly for ${domain} ---`);
  try {
    const mxRecords = await dns.resolveMx(domain);
    console.log('MX Records:', mxRecords);
  } catch (e) {
    console.error('MX Error:', e.message);
    // Let's try to manually query google DNS via DoH (DNS over HTTPS)
    const res = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
    const data = await res.json();
    console.log('Google DoH MX:', data.Answer);
  }

  try {
    const nsRecords = await dns.resolveNs(domain);
    console.log('NS Records:', nsRecords);
  } catch (e) {
    console.error('NS Error:', e.message);
    const res = await fetch(`https://dns.google/resolve?name=${domain}&type=NS`);
    const data = await res.json();
    console.log('Google DoH NS:', data.Answer);
  }
}

async function testESG(domain) {
  console.log(`\n--- Testing ESG for ${domain} ---`);
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    console.log('No Gemini API key.');
    return;
  }
  
  const prompt = `You are a Third-Party Risk Management (TPRM) analyst. Perform a targeted web search to determine if the company at domain "${domain}" has any publicly available Environmental, Social, and Governance (ESG) reports, Sustainability statements, or Modern Slavery statements. Reply ONLY in valid JSON format: { "hasESG": boolean, "details": "1-sentence summary" }`;
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });
    const data = await res.json();
    console.log('ESG Result:', data.candidates[0].content.parts[0].text);
  } catch (e) {
    console.error('ESG Error:', e.message);
  }
}

async function runPrototypes() {
  // Load .env
  const fs = require('fs');
  try {
    const envFile = fs.readFileSync('.env', 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) process.env[match[1]] = match[2].replace(/"/g, '').trim();
    });
  } catch(e){}

  const domains = ['github.com', 'devsinc.com'];
  for (const domain of domains) {
    await testDNS(domain);
    await testESG(domain);
  }
}

runPrototypes();
