import React, { useState } from 'react';
import { Project } from '../../types/paimana';
import { benchmarkProject } from '../../utils/benchmarking';
import { useProjects } from '../../context/ProjectContext';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface BenchmarkingCardProps {
  project: Project;
}

export const BenchmarkingCard: React.FC<BenchmarkingCardProps> = ({ project }) => {
  const { projects } = useProjects();
  const [cohortType, setCohortType] = useState<'Sector' | 'State' | 'Ministry' | 'Cost Bracket'>('Sector');

  const benchmark = benchmarkProject(project, projects, cohortType);

  const renderDelta = (delta: number, unit: string = '%', invertedGood: boolean = false) => {
    if (delta === 0) {
      return (
        <span className="inline-flex items-center text-slate-500 font-mono text-xs">
          <Minus className="w-3.5 h-3.5 mr-0.5" /> 0.0{unit}
        </span>
      );
    }
    const isHigher = delta > 0;
    // For progress, higher is good. For cost change or schedule delay or risk, lower is good.
    const isGood = invertedGood ? !isHigher : isHigher;

    return (
      <span
        className={`inline-flex items-center font-mono text-xs font-semibold ${
          isGood ? 'text-emerald-600' : 'text-rose-600'
        }`}
      >
        {isHigher ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
        {isHigher ? '+' : ''}{delta}{unit}
      </span>
    );
  };

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-900">Project Benchmarking & Peer Comparison</h4>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparing against {benchmark.physicalProgress.peerCount} peer projects in{' '}
            <span className="font-semibold text-slate-700">{benchmark.peerGroupName}</span>
          </p>
        </div>

        {/* Cohort Selector */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
          {(['Sector', 'State', 'Ministry', 'Cost Bracket'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setCohortType(tab)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                cohortType === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Physical Progress */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <p className="text-[11px] text-slate-500 font-medium">Physical Progress</p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-bold text-slate-900">
              {benchmark.physicalProgress.projectMetric}%
            </span>
            {renderDelta(benchmark.physicalProgress.delta, '%', false)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Peer Avg: <span className="font-mono text-slate-600">{benchmark.physicalProgress.peerAverage}%</span>
          </p>
        </div>

        {/* Metric 2: Observed Cost Change % */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <p className="text-[11px] text-slate-500 font-medium">Observed Cost Change</p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-bold text-slate-900">
              {benchmark.costChangePct.projectMetric > 0 ? `+${benchmark.costChangePct.projectMetric}%` : `${benchmark.costChangePct.projectMetric}%`}
            </span>
            {renderDelta(benchmark.costChangePct.delta, '%', true)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Peer Avg: <span className="font-mono text-slate-600">+{benchmark.costChangePct.peerAverage}%</span>
          </p>
        </div>

        {/* Metric 3: Expenditure Ratio */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <p className="text-[11px] text-slate-500 font-medium">Expenditure Ratio</p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-bold text-slate-900">
              {benchmark.expenditureRatio.projectMetric}%
            </span>
            {renderDelta(benchmark.expenditureRatio.delta, '%', false)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Peer Avg: <span className="font-mono text-slate-600">{benchmark.expenditureRatio.peerAverage}%</span>
          </p>
        </div>

        {/* Metric 4: Risk Score */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <p className="text-[11px] text-slate-500 font-medium">Risk Score</p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-bold text-slate-900">
              {benchmark.riskScore.projectMetric}/100
            </span>
            {renderDelta(benchmark.riskScore.delta, ' pts', true)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Peer Avg: <span className="font-mono text-slate-600">{benchmark.riskScore.peerAverage}/100</span>
          </p>
        </div>
      </div>

      <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200/60 text-xs text-slate-600">
        <span className="font-semibold text-blue-900">Peer Comparison Notice: </span>
        This analytical benchmark offers descriptive cohort comparisons against other Central Sector projects. It does not constitute an official relative efficiency score or punitive rank.
      </div>
    </div>
  );
};
