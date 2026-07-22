<div align="center">
  <img src="./public/wahid-logo.png" alt="Wahid AI Logo" width="250" />
</div>

<h1 align="center">Wahid AI: Third-Party Risk Management (TPRM) Scorer</h1>

<div align="center">
  <strong>Enterprise-Grade OSINT Telemetry & Vendor Risk Scoring Engine</strong>
</div>

<br />

<div align="center">
  <img src="https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</div>

<br />

## 📖 Overview

The **Wahid AI Third-Party Risk Management (TPRM) Module** is a robust, dynamic React-based web application designed to evaluate vendor risk across a 20-point OSINT telemetry matrix. The system generates a highly defensible, mathematically rigorous vendor risk score (0-950) by analyzing publicly available data and user inputs.

Built with a pristine Light Theme UI featuring glassmorphism and modern enterprise aesthetics, the module acts as a complete "Real-Time OSINT Scanner" for any domain or vendor identity.

---

## ✨ Key Features

### 🛡️ Defensible Scoring Engine
*   **Pristine Default Scoring:** Vendors start with a perfect 950 base score. Penalties are deducted based on findings.
*   **Severity Weights:** Critical (-150), High (-70), Medium (-30), Low (-10).
*   **Hard & Soft Overrides:** Critical global events bypass mathematical scoring.
    *   *Direct Sanctions/Active Ransomware breaches* force an immediate **Grade F** override.
    *   *Related-Entity sanctions* apply a soft-cap maximum of **Grade C**.

### 📊 6-Category OSINT Matrix
Evaluates vendor risk across 6 critical domains:
1.  **Cybersecurity (30%):** SSL Grade, Open Ports, `security.txt`, CVEs.
2.  **Compliance & Privacy (20%):** Privacy Policy, DPA Availability.
3.  **Business Stability (15%):** Bankruptcy Filings, Mass Layoffs.
4.  **Reputation (15%):** Data Breach Disclosures, Negative News.
5.  **Operational Resilience (10%):** Public Outages, Missing Status Page.
6.  **Legal & Regulatory (10%):** Sanctions Matches, Regulatory Action.

### 🧮 Advanced Mathematics & Under-Coverage Redistribution
Automatically detects if a category has insufficient data (< 50% of signals checked). It reduces that category's effective weight and proportionally redistributes the lost weight across all other valid categories to ensure a mathematically pure 100% score representation.

### 🌐 Multi-Asset Weakest-Link Analysis
Capable of scoring multiple domains/IPs for a single vendor, automatically assigning the lowest (weakest) cybersecurity score to the vendor's overall profile to prevent risk obfuscation.

### 📝 Standardized Board Pack Export
One-click export of the final vendor assessment into a clean, standardized Markdown (`.md`) report, ready for committee review and executive auditing.

---

## 🚀 Quick Start

### Prerequisites
*   Node.js (v16 or higher)
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/aamir-786/Osint-tprm-scorer.git
    cd Osint-tprm-scorer
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

4.  **Open your browser** and navigate to `http://localhost:5173`.

---

## 📁 Project Structure

```text
📦 src
 ┣ 📂 assets            # Static media and icons
 ┣ 📂 components        # React components
 ┃ ┣ 📜 CategorySignalMatrix.tsx    # Core 6-category evaluation matrix
 ┃ ┣ 📜 ReweightingMathDebugger.tsx # Real-time mathematical transparency
 ┃ ┣ 📜 ScorecardView.tsx           # Final Grade A-F visualization
 ┃ ┣ 📜 TprmModuleDashboard.tsx     # Main module wrapper
 ┃ ┗ 📜 VendorIdentityHeader.tsx    # Live OSINT Domain Scanner
 ┣ 📂 engine            # TPRM Scoring Logic
 ┃ ┣ 📜 constants.ts    # Matrix weights and rules
 ┃ ┣ 📜 presets.ts      # Demo scenarios (Pristine, Grade F, etc.)
 ┃ ┗ 📜 tprmEngine.ts   # The core mathematical calculator
 ┣ 📂 services          # External API hooks (OSINT)
 ┣ 📂 styles            # CSS files (Vanilla CSS system)
 ┣ 📂 types             # TypeScript interfaces
 ┣ 📜 App.tsx           # Root Application
 ┗ 📜 main.tsx          # React DOM entry
```

---

## 📚 Comprehensive Documentation

For an in-depth understanding of the scoring mathematics, identity resolution, and system architecture, please see the complete documentation in the `docs/` folder:

*   **[System Documentation](./docs/SYSTEM_DOCUMENTATION.md)** - Deep dive into the scoring engine, matrix weights, and override logic.
*   **[Demo Guide & Architecture Flow](./docs/DEMO_GUIDE.md)** - Contains a walkthrough of a demo scenario and a **Mermaid flowchart diagram** mapping the entire TPRM pipeline.

---

## 🎨 UI/UX Design Principles
This project uses **Vanilla CSS** (`src/styles/app.css`) to enforce the Wahid AI Enterprise Governance design system. It focuses on:
- High-contrast typography.
- Glassmorphism and subtle drop shadows.
- Smooth micro-animations.
- Pixel-perfect, "empty state" hero search bars.

---

<div align="center">
  <i>Built for the Wahid AI Enterprise Platform v3.4.1</i>
</div>