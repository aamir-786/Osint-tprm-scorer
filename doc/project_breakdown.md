# OSINT TPRM Scorer - Project Breakdown

## 1. Overview
The OSINT TPRM (Open Source Intelligence - Third Party Risk Management) Scorer is a full-stack application designed to evaluate and score third-party entities based on open-source intelligence signals.

## 2. Architecture

### Frontend
- **Framework:** React with TypeScript, bundled using Vite.
- **Styling:** CSS for a responsive, modern interface.
- **Key Components:**
  - Dynamic score visualizers.
  - Category signal matrices.
  - Reweighting and math debuggers for analyzing score calculations.

### Backend
- **Environment:** Node.js with Express.
- **Core Functionality:**
  - Processing and aggregating signals from various intelligence sources.
  - Specific scanners (e.g., Business Stability, Compliance) to modularize the data gathering.
  - Serving REST API endpoints for the frontend to consume.

## 3. Directory Structure
- `/src`: Contains the React frontend application.
- `/server`: Contains the Express server, API routes, and specialized OSINT scanners.
- `/docs`: Existing project documentation and diagrams.
- `/doc`: Targeted documentation files (like this project breakdown).

## 4. Workflows
1. **Data Ingestion:** The server fetches/receives OSINT data.
2. **Scoring Engine:** Scanners analyze specific domains (compliance, stability). The scoring engine calculates an overall risk score using mathematical weighting.
3. **Visualization:** The frontend queries the backend and displays comprehensive risk reports and matrices to the user.
