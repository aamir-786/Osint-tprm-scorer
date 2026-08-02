# Comprehensive Scanner Test Results

**Date:** 2026-07-30T20:57:58.207Z

Testing all categories and signals across multiple domains.

## Domain: `github.com`

### Category: Cybersecurity
- **Status:** ✅ Success (7.08s)
- **Findings:** 3
  - 🟢 **[cs_ssl]** SSL Certificate is valid for 62 days. (Source: Native TLS Check)
  - 🟢 **[cs_exposed_services]** API request limit exhausted or unavailable. Cannot verify this signal. (Source: Shodan API)
  - 🟢 **[cs_security_txt]** security.txt is published. (Source: HTTP GET /.well-known/security.txt)

### Category: Compliance
- **Status:** ✅ Success (9.43s)
- **Findings:** 1
  - 🔴 **[cp_privacy_policy]** No Privacy Policy links detected in the rendered DOM. (Source: Puppeteer DOM Scraper)

### Category: Business Stability
- **Status:** ✅ Success (3.33s)
- **Findings:** 2
  - 🔴 **[bs_bankruptcy]** News found regarding potential bankruptcy (3 articles). (Source: NewsAPI)
  - 🔴 **[bs_layoffs]** News found regarding mass layoffs (14 articles). (Source: NewsAPI)

### Category: Reputation
- **Status:** ✅ Success (5.38s)
- **Findings:** 2
  - 🔴 **[rep_negative_news]** AI Summary: GitHub has been implicated in a "FakeGit" campaign involving 7,600 malicious repositories used to spread SmartLoader malware. Separately, a legitimate GitHub repository was inadvertently taken down due to an erroneous DMCA notice. (Source: NewsAPI)
  - 🟢 **[rep_breach_history]** API request limit exhausted or unavailable. Cannot verify this signal. (Source: External API)

### Category: Legal
- **Status:** ✅ Success (0.64s)
- **Findings:** 1
  - 🟢 **[lr_fines]** API request limit exhausted or unavailable. Cannot verify this signal. (Source: OpenSanctions API)

### Category: Maturity
- **Status:** ✅ Success (4.31s)
- **Findings:** 3
  - 🟢 **[bm_domain_age]** Domain is established (18.8 years old). (Source: WHOIS)
  - 🟢 **[bm_public_market]** API request limit exhausted or unavailable. Cannot verify this signal. (Source: Yahoo Finance API)
  - 🟢 **[bm_wikipedia]** Global notability verified by AI: GitHub has a dedicated Wikipedia page, which is a strong indicator of global recognition and notability for an enterprise. (Source: Gemini AI (Wikipedia))

### Category: ESG
- **Status:** ✅ Success (9.03s)
- **Findings:** 2
  - 🟢 **[esg_sustainability]** ESG/Sustainability reporting verified: GitHub (github.com) operates under the comprehensive ESG reporting, sustainability initiatives, and Modern Slavery Act Transparency Statement of its parent company, Microsoft, rather than publishing separate, standalone reports. (Source: Gemini AI (ESG))
  - 🟢 **[esg_modern_slavery]** Assumed covered under corporate ethics/ESG umbrella. (Source: Gemini AI (Ethics))

### Category: Geopolitical
- **Status:** ✅ Success (1.33s)
- **Findings:** 1
  - 🟢 **[geo_hosting_location]** Infrastructure mapped to Jurisdiction: India (IN) (Source: IP Geolocation)

### Category: Nth-Party
- **Status:** ✅ Success (0.44s)
- **Findings:** 2
  - 🟢 **[nth_email_provider]** Corporate Email Provider: Microsoft 365 (Source: DNS MX (Google DoH))
  - 🟢 **[nth_cloud_hosting]** Cloud Infrastructure / DNS: AWS Route53 / Amazon Web Services (Source: DNS NS (Google DoH))

### Category: Resilience
- **Status:** ✅ Success (1.39s)
- **Findings:** 1
  - 🟢 **[res_status_page]** Public status/uptime page verified at: https://status.github.com (Source: HTTP Prober)

## Domain: `devsinc.com`

### Category: Cybersecurity
- **Status:** ✅ Success (1.78s)
- **Findings:** 3
  - 🟢 **[cs_ssl]** SSL Certificate is valid for 41 days. (Source: Native TLS Check)
  - 🟡 **[cs_exposed_services]** Exposed non-standard ports detected on 198.202.211.1: 2096, 2082, 2083, 2052, 2053, 2086, 2087, 2095, 8880 (Verified via DNS IP Resolution) (Source: Shodan API)
  - 🟡 **[cs_security_txt]** Missing security.txt file. (Source: HTTP GET /.well-known/security.txt)

