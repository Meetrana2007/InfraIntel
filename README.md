# InfraGuard AI

> **"From Project Monitoring to Proactive Risk Intelligence"**  
> AI-Powered Predictive Infrastructure Project Monitoring & Early Warning System  
> **Smart India Hackathon 2026 — Problem Statement: SIH26103**

---

## 📌 Visible Data Label
```
DEMO PROTOTYPE — PAIMANA APRIL 2026 REPORT DATA
```
*Official source: Infrastructure and Project Monitoring Division (IPMD), Ministry of Statistics and Programme Implementation (MoSPI), Government of India.*

---

## 1. Project Overview & SIH26103 Problem Statement

Central Sector Infrastructure Projects (costing ₹150 Crore and above) form the critical backbone of national logistics, energy transition, connectivity, and industrial corridors. The Ministry of Statistics and Programme Implementation (MoSPI) monitors these projects through the **PAIMANA (Project Analysis and Integrated Management Analysis)** portal / OCMS.

### The Problem:
PAIMANA and official monthly Flash Reports provide crucial snapshots of current project conditions (delays, revised dates, expenditures). However:
1. Decision makers are often presented with raw numbers without contextual risk explanation.
2. Compound risks (e.g. rapid financial disbursement paired with lagging physical execution) are not automatically flagged before critical path failure occurs.
3. Comparative benchmarking across peer sectors and geographic regions requires manual compilation.
4. Administrative officers lack an interactive sandbox to test policy interventions ("What if we expedite clearances by 6 months?").

### The InfraGuard AI Solution:
InfraGuard AI introduces an **intelligence and decision-support layer** on top of PAIMANA:
```
PAIMANA DATA
      ↓
DATA PROCESSING & AUDIT
      ↓
PERFORMANCE ANALYSIS
      ↓
MULTI-INDICATOR RISK ENGINE
      ↓
RISK EXPLANATION (Non-Causal Signals)
      ↓
EARLY WARNING CENTER
      ↓
DECISION SUPPORT & WHAT-IF SIMULATION
```

---

## 2. Fundamental PAIMANA Differentiation

| Dimension | PAIMANA (MoSPI Portal) | InfraGuard AI (Intelligence Layer) |
| :--- | :--- | :--- |
| **Primary Objective** | Statutory project monitoring, progress reporting, and milestone tracking. | Risk signal extraction, automated early warnings, and decision support. |
| **Data Nature** | Descriptive snapshot of current progress, costs, and timeline status. | Diagnostic analytics, compound risk indices, and peer group cohort benchmarking. |
| **Flagging Philosophy** | Flags projects whose revised dates exceed original targets. | Detects compound signals (e.g. expenditure-to-progress gaps, data quality risks). |
| **Interactive Decision Tools** | Static reporting tables and official bulletin PDFs. | What-If scenario simulator, interactive India map, and conversational AI assistant. |

---

## 3. Dataset Structure & Fields

InfraGuard AI is strictly designed around the authentic schema of the official **MoSPI PAIMANA April 2026 Flash Report**:

```typescript
export interface Project {
  serialNo: number;                   // Sl. No. in official report
  projectName: string;                // Official project name
  agency: string;                     // Implementing agency (NHAI, RVNL, NTPC, IOCL, etc.)
  projectCode: string;                // PAIMANA project code (e.g., NHAI-2020-0112)
  legacyOCMSCode: string | null;      // Legacy OCMS code where available, else null
  pmgid: string | null;               // Project Monitoring Group ID (Invest India), else null
  state: string;                      // State / Multi-State jurisdiction
  approvalDate: string;               // Cabinet/Board approval date (YYYY-MM-DD)
  startDate: string;                  // Construction start date (YYYY-MM-DD)
  originalCompletionDate: string;     // Initial target completion milestone (YYYY-MM-DD)
  revisedCompletionDate: string | null;// Revised date where available, else null
  originalCost: number;               // Approved financial outlay (₹ Crore)
  revisedCost: number;                // Revised anticipated cost (₹ Crore)
  cumulativeExpenditure: number;      // Actual financial spend incurred (₹ Crore)
  physicalProgress: number | null;    // Civil/structural progress (%) or null
  ministry: string;                   // Nodal Central Ministry
  sector: string;                     // Sector (Roads, Railways, Power, Petroleum, etc.)
}
```

