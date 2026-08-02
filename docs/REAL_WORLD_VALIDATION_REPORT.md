# Real-World OSINT TPRM Validation Tests

> [!NOTE]
> The 5-Category user-centric model was tested against 4 vastly different real-world vendors to validate penalty behavior, AI fallback logic, and port scanning accuracy.

## Vendor: openai.com

### CYBERSECURITY
- *[Info]* SSL Certificate is valid for 77 days. (Source: Native TLS Check)
- **[LOW]** Unnecessary non-standard ports (closed ones) are OPEN on 172.64.154.211: 2096, 2082, 2083, 2052, 2053, 2086, 2087, 2095, 8880 (Verified via Shodan Hostnames) (Source: Shodan API)
- *[Info]* security.txt is published. (Source: HTTP GET /.well-known/security.txt)

### COMPLIANCE
- **[MEDIUM]** No Privacy Policy links detected in the rendered DOM. (Source: Puppeteer DOM Scraper)   it has privacy policies at https://openai.com/policies/privacy-policy/ fix this signal properly

### BUSINESSSTABILITY
- **[CRITICAL]** News or AI detected potential bankruptcy (multiple signals found). (Source: News/AI API)
- **[HIGH]** News or AI detected mass layoffs (multiple signals found). (Source: News/AI API)

### REPUTATION
- **[HIGH]** AI Summary: OpenAI is facing a trade secrets lawsuit from Apple, alleging the company's hardware head requested unreleased product samples from job candidates. This is among multiple lawsuits OpenAI has encountered throughout the year. (Source: NewsAPI)
- *[Info]* API request limit exhausted or unavailable. Cannot verify this signal. (Source: External API)

### LEGAL
- *[Info]* API request limit exhausted or unavailable. Cannot verify this signal. (Source: OpenSanctions API)

### MATURITY
- *[Info]* Domain is established (19.5 years old). (Source: WHOIS)
- **[LOW]** Company is not publicly traded (Private or Startup). (Source: Yahoo Finance API)
- *[Info]* Global notability verified by AI: OpenAI has a dedicated and comprehensive Wikipedia page, which serves as a strong indicator of its global recognition and notability according to Wikipedia's established criteria for organizations. (Source: Gemini AI (Wikipedia))

## Vendor: yandex.ru

### CYBERSECURITY
- *[Info]* SSL Certificate is valid for 150 days. (Source: Native TLS Check)
- *[Info]* Only necessary open web ports exposed on 2a02:6b8:a::a (No Penalty): 80, 443 (Verified via Shodan Hostnames) (Source: Shodan API)
- *[Info]* security.txt is published. (Source: HTTP GET /.well-known/security.txt)

### COMPLIANCE
- **[MEDIUM]** No Privacy Policy links detected in the rendered DOM. (Source: Puppeteer DOM Scraper)

### BUSINESSSTABILITY
- *[Info]* No recent bankruptcy news detected. (Source: News/AI API)
- *[Info]* No recent mass layoff news detected. (Source: News/AI API)

### REPUTATION
- **[HIGH]** AI Summary: The provided article, "Occupation BV: The Dutch Infrastructure Behind Israel’s War Economy," does not contain any information regarding Yandex. (Source: NewsAPI)
- *[Info]* API request limit exhausted or unavailable. Cannot verify this signal. (Source: External API)

### LEGAL
- *[Info]* API request limit exhausted or unavailable. Cannot verify this signal. (Source: OpenSanctions API)

### MATURITY
- *[Info]* WHOIS data missing creation date. Cannot verify this signal. (Source: WHOIS)
- **[LOW]** Company is not publicly traded (Private or Startup). (Source: Yahoo Finance API)
- *[Info]* Global notability verified by AI: Yandex has a dedicated Wikipedia page and is a globally recognized Russian multinational technology company, often referred to as 'Russia's Google,' with a wide range of internet services. (Source: Gemini AI (Wikipedia))

## Vendor: ftx.com

### CYBERSECURITY
- *[Info]* SSL Certificate is valid for 105 days. (Source: Native TLS Check)
- *[Info]* API request limit exhausted or unavailable. Cannot verify this signal. (Source: Shodan API)
- **[LOW]** Missing security.txt file. (Source: HTTP GET /.well-known/security.txt)

### COMPLIANCE
- **[MEDIUM]** No Privacy Policy links detected in the rendered DOM. (Source: Puppeteer DOM Scraper)

### BUSINESSSTABILITY
- **[CRITICAL]** News or AI detected potential bankruptcy (multiple signals found). (Source: News/AI API)
- **[HIGH]** News or AI detected mass layoffs (multiple signals found). (Source: News/AI API)

### REPUTATION
- **[HIGH]** AI Summary: FTX is distributing $900 million to creditors in its fifth payment round, totaling approximately $10 billion since its November 2022 bankruptcy filing. Separately, the US Senate unanimously adopted a resolution opposing clemency for former FTX CEO Sam Bankman-Fried. (Source: NewsAPI)
- *[Info]* API request limit exhausted or unavailable. Cannot verify this signal. (Source: External API)

### LEGAL
- *[Info]* API request limit exhausted or unavailable. Cannot verify this signal. (Source: OpenSanctions API)

### MATURITY
- *[Info]* Domain is established (26.6 years old). (Source: WHOIS)
- *[Info]* Publicly traded verified: Ticker FTXP (FOOTHILLS EXPLORATION INC). (Source: Yahoo Finance API)
- *[Info]* Global notability verified: Wikipedia article found ("FTX"). (Source: Wikipedia API)

## Vendor: very-new-startup-xyz123.io

### CYBERSECURITY
- *[Info]* Domain does not resolve to an IP (getaddrinfo ENOTFOUND very-new-startup-xyz123.io). Cannot verify SSL. (Source: Native TLS Check)
- *[Info]* Domain does not resolve to an IP. Cannot run Shodan scan. (Source: Shodan API)
- **[LOW]** Missing security.txt file. (Source: HTTP GET /.well-known/security.txt)

### COMPLIANCE
- **[MEDIUM]** No Privacy Policy links detected in the rendered DOM. (Source: Puppeteer DOM Scraper)

### BUSINESSSTABILITY
- *[Info]* No recent bankruptcy news detected. (Source: News/AI API)
- *[Info]* No recent mass layoff news detected. (Source: News/AI API)

### REPUTATION
- *[Info]* No adverse media found in recent news. (Source: NewsAPI)
- *[Info]* API request limit exhausted or unavailable. Cannot verify this signal. (Source: External API)

### LEGAL
- *[Info]* API request limit exhausted or unavailable. Cannot verify this signal. (Source: OpenSanctions API)

### MATURITY
- *[Info]* WHOIS data missing creation date. Cannot verify this signal. (Source: WHOIS)
- **[LOW]** Company is not publicly traded (Private or Startup). (Source: Yahoo Finance API)
- **[LOW]** No dedicated corporate Wikipedia article found. Lacks global notability. (Source: Wikipedia API)