### Category: Compliance
- **Status:** ✅ Success (8.46s)
- **Findings:** 1
  - 🟢 **[cp_privacy_policy]** Privacy Policy links successfully extracted via Headless DOM Rendering. (Source: Puppeteer DOM Scraper)

### Category: Business Stability
- **Status:** ✅ Success (0.96s)
- **Findings:** 2
  - 🟢 **[bs_bankruptcy]** No recent bankruptcy news detected. (Source: NewsAPI)
  - 🟢 **[bs_layoffs]** No recent mass layoff news detected. (Source: NewsAPI)

### Category: Reputation
- **Status:** ✅ Success (0.27s)
- **Findings:** 2
  - 🟢 **[rep_negative_news]** No adverse media found in recent news. (Source: NewsAPI)
  - 🟢 **[rep_breach_history]** API request limit exhausted or unavailable. Cannot verify this signal. (Source: External API)

### Category: Legal
- **Status:** ✅ Success (0.81s)
- **Findings:** 1
  - 🟢 **[lr_fines]** API request limit exhausted or unavailable. Cannot verify this signal. (Source: OpenSanctions API)

### Category: Maturity
- **Status:** ✅ Success (4.61s)
- **Findings:** 3
  - 🟢 **[bm_domain_age]** WHOIS data missing creation date. Cannot verify this signal. (Source: WHOIS)
  - 🟢 **[bm_public_market]** API request limit exhausted or unavailable. Cannot verify this signal. (Source: Yahoo Finance API)
  - 🟡 **[bm_wikipedia]** AI analysis: Devsinc does not have a dedicated Wikipedia page and lacks significant, independent coverage in globally recognized media outlets to establish broad notability. (Source: Gemini AI)

### Category: ESG
- **Status:** ✅ Success (4.26s)
- **Findings:** 1
  - 🔴 **[esg_sustainability]** No public ESG, Sustainability, or Modern Slavery reports found. May pose a supply chain ethics risk. (Source: Gemini AI (ESG))

### Category: Geopolitical
- **Status:** ✅ Success (1.74s)
- **Findings:** 1
  - 🟢 **[geo_hosting_location]** Infrastructure mapped to Jurisdiction: United States (US) (Source: IP Geolocation)

### Category: Nth-Party
- **Status:** ✅ Success (0.69s)
- **Findings:** 2
  - 🟢 **[nth_email_provider]** Corporate Email Provider: Google Workspace (Source: DNS MX (Google DoH))
  - 🟢 **[nth_cloud_hosting]** Cloud Infrastructure / DNS: Cloudflare (DDoS/WAF Protection active) (Source: DNS NS (Google DoH))

### Category: Resilience
- **Status:** ✅ Success (0.07s)
- **Findings:** 1
  - 🟡 **[res_status_page]** No public status page (status.*, trust.*, uptime.*) detected. May indicate lower operational transparency. (Source: HTTP Prober)

## Domain: `effectiverm.com`

### Category: Cybersecurity
- **Status:** ✅ Success (4.88s)
- **Findings:** 3
  - 🟢 **[cs_ssl]** SSL Certificate is valid for 57 days. (Source: Native TLS Check)
  - 🟢 **[cs_exposed_services]** Only standard safe web ports exposed on 75.2.60.5: 80, 443 (Verified via DNS IP Resolution) (Source: Shodan API)
  - 🟡 **[cs_security_txt]** Missing security.txt file. (Source: HTTP GET /.well-known/security.txt)

### Category: Compliance
- **Status:** ✅ Success (9.07s)
- **Findings:** 1
  - 🟢 **[cp_privacy_policy]** Privacy Policy links successfully extracted via Headless DOM Rendering. (Source: Puppeteer DOM Scraper)

### Category: Business Stability
- **Status:** ✅ Success (0.57s)
- **Findings:** 2
  - 🟢 **[bs_bankruptcy]** No recent bankruptcy news detected. (Source: NewsAPI)
  - 🟢 **[bs_layoffs]** No recent mass layoff news detected. (Source: NewsAPI)

### Category: Reputation
- **Status:** ✅ Success (0.26s)
- **Findings:** 2
  - 🟢 **[rep_negative_news]** No adverse media found in recent news. (Source: NewsAPI)
  - 🟢 **[rep_breach_history]** API request limit exhausted or unavailable. Cannot verify this signal. (Source: External API)

### Category: Legal
- **Status:** ✅ Success (0.59s)
- **Findings:** 1
  - 🟢 **[lr_fines]** API request limit exhausted or unavailable. Cannot verify this signal. (Source: OpenSanctions API)

### Category: Maturity
- **Status:** ✅ Success (6.11s)
- **Findings:** 3
  - 🟢 **[bm_domain_age]** WHOIS data missing creation date. Cannot verify this signal. (Source: WHOIS)
  - 🟢 **[bm_public_market]** API request limit exhausted or unavailable. Cannot verify this signal. (Source: Yahoo Finance API)
  - 🟡 **[bm_wikipedia]** AI analysis: Effectiverm does not have a dedicated Wikipedia page and lacks significant evidence of global recognition or widespread media coverage to suggest widespread notability. (Source: Gemini AI)

