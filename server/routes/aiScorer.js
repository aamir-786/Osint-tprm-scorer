const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const geminiApiKey = process.env.GEMINI_API_KEY;

async function generateAIScore(domain) {
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured in .env');
  }

  const prompt = `You are an expert Third-Party Risk Management (TPRM) Analyst. 
I need you to independently evaluate the company operating at the domain "${domain}".
Use your internal knowledge to assess them across these 5 categories:
1. Security & Privacy (30%)
   Focus: "Is my data safe?"
   Evaluate: SSL Grade & Cert, Certificate Validity, Security Headers, Known Vulnerabilities (CVEs), Exposed Services, security.txt Presence, Privacy Policy Presence.
2. Reliability & Maturity (25%)
   Focus: "Are they established and reliable?"
   Evaluate: Domain Registration Age, Public Market Verification, Global Notability, Public Status Page Presence, Cloud & DNS Hosting, Corporate Email Provider.
3. Financial Health (15%)
   Focus: "Are they going bankrupt?"
   Evaluate: Insolvency & Bankruptcy, Layoffs & Funding News. (If info is lacking, apply penalty for lack of transparency).
4. Reputation & Ethics (15%)
   Focus: "Are they involved in scandals?"
   Evaluate: Negative Media Screening, Breach Disclosure, ESG/Sustainability Reporting, Modern Slavery Statement.
5. Legal & Geopolitical (15%)
   Focus: "Is it legal and safe to do business with them?"
   Evaluate: Sanctions & Watchlist Check, Hosting Jurisdiction.

SCORING METHODOLOGY:
- The company starts with a perfect score of 950.
- For each category, recall any known facts and evaluate based on the criteria.
- If you find negative information or lack of transparency, apply a penalty based on severity:
  - Critical (-150): e.g., active sanctions, massive data breach, bankruptcy.
  - High (-70): e.g., multiple negative news, major outages, expired certs.
  - Medium (-30): e.g., isolated complaints, minor security flaws.
  - Low (-10): e.g., young company, minor compliance gaps.
- If no negative info is found for a category, penalty is 0.

Calculate the final score (max 950, min 0) and assign a Grade:
- Grade A: 801-950
- Grade B: 601-800
- Grade C: 401-600
- Grade D: 201-400
- Grade F: 0-200

OUTPUT FORMAT:
You MUST output ONLY a valid JSON object matching this exact schema, with no markdown formatting or backticks:
{
  "finalScore": 950,
  "grade": "A",
  "summary": "1-2 sentence executive summary of your evaluation.",
  "categories": [
    {
      "name": "Security & Privacy",
      "findings": "Your analysis for this category...",
      "penaltyApplied": 0
    }
  ]
}
Make sure there are exactly 5 objects in the categories array.`;

  try {
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    let resultText = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) {
      throw new Error('No response from Gemini API');
    }

    // Strip markdown code block if present
    resultText = resultText.replace(/^```(json)?/im, '').replace(/```$/im, '').trim();

    const jsonResult = JSON.parse(resultText);
    return jsonResult;
  } catch (error) {
    console.error(`[AI Scorer] Error fetching score for ${domain}:`, error.message);
    throw error;
  }
}

module.exports = { generateAIScore };
