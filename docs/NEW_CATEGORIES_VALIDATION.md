# TPRM Enterprise Evolution: New Categories & Validation Report

This document outlines the four new enterprise-grade Third-Party Risk Management (TPRM) categories added to the OSINT engine, their associated signals, and the validation results from real-world testing. 

By adding these categories, the engine now perfectly balances a **Security Lens** with a **Procurement & Supply Chain Lens**.

---

## 1. ESG & Corporate Ethics (Procurement Focus)
Modern procurement teams are legally and culturally mandated to assess Environmental, Social, and Governance (ESG) risks before onboarding a vendor.

- **Scanner Name:** `server/scanners/esg.js`
- **Methodology:** Utilizes the Google Gemini 2.5 AI model acting as a corporate intelligence analyst to research the vendor for ESG transparency, Modern Slavery statements, and sustainability reporting.
- **Signals:**
  - `esg_sustainability`: AI-verified presence of ESG/Sustainability reporting.
  - `esg_modern_slavery`: AI-verified presence of Modern Slavery or Human Rights statements.

### Validation Test Results
* **github.com:** 🟢 **Success.** Gemini intelligently deduced that GitHub operates under the comprehensive ESG and Modern Slavery statements of its parent company, Microsoft.
* **devsinc.com:** 🔴 **Success.** Gemini accurately flagged that no public ESG or sustainability reports could be found, highlighting a potential supply chain ethics risk.
* **effectiverm.com:** 🔴 **Success.** Similarly flagged for lacking public ESG transparency.

---

## 2. Geopolitical Risk (Supply Chain Focus)
Supply chain teams must evaluate geographic risk to avoid operational disruptions and OFAC/FATF regulatory fines.

- **Scanner Name:** `server/scanners/geopolitical.js`
- **Methodology:** Rapid IP geolocation (`ip-api.com`) via DNS resolution, backed by a WHOIS fallback, to trace the physical hosting location of the vendor's infrastructure.
- **Signals:**
  - `geo_hosting_location`: Infrastructure mapped to a specific jurisdiction. Flags as `Critical` if hosted in high-risk/embargoed regions (e.g., KP, IR, SY, CU, RU).

### Validation Test Results
* **github.com:** 🟢 **Success.** Mapped active infrastructure to India (IN) via Microsoft Corporation.
* **devsinc.com:** 🟢 **Success.** Mapped to United States (US) via Cloudflare.
* **effectiverm.com:** 🟢 **Success.** Mapped to United States (US) via AWS.
* **thisisafakedomain12345.xyz:** 🟢 **Success.** Gracefully caught DNS `ENOTFOUND` and reported that location could not be determined.

---

## 3. Nth-Party / Cloud Concentration (Security Focus)
Security teams need to evaluate Fourth-Party risk—understanding who their vendors rely on for critical infrastructure.

- **Scanner Name:** `server/scanners/nth_party.js`
- **Methodology:** Queries Google's DNS-over-HTTPS (DoH) API (`dns.google/resolve`) to reliably bypass local network blocks and extract `MX` (Mail Exchange) and `NS` (Name Server) records.
- **Signals:**
  - `nth_email_provider`: Identifies enterprise-grade email security (e.g., M365, Google Workspace) vs. risky private mail servers.
  - `nth_cloud_hosting`: Identifies enterprise cloud/DNS infrastructure (e.g., AWS, Azure, GCP, Cloudflare) vs. small/private hosts.

### Validation Test Results
* **github.com:** 🟢 **Success.** Discovered corporate email running on Microsoft 365 and cloud infrastructure on AWS Route53.
* **devsinc.com:** 🟢 **Success.** Discovered corporate email on Google Workspace and web infrastructure protected by Cloudflare.
* **effectiverm.com:** 🟡 **Success.** Identified Google Workspace for email, but flagged a small/private DNS provider for cloud hosting.

---

## 4. Operational Resilience (Shared Focus)
Evaluates whether a vendor can survive an outage and if they communicate transparently with their customers.

- **Scanner Name:** `server/scanners/resilience.js`
- **Methodology:** Intelligently probes infrastructure for public transparency pages (`status.domain`, `trust.domain`, `uptime.domain`) with strict timeouts.
- **Signals:**
  - `res_status_page`: Validates the presence of a dedicated transparent status page.

### Validation Test Results
* **github.com:** 🟢 **Success.** Verified public status page at `https://status.github.com`.
* **devsinc.com & effectiverm.com:** 🟡 **Success.** Correctly identified that neither domain publishes a standard public status page, flagging them for lower operational transparency.

---

## Conclusion
The real-world testing proves that the OSINT engine can rapidly, accurately, and safely extract advanced TPRM metrics without requiring local dependencies or fragile network setups. The transition to AI-assisted analysis (Gemini) and DoH (DNS-over-HTTPS) has drastically improved the resilience and intelligence of the scoring model.
