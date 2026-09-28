import type { Project, RiskAnalysis, EarlyWarningAlert, BenchmarkingResult, ScenarioInput, ScenarioResult, RiskWeights, RiskThresholds } from '../types/paimana';
import { PAIMANA_APRIL_2026_PROJECTS, REPORT_METADATA } from '../data/paimanaApril2026';
import { analyzeProjectRisk, DEFAULT_WEIGHTS, DEFAULT_THRESHOLDS } from '../utils/riskEngine';
import { benchmarkProject } from '../utils/benchmarking';
import { generateEarlyWarnings } from '../utils/earlyWarnings';

export interface DashboardResponse {
  metadata: typeof REPORT_METADATA;
  totalProjects: number;
  totalOriginalCost: number;
  totalRevisedCost: number;
  totalExpenditure: number;
  averagePhysicalProgress: number;
  projectsWithRevisedCompletion: number;
  highRiskProjectsCount: number;
  mediumRiskProjectsCount: number;
  lowRiskProjectsCount: number;
}

export interface AnalyticsResponse {
  byState: { state: string; count: number; cost: number; avgProgress: number }[];
  byMinistry: { ministry: string; count: number; cost: number }[];
  bySector: { sector: string; count: number; cost: number }[];
  progressDistribution: { bucket: string; count: number }[];
  costComparison: { name: string; original: number; revised: number; expenditure: number }[];
}

export interface AssistantQueryRequest {
  query: string;
  selectedProjectCode?: string;
}

export interface AssistantQueryResponse {
  answer: string;
  matchedProjects?: Project[];
  relatedField?: string;
  isGroundedInReport: boolean;
}

/**
 * API Client Layer for InfraIntel.
 * Fully API-ready: Structured matching FastAPI REST design endpoints.
 * Currently uses high-performance deterministic local execution on PAIMANA April 2026 data.
 */
export class ApiService {
  private static projects: Project[] = [...PAIMANA_APRIL_2026_PROJECTS];
  private static weights: RiskWeights = { ...DEFAULT_WEIGHTS };
  private static thresholds: RiskThresholds = { ...DEFAULT_THRESHOLDS };

  public static setCustomProjects(newProjects: Project[]) {
    this.projects = [...newProjects];
  }

  public static setRiskConfig(weights: RiskWeights, thresholds: RiskThresholds) {
    this.weights = { ...weights };
    this.thresholds = { ...thresholds };
  }

  public static getRiskConfig() {
    return { weights: this.weights, thresholds: this.thresholds };
  }

  // GET /api/projects
  public static async getProjects(): Promise<Project[]> {
    return Promise.resolve([...this.projects]);
  }

  // GET /api/projects/:id
  public static async getProjectById(codeOrSerial: string | number): Promise<Project | null> {
    const found = this.projects.find(
      p => p.projectCode.toLowerCase() === String(codeOrSerial).toLowerCase() || p.serialNo === Number(codeOrSerial)
    );
    return Promise.resolve(found || null);
  }

  // GET /api/dashboard
  public static async getDashboardStats(activeProjects: Project[] = this.projects): Promise<DashboardResponse> {
    const totalProjects = activeProjects.length;
    if (totalProjects === 0) {
      return {
        metadata: REPORT_METADATA,
        totalProjects: 0,
        totalOriginalCost: 0,
        totalRevisedCost: 0,
        totalExpenditure: 0,
        averagePhysicalProgress: 0,
        projectsWithRevisedCompletion: 0,
        highRiskProjectsCount: 0,
        mediumRiskProjectsCount: 0,
        lowRiskProjectsCount: 0,
      };
    }

    const totalOriginalCost = Number(activeProjects.reduce((acc, p) => acc + p.originalCost, 0).toFixed(2));
    const totalRevisedCost = Number(activeProjects.reduce((acc, p) => acc + p.revisedCost, 0).toFixed(2));
    const totalExpenditure = Number(activeProjects.reduce((acc, p) => acc + p.cumulativeExpenditure, 0).toFixed(2));

    const progressValues = activeProjects
      .map(p => p.physicalProgress)
      .filter((v): v is number => v !== null);

    const averagePhysicalProgress = progressValues.length > 0
      ? Number((progressValues.reduce((a, b) => a + b, 0) / progressValues.length).toFixed(1))
      : 0;

    const projectsWithRevisedCompletion = activeProjects.filter(p => p.revisedCompletionDate !== null).length;

    let highCount = 0;
    let medCount = 0;
    let lowCount = 0;

    activeProjects.forEach(p => {
      const risk = analyzeProjectRisk(p, this.weights, this.thresholds);
      if (risk.category === 'High') highCount++;
      else if (risk.category === 'Medium') medCount++;
      else lowCount++;
    });

    return {
      metadata: REPORT_METADATA,
      totalProjects,
      totalOriginalCost,
      totalRevisedCost,
      totalExpenditure,
      averagePhysicalProgress,
      projectsWithRevisedCompletion,
      highRiskProjectsCount: highCount,
      mediumRiskProjectsCount: medCount,
      lowRiskProjectsCount: lowCount,
    };
  }

