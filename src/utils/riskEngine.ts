import type { Project, RiskAnalysis, IndicatorScores, RiskCategory, RiskWeights, RiskThresholds } from '../types/paimana';

export const DEFAULT_WEIGHTS: RiskWeights = {
  costWeight: 30,
  scheduleWeight: 30,
  progressWeight: 30,
  dataQualityWeight: 10,
};

export const DEFAULT_THRESHOLDS: RiskThresholds = {
  lowMax: 39,
  mediumMax: 69,
};

/**
 * Calculates month difference between two YYYY-MM-DD date strings.
 * Returns positive number if date2 is after date1.
 */
export function getMonthDifference(dateStr1: string, dateStr2: string): number {
  try {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    const yearDiff = d2.getFullYear() - d1.getFullYear();
    const monthDiff = d2.getMonth() - d1.getMonth();
    return yearDiff * 12 + monthDiff;
  } catch {
    return 0;
  }
}

/**
 * Deterministic, transparent prototype indicator calculation.
 * Each indicator produces a normalized score from 0 (very low risk) to 100 (high risk).
 */
export function calculateIndicatorScores(project: Project): IndicatorScores {
  // 1. Cost Indicator (Observed Cost Change %)
  const costChangePct = project.originalCost > 0
    ? ((project.revisedCost - project.originalCost) / project.originalCost) * 100
    : 0;

  let costScore = 15;
  if (costChangePct <= 0) {
    costScore = 10;
  } else if (costChangePct <= 10) {
    costScore = 25;
  } else if (costChangePct <= 25) {
    costScore = 50;
  } else if (costChangePct <= 50) {
    costScore = 75;
  } else {
    costScore = 100;
  }

  // 2. Schedule Indicator (Revised Completion Date Shift)
  let scheduleScore = 15;
  if (project.revisedCompletionDate) {
    const delayMonths = getMonthDifference(project.originalCompletionDate, project.revisedCompletionDate);
    if (delayMonths <= 0) {
      scheduleScore = 15;
    } else if (delayMonths <= 12) {
      scheduleScore = 40;
    } else if (delayMonths <= 24) {
      scheduleScore = 65;
    } else if (delayMonths <= 36) {
      scheduleScore = 85;
    } else {
      scheduleScore = 98;
    }
  } else {
    // If no revised date is reported, project is on original schedule or unrevised
    scheduleScore = 15;
  }

  // 3. Progress Indicator (Physical Progress %)
  let progressScore = 20;
  if (project.physicalProgress === null) {
    // Missing progress data adds uncertainty
    progressScore = 65;
  } else if (project.physicalProgress >= 80) {
    progressScore = 15;
  } else if (project.physicalProgress >= 60) {
    progressScore = 35;
  } else if (project.physicalProgress >= 40) {
    progressScore = 55;
  } else if (project.physicalProgress >= 20) {
    progressScore = 75;
  } else {
    progressScore = 90;
  }

  // 4. Data Quality Indicator (Missing critical fields)
  const missing = getMissingFields(project);
  let dataQualityScore = 10;
  if (missing.length === 0) {
    dataQualityScore = 10;
  } else if (missing.length === 1) {
    dataQualityScore = 35;
  } else if (missing.length === 2) {
    dataQualityScore = 60;
  } else {
    dataQualityScore = 85;
  }

  return {
    costScore,
    scheduleScore,
    progressScore,
    dataQualityScore,
  };
}

export function getMissingFields(project: Project): string[] {
  const missing: string[] = [];
  if (!project.projectCode) missing.push("Project Code");
  if (!project.agency) missing.push("Agency");
  if (!project.pmgid) missing.push("PMGID");
  if (!project.legacyOCMSCode) missing.push("Legacy OCMS Code");
  if (project.physicalProgress === null) missing.push("Physical Progress");
  if (!project.revisedCompletionDate) missing.push("Revised Completion Date");
  return missing;
}

export function calculateDataCompleteness(project: Project): number {
  const trackedFields = [
    project.projectCode,
    project.agency,
    project.projectName,
    project.state,
    project.ministry,
    project.sector,
    project.originalCost,
    project.revisedCost,
    project.cumulativeExpenditure,
    project.physicalProgress !== null ? true : null,
    project.approvalDate,
    project.originalCompletionDate,
    project.revisedCompletionDate,
    project.pmgid,
    project.legacyOCMSCode,
  ];

  const presentCount = trackedFields.filter(f => f !== null && f !== undefined && f !== "").length;
  return Math.round((presentCount / trackedFields.length) * 100);
}

/**
 * Evaluates comprehensive risk analysis for a given project.
 */
