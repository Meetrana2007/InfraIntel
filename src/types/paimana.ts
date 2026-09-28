// Core Schema Definitions for InfraGuard AI
// Aligned with the official MoSPI / PAIMANA Flash Report (April 2026)

export interface Project {
  serialNo: number; // Sl. No.
  projectName: string; // Project Name
  agency: string; // Implementing Agency (e.g. NHAI, RVNL, NTPC, IOCL)
  projectCode: string; // PAIMANA Project Code
  legacyOCMSCode: string | null; // Legacy OCMS Code where available, else null
  pmgid: string | null; // PMGID where available, else null
  state: string; // State / Region (e.g. Gujarat, Maharashtra, Multi-State)
  approvalDate: string; // Date of Approval / Start Date (YYYY-MM-DD)
  startDate: string; // Start Date (YYYY-MM-DD)
  originalCompletionDate: string; // Original / Target Date of Completion (YYYY-MM-DD)
  revisedCompletionDate: string | null; // Revised Date of Completion (YYYY-MM-DD) or null
  originalCost: number; // in ₹ Crore
  revisedCost: number; // in ₹ Crore
  cumulativeExpenditure: number; // in ₹ Crore
  physicalProgress: number | null; // Physical Progress (%) or null
  ministry: string; // Ministry Name
  sector: string; // Infrastructure Sector
}

export type RiskCategory = 'Low' | 'Medium' | 'High';

export interface IndicatorScores {
  costScore: number; // 0-100
  scheduleScore: number; // 0-100
  progressScore: number; // 0-100
  dataQualityScore: number; // 0-100
}

export interface RiskAnalysis {
  projectCode: string;
  overallScore: number; // 0-100
  category: RiskCategory;
  indicators: IndicatorScores;
  observedCostChange: number; // revisedCost - originalCost (₹ Cr)
  observedCostChangePct: number; // ((revised - original) / original) * 100
  expenditureRatio: number; // (cumulativeExpenditure / revisedCost) * 100
  scheduleShiftMonths: number | null; // difference between revised & original
  isCompletionRevised: boolean;
  expenditureProgressGap: number | null; // expenditureRatio - physicalProgress
  dataCompletenessPct: number;
  missingFields: string[];
  signals: string[]; // Explanatory risk signals
  recommendedAttention: string;
}

export type AlertType = 
  | 'Schedule Revision Detected'
  | 'Significant Cost Change'
  | 'Low Physical Progress'
  | 'High Expenditure-to-Progress Gap'
  | 'Missing Critical Data';

export type AlertSeverity = 'High' | 'Medium' | 'Low';

export interface EarlyWarningAlert {
  id: string;
  projectCode: string;
  projectName: string;
  agency: string;
  state: string;
  sector: string;
  alertType: AlertType;
  severity: AlertSeverity;
  detectedSignal: string;
  sourceField: string;
  recommendedAttention: string;
  timestamp: string;
}

export interface RiskWeights {
  costWeight: number; // e.g. 30 (%)
  scheduleWeight: number; // e.g. 30 (%)
  progressWeight: number; // e.g. 30 (%)
  dataQualityWeight: number; // e.g. 10 (%)
}

export interface RiskThresholds {
  lowMax: number; // default 39 (0-39 = Low)
  mediumMax: number; // default 69 (40-69 = Medium, 70-100 = High)
}

export interface PeerBenchmark {
  projectMetric: number;
  peerAverage: number;
  peerCount: number;
  delta: number;
}

export interface BenchmarkingResult {
  projectCode: string;
  peerGroupType: 'Sector' | 'State' | 'Ministry' | 'Cost Bracket';
  peerGroupName: string;
  physicalProgress: PeerBenchmark;
  costChangePct: PeerBenchmark;
  expenditureRatio: PeerBenchmark;
  scheduleShiftMonths: PeerBenchmark;
  riskScore: PeerBenchmark;
}

export interface ScenarioInput {
  adjustedProgress: number; // 0-100
  scheduleDelayMonths: number; // -24 to +48
  costChangeDeltaPct: number; // -20% to +50%
}

export interface ScenarioResult {
  baselineScore: number;
  baselineCategory: RiskCategory;
  simulatedScore: number;
  simulatedCategory: RiskCategory;
  scoreDelta: number;
  simulatedIndicators: IndicatorScores;
}

export interface ProjectFilter {
  state: string;
  ministry: string;
  sector: string;
  agency: string;
  riskCategory: string; // 'All' | 'Low' | 'Medium' | 'High'
  minProgress: number;
  maxProgress: number;
  searchQuery: string;
}
