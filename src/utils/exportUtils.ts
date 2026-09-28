import type { Project } from '../types/paimana';
import { analyzeProjectRisk } from './riskEngine';

/**
 * Escapes a cell value for RFC 4180 CSV compliance.
 */
function escapeCSV(val: any): string {
  if (val === null || val === undefined) return 'N/A';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts a list of projects with their computed risk indicators into CSV format.
 */
export function exportProjectsToCSV(projects: Project[], filename: string = 'paimana_projects_export.csv'): void {
  const headers = [
    'Sl. No.',
    'Project Name',
    'Agency',
    'Project Code',
    'Legacy OCMS Code',
    'PMGID',
    'State',
    'Ministry',
    'Sector',
    'Approval Date',
    'Original Completion Date',
    'Revised Completion Date',
    'Original Cost (Cr)',
    'Revised Cost (Cr)',
    'Observed Cost Change (Cr)',
    'Observed Cost Change (%)',
    'Cumulative Expenditure (Cr)',
    'Expenditure Ratio (%)',
    'Physical Progress (%)',
    'Schedule Shift (Months)',
    'Risk Score',
    'Risk Level',
    'Data Completeness (%)',
  ];

  const rows = projects.map(p => {
    const risk = analyzeProjectRisk(p);
    return [
      p.serialNo,
      escapeCSV(p.projectName),
      escapeCSV(p.agency),
      escapeCSV(p.projectCode),
      escapeCSV(p.legacyOCMSCode ?? 'N/A'),
      escapeCSV(p.pmgid ?? 'N/A'),
      escapeCSV(p.state),
      escapeCSV(p.ministry),
      escapeCSV(p.sector),
      escapeCSV(p.approvalDate),
      escapeCSV(p.originalCompletionDate),
      escapeCSV(p.revisedCompletionDate ?? 'Not Available'),
      p.originalCost,
      p.revisedCost,
      risk.observedCostChange,
      `${risk.observedCostChangePct}%`,
      p.cumulativeExpenditure,
      `${risk.expenditureRatio}%`,
      p.physicalProgress !== null ? `${p.physicalProgress}%` : 'N/A',
      risk.scheduleShiftMonths !== null ? risk.scheduleShiftMonths : 'N/A',
      risk.overallScore,
      risk.category,
      `${risk.dataCompletenessPct}%`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generic CSV downloader for arbitrary reports.
 */
export function exportTableToCSV(headers: string[], rows: (string | number)[][], filename: string): void {
  const csvRows = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(',')),
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