### Category: ESG
- **Status:** ✅ Success (4.42s)
- **Findings:** 1
  - 🔴 **[esg_sustainability]** No public ESG, Sustainability, or Modern Slavery reports found. May pose a supply chain ethics risk. (Source: Gemini AI (ESG))

### Category: Geopolitical
- **Status:** ✅ Success (4.24s)
- **Findings:** 1
  - 🟢 **[geo_hosting_location]** Infrastructure mapped to Jurisdiction: United States (US) (Source: IP Geolocation)

### Category: Nth-Party
- **Status:** ✅ Success (1.80s)
- **Findings:** 2
  - 🟢 **[nth_email_provider]** Corporate Email Provider: Google Workspace (Source: DNS MX (Google DoH))
  - 🟡 **[nth_cloud_hosting]** Cloud Infrastructure / DNS: Small/Private DNS Provider (Source: DNS NS (Google DoH))

### Category: Resilience
- **Status:** ✅ Success (2.18s)
- **Findings:** 1
  - 🟡 **[res_status_page]** No public status page (status.*, trust.*, uptime.*) detected. May indicate lower operational transparency. (Source: HTTP Prober)

## Domain: `thisisafakedomain12345.xyz`

### Category: Cybersecurity
- **Status:** ✅ Success (0.82s)
- **Findings:** 3
  - 🟢 **[cs_ssl]** Domain does not resolve to an IP (getaddrinfo ENOTFOUND thisisafakedomain12345.xyz). Cannot verify SSL. (Source: Native TLS Check)
  - 🟢 **[cs_exposed_services]** Domain does not resolve to an IP. Cannot run Shodan scan. (Source: Shodan API)
  - 🟡 **[cs_security_txt]** Missing security.txt file. (Source: HTTP GET /.well-known/security.txt)

### Category: Compliance
- **Status:** ✅ Success (3.28s)
- **Findings:** 1
  - 🔴 **[cp_privacy_policy]** No Privacy Policy links detected in the rendered DOM. (Source: Puppeteer DOM Scraper)

### Category: Business Stability
- **Status:** ✅ Success (1.61s)
- **Findings:** 2
  - 🟢 **[bs_bankruptcy]** No recent bankruptcy news detected. (Source: NewsAPI)
  - 🟢 **[bs_layoffs]** No recent mass layoff news detected. (Source: NewsAPI)

### Category: Reputation
- **Status:** ✅ Success (0.26s)
- **Findings:** 2
  - 🟢 **[rep_negative_news]** No adverse media found in recent news. (Source: NewsAPI)
  - 🟢 **[rep_breach_history]** API request limit exhausted or unavailable. Cannot verify this signal. (Source: External API)

### Category: Legal
- **Status:** ✅ Success (2.38s)
- **Findings:** 1
  - 🟢 **[lr_fines]** API request limit exhausted or unavailable. Cannot verify this signal. (Source: OpenSanctions API)

### Category: Maturity
- **Status:** ✅ Success (3.27s)
- **Findings:** 3
  - 🟢 **[bm_domain_age]** WHOIS data missing creation date. Cannot verify this signal. (Source: WHOIS)
  - 🟢 **[bm_public_market]** API request limit exhausted or unavailable. Cannot verify this signal. (Source: Yahoo Finance API)
  - 🟡 **[bm_wikipedia]** No dedicated corporate Wikipedia article found. Lacks global notability. (Source: Wikipedia API)

### Category: ESG
- **Status:** ✅ Success (0.78s)
- **Findings:** 1
  - 🟢 **[esg_sustainability]** API request limit exhausted or unavailable. Cannot verify this signal. (Source: Gemini AI)

### Category: Geopolitical
- **Status:** ✅ Success (0.02s)
- **Findings:** 1
  - 🟢 **[geo_hosting_location]** Domain does not resolve to an IP. Cannot determine location. (Source: DNS)

### Category: Nth-Party
- **Status:** ✅ Success (0.47s)
- **Findings:** 2
  - 🟢 **[nth_email_provider]** Corporate Email Provider: No MX records found. Domain does not receive email. (Source: DNS MX (Google DoH))
  - 🟢 **[nth_cloud_hosting]** Cloud Infrastructure / DNS: No NS records found. (Source: DNS NS (Google DoH))

### Category: Resilience
- **Status:** ✅ Success (0.68s)
- **Findings:** 1
  - 🟡 **[res_status_page]** No public status page (status.*, trust.*, uptime.*) detected. May indicate lower operational transparency. (Source: HTTP Prober)

