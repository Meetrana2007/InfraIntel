import React, { useMemo } from 'react';
import { useProjects } from '../context/ProjectContext';
import { KpiCard } from '../components/common/KpiCard';
import { FilterBar } from '../components/dashboard/FilterBar';
import { DashboardCharts } from '../components/dashboard/DashboardCharts';
import { analyzeProjectRisk } from '../utils/riskEngine';
import {
  FolderKanban,
  IndianRupee,
  TrendingUp,
  Percent,
  CalendarClock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { filteredProjects, projects, weights, thresholds, alerts, setActiveTab } = useProjects();

  // Dynamic KPI calculations strictly from the active filtered projects dataset
  const kpiStats = useMemo(() => {
    const totalProjects = filteredProjects.length;
    const totalOriginalCost = filteredProjects.reduce((acc, p) => acc + p.originalCost, 0);
    const totalRevisedCost = filteredProjects.reduce((acc, p) => acc + p.revisedCost, 0);
    const totalExpenditure = filteredProjects.reduce((acc, p) => acc + p.cumulativeExpenditure, 0);

    const progressValues = filteredProjects
      .map(p => p.physicalProgress)
      .filter((v): v is number => v !== null);

    const avgProgress = progressValues.length > 0
      ? Number((progressValues.reduce((a, b) => a + b, 0) / progressValues.length).toFixed(1))
      : 0;

    const revisedDatesCount = filteredProjects.filter(p => p.revisedCompletionDate !== null).length;

    let highCount = 0;
    let medCount = 0;
    let lowCount = 0;

    filteredProjects.forEach(p => {
      const risk = analyzeProjectRisk(p, weights, thresholds);
      if (risk.category === 'High') highCount++;
      else if (risk.category === 'Medium') medCount++;
      else lowCount++;
    });

    const netCostDelta = totalRevisedCost - totalOriginalCost;
    const netCostDeltaPct = totalOriginalCost > 0
      ? Number(((netCostDelta / totalOriginalCost) * 100).toFixed(1))
      : 0;

    return {
      totalProjects,
      totalOriginalCost,
      totalRevisedCost,
      totalExpenditure,
      avgProgress,
      revisedDatesCount,
      highCount,
      medCount,
      lowCount,
      netCostDelta,
      netCostDeltaPct,
    };
  }, [filteredProjects, weights, thresholds]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            PAIMANA Infrastructure Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Predictive risk monitoring and early warning engine built on official April 2026 IPMD/MoSPI Flash Report.
          </p>
        </div>

        {/* High Risk Quick Banner */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
            <span className="font-bold text-slate-800">{kpiStats.highCount} High Risk</span>
            <span className="text-slate-300">|</span>
            <span className="text-amber-700 font-semibold">{kpiStats.medCount} Med</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-semibold">{kpiStats.lowCount} Low</span>
          </div>
          <button
            onClick={() => setActiveTab('early-warnings')}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold ml-2 cursor-pointer flex items-center gap-0.5"
          >
            <span>Alerts ({alerts.length})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Dataset Filter Bar */}
      <FilterBar />

      {/* 6 Top Required KPI Cards (Dynamically Calculated) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* KPI 1: Total Projects */}
        <KpiCard
          title="Total Projects"
          value={kpiStats.totalProjects}
          subtitle={`Out of ${projects.length} in report`}
          icon={FolderKanban}
          badge={{
            text: kpiStats.totalProjects === projects.length ? '100% Loaded' : 'Filtered',
            variant: 'neutral',
          }}
        />

        {/* KPI 2: Total Original Cost */}
        <KpiCard
          title="Total Original Cost"
          value={`₹${Math.round(kpiStats.totalOriginalCost).toLocaleString('en-IN')} Cr`}
          subtitle="Approved outlay sanction"
          icon={IndianRupee}
        />

        {/* KPI 3: Total Revised Cost */}
        <KpiCard
          title="Total Revised Cost"
          value={`₹${Math.round(kpiStats.totalRevisedCost).toLocaleString('en-IN')} Cr`}
          subtitle={`+${kpiStats.netCostDeltaPct}% observed change`}
          icon={TrendingUp}
          badge={{
            text: `+₹${Math.round(kpiStats.netCostDelta).toLocaleString('en-IN')} Cr`,
            variant: kpiStats.netCostDelta > 0 ? 'warning' : 'positive',
          }}
        />

        {/* KPI 4: Total Expenditure */}
        <KpiCard
          title="Total Expenditure"
          value={`₹${Math.round(kpiStats.totalExpenditure).toLocaleString('en-IN')} Cr`}
          subtitle={`${Math.round((kpiStats.totalExpenditure / (kpiStats.totalRevisedCost || 1)) * 100)}% of revised budget`}
          icon={IndianRupee}
        />

        {/* KPI 5: Average Physical Progress */}
        <KpiCard
          title="Avg Physical Progress"
          value={`${kpiStats.avgProgress}%`}
          subtitle="Across active projects"
          icon={Percent}
          badge={{
            text: kpiStats.avgProgress >= 70 ? 'Advanced' : 'Moderate',
            variant: kpiStats.avgProgress >= 70 ? 'positive' : 'warning',
          }}
        />

        {/* KPI 6: Projects with Revised Completion Date */}
        <KpiCard
          title="Revised Completion"
          value={kpiStats.revisedDatesCount}
          subtitle={`${Math.round((kpiStats.revisedDatesCount / (kpiStats.totalProjects || 1)) * 100)}% of filtered projects`}
          icon={CalendarClock}
          badge={{
            text: 'Schedule Shift',
            variant: 'warning',
          }}
        />
      </div>

      {/* PAIMANA Intelligence Layer Explanation Banner */}
      <div className="bg-linear-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold tracking-wide uppercase">
                InfraGuard AI Intelligence Layer
              </h3>
            </div>
            <p className="text-xs text-blue-100 max-w-3xl leading-relaxed">
              PAIMANA shows current project conditions. InfraGuard AI analyzes reported cost adjustments, completion date revisions, physical progress milestones, and expenditure ratios to generate explainable early warning signals.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('projects')}
              className="px-4 py-2 bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Explore Projects Directory
            </button>
            <button
              onClick={() => setActiveTab('assistant')}
              className="px-4 py-2 bg-blue-800 hover:bg-blue-700 text-white text-xs font-bold rounded-lg border border-blue-600 transition-colors cursor-pointer"
            >
              Ask AI Assistant
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Charts Section (A through G) */}
      <DashboardCharts projects={filteredProjects} />
    </div>
  );
};