### ⚠️ Strict Data Fidelity Standard:
- **No Value Fabrication:** If an official field is missing in the Flash Report, it is preserved as `null` and displayed as `"N/A"` or `"Not Available"`.
- **Observed Cost Change:** Cost adjustments are strictly labeled as `"Observed Cost Change"` because the source dataset is a monthly snapshot rather than a time-series forecast.
- **Expenditure Ratio:** Labeled as `"Cumulative expenditure ratio"` with a clear note that expenditure percentage does not represent physical completion.

---

## 4. Key Features & Page Modules

1. **Dashboard:**
   - Dynamic KPI cards calculated in real-time: Total Projects, Total Original Cost, Total Revised Cost, Total Expenditure, Average Physical Progress, Projects with Revised Completion.
   - 7 charts: Projects by State, Projects by Ministry, Projects by Sector, Original vs Revised Cost, Expenditure vs Revised Cost, Physical Progress Distribution (0–25%, 26–50%, 51–75%, 76–100%), and Project Completion Timeline.
   - Dynamic filtering by State, Ministry, Sector, Agency, and Risk Level.

2. **Projects Directory:**
   - Searchable by Project Name, Project Code, Implementing Agency, and State.
   - Multi-column sortable table with status indicators and quick-details drawer.

3. **Project Details:**
   - Deep dive into financial analysis, timeline shifts, and physical progress pacing.
   - **"WHY IS THIS PROJECT FLAGGED?"**: Objective bulleted risk signals avoiding unsupported causal assertions.
   - Recommended attention text (e.g. "Review critical path milestones and vendor pacing").

4. **Risk Analytics:**
   - Multi-dimensional breakdown across 4 normalized indicators (0–100):
     - **Cost Indicator:** Based on observed cost change %.
     - **Schedule Indicator:** Based on months delay between revised and original completion dates.
     - **Progress Indicator:** Based on certified physical progress %.
     - **Data Quality Indicator:** Penalizes uncertainty from missing critical fields.
   - Correlation scatter chart: Physical Progress vs Risk Score.

5. **Early Warning Center:**
   - Automated detection across 5 distinct measurable signals:
     - **Warning 1:** Schedule Revision Detected (Severity: High if > 18 months, Medium if ≤ 18 months).
     - **Warning 2:** Significant Cost Change (Severity: High if ≥ 25%, Medium if ≥ 10%).
     - **Warning 3:** Low Physical Progress (< 30% progress).
     - **Warning 4:** High Expenditure-to-Progress Gap (Disbursement exceeds progress by ≥ 20 points).
     - **Warning 5:** Missing Critical Data (Missing PMGID, Legacy OCMS Code, or progress).

6. **Project Benchmarking:**
   - Side-by-side comparative analysis against peer cohorts:
     - Peers in the same **Sector**
     - Peers in the same **State**
     - Peers in the same **Ministry**
     - Peers in the same **Cost Bracket** (< ₹2,000 Cr, ₹2,000–10,000 Cr, > ₹10,000 Cr)
   - Labeled clearly: *"Peer comparison — descriptive statistical comparison, not an official ranking"*.

7. **What-If Scenario Simulator:**
   - Interactive policy sandbox allowing users to adjust:
     - Physical progress percentage slider (0–100%)
     - Schedule adjustment slider (-12 months expedited to +36 months delay)
     - Cost adjustment slider (-20% cost reduction to +50% escalation)
   - Real-time recalculation of simulated risk score and indicator breakdown.
   - Labeled: *"Scenario simulation — not a guaranteed forecast"*.

8. **India State & Regional Project Map:**
   - State-level visualization with realistic Indian States mapped.
   - Summary cards per state with project volume, cumulative budget, high-risk counts, and average physical progress.
   - Prevents fictitious GPS coordinates by mapping strictly at reported administrative state levels.

9. **Project Intelligence Assistant (Zero-Hallucination AI Chat):**
   - Natural language conversational assistant answering questions strictly from the loaded PAIMANA report.
   - Instant-run suggested prompts for demonstration.
   - Strict guardrail: If information is not in the PAIMANA report, responds:
     *"The available PAIMANA report data does not contain this information."*

10. **Reports Center:**
    - 9 comprehensive pre-compiled statutory reports with instant **CSV export**:
      1. Project Summary Report
      2. High Attention Projects
      3. Cost Change Report
      4. Schedule Revision Report
      5. Physical Progress Report
      6. Data Quality Report
      7. State-wise Analysis
      8. Sector-wise Analysis
      9. Ministry-wise Analysis

