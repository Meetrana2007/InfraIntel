import React, { useState, useMemo } from 'react';
import { useProjects } from '../context/ProjectContext';
import { analyzeProjectRisk } from '../utils/riskEngine';
import { exportTableToCSV, exportProjectsToCSV } from '../utils/exportUtils';
import {
  Download,
  FileText,
  AlertTriangle,
  TrendingUp,
  Clock,
  Percent,
  Database,
  MapPin,
  Layers,
  Building2,
} from 'lucide-react';

type ReportType =
  | 'summary'
  | 'high-attention'
  | 'cost-change'
  | 'schedule-revision'
  | 'physical-progress'
  | 'data-quality'
  | 'state-wise'
  | 'sector-wise'
  | 'ministry-wise';

export const ReportsPage: React.FC = () => {
  const { projects, openProjectDetails, weights, thresholds } = useProjects();
  const [selectedReport, setSelectedReport] = useState<ReportType>('summary');

  const reportTabs: { id: ReportType; label: string; icon: any; count?: number }[] = [
    { id: 'summary', label: '1. Project Summary Report', icon: FileText, count: projects.length },
    {
      id: 'high-attention',
      label: '2. High Attention Projects',
      icon: AlertTriangle,
      count: projects.filter(p => analyzeProjectRisk(p, weights, thresholds).category === 'High').length,
    },
    { id: 'cost-change', label: '3. Cost Change Report', icon: TrendingUp },
    {
      id: 'schedule-revision',
      label: '4. Schedule Revision Report',
      icon: Clock,
      count: projects.filter(p => p.revisedCompletionDate !== null).length,
    },
    { id: 'physical-progress', label: '5. Physical Progress Report', icon: Percent },
    { id: 'data-quality', label: '6. Data Quality Report', icon: Database },
    { id: 'state-wise', label: '7. State-wise Analysis', icon: MapPin },
    { id: 'sector-wise', label: '8. Sector-wise Analysis', icon: Layers },
    { id: 'ministry-wise', label: '9. Ministry-wise Analysis', icon: Building2 },
  ];

  // Dynamic calculations for various reports
  const stateWiseData = useMemo(() => {
    const map = new Map<string, { state: string; count: number; origCost: number; revCost: number; exp: number; avgProg: number; progCount: number }>();
    projects.forEach(p => {
      const cur = map.get(p.state) || { state: p.state, count: 0, origCost: 0, revCost: 0, exp: 0, avgProg: 0, progCount: 0 };
      cur.count++;
      cur.origCost += p.originalCost;
      cur.revCost += p.revisedCost;
      cur.exp += p.cumulativeExpenditure;
      if (p.physicalProgress !== null) {
        cur.avgProg += p.physicalProgress;
        cur.progCount++;
      }
      map.set(p.state, cur);
    });
    return Array.from(map.values())
      .map(d => ({
        ...d,
        avgProgress: d.progCount > 0 ? Number((d.avgProg / d.progCount).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [projects]);

  const sectorWiseData = useMemo(() => {
    const map = new Map<string, { sector: string; count: number; revCost: number; exp: number; avgProg: number; progCount: number }>();
    projects.forEach(p => {
      const cur = map.get(p.sector) || { sector: p.sector, count: 0, revCost: 0, exp: 0, avgProg: 0, progCount: 0 };
      cur.count++;
      cur.revCost += p.revisedCost;
      cur.exp += p.cumulativeExpenditure;
      if (p.physicalProgress !== null) {
        cur.avgProg += p.physicalProgress;
        cur.progCount++;
      }
      map.set(p.sector, cur);
    });
    return Array.from(map.values())
      .map(d => ({
        ...d,
        avgProgress: d.progCount > 0 ? Number((d.avgProg / d.progCount).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [projects]);

  const ministryWiseData = useMemo(() => {
    const map = new Map<string, { ministry: string; count: number; revCost: number; exp: number }>();
    projects.forEach(p => {
      const cur = map.get(p.ministry) || { ministry: p.ministry, count: 0, revCost: 0, exp: 0 };
      cur.count++;
      cur.revCost += p.revisedCost;
      cur.exp += p.cumulativeExpenditure;
      map.set(p.ministry, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [projects]);

  // Handle Export based on selected report
  const handleExportCurrent = () => {
    switch (selectedReport) {
      case 'summary':
        exportProjectsToCSV(projects, 'paimana_project_summary_report.csv');
        break;
      case 'high-attention': {
        const high = projects.filter(p => analyzeProjectRisk(p, weights, thresholds).category === 'High');
        exportProjectsToCSV(high, 'paimana_high_attention_projects.csv');
        break;
      }
      case 'state-wise': {
        const headers = ['State / Region', 'Project Count', 'Original Cost (Cr)', 'Revised Cost (Cr)', 'Expenditure (Cr)', 'Avg Physical Progress (%)'];
        const rows = stateWiseData.map(d => [d.state, d.count, d.origCost, d.revCost, d.exp, `${d.avgProgress}%`]);
        exportTableToCSV(headers, rows, 'paimana_state_wise_analysis.csv');
        break;
      }
      case 'sector-wise': {
        const headers = ['Sector', 'Project Count', 'Revised Cost (Cr)', 'Expenditure (Cr)', 'Avg Physical Progress (%)'];
        const rows = sectorWiseData.map(d => [d.sector, d.count, d.revCost, d.exp, `${d.avgProgress}%`]);
        exportTableToCSV(headers, rows, 'paimana_sector_wise_analysis.csv');
        break;
      }
      case 'ministry-wise': {
        const headers = ['Ministry', 'Project Count', 'Revised Cost (Cr)', 'Expenditure (Cr)'];
        const rows = ministryWiseData.map(d => [d.ministry, d.count, d.revCost, d.exp]);
        exportTableToCSV(headers, rows, 'paimana_ministry_wise_analysis.csv');
        break;
      }
      default:
        exportProjectsToCSV(projects, `paimana_${selectedReport}_report.csv`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Official Reports & Executive Analytical Summaries
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pre-compiled statutory and analytical summaries generated strictly from the April 2026 PAIMANA Flash Report.
          </p>
        </div>

        <button
          onClick={handleExportCurrent}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Current Report (CSV)</span>
        </button>
      </div>

      {/* Report Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {reportTabs.map(tab => {
          const Icon = tab.icon;
          const isSelected = selectedReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedReport(tab.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs ${
                isSelected
                  ? 'bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-500/20 font-bold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-xs truncate">{tab.label}</span>
              </div>
              {tab.count !== undefined && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-bold shrink-0">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Report Content Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Report 1: Project Summary Report */}
        {selectedReport === 'summary' && (
          <div className="p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">1. Project Summary Report (Master Register)</h3>
              <p className="text-xs text-slate-500">Comprehensive overview of all {projects.length} Central Sector projects costing ₹150 Cr and above</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200">
                    <th className="p-2.5">Project Name</th>
                    <th className="p-2.5">Agency</th>
                    <th className="p-2.5">State</th>
                    <th className="p-2.5 text-right">Orig Cost (Cr)</th>
                    <th className="p-2.5 text-right">Rev Cost (Cr)</th>
                    <th className="p-2.5 text-right">Expenditure (Cr)</th>
                    <th className="p-2.5 text-center">Progress</th>
                    <th className="p-2.5 text-center">Target Date</th>
                    <th className="p-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {projects.map(p => (
                    <tr key={p.projectCode} className="hover:bg-slate-50">
                      <td className="p-2.5 font-semibold text-slate-900 max-w-xs truncate">{p.projectName}</td>
                      <td className="p-2.5 font-mono text-slate-700">{p.agency}</td>
                      <td className="p-2.5 text-slate-600">{p.state}</td>
                      <td className="p-2.5 text-right font-mono">₹{p.originalCost.toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">₹{p.revisedCost.toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-right font-mono">₹{p.cumulativeExpenditure.toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-center font-mono font-bold">
                        {p.physicalProgress !== null ? `${p.physicalProgress}%` : 'N/A'}
                      </td>
                      <td className="p-2.5 text-center font-mono text-[11px]">
                        {p.revisedCompletionDate || p.originalCompletionDate}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => openProjectDetails(p)}
                          className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report 2: High Attention Projects */}
        {selectedReport === 'high-attention' && (
          <div className="p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">2. High Attention Projects Report</h3>
              <p className="text-xs text-slate-500">
                Projects exceeding threshold score of {thresholds.mediumMax} requiring priority executive oversight
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200">
                    <th className="p-2.5">Project Title</th>
                    <th className="p-2.5">Agency</th>
                    <th className="p-2.5 text-right">Cost Delta</th>
                    <th className="p-2.5 text-right">Schedule Shift</th>
                    <th className="p-2.5 text-center">Progress</th>
                    <th className="p-2.5">Key Attention Reason</th>
                    <th className="p-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {projects
                    .filter(p => analyzeProjectRisk(p, weights, thresholds).category === 'High')
                    .map(p => {
                      const risk = analyzeProjectRisk(p, weights, thresholds);
                      return (
                        <tr key={p.projectCode} className="hover:bg-rose-50/30">
                          <td className="p-2.5 font-semibold text-slate-900 max-w-xs truncate">{p.projectName}</td>
                          <td className="p-2.5 font-bold text-slate-800">{p.agency}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-rose-600">
                            +{risk.observedCostChangePct}%
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-amber-700">
                            +{risk.scheduleShiftMonths ?? 0} mos
                          </td>
                          <td className="p-2.5 text-center font-mono font-bold">
                            {p.physicalProgress !== null ? `${p.physicalProgress}%` : 'N/A'}
                          </td>
                          <td className="p-2.5 text-xs text-slate-600 max-w-md truncate">
                            {risk.signals[0]}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => openProjectDetails(p)}
                              className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold cursor-pointer"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report 3: Cost Change Report */}
        {selectedReport === 'cost-change' && (
          <div className="p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">3. Observed Cost Change Report</h3>
              <p className="text-xs text-slate-500">Sorted by percentage difference between original approved and revised cost</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200">
                    <th className="p-2.5">Project Name</th>
                    <th className="p-2.5">Agency</th>
                    <th className="p-2.5 text-right">Original Cost</th>
                    <th className="p-2.5 text-right">Revised Cost</th>
                    <th className="p-2.5 text-right">Cost Delta (₹ Cr)</th>
                    <th className="p-2.5 text-right">Change (%)</th>
                    <th className="p-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {[...projects]
                    .sort((a, b) => ((b.revisedCost - b.originalCost) / b.originalCost) - ((a.revisedCost - a.originalCost) / a.originalCost))
                    .map(p => {
                      const delta = p.revisedCost - p.originalCost;
                      const pct = p.originalCost > 0 ? ((delta / p.originalCost) * 100).toFixed(1) : '0';
                      return (
                        <tr key={p.projectCode} className="hover:bg-slate-50">
                          <td className="p-2.5 font-semibold text-slate-900 max-w-sm truncate">{p.projectName}</td>
                          <td className="p-2.5 font-mono text-slate-700">{p.agency}</td>
                          <td className="p-2.5 text-right font-mono">₹{p.originalCost.toLocaleString('en-IN')}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">₹{p.revisedCost.toLocaleString('en-IN')}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-rose-600">
                            {delta > 0 ? `+₹${delta.toLocaleString('en-IN')}` : '₹0'}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-rose-600">
                            +{pct}%
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => openProjectDetails(p)}
                              className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold cursor-pointer"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report 4: Schedule Revision Report */}
        {selectedReport === 'schedule-revision' && (
          <div className="p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">4. Schedule Revision Report</h3>
              <p className="text-xs text-slate-500">All projects where official revised completion dates differ from original targets</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200">
                    <th className="p-2.5">Project Title</th>
                    <th className="p-2.5">Agency</th>
                    <th className="p-2.5 text-center">Original Target Date</th>
                    <th className="p-2.5 text-center">Revised Target Date</th>
                    <th className="p-2.5 text-right">Schedule Shift</th>
                    <th className="p-2.5 text-center">Physical Progress</th>
                    <th className="p-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {projects
                    .filter(p => p.revisedCompletionDate !== null)
                    .map(p => {
                      const risk = analyzeProjectRisk(p, weights, thresholds);
                      return (
                        <tr key={p.projectCode} className="hover:bg-slate-50">
                          <td className="p-2.5 font-semibold text-slate-900 max-w-sm truncate">{p.projectName}</td>
                          <td className="p-2.5 font-mono text-slate-700">{p.agency}</td>
                          <td className="p-2.5 text-center font-mono text-slate-500">{p.originalCompletionDate}</td>
                          <td className="p-2.5 text-center font-mono font-bold text-amber-800">{p.revisedCompletionDate}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-amber-700">
                            +{risk.scheduleShiftMonths ?? 0} months
                          </td>
                          <td className="p-2.5 text-center font-mono font-bold">
                            {p.physicalProgress !== null ? `${p.physicalProgress}%` : 'N/A'}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => openProjectDetails(p)}
                              className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold cursor-pointer"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report 5: Physical Progress Report */}
        {selectedReport === 'physical-progress' && (
          <div className="p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">5. Physical Progress Distribution Report</h3>
              <p className="text-xs text-slate-500">Categorized by 0–25% (Low), 26–50% (Moderate), 51–75% (Advanced), and 76–100% (Mature)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200">
                    <th className="p-2.5">Project Title</th>
                    <th className="p-2.5">Agency</th>
                    <th className="p-2.5 text-center">Progress Bracket</th>
                    <th className="p-2.5 text-center">Reported Progress</th>
                    <th className="p-2.5 text-right">Expenditure Ratio</th>
                    <th className="p-2.5 text-center">Gap</th>
                    <th className="p-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {[...projects]
                    .sort((a, b) => (a.physicalProgress ?? 999) - (b.physicalProgress ?? 999))
                    .map(p => {
                      const risk = analyzeProjectRisk(p, weights, thresholds);
                      const bracket = p.physicalProgress === null ? 'N/A' : p.physicalProgress <= 25 ? '0–25% Low' : p.physicalProgress <= 50 ? '26–50% Mod' : p.physicalProgress <= 75 ? '51–75% Adv' : '76–100% Mature';
                      return (
                        <tr key={p.projectCode} className="hover:bg-slate-50">
                          <td className="p-2.5 font-semibold text-slate-900 max-w-sm truncate">{p.projectName}</td>
                          <td className="p-2.5 font-mono text-slate-700">{p.agency}</td>
                          <td className="p-2.5 text-center font-semibold text-slate-700">{bracket}</td>
                          <td className="p-2.5 text-center font-mono font-bold text-slate-900">
                            {p.physicalProgress !== null ? `${p.physicalProgress}%` : 'N/A'}
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-600">
                            {risk.expenditureRatio}%
                          </td>
                          <td className="p-2.5 text-center font-mono font-bold text-slate-700">
                            {risk.expenditureProgressGap !== null ? `${risk.expenditureProgressGap}%` : 'N/A'}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => openProjectDetails(p)}
                              className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold cursor-pointer"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report 6: Data Quality Report */}
        {selectedReport === 'data-quality' && (
          <div className="p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">6. Data Quality & Completeness Audit Report</h3>
              <p className="text-xs text-slate-500">Evaluation of missing critical identifiers (PMGID, Legacy OCMS Code, Revised Dates)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200">
                    <th className="p-2.5">Project Title</th>
                    <th className="p-2.5">Agency</th>
                    <th className="p-2.5 text-center">Completeness</th>
                    <th className="p-2.5">Missing Attributes</th>
                    <th className="p-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {projects.map(p => {
                    const risk = analyzeProjectRisk(p, weights, thresholds);
                    return (
                      <tr key={p.projectCode} className="hover:bg-slate-50">
                        <td className="p-2.5 font-semibold text-slate-900 max-w-sm truncate">{p.projectName}</td>
                        <td className="p-2.5 font-mono text-slate-700">{p.agency}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-slate-800">
                          {risk.dataCompletenessPct}%
                        </td>
                        <td className="p-2.5 text-xs text-slate-600">
                          {risk.missingFields.length > 0 ? (
                            <span className="text-amber-700 font-medium">{risk.missingFields.join(', ')}</span>
                          ) : (
                            <span className="text-emerald-700 font-medium">None (100% Present)</span>
                          )}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => openProjectDetails(p)}
                            className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report 7: State-wise Analysis */}
        {selectedReport === 'state-wise' && (
          <div className="p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">7. State-wise Aggregation Analysis</h3>
              <p className="text-xs text-slate-500">Summary aggregates across Indian States & Union Territories</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200">
                    <th className="p-2.5">State / Jurisdiction</th>
                    <th className="p-2.5 text-center">Projects</th>
                    <th className="p-2.5 text-right">Orig Outlay (₹ Cr)</th>
                    <th className="p-2.5 text-right">Revised Outlay (₹ Cr)</th>
                    <th className="p-2.5 text-right">Expenditure (₹ Cr)</th>
                    <th className="p-2.5 text-center">Avg Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {stateWiseData.map(d => (
                    <tr key={d.state} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{d.state}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-blue-700">{d.count}</td>
                      <td className="p-2.5 text-right font-mono">₹{Math.round(d.origCost).toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">₹{Math.round(d.revCost).toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-right font-mono">₹{Math.round(d.exp).toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-emerald-700">{d.avgProgress}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report 8: Sector-wise Analysis */}
        {selectedReport === 'sector-wise' && (
          <div className="p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">8. Sector-wise Infrastructure Analysis</h3>
              <p className="text-xs text-slate-500">Volume and financial commitment breakdown across core domains</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200">
                    <th className="p-2.5">Sector</th>
                    <th className="p-2.5 text-center">Projects</th>
                    <th className="p-2.5 text-right">Revised Cost (₹ Cr)</th>
                    <th className="p-2.5 text-right">Expenditure (₹ Cr)</th>
                    <th className="p-2.5 text-center">Avg Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {sectorWiseData.map(d => (
                    <tr key={d.sector} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{d.sector}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-blue-700">{d.count}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">₹{Math.round(d.revCost).toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-right font-mono">₹{Math.round(d.exp).toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-emerald-700">{d.avgProgress}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report 9: Ministry-wise Analysis */}
        {selectedReport === 'ministry-wise' && (
          <div className="p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">9. Ministry-wise Analysis</h3>
              <p className="text-xs text-slate-500">Central nodal ministries portfolio summary</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200">
                    <th className="p-2.5">Nodal Ministry</th>
                    <th className="p-2.5 text-center">Project Count</th>
                    <th className="p-2.5 text-right">Revised Cost (₹ Cr)</th>
                    <th className="p-2.5 text-right">Expenditure (₹ Cr)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {ministryWiseData.map(d => (
                    <tr key={d.ministry} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{d.ministry}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-blue-700">{d.count}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">₹{Math.round(d.revCost).toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-right font-mono">₹{Math.round(d.exp).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
