# Wahid AI TPRM Module - Complete System Documentation

## Overview
The **Wahid AI Third-Party Risk Management (TPRM) Module** is a robust, dynamic React-based web application designed to evaluate vendor risk across a 20-point OSINT telemetry matrix. The system generates a highly defensible, mathematically rigorous vendor risk score by analyzing publicly available data and user inputs.

## Core Architecture

### 1. Vendor Identity Resolution
Before assessing a vendor, the system attempts to establish a canonical identity. It resolves a generic company name to a verified primary domain.
- **Confidence Levels:** High, Medium, Low. Low confidence requires manual disambiguation.

### 2. The Scoring Engine & 6-Category Matrix
The engine starts every vendor at a perfect "Pristine" score of **950**. Risk is penalized by subtracting points based on the severity of findings across 6 core categories.

| Category | Default Weight | Planned Signals | Example Signals |
|---|---|---|---|
| **Cybersecurity** | 30% | 6 | SSL Grade, Open Ports, security.txt, CVEs |
| **Compliance & Privacy** | 20% | 3 | Privacy Policy, DPA Availability |
| **Business Stability** | 15% | 3 | Bankruptcy Filings, Mass Layoffs |
| **Reputation** | 15% | 3 | Data Breach Disclosures, Negative News |
| **Operational Resilience**| 10% | 2 | Public Outages, Missing Status Page |
| **Legal & Regulatory** | 10% | 3 | Sanctions Matches, Regulatory Action |

### 3. Severity Penalties
Findings deduct points from the category base score of 950:
- **Critical:** -150 pts
- **High:** -70 pts
- **Medium:** -30 pts
- **Low:** -10 pts
- **Informational:** 0 pts

### 4. Mathematical Weight Redistribution (The "Under-coverage" Rule)
If a category has less than **50% coverage** (e.g., only 1 out of 3 signals checked), it is deemed to have "Insufficient Data".
- Its effective weight is reduced proportionally: `Effective Weight = Original Weight × (Coverage ÷ 0.5)`.
- The "lost" weight is mathematically redistributed to the other valid categories based on their original relative weights. This ensures the final score always equals 100% of the possible model space.

### 5. Multi-Asset Cybersecurity Mode
For vendors with multiple digital assets (e.g., an API gateway, a main marketing site, and a client portal), the system evaluates each individually. 
- The module strictly applies the **Weakest Link Principle**: The asset with the lowest cybersecurity score becomes the final score for the entire Cybersecurity category.

### 6. Overrides and Hard Caps
Certain extremely severe findings instantly override the mathematical model to protect the enterprise:
- **Direct Sanctions or Active Breach:** Overrides final score to Grade F.
- **Related-Entity / Partial Sanction Match:** Applies a soft-cap of Grade C (maximum score).

### 7. Real-Time OSINT Backend Engine
To circumvent browser CORS policies and safely manage private API keys, the system leverages a dedicated **Node.js/Express Backend Proxy Server**.
- **Real-Time Data Fetching:** The backend dynamically queries live public and commercial APIs on behalf of the client (e.g., Shodan for Cybersecurity, NewsAPI for Business Stability, OpenSanctions for Legal & Regulatory).
- **Graceful Fallback:** If an API key is missing from the `.env` configuration file, the scanner intelligently skips that specific module and proceeds with the rest of the scan, ensuring the application never crashes.
- **Concurrent Execution:** The Vite React frontend and Express backend are seamlessly orchestrated to run concurrently during development, providing a highly realistic production-grade OSINT pipeline.

## Output & Reporting
The system produces two final outputs:
1. **Defensible Risk Score (0-950) & Grade (A-F)**
2. **Standardized Markdown Report:** A board-ready audit log showing exact penalties, coverage math, and detailed finding descriptions.
