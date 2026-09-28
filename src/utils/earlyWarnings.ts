import type { Project, EarlyWarningAlert } from '../types/paimana';
import { analyzeProjectRisk } from './riskEngine';

export function generateEarlyWarnings(projects: Project[]): EarlyWarningAlert[] {
  const alerts: EarlyWarningAlert[] = [];

  projects.forEach(project => {
    const risk = analyzeProjectRisk(project);

    // Warning 1: Schedule Revision Detected
    if (risk.isCompletionRevised && risk.scheduleShiftMonths && risk.scheduleShiftMonths > 0) {
      alerts.push({
        id: `alert-sched-${project.projectCode}`,
        projectCode: project.projectCode,
        projectName: project.projectName,
        agency: project.agency,
        state: project.state,
        sector: project.sector,
        alertType: 'Schedule Revision Detected',
        severity: risk.scheduleShiftMonths > 18 ? 'High' : 'Medium',
        detectedSignal: `Revised completion date differs from original target by ${risk.scheduleShiftMonths} months (Original: ${project.originalCompletionDate} → Revised: ${project.revisedCompletionDate}).`,
        sourceField: 'Original vs Revised Completion Date',
        recommendedAttention: 'Review revised critical path schedule, contractor resource allocation, and statutory clearance dependencies.',
        timestamp: 'April 2026 Report Cycle',
      });
    }

    // Warning 2: Significant Cost Change
    if (risk.observedCostChangePct >= 10) {
      alerts.push({
        id: `alert-cost-${project.projectCode}`,
        projectCode: project.projectCode,
        projectName: project.projectName,
        agency: project.agency,
        state: project.state,
        sector: project.sector,
        alertType: 'Significant Cost Change',
        severity: risk.observedCostChangePct >= 25 ? 'High' : 'Medium',
        detectedSignal: `Revised cost is ₹${project.revisedCost.toLocaleString('en-IN')} Cr against original approved ₹${project.originalCost.toLocaleString('en-IN')} Cr (+${risk.observedCostChangePct}% observed change).`,
        sourceField: 'Original Cost vs Revised Cost',
        recommendedAttention: 'Audit cost escalation drivers, commodity price escalation claims, and obtain revised administrative sanction if required.',
        timestamp: 'April 2026 Report Cycle',
      });
    }

    // Warning 3: Low Physical Progress
    if (project.physicalProgress !== null && project.physicalProgress < 30) {
      alerts.push({
        id: `alert-prog-${project.projectCode}`,
        projectCode: project.projectCode,
        projectName: project.projectName,
        agency: project.agency,
        state: project.state,
        sector: project.sector,
        alertType: 'Low Physical Progress',
        severity: project.physicalProgress < 20 ? 'High' : 'Medium',
        detectedSignal: `Reported physical progress is currently at ${project.physicalProgress}%, indicating nascent or obstructed execution.`,
        sourceField: 'Physical Progress (%)',
        recommendedAttention: 'Inspect Right of Way (RoW) readiness, utility shifting status, and environmental or forestry stage-II clearances.',
        timestamp: 'April 2026 Report Cycle',
      });
    }

    // Warning 4: High Expenditure-to-Progress Gap
    if (risk.expenditureProgressGap !== null && risk.expenditureProgressGap >= 20) {
      alerts.push({
        id: `alert-gap-${project.projectCode}`,
        projectCode: project.projectCode,
        projectName: project.projectName,
        agency: project.agency,
        state: project.state,
        sector: project.sector,
        alertType: 'High Expenditure-to-Progress Gap',
        severity: risk.expenditureProgressGap >= 30 ? 'High' : 'Medium',
        detectedSignal: `Expenditure ratio (${risk.expenditureRatio}%) exceeds reported physical progress (${project.physicalProgress}%) by ${risk.expenditureProgressGap} percentage points.`,
        sourceField: 'Cumulative Expenditure vs Physical Progress (%)',
        recommendedAttention: 'Cross-verify interim payment certificates with physical milestone verification on ground to prevent disbursement front-loading.',
        timestamp: 'April 2026 Report Cycle',
      });
    }

    // Warning 5: Missing Critical Data
    if (risk.missingFields.length > 0) {
      alerts.push({
        id: `alert-data-${project.projectCode}`,
        projectCode: project.projectCode,
        projectName: project.projectName,
        agency: project.agency,
        state: project.state,
        sector: project.sector,
        alertType: 'Missing Critical Data',
        severity: risk.missingFields.length >= 2 ? 'Medium' : 'Low',
        detectedSignal: `Missing official fields: ${risk.missingFields.join(', ')}. Data completeness is ${risk.dataCompletenessPct}%.`,
        sourceField: 'PAIMANA Portal Master Attributes',
        recommendedAttention: 'Coordinate with nodal officer in implementing agency to furnish missing identifiers and updated milestones into PAIMANA.',
        timestamp: 'April 2026 Report Cycle',
      });
    }
  });

  // Sort alerts by severity (High first, then Medium, then Low)
  const severityRank: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
  return alerts.sort((a, b) => severityRank[b.severity] - severityRank[a.severity]);
}