11. **Data Quality Module:**
    - System-wide completeness gauge (overall dataset health).
    - Field-by-field completeness rates across 14 statutory fields.
    - Audit of projects with missing attributes requiring agency update.

12. **Settings:**
    - Real-time tuning of prototype risk weights (Cost %, Schedule %, Progress %, Data Quality %).
    - Configurable risk threshold boundaries (Low <-> Medium, Medium <-> High).
    - Ingest custom PAIMANA JSON feeds.

---

## 5. Technology Stack

- **Frontend Core:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS (Custom clean enterprise light theme: navy blue, light blue, white, green, orange, red)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Architecture:** FastAPI-ready REST design, PostgreSQL-ready relational schema
- **Runtime:** Node.js 20+

---

## 6. Project Folder Structure

```
SIH26103/
├── index.html                  # HTML entry point with metadata and favicon
├── package.json                # Project dependencies and scripts
├── tsconfig.json               # TypeScript base configuration
├── tsconfig.app.json           # Bundler configuration
├── vite.config.ts              # Vite configuration with React and Tailwind plugins
├── src/
│   ├── main.tsx                # React DOM entry point
│   ├── App.tsx                 # Master layout assembly and routing
│   ├── index.css               # Global Tailwind CSS and typography tokens
│   ├── types/
│   │   └── paimana.ts          # Core PAIMANA schemas, Risk types, Alert types, API types
│   ├── data/
│   │   └── paimanaApril2026.ts # Authentic PAIMANA April 2026 Flash Report dataset
│   ├── context/
│   │   └── ProjectContext.tsx  # Central state for dataset, filters, weights, thresholds
│   ├── utils/
│   │   ├── riskEngine.ts       # Deterministic risk calculation and indicator formulas
│   │   ├── benchmarking.ts     # Peer cohort statistics and comparative metrics
│   │   ├── earlyWarnings.ts    # 5 automated early warning detection rules
│   │   ├── dataQuality.ts      # Missing field audit and completeness analytics
│   │   └── exportUtils.ts      # RFC 4180 CSV export utilities
│   ├── services/
│   │   └── apiService.ts       # API-ready service abstraction matching FastAPI endpoints
│   ├── components/
│   │   ├── common/
│   │   │   ├── RiskBadge.tsx   # Green/Amber/Red risk status badge
│   │   │   ├── ProgressBar.tsx # Animated progress bar with null handling
│   │   │   ├── KpiCard.tsx     # Executive KPI metric card
│   │   │   └── Modal.tsx       # Accessible dialog modal
│   │   ├── layout/
│   │   │   ├── Navbar.tsx      # Top bar with official notice banner & global search
│   │   │   ├── Sidebar.tsx     # Persistent navigation sidebar
│   │   │   └── Footer.tsx      # Footer with official notice & hackathon details
│   │   ├── dashboard/
│   │   │   ├── FilterBar.tsx   # Dynamic dataset filter bar
│   │   │   └── DashboardCharts.tsx # Charts A through G using Recharts
│   │   └── project/
│   │       ├── ProjectTable.tsx # Searchable, sortable, paginated project table
│   │       ├── ProjectDetailModal.tsx # Full-field project inspector dialog
│   │       ├── BenchmarkingCard.tsx # Peer cohort comparison card
│   │       └── ScenarioSimulator.tsx # What-If interactive simulator
│   └── pages/
│       ├── DashboardPage.tsx   # Main executive dashboard
│       ├── ProjectsPage.tsx    # Central projects directory
│       ├── RiskAnalyticsPage.tsx # Risk scoring & indicator breakdown
│       ├── EarlyWarningsPage.tsx # Automated early warning alerts
│       ├── ProjectMapPage.tsx  # State & regional distribution map
│       ├── ReportsPage.tsx     # 9 pre-compiled reports with CSV export
│       ├── AssistantPage.tsx   # Grounded zero-hallucination AI chat
│       ├── DataQualityPage.tsx # Data completeness audit module
│       ├── MethodologyPage.tsx # Scientific integrity & system documentation
│       └── SettingsPage.tsx    # Configurable weights & dataset controls
└── README.md                   # This documentation file
```

---

## 7. How to Run Locally

### Prerequisites:
- Node.js (version 20.18+ or 22+)
- npm (version 10+)

