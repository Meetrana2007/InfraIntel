import React, { useState, useMemo } from 'react';
import { Project, ScenarioInput } from '../../types/paimana';
import { useProjects } from '../../context/ProjectContext';
import { analyzeProjectRisk } from '../../utils/riskEngine';
import { RiskBadge } from '../common/RiskBadge';
import { Sliders, RotateCcw, AlertCircle, ArrowRight } from 'lucide-react';

interface ScenarioSimulatorProps {
  project: Project;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({ project }) => {
  const { weights, thresholds } = useProjects();

  const baselineRisk = useMemo(() => {
    return analyzeProjectRisk(project, weights, thresholds);
  }, [project, weights, thresholds]);

  const [input, setInput] = useState<ScenarioInput>({
    adjustedProgress: project.physicalProgress ?? 50,
    scheduleDelayMonths: 0,
    costChangeDeltaPct: 0,
  });

  const simulatedResult = useMemo(() => {
    // Clone project with simulated changes
    const newCost = project.revisedCost * (1 + input.costChangeDeltaPct / 100);
    const simulatedProject: Project = {
      ...project,
      physicalProgress: Math.min(100, Math.max(0, input.adjustedProgress)),
      revisedCost: Number(newCost.toFixed(2)),
    };

    if (input.scheduleDelayMonths !== 0) {
      const origDate = new Date(project.originalCompletionDate);
      origDate.setMonth(origDate.getMonth() + (baselineRisk.scheduleShiftMonths ?? 0) + input.scheduleDelayMonths);
      simulatedProject.revisedCompletionDate = origDate.toISOString().slice(0, 10);
    }

    const simRisk = analyzeProjectRisk(simulatedProject, weights, thresholds);
    const delta = simRisk.overallScore - baselineRisk.overallScore;

    return {
      simRisk,
      delta,
    };
  }, [project, input, baselineRisk, weights, thresholds]);

  const handleReset = () => {
    setInput({
      adjustedProgress: project.physicalProgress ?? 50,
      scheduleDelayMonths: 0,
      costChangeDeltaPct: 0,
    });
  };

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-900">What-If Scenario Simulation</h4>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Test policy, funding, or acceleration interventions to evaluate prototype risk sensitivity.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 bg-white px-2.5 py-1 rounded border border-slate-200 cursor-pointer transition-colors"
          title="Reset to baseline"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sliders Input Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-white p-4 rounded-xl border border-slate-200">
        {/* Slider 1: Physical Progress */}
        <div>
          <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
            <span>Physical Progress</span>
            <span className="font-mono font-bold text-blue-700">{input.adjustedProgress}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={input.adjustedProgress}
            onChange={(e) => setInput(prev => ({ ...prev, adjustedProgress: Number(e.target.value) }))}
            className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>0%</span>
            <span>Current: {project.physicalProgress !== null ? `${project.physicalProgress}%` : 'N/A'}</span>
            <span>100%</span>
          </div>
        </div>

        {/* Slider 2: Additional Timeline Shift (Months) */}
        <div>
          <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
            <span>Timeline Adjustment</span>
            <span className={`font-mono font-bold ${input.scheduleDelayMonths > 0 ? 'text-rose-600' : input.scheduleDelayMonths < 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
              {input.scheduleDelayMonths > 0 ? `+${input.scheduleDelayMonths} mos delay` : input.scheduleDelayMonths < 0 ? `${input.scheduleDelayMonths} mos expedited` : '0 mos change'}
            </span>
          </div>
          <input
            type="range"
            min="-12"
            max="36"
            step="1"
            value={input.scheduleDelayMonths}
            onChange={(e) => setInput(prev => ({ ...prev, scheduleDelayMonths: Number(e.target.value) }))}
            className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>-12 mos</span>
            <span>Baseline</span>
            <span>+36 mos</span>
          </div>
        </div>

        {/* Slider 3: Cost Adjustment (%) */}
        <div>
          <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
            <span>Cost Adjustment</span>
            <span className={`font-mono font-bold ${input.costChangeDeltaPct > 0 ? 'text-rose-600' : input.costChangeDeltaPct < 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
              {input.costChangeDeltaPct > 0 ? `+${input.costChangeDeltaPct}%` : `${input.costChangeDeltaPct}%`}
            </span>
          </div>
          <input
            type="range"
            min="-20"
            max="50"
            step="2"
            value={input.costChangeDeltaPct}
            onChange={(e) => setInput(prev => ({ ...prev, costChangeDeltaPct: Number(e.target.value) }))}
            className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>-20%</span>
            <span>Current Rev Cost</span>
            <span>+50%</span>
          </div>
        </div>
      </div>

      {/* Outcome Comparison */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Current State */}
        <div className="flex items-center gap-3">
          <div className="text-center sm:text-left">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Current Baseline
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">
                {baselineRisk.overallScore}
              </span>
              <RiskBadge category={baselineRisk.category} showScore={false} size="sm" />
            </div>
          </div>
        </div>

        <ArrowRight className="w-5 h-5 text-slate-300 hidden sm:block" />

        {/* Simulated Scenario */}
        <div className="flex items-center gap-3">
          <div className="text-center sm:text-left">
            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
              Simulated Scenario
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">
                {simulatedResult.simRisk.overallScore}
              </span>
              <RiskBadge category={simulatedResult.simRisk.category} showScore={false} size="sm" />
              {simulatedResult.delta !== 0 && (
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  simulatedResult.delta < 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {simulatedResult.delta > 0 ? `+${simulatedResult.delta}` : simulatedResult.delta} pts
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Indicators breakdown change */}
        <div className="text-xs text-slate-500 space-y-1 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-4">
          <div className="flex justify-between gap-4">
            <span>Cost Indicator:</span>
            <span className="font-mono text-slate-700">{simulatedResult.simRisk.indicators.costScore}/100</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Schedule Indicator:</span>
            <span className="font-mono text-slate-700">{simulatedResult.simRisk.indicators.scheduleScore}/100</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Progress Indicator:</span>
            <span className="font-mono text-slate-700">{simulatedResult.simRisk.indicators.progressScore}/100</span>
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer Label */}
      <div className="flex items-start gap-2 p-3 bg-amber-50/70 border border-amber-200/70 rounded-lg text-xs text-amber-800">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Required Notice: </span>
          <span>Scenario simulation — not a guaranteed forecast. Interventions reflect model sensitivity within the rule-based risk prototype.</span>
        </div>
      </div>
    </div>
  );
};