export function analyzeProjectRisk(
  project: Project,
  weights: RiskWeights = DEFAULT_WEIGHTS,
  thresholds: RiskThresholds = DEFAULT_THRESHOLDS
): RiskAnalysis {
  const indicators = calculateIndicatorScores(project);

  // Normalized weighted sum
  const totalWeight = weights.costWeight + weights.scheduleWeight + weights.progressWeight + weights.dataQualityWeight || 100;
  const rawScore = (
    indicators.costScore * weights.costWeight +
    indicators.scheduleScore * weights.scheduleWeight +
    indicators.progressScore * weights.progressWeight +
    indicators.dataQualityScore * weights.dataQualityWeight
  ) / totalWeight;

  const overallScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  let category: RiskCategory = 'Low';
  if (overallScore > thresholds.mediumMax) {
    category = 'High';
  } else if (overallScore > thresholds.lowMax) {
    category = 'Medium';
  } else {
    category = 'Low';
  }

  // Financial and schedule calculations
  const observedCostChange = Number((project.revisedCost - project.originalCost).toFixed(2));
  const observedCostChangePct = project.originalCost > 0
    ? Number((((project.revisedCost - project.originalCost) / project.originalCost) * 100).toFixed(1))
    : 0;

  const expenditureRatio = project.revisedCost > 0
    ? Number(((project.cumulativeExpenditure / project.revisedCost) * 100).toFixed(1))
    : 0;

  const scheduleShiftMonths = project.revisedCompletionDate
    ? getMonthDifference(project.originalCompletionDate, project.revisedCompletionDate)
    : null;

  const isCompletionRevised = project.revisedCompletionDate !== null && (scheduleShiftMonths !== null && scheduleShiftMonths > 0);

  const expenditureProgressGap = project.physicalProgress !== null
    ? Number((expenditureRatio - project.physicalProgress).toFixed(1))
    : null;

  const missingFields = getMissingFields(project);
  const dataCompletenessPct = calculateDataCompleteness(project);

  // Generate objective, non-causal risk signals
  const signals: string[] = [];

  if (isCompletionRevised && scheduleShiftMonths && scheduleShiftMonths > 0) {
    signals.push(`Revised completion date differs from original target by ${scheduleShiftMonths} months.`);
  } else if (!project.revisedCompletionDate) {
    signals.push("Revised completion date not available; currently running on original schedule target.");
  }

  if (observedCostChange > 0) {
    signals.push(`Observed cost change is +${observedCostChangePct}% (₹${observedCostChange.toLocaleString('en-IN')} Cr increase).`);
  } else if (observedCostChange < 0) {
    signals.push(`Observed cost reduction of ₹${Math.abs(observedCostChange).toLocaleString('en-IN')} Cr reported.`);
  } else {
    signals.push("Revised cost currently matches the original approved cost.");
  }

  if (project.physicalProgress !== null) {
    if (project.physicalProgress < 25) {
      signals.push(`Physical progress is ${project.physicalProgress}%, categorized under Low Progress (<25%).`);
    } else if (project.physicalProgress < 50) {
      signals.push(`Physical progress is ${project.physicalProgress}%, categorized under Moderate Progress (25-50%).`);
    } else {
      signals.push(`Physical progress is ${project.physicalProgress}%, reflecting advanced stage execution.`);
    }
  } else {
    signals.push("Physical progress is not recorded in the available flash report (N/A).");
  }

  if (expenditureProgressGap !== null && expenditureProgressGap > 20) {
    signals.push(`Expenditure ratio (${expenditureRatio}%) exceeds physical progress (${project.physicalProgress}%) by ${expenditureProgressGap} percentage points, indicating disbursement front-loading or milestone reporting lag.`);
  }

  if (missingFields.length > 0) {
    signals.push(`Reporting completeness: ${dataCompletenessPct}% (Missing: ${missingFields.join(', ')}).`);
  }

  // Actionable attention text (avoiding fatalistic wording like "project will fail")
  let recommendedAttention = "Project parameters are within expected operational variance. Continue routine periodic monitoring.";
  if (category === 'High') {
    recommendedAttention = "Project requires elevated executive attention. Recommended to review milestone critical paths, vendor pacing, and alignment between financial disbursements and on-site physical delivery.";
  } else if (category === 'Medium') {
    recommendedAttention = "Project requires intermediate coordination. Track timeline shifts and monitor physical progress increments against the quarterly expenditure run-rate.";
  }

  return {
    projectCode: project.projectCode,
    overallScore,
    category,
    indicators,
    observedCostChange,
    observedCostChangePct,
    expenditureRatio,
    scheduleShiftMonths,
    isCompletionRevised,
    expenditureProgressGap,
    dataCompletenessPct,
    missingFields,
    signals,
    recommendedAttention,
  };
}