  // GET /api/analytics
  public static async getAnalytics(activeProjects: Project[] = this.projects): Promise<AnalyticsResponse> {
    // 1. By State
    const stateMap = new Map<string, { count: number; cost: number; progressSum: number; progressCount: number }>();
    activeProjects.forEach(p => {
      const current = stateMap.get(p.state) || { count: 0, cost: 0, progressSum: 0, progressCount: 0 };
      current.count += 1;
      current.cost += p.revisedCost;
      if (p.physicalProgress !== null) {
        current.progressSum += p.physicalProgress;
        current.progressCount += 1;
      }
      stateMap.set(p.state, current);
    });

    const byState = Array.from(stateMap.entries())
      .map(([state, data]) => ({
        state,
        count: data.count,
        cost: Number(data.cost.toFixed(2)),
        avgProgress: data.progressCount > 0 ? Number((data.progressSum / data.progressCount).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // 2. By Ministry
    const minMap = new Map<string, { count: number; cost: number }>();
    activeProjects.forEach(p => {
      const cur = minMap.get(p.ministry) || { count: 0, cost: 0 };
      cur.count += 1;
      cur.cost += p.revisedCost;
      minMap.set(p.ministry, cur);
    });
    const byMinistry = Array.from(minMap.entries())
      .map(([ministry, data]) => ({
        ministry: ministry.replace('Ministry of ', 'Mo '),
        count: data.count,
        cost: Number(data.cost.toFixed(2)),
      }))
      .sort((a, b) => b.count - a.count);

    // 3. By Sector
    const secMap = new Map<string, { count: number; cost: number }>();
    activeProjects.forEach(p => {
      const cur = secMap.get(p.sector) || { count: 0, cost: 0 };
      cur.count += 1;
      cur.cost += p.revisedCost;
      secMap.set(p.sector, cur);
    });
    const bySector = Array.from(secMap.entries())
      .map(([sector, data]) => ({
        sector,
        count: data.count,
        cost: Number(data.cost.toFixed(2)),
      }))
      .sort((a, b) => b.count - a.count);

    // 4. Progress Distribution
    let b1 = 0, b2 = 0, b3 = 0, b4 = 0, na = 0;
    activeProjects.forEach(p => {
      if (p.physicalProgress === null) na++;
      else if (p.physicalProgress <= 25) b1++;
      else if (p.physicalProgress <= 50) b2++;
      else if (p.physicalProgress <= 75) b3++;
      else b4++;
    });

    const progressDistribution = [
      { bucket: '0–25% (Low)', count: b1 },
      { bucket: '26–50% (Moderate)', count: b2 },
      { bucket: '51–75% (Advanced)', count: b3 },
      { bucket: '76–100% (Mature)', count: b4 },
    ];
    if (na > 0) {
      progressDistribution.push({ bucket: 'N/A (Unreported)', count: na });
    }

    // 5. Cost Comparison (Top 8 largest projects for clear visualization)
    const costComparison = [...activeProjects]
      .sort((a, b) => b.revisedCost - a.revisedCost)
      .slice(0, 8)
      .map(p => ({
        name: p.projectName.length > 25 ? p.projectName.slice(0, 22) + '...' : p.projectName,
        original: p.originalCost,
        revised: p.revisedCost,
        expenditure: p.cumulativeExpenditure,
      }));

    return {
      byState,
      byMinistry,
      bySector,
      progressDistribution,
      costComparison,
    };
  }

  // GET /api/risk/:projectId
  public static async getProjectRisk(projectCode: string): Promise<RiskAnalysis | null> {
    const project = await this.getProjectById(projectCode);
    if (!project) return null;
    return analyzeProjectRisk(project, this.weights, this.thresholds);
  }

  // GET /api/alerts
  public static async getAlerts(activeProjects: Project[] = this.projects): Promise<EarlyWarningAlert[]> {
    return Promise.resolve(generateEarlyWarnings(activeProjects));
  }

  // GET /api/benchmark/:projectId
  public static async getBenchmark(
    projectCode: string,
    cohort: 'Sector' | 'State' | 'Ministry' | 'Cost Bracket' = 'Sector'
  ): Promise<BenchmarkingResult | null> {
    const project = await this.getProjectById(projectCode);
    if (!project) return null;
    return benchmarkProject(project, this.projects, cohort);
  }

  // POST /api/scenario
  public static async runScenario(projectCode: string, input: ScenarioInput): Promise<ScenarioResult | null> {
    const project = await this.getProjectById(projectCode);
    if (!project) return null;

    const baselineRisk = analyzeProjectRisk(project, this.weights, this.thresholds);

    // Create simulated project
    const simulatedCost = project.revisedCost * (1 + input.costChangeDeltaPct / 100);
    const simulatedProject: Project = {
      ...project,
      physicalProgress: Math.min(100, Math.max(0, input.adjustedProgress)),
      revisedCost: Number(simulatedCost.toFixed(2)),
    };

    // If schedule delay is altered
    if (input.scheduleDelayMonths !== 0) {
      const origDate = new Date(project.originalCompletionDate);
      origDate.setMonth(origDate.getMonth() + input.scheduleDelayMonths);
      simulatedProject.revisedCompletionDate = origDate.toISOString().slice(0, 10);
    }

    const simRisk = analyzeProjectRisk(simulatedProject, this.weights, this.thresholds);

    return {
      baselineScore: baselineRisk.overallScore,
      baselineCategory: baselineRisk.category,
      simulatedScore: simRisk.overallScore,
      simulatedCategory: simRisk.category,
      scoreDelta: simRisk.overallScore - baselineRisk.overallScore,
      simulatedIndicators: simRisk.indicators,
    };
  }

  // POST /api/assistant
  public static async queryAssistant(request: AssistantQueryRequest): Promise<AssistantQueryResponse> {
    const q = request.query.toLowerCase().trim();

    // 1. High-risk projects
    if (q.includes("high-risk") || q.includes("high risk") || q.includes("critical projects") || q.includes("flagged projects")) {
      const highRisk = this.projects
        .filter(p => analyzeProjectRisk(p, this.weights, this.thresholds).category === 'High')
        .sort((a, b) => analyzeProjectRisk(b, this.weights, this.thresholds).overallScore - analyzeProjectRisk(a, this.weights, this.thresholds).overallScore);

      const names = highRisk.map(p => `• **${p.projectName}** (${p.agency}) — Risk Score: ${analyzeProjectRisk(p, this.weights, this.thresholds).overallScore}/100 [Code: ${p.projectCode}]`).join('\n');
      return {
        answer: `Identified **${highRisk.length} high-risk projects** in the PAIMANA April 2026 report requiring elevated executive attention:\n\n${names}\n\n*Note: Flagged signals are rule-based assessments reflecting observed schedule revisions, cost adjustments, or execution pacing.*`,
        matchedProjects: highRisk,
        isGroundedInReport: true,
      };
    }

    // 2. State-specific queries (e.g. Gujarat)
    const states = Array.from(new Set(this.projects.map(p => p.state.toLowerCase())));
    const matchedState = states.find(s => q.includes(s));
    if (matchedState) {
      const stateProjects = this.projects.filter(p => p.state.toLowerCase() === matchedState);
      const totalCost = stateProjects.reduce((acc, p) => acc + p.revisedCost, 0);
      const highRiskCount = stateProjects.filter(p => analyzeProjectRisk(p, this.weights, this.thresholds).category === 'High').length;
      const list = stateProjects.map(p => `• **${p.projectName}** (${p.agency}) — Progress: ${p.physicalProgress !== null ? p.physicalProgress + '%' : 'N/A'}, Cost: ₹${p.revisedCost.toLocaleString('en-IN')} Cr`).join('\n');

      return {
        answer: `The PAIMANA April 2026 report lists **${stateProjects.length} Central Sector projects** located in **${stateProjects[0].state}** with aggregate anticipated cost of **₹${totalCost.toLocaleString('en-IN')} Cr** (${highRiskCount} flagged as High Risk):\n\n${list}`,
        matchedProjects: stateProjects,
        isGroundedInReport: true,
      };
    }

    // 3. Revised completion date queries
    if (q.includes("revised completion") || q.includes("revised date") || q.includes("delayed") || q.includes("schedule revision")) {
      const revisedProjects = this.projects.filter(p => p.revisedCompletionDate !== null);
      const list = revisedProjects.slice(0, 10).map(p => {
        const risk = analyzeProjectRisk(p, this.weights, this.thresholds);
        return `• **${p.projectName}** (${p.agency}) — Target was ${p.originalCompletionDate}, revised to **${p.revisedCompletionDate}** (+${risk.scheduleShiftMonths ?? 0} mos)`;
      }).join('\n');

      return {
        answer: `There are **${revisedProjects.length} out of ${this.projects.length} projects** reported with an official revised completion date:\n\n${list}${revisedProjects.length > 10 ? `\n...and ${revisedProjects.length - 10} more in the Projects tab.` : ''}`,
        matchedProjects: revisedProjects,
        isGroundedInReport: true,
      };
    }

    // 4. Highest cost change queries
    if (q.includes("highest cost") || q.includes("cost change") || q.includes("cost increase") || q.includes("cost escalation")) {
      const sortedByCost = [...this.projects].sort((a, b) => {
        const pctA = ((a.revisedCost - a.originalCost) / a.originalCost) * 100;
        const pctB = ((b.revisedCost - b.originalCost) / b.originalCost) * 100;
        return pctB - pctA;
      }).slice(0, 5);

      const list = sortedByCost.map(p => {
        const change = p.revisedCost - p.originalCost;
        const pct = ((change / p.originalCost) * 100).toFixed(1);
        return `• **${p.projectName}** (${p.agency}): Orig ₹${p.originalCost.toLocaleString('en-IN')} Cr → Rev ₹${p.revisedCost.toLocaleString('en-IN')} Cr (**+${pct}%**, +₹${change.toLocaleString('en-IN')} Cr)`;
      }).join('\n');

      return {
        answer: `Top 5 projects with highest observed cost change between original approved cost and revised cost:\n\n${list}\n\n*Note: Labeled as 'Observed Cost Change' as recorded in the snapshot report.*`,
        matchedProjects: sortedByCost,
        isGroundedInReport: true,
      };
    }

    // 5. Low physical progress (< 25% or below 25%)
    if (q.includes("below 25%") || q.includes("progress below 25") || q.includes("low progress") || q.includes("under 25%")) {
      const lowProgress = this.projects.filter(p => p.physicalProgress !== null && p.physicalProgress < 25);
      const list = lowProgress.map(p => `• **${p.projectName}** (${p.agency}) — **${p.physicalProgress}%** progress (Cost: ₹${p.revisedCost.toLocaleString('en-IN')} Cr, Target: ${p.revisedCompletionDate || p.originalCompletionDate})`).join('\n');

      return {
        answer: `Found **${lowProgress.length} projects** with physical progress below 25%:\n\n${list}\n\n*Note: Low physical progress does not inherently imply failure; it frequently correlates with newly commenced projects or extensive pre-construction clearance phases.*`,
        matchedProjects: lowProgress,
        isGroundedInReport: true,
      };
    }

    // 6. Missing data queries
    if (q.includes("missing data") || q.includes("data quality") || q.includes("incomplete") || q.includes("missing fields")) {
      const withMissing = this.projects.map(p => ({
        p,
        risk: analyzeProjectRisk(p, this.weights, this.thresholds)
      })).filter(x => x.risk.missingFields.length > 0);

      const list = withMissing.slice(0, 8).map(x => `• **${x.p.projectName}** (${x.p.agency}) — Missing: *${x.risk.missingFields.join(', ')}* (Completeness: ${x.risk.dataCompletenessPct}%)`).join('\n');

      return {
        answer: `**${withMissing.length} projects** in the report have one or more missing official attributes (such as PMGID, Legacy OCMS Code, or Revised Date):\n\n${list}${withMissing.length > 8 ? `\n...and ${withMissing.length - 8} more. Check the 'Data Quality' page for complete field breakdown.` : ''}`,
        matchedProjects: withMissing.map(x => x.p),
        isGroundedInReport: true,
      };
    }

    // 7. Why was this project flagged?
    if (q.includes("why was") || q.includes("why is") || q.includes("flagged") || q.includes("risk reason")) {
      // Find matching project from query or context
      const proj = this.projects.find(p => q.includes(p.projectName.toLowerCase()) || q.includes(p.projectCode.toLowerCase()) || (request.selectedProjectCode && p.projectCode === request.selectedProjectCode)) || this.projects[0];
      const risk = analyzeProjectRisk(proj, this.weights, this.thresholds);

      const signalList = risk.signals.map(s => `• ${s}`).join('\n');
      return {
        answer: `### Risk Signal Explanation for ${proj.projectName} [${proj.projectCode}]\n\n**Overall Risk Score: ${risk.overallScore}/100 (${risk.category} Risk)**\n\n**Observed Signals in PAIMANA Data:**\n${signalList}\n\n**Recommended Attention:**\n${risk.recommendedAttention}\n\n*Strict rule: These are descriptive signals detected from reported values, not an official government indictment.*`,
        matchedProjects: [proj],
        isGroundedInReport: true,
      };
    }

    // Default grounded fallback
    return {
      answer: "The available PAIMANA report data does not contain this information. InfraIntel is strictly grounded in the official April 2026 PAIMANA Flash Report dataset. You can ask queries regarding projects, costs, expenditures, states, ministries, physical progress, schedule revisions, risk signals, or data quality.",
      isGroundedInReport: false,
    };
  }
}