### Steps:
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open browser at:
http://127.0.0.1:5173/
```

### Production Build:
```bash
npm run build
```

---

## 8. Smart India Hackathon Demo Flow (Step-by-Step)

Judges can evaluate the system using this structured demonstration script:

1. **Step 1 — Open Dashboard:**
   - Observe the top banner: `"DEMO PROTOTYPE — PAIMANA APRIL 2026 REPORT DATA"`.
   - Verify the 6 top KPI cards (Total Projects, Total Original Cost, Total Revised Cost, Total Expenditure, Avg Physical Progress, Revised Completion).

2. **Step 2 — Dynamic Filtering:**
   - Under the Filter Bar, change **State** to `Gujarat`.
   - Watch the KPI numbers, cost comparisons, and charts update dynamically in real time.

3. **Step 3 — Inspect Project Details:**
   - Click on the **Projects** tab in the sidebar.
   - Click **"Details"** on *"Vadodara-Mumbai Expressway"* or *"Mumbai-Ahmedabad High Speed Rail"*.
   - Review Original vs Revised Cost, Approval Date vs Target Completion Date, and reported Physical Progress.

4. **Step 4 — Review Risk Signals:**
   - Read the box: **"WHY IS THIS PROJECT FLAGGED?"**.
   - Note the descriptive, non-causal signals (e.g. Schedule shift of 35 months, observed cost change, expenditure pacing).

5. **Step 5 — Peer Benchmarking:**
   - Inside the Project Details modal, click the **"Peer Benchmarking"** tab.
   - Compare the project against its peers in the same Sector, State, and Ministry.

6. **Step 6 — What-If Scenario Simulator:**
   - Click the **"What-If Scenario Simulator"** tab.
   - Adjust the **Physical Progress** slider (+10%) or **Cost Adjustment** slider.
   - See the simulated risk score and indicator levels recalculate dynamically.

7. **Step 7 — Early Warning Center:**
   - Navigate to **"Early Warnings"** in the sidebar.
   - Review alerts categorized into the 5 core warning signals with actionable attention notes.

8. **Step 8 — AI Intelligence Assistant:**
   - Navigate to **"AI Assistant"** in the sidebar.
   - Click suggested queries such as *"How many projects are in Gujarat?"* or *"Why was this project flagged?"*.
   - Observe the strictly grounded, zero-hallucination answers.

9. **Step 9 — Reports & CSV Export:**
   - Navigate to **"Reports"**. Select *"High Attention Projects"* or *"State-wise Analysis"*.
   - Click **"Export Current Report (CSV)"** to verify instant spreadsheet generation.

---

## 9. Future ML & API Architecture

### Future Longitudinal ML Pipeline:
When multi-year monthly reporting data becomes available, the deterministic engine will be complemented by a gradient-boosted ML pipeline:
```
Monthly PAIMANA Ingestion (24–36 Months)
              ↓
Time-Series Feature Extraction (Milestone Velocity, Burn Rate, Seasonality)
              ↓
Train / Validation / Test Split (Time-based temporal split)
              ↓
Baseline Statistical Model (Logistic Regression / Survival Analysis)
              ↓
Gradient Boosted Trees (XGBoost / LightGBM)
              ↓
SHAP Value Generation (Local feature contribution for explainability)
              ↓
Automated Early Warning Notification Service
```

### FastAPI REST Endpoints Prepared:
The frontend API client layer (`src/services/apiService.ts`) is designed to map directly to a future FastAPI backend:
- `GET /api/projects` — List all monitored projects
- `GET /api/projects/:id` — Retrieve specific project by PAIMANA code
- `GET /api/dashboard` — Aggregate metrics and KPIs
- `GET /api/analytics` — Multi-dimensional breakdowns
- `GET /api/risk/:projectId` — Detailed indicator scores and signal explanations
- `GET /api/alerts` — Active early warning alerts
- `GET /api/benchmark/:projectId` — Peer cohort statistical comparisons
- `POST /api/scenario` — Execute policy simulation
- `POST /api/assistant` — Query grounded RAG intelligence agent

---

## 10. Integrity & Compliance Statement

1. **No Direct Government API Claim:** The application is explicitly labeled as an analytical prototype operating on official April 2026 PAIMANA Flash Report data.
2. **Missing Official Values:** Missing fields (such as PMGID or Legacy OCMS Code) are preserved as `null` and displayed as `"N/A"` or `"Not Available"`. No values, dates, or coordinates are synthesized.
3. **Non-Punitive Language:** Alerts and explanations use constructive phrasing (*"Project requires attention"* rather than *"Project will fail"*).
