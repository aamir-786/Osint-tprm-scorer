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
📦 server               # Node.js/Express Backend Proxy
 ┣ 📂 scanners          # OSINT API Integration Modules
 ┃ ┣ 📜 businessStability.js
 ┃ ┣ 📜 compliance.js
 ┃ ┣ 📜 cybersecurity.js
 ┃ ┣ 📜 legal.js
 ┃ ┗ 📜 reputation.js
 ┣ 📜 index.js          # Express Entry Point
 ┗ 📜 test-scanners.js  # Backend Testing Script
```


---

## 🔑 API Dependencies

The Wahid AI TPRM backend connects to several third-party APIs to gather comprehensive OSINT telemetry. If any API key is missing from your `.env` file, the backend gracefully skips that specific scan without crashing.

*   **Shodan API** (Cybersecurity): Detects exposed databases, open ports, and infrastructure vulnerabilities.
*   **NewsAPI** (Business Stability & Reputation): Scans for negative media, mass layoff reports, and bankruptcy filings.
*   **OpenSanctions** (Legal & Regulatory): Screens entities against international sanctions and regulatory watchlists.
*   **HaveIBeenPwned** (Reputation): Identifies historical data breach disclosures and credential leaks.

---

## 📚 Comprehensive Documentation

For an in-depth understanding of the scoring mathematics, identity resolution, and system architecture, please see the complete documentation in the `docs/` folder:

*   **[System Documentation](./docs/SYSTEM_DOCUMENTATION.md)** - Deep dive into the scoring engine, matrix weights, and override logic.
*   **[Demo Guide & Architecture Flow](./docs/DEMO_GUIDE.md)** - Contains a walkthrough of a demo scenario, the Scoring Model Matrix, and a **Mermaid flowchart diagram** mapping the entire TPRM pipeline.

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
    ```

3.  **Configure Environment Variables**
    Copy the example configuration file and optionally add your API keys:
    ```bash
    cp .env.example .env
    ```



### Running the Application

There are three ways to run the system depending on your development needs:

**Option 1: Run Concurrently (Recommended)**
This will start both the React frontend and the Express backend simultaneously in the same terminal.
```bash
npm run dev
```
*The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3000`.*

**Option 2: Run Frontend Only**
If you are only working on UI/UX and don't need the live backend proxy.
```bash
npm run dev:frontend
```

**Option 3: Run Backend Only**
If you want to test the OSINT API endpoints or run test scripts independently.
```bash
npm run dev:backend
```

---

<div align="center">
  <i>Built for the Wahid AI Enterprise Platform v3.4.1</i>
</div>