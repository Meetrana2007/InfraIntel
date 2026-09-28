import type { Project, BenchmarkingResult, PeerBenchmark } from '../types/paimana';
import { analyzeProjectRisk } from './riskEngine';

function computeMetric(val: number, arr: number[]): PeerBenchmark {
  const count = arr.length;
  if (count === 0) {
    return { projectMetric: val, peerAverage: val, peerCount: 0, delta: 0 };
  }
  const sum = arr.reduce((a, b) => a + b, 0);
  const avg = Number((sum / count).toFixed(1));
  const delta = Number((val - avg).toFixed(1));
  return {
    projectMetric: Number(val.toFixed(1)),
    peerAverage: avg,
    peerCount: count,
    delta,
  };
}

export function getCostBracket(cost: number): string {
  if (cost < 2000) return 'Under ₹2,000 Cr';
  if (cost <= 10000) return '₹2,000 – ₹10,000 Cr';
  return 'Over ₹10,000 Cr';
}

export function benchmarkProject(
  targetProject: Project,
  allProjects: Project[],
  cohortType: 'Sector' | 'State' | 'Ministry' | 'Cost Bracket' = 'Sector'
): BenchmarkingResult {
  const targetRisk = analyzeProjectRisk(targetProject);
  let peers: Project[] = [];
  let peerGroupName = '';

  const targetBracket = getCostBracket(targetProject.revisedCost || targetProject.originalCost);

  switch (cohortType) {
    case 'Sector':
      peerGroupName = `${targetProject.sector} Sector`;
      peers = allProjects.filter(p => p.sector === targetProject.sector && p.projectCode !== targetProject.projectCode);
      break;
    case 'State':
      peerGroupName = `${targetProject.state} Region`;
      peers = allProjects.filter(p => p.state === targetProject.state && p.projectCode !== targetProject.projectCode);
      break;
    case 'Ministry':
      peerGroupName = targetProject.ministry;
      peers = allProjects.filter(p => p.ministry === targetProject.ministry && p.projectCode !== targetProject.projectCode);
      break;
    case 'Cost Bracket':
      peerGroupName = `Projects (${targetBracket})`;
      peers = allProjects.filter(p => {
        const cost = p.revisedCost || p.originalCost;
        return getCostBracket(cost) === targetBracket && p.projectCode !== targetProject.projectCode;
      });
      break;
  }

  // Pre-calculate risk analysis for peers
  const peerRisks = peers.map(p => analyzeProjectRisk(p));

  const peerProgressList = peers.map(p => p.physicalProgress).filter((v): v is number => v !== null);
  const peerCostChangePctList = peerRisks.map(r => r.observedCostChangePct);
  const peerExpRatioList = peerRisks.map(r => r.expenditureRatio);
  const peerSchedShiftList = peerRisks.map(r => r.scheduleShiftMonths).filter((v): v is number => v !== null);
  const peerRiskScoreList = peerRisks.map(r => r.overallScore);

  return {
    projectCode: targetProject.projectCode,
    peerGroupType: cohortType,
    peerGroupName,
    physicalProgress: computeMetric(targetProject.physicalProgress ?? 0, peerProgressList),
    costChangePct: computeMetric(targetRisk.observedCostChangePct, peerCostChangePctList),
    expenditureRatio: computeMetric(targetRisk.expenditureRatio, peerExpRatioList),
    scheduleShiftMonths: computeMetric(targetRisk.scheduleShiftMonths ?? 0, peerSchedShiftList),
    riskScore: computeMetric(targetRisk.overallScore, peerRiskScoreList),
  };
}
