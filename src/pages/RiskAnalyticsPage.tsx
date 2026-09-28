import React, { useMemo } from 'react';
import { useProjects } from '../context/ProjectContext';
import { analyzeProjectRisk } from '../utils/riskEngine';
import { RiskBadge } from '../components/common/RiskBadge';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { Activity, ShieldCheck, Sliders, ExternalLink, ArrowRight } from 'lucide-react';

export const RiskAnalyticsPage: React.FC = () => {
  const { filteredProjects, weights, thresholds, openProjectDetails, setActiveTab } = useProjects();

  const riskAnalyses = useMemo(() => {
    return filteredProjects.map(p => ({
      project: p,
      risk: analyzeProjectRisk(p, weights, thresholds),
    }));
  }, [filteredProjects, weights, thresholds]);

  const summary = useMemo(() => {
    let high = 0, med = 0, low = 0;
    let sumCostScore = 0, sumSchedScore = 0, sumProgScore = 0, sumDQScore = 0, sumOverall = 0;

    riskAnalyses.forEach(({ risk }) => {
      if (risk.category === 'High') high++;
      else if (risk.category === 'Medium') med++;
      else low++;

      sumCostScore += risk.indicators.costScore;
      sumSchedScore += risk.indicators.scheduleScore;
      sumProgScore += risk.indicators.progressScore;
      sumDQScore += risk.indicators.dataQualityScore;
      sumOverall += risk.overallScore;
    });

    const count = riskAnalyses.length || 1;
    return {
      high,
      med,
      low,
      avgCost: Math.round(sumCostScore / count),
      avgSched: Math.round(sumSchedScore / count),
      avgProg: Math.round(sumProgScore / count),
      avgDQ: Math.round(sumDQScore / count),
      avgOverall: Math.round(sumOverall / count),
    };
  }, [riskAnalyses]);

  // Scatter chart data: Progress vs Risk Score
  const scatterData = useMemo(() => {
    return riskAnalyses.map(({ project, risk }) => ({
      name: project.projectName,
      progress: project.physicalProgress ?? 0,
      riskScore: risk.overallScore,
      costChangePct: risk.observedCostChangePct,
      category: risk.category,
      agency: project.agency,
    }));
  }, [riskAnalyses]);

  // Indicator Comparison Bar Data
  const indicatorBarData = [
    { indicator: `Cost (${weights.costWeight}%)`, score: summary.avgCost },
    { indicator: `Schedule (${weights.scheduleWeight}%)`, score: summary.avgSched },
    { indicator: `Progress (${weights.progressWeight}%)`, score: summary.avgProg },
    { indicator: `Data Quality (${weights.dataQualityWeight}%)`, score: summary.avgDQ },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Predictive Risk Assessment Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Transparent, multi-dimensional analytical risk scoring evaluating cost shift, timeline revision, execution progress, and data completeness.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-1.5 px-3 py-2 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-blue-600" />
          <span>Tune Indicator Weights</span>
        </button>
      </div>

      {/* Top Risk Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase">Average Risk Score</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">{summary.avgOverall}/100</p>
          <p className="text-[11px] text-slate-400 mt-1">Weighted composite across 4 indicators</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200/80 shadow-2xs bg-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase">High Risk Flagged</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
          </div>
          <p className="text-2xl font-bold text-rose-900 mt-1 font-mono">{summary.high}</p>
          <p className="text-[11px] text-rose-700/80 mt-1">
            Score &gt; {thresholds.mediumMax} • Executive Review Required
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase">Medium Risk Flagged</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-900 mt-1 font-mono">{summary.med}</p>
          <p className="text-[11px] text-amber-700/80 mt-1">
            Score {thresholds.lowMax + 1}–{thresholds.mediumMax} • Track Monthly Milestones
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-2xs bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase">Low Risk Normal</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-900 mt-1 font-mono">{summary.low}</p>
          <p className="text-[11px] text-emerald-700/80 mt-1">
            Score 0–{thresholds.lowMax} • Routine Monitoring
          </p>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Average Indicator Scores */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800">Average Indicator Stress Levels</h3>
            <p className="text-xs text-slate-500">
              Average 0–100 score across all active projects for each indicator domain
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={indicatorBarData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="indicator" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`${val}/100 stress score`, 'Average Stress']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="score" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Physical Progress vs Risk Score Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800">Physical Progress vs Overall Risk Score</h3>
            <p className="text-xs text-slate-500">
              Distribution showing how completion pacing correlates with risk flags
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="progress"
                  name="Physical Progress"
                  unit="%"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Reported Physical Progress (%)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#94a3b8' }}
                />
                <YAxis
                  type="number"
                  dataKey="riskScore"
                  name="Risk Score"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Risk Score', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: '#94a3b8' }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value: any, name: any) => [name === 'Physical Progress' ? `${value}%` : `${value}/100`, name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Scatter name="Projects" data={scatterData} fill="#dc2626" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Flagged Projects Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Highest Risk Flagged Projects</h3>
            <p className="text-xs text-slate-500">
              Ranked by composite prototype risk indicator score
            </p>
          </div>
          <button
            onClick={() => setActiveTab('projects')}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
          >
            <span>View All in Projects Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200">
                <th className="p-3">Project Title & Code</th>
                <th className="p-3">Agency</th>
                <th className="p-3">Cost Change</th>
                <th className="p-3">Schedule Shift</th>
                <th className="p-3 text-center">Progress</th>
                <th className="p-3">Primary Risk Signals</th>
                <th className="p-3 text-center">Score</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-700">
              {riskAnalyses
                .sort((a, b) => b.risk.overallScore - a.risk.overallScore)
                .slice(0, 8)
                .map(({ project, risk }) => (
                  <tr key={project.projectCode} className="hover:bg-slate-50/70">
                    <td className="p-3 max-w-xs">
                      <div className="font-semibold text-slate-900 line-clamp-1">
                        {project.projectName}
                      </div>
                      <div className="text-[11px] font-mono text-blue-700">
                        {project.projectCode} • {project.state}
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{project.agency}</td>
                    <td className="p-3 font-mono">
                      <span className={risk.observedCostChange > 0 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                        {risk.observedCostChange > 0 ? `+${risk.observedCostChangePct}%` : '0%'}
                      </span>
                    </td>
                    <td className="p-3 font-mono">
                      {risk.scheduleShiftMonths ? (
                        <span className="text-amber-700 font-bold">+{risk.scheduleShiftMonths} mos</span>
                      ) : (
                        <span className="text-slate-400">On Target</span>
                      )}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-slate-900">
                      {project.physicalProgress !== null ? `${project.physicalProgress}%` : 'N/A'}
                    </td>
                    <td className="p-3 max-w-sm">
                      <div className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {risk.signals[0] || 'Parameters within normal bounds'}
                      </div>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <RiskBadge category={risk.category} score={risk.overallScore} size="sm" />
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => openProjectDetails(project)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold text-[11px] rounded border border-slate-200 transition-colors cursor-pointer"
                      >
                        <span>Investigate</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
