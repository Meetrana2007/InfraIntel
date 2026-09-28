import type { Project } from '../types/paimana';
import { getMissingFields, calculateDataCompleteness } from './riskEngine';

export interface FieldQualityStat {
  fieldName: string;
  availableCount: number;
  missingCount: number;
  completenessPct: number;
  criticality: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface DataQualityReportData {
  totalProjects: number;
  overallCompletenessPct: number;
  fieldStats: FieldQualityStat[];
  projectsWithMissingFields: {
    project: Project;
    missing: string[];
    completenessPct: number;
  }[];
}

export function auditDataQuality(projects: Project[]): DataQualityReportData {
  const total = projects.length;
  if (total === 0) {
    return {
      totalProjects: 0,
      overallCompletenessPct: 0,
      fieldStats: [],
      projectsWithMissingFields: [],
    };
  }

  const fieldDefs: {
    name: string;
    check: (p: Project) => boolean;
    criticality: 'High' | 'Medium' | 'Low';
    description: string;
  }[] = [
    { name: 'Project Name', check: p => !!p.projectName, criticality: 'High', description: 'Official project title in IPMD records' },
    { name: 'Implementing Agency', check: p => !!p.agency, criticality: 'High', description: 'Central PSU / Department executing project' },
    { name: 'PAIMANA Project Code', check: p => !!p.projectCode, criticality: 'High', description: 'Primary alphanumeric identifier in PAIMANA' },
    { name: 'Ministry', check: p => !!p.ministry, criticality: 'High', description: 'Administrative nodal ministry' },
    { name: 'Sector', check: p => !!p.sector, criticality: 'High', description: 'Infrastructure sector classification' },
    { name: 'State / Region', check: p => !!p.state, criticality: 'High', description: 'Geographical jurisdiction' },
    { name: 'Original Cost (₹ Cr)', check: p => p.originalCost > 0, criticality: 'High', description: 'Cabinet / Board approved financial outlay' },
    { name: 'Revised Cost (₹ Cr)', check: p => p.revisedCost > 0, criticality: 'High', description: 'Current anticipated/sanctioned cost' },
    { name: 'Cumulative Expenditure (₹ Cr)', check: p => p.cumulativeExpenditure !== undefined, criticality: 'High', description: 'Actual financial spend incurred to date' },
    { name: 'Original Completion Date', check: p => !!p.originalCompletionDate, criticality: 'High', description: 'Initial targeted commissioning milestone' },
    { name: 'Physical Progress (%)', check: p => p.physicalProgress !== null, criticality: 'High', description: 'Reported civil/structural progress percentage' },
    { name: 'Revised Completion Date', check: p => p.revisedCompletionDate !== null, criticality: 'Medium', description: 'Updated target date if timeline shifted' },
    { name: 'PMGID', check: p => p.pmgid !== null, criticality: 'Medium', description: 'Project Monitoring Group (Invest India) reference ID' },
    { name: 'Legacy OCMS Code', check: p => p.legacyOCMSCode !== null, criticality: 'Low', description: 'Historical MoSPI OCMS reference number' },
  ];

  const fieldStats: FieldQualityStat[] = fieldDefs.map(def => {
    const availableCount = projects.filter(def.check).length;
    const missingCount = total - availableCount;
    const completenessPct = Math.round((availableCount / total) * 100);
    return {
      fieldName: def.name,
      availableCount,
      missingCount,
      completenessPct,
      criticality: def.criticality,
      description: def.description,
    };
  });

  const projectsWithMissing = projects.map(p => {
    const missing = getMissingFields(p);
    const completenessPct = calculateDataCompleteness(p);
    return {
      project: p,
      missing,
      completenessPct,
    };
  }).filter(item => item.missing.length > 0);

  const avgCompleteness = Math.round(
    projects.reduce((acc, p) => acc + calculateDataCompleteness(p), 0) / total
  );

  return {
    totalProjects: total,
    overallCompletenessPct: avgCompleteness,
    fieldStats,
    projectsWithMissingFields: projectsWithMissing,
  };
}
