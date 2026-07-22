# Wahid AI TPRM Module - Demo Guide & Architecture Flow

This document provides a walkthrough of the TPRM Dashboard based on the `Effectiverm Inc.` demo scenario, explaining the data flow, architecture, and exact scoring mechanics observed.

## Demo Scenario: `effectiverm.com`
In this scenario, we evaluated a vendor with a pristine record except for two minor/medium operational and cybersecurity issues.

1. **Vendor Identity:** System resolved "Effectiverm Inc." to `effectiverm.com` with High confidence.
2. **Coverage:** All 6 categories had 100% coverage (all planned signals evaluated).
3. **Cybersecurity Findings:** 1 Low severity finding (Missing `security.txt` file). Score = 940 (-10 pts).
4. **Operational Resilience Findings:** 1 Medium severity finding. Score = 920 (-30 pts).
5. **Other Categories:** Pristine (950).
6. **Final Score:** 944 / 950 (Grade A).

### Mathematical Breakdown
Because all categories had >= 50% coverage, no weight redistribution occurred. The math strictly followed the base weights:
- **Cybersecurity (30%):** 940 * 0.30 = 282
- **Compliance (20%):** 950 * 0.20 = 190
- **Business Stability (15%):** 950 * 0.15 = 142.5
- **Reputation (15%):** 950 * 0.15 = 142.5
- **Operational Resilience (10%):** 920 * 0.10 = 92
- **Legal & Regulatory (10%):** 950 * 0.10 = 95
**Total:** 282 + 190 + 142.5 + 142.5 + 92 + 95 = 944

> **Note on OSINT Data Feeds:** In this Demo environment, the browser executes real live CORS-friendly queries (like Google Public DNS and ICANN RDAP). However, for APIs like RSS Feeds, BreachDB, or Shodan that block browser origins, the system uses a **Deterministic Domain Hash**. This intelligently generates highly realistic and consistent mock data based on the URL, allowing you to perfectly test the math and coverage models. To attach real API keys (e.g., NewsAPI, Qualys), a dedicated backend proxy must be established.

---

## Complete System Architecture & Data Flow Diagram

The following Mermaid flow diagram illustrates the complete end-to-end architecture of the Wahid AI TPRM Scoring Engine.

```mermaid
flowchart TD
    %% Styling
    classDef input fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e3a8a
    classDef engine fill:#fef2f2,stroke:#ef4444,stroke-width:2px,color:#991b1b
    classDef process fill:#f8fafc,stroke:#94a3b8,stroke-width:1px,color:#334155
    classDef decision fill:#fffbeb,stroke:#f59e0b,stroke-width:2px,color:#92400e
    classDef output fill:#ecfdf5,stroke:#10b981,stroke-width:2px,color:#065f46

    %% Flow
    A[User Input: Vendor Name or Domain]:::input --> B[Identity Resolution Engine]:::process
    B --> C{Confidence Level?}:::decision
    C -- Low --> D[Manual Disambiguation Required]:::process
    C -- High/Medium --> E[Establish Canonical Identity]:::process
    D --> E

    E --> F[OSINT Signal Collection Matrix]:::process
    
    F --> G1[Cybersecurity]:::process
    F --> G2[Compliance & Privacy]:::process
    F --> G3[Business Stability]:::process
    F --> G4[Reputation]:::process
    F --> G5[Op Resilience]:::process
    F --> G6[Legal & Reg]:::process

    %% Multi Asset Subflow
    G1 -.-> MA{Multi-Asset Enabled?}:::decision
    MA -- Yes --> MA1[Score Asset 1]:::process
    MA -- Yes --> MA2[Score Asset 2]:::process
    MA1 --> MA3[Apply Weakest Link Principle]:::process
    MA2 --> MA3
    MA3 -.-> G1

    %% Engine Aggregation
    G1 & G2 & G3 & G4 & G5 & G6 --> H[TPRM Scoring Engine]:::engine
    
    H --> I{Calculate Coverage Math}:::decision
    I -- Coverage < 50% --> J[Reduce Category Weight]:::process
    J --> K[Redistribute Lost Weight Proportionally]:::process
    I -- Coverage >= 50% --> L[Use Standard Weights]:::process
    K --> L

    L --> M{Check Hard Overrides}:::decision
    M -- Active Sanctions / Breach --> N[Override Grade F]:::engine
    M -- Related Entity Sanctions --> O[Soft Cap Grade C]:::engine
    M -- No Overrides --> P[Calculate Mathematical Score]:::process
    
    N --> Q[Final Defensible Risk Score & Grade]:::output
    O --> Q
    P --> Q

    Q --> R[Generate Markdown Board Pack Output]:::output
```

## How the Flow Matches the Dashboard
1. **Top Section:** The `Identity Resolution` establishes the base context.
2. **Left Column (Matrix):** Users interact with the `OSINT Signal Collection Matrix`, flagging findings across the 6 categories and optionally triggering the `Multi-Asset` evaluator.
3. **Right Column (Outputs):** Displays the outputs from the `TPRM Scoring Engine`:
   - The large **Scorecard** (Top Right)
   - The **Weight Redistribution Math Debugger** (Middle Right) showing the `Calculate Coverage Math` step.
   - The **Standardized Output Report** (Bottom Right) generated from the final outputs.
