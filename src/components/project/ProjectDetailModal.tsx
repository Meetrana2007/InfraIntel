import React, { useState } from 'react';
import { Project } from '../../types/paimana';
import { useProjects } from '../../context/ProjectContext';
import { Modal } from '../common/Modal';
import { RiskBadge } from '../common/RiskBadge';
import { ProgressBar } from '../common/ProgressBar';
import { analyzeProjectRisk } from '../../utils/riskEngine';
import { BenchmarkingCard } from './BenchmarkingCard';
import { ScenarioSimulator } from './ScenarioSimulator';
import {
  Calendar,
  IndianRupee,
  AlertTriangle,
  Layers,
  MapPin,
} from 'lucide-react';

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const { weights, thresholds } = useProjects();
  const [activeTab, setActiveTab] = useState<'overview' | 'benchmark' | 'whatif'>('overview');

  if (!project) return null;

  const risk = analyzeProjectRisk(project, weights, thresholds);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project.projectName}
      subtitle={`PAIMANA Code: ${project.projectCode} • Agency: ${project.agency} • ${project.state}`}
      maxWidth="5xl"
    >
      {/* Top Navigation Tabs inside Modal */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 -mt-2">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Project Overview & Risk Signals
          </button>
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'benchmark'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Peer Benchmarking
          </button>
          <button
            onClick={() => setActiveTab('whatif')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'whatif'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            What-If Scenario Simulator
          </button>
        </div>

        <RiskBadge category={risk.category} score={risk.overallScore} size="lg" />
      </div>

      {activeTab === 'benchmark' ? (
        <BenchmarkingCard project={project} />
      ) : activeTab === 'whatif' ? (
        <ScenarioSimulator project={project} />
      ) : (
        <div className="space-y-6">
          {/* Section 1: Executive Identity & Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <p className="text-[11px] font-medium text-slate-700 uppercase">Implementing Agency</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{project.agency}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-700 uppercase">Project Code</p>
              <p className="text-xs font-mono font-bold text-blue-700 mt-0.5">{project.projectCode}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-700 uppercase">Legacy OCMS Code</p>
              <p className="text-xs font-mono text-slate-800 mt-0.5">
                {project.legacyOCMSCode || <span className="text-slate-400 italic">N/A</span>}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-700 uppercase">PMGID (Invest India)</p>
              <p className="text-xs font-mono text-slate-800 mt-0.5">
                {project.pmgid || <span className="text-slate-400 italic">Not Available</span>}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-700 uppercase">State / Jurisdiction</p>
              <p className="text-xs font-semibold text-slate-900 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-700" />
                {project.state}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-700 uppercase">Sector</p>
              <p className="text-xs font-semibold text-slate-900 mt-0.5 flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-700" />
                {project.sector}
              </p>
            </div>
          </div>

          {/* Section 2: Why Is This Project Flagged? (Explicit Requirement) */}
          <div className={`p-4 rounded-xl border ${
            risk.category === 'High'
              ? 'bg-rose-50/70 border-rose-200 text-rose-950'
              : risk.category === 'Medium'
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex items-center gap-2 mb-2 font-bold text-sm">
              <AlertTriangle className={`w-4 h-4 ${
                risk.category === 'High' ? 'text-rose-600' : risk.category === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
              }`} />
              <span>WHY IS THIS PROJECT FLAGGED?</span>
              <span className="text-xs font-normal opacity-75 font-mono ml-auto">
                Deterministic Signal Analysis
              </span>
            </div>
            <ul className="space-y-1.5 text-xs">
              {risk.signals.map((signal, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-bold text-slate-700">•</span>
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-2.5 border-t border-slate-200/50 text-xs">
              <span className="font-bold">Recommended Attention: </span>
              <span>{risk.recommendedAttention}</span>
            </div>
          </div>

          {/* Section 3: Financial & Timeline Analysis (Two-Column Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Financial Analysis Box */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Financial Analysis</h4>
                </div>
                <span className="text-[10px] text-slate-700 font-mono">₹ in Crores</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p className="text-[10px] text-slate-700 uppercase font-medium">Original Cost</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    ₹{project.originalCost.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p className="text-[10px] text-slate-700 uppercase font-medium">Revised Cost</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    ₹{project.revisedCost.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p className="text-[10px] text-slate-700 uppercase font-medium">Observed Change</p>
                  <p className={`text-sm font-bold mt-0.5 ${risk.observedCostChange > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {risk.observedCostChange > 0 ? `+${risk.observedCostChangePct}%` : '0%'}
                  </p>
                </div>
              </div>

              {/* Cumulative Expenditure Ratio with mandated label */}
              <div>
                <ProgressBar
                  value={risk.expenditureRatio}
                  label="Cumulative expenditure ratio"
                  subLabel={`₹${project.cumulativeExpenditure.toLocaleString('en-IN')} Cr spent out of ₹${project.revisedCost.toLocaleString('en-IN')} Cr revised cost. Note: Cumulative expenditure ratio does not represent physical completion.`}
                  color="blue"
                  height="md"
                />
              </div>
            </div>

            {/* Timeline & Progress Analysis Box */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Timeline & Physical Progress</h4>
                </div>
                <span className="text-[10px] text-slate-700 font-mono">Milestone Tracking</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p className="text-[10px] text-slate-700 uppercase font-medium">Approval / Start Date</p>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">{project.approvalDate}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p className="text-[10px] text-slate-700 uppercase font-medium">Original Target Date</p>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">{project.originalCompletionDate}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 col-span-2">
                  <p className="text-[10px] text-slate-700 uppercase font-medium">Revised Completion Date</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className={`text-xs font-bold ${project.revisedCompletionDate ? 'text-amber-700' : 'text-slate-700'}`}>
                      {project.revisedCompletionDate || 'Revised completion date not available'}
                    </p>
                    {risk.isCompletionRevised && risk.scheduleShiftMonths && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Completion date revised (+{risk.scheduleShiftMonths} mos shift)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Physical Progress */}
              <div>
                <ProgressBar
                  value={project.physicalProgress}
                  label="Physical Progress (%)"
                  subLabel="Civil, structural, and procurement completion percentage as reported by implementing agency."
                  color={
                    project.physicalProgress === null
                      ? 'auto'
                      : project.physicalProgress < 25
                      ? 'amber'
                      : project.physicalProgress < 75
                      ? 'blue'
                      : 'emerald'
                  }
                  height="md"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Risk Indicators Component Breakdown */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Prototype Risk Indicator Components (Configurable Weights)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-700 block font-medium">Cost Indicator ({weights.costWeight}%)</span>
                <span className="text-lg font-bold text-slate-800 font-mono">{risk.indicators.costScore}/100</span>
                <p className="text-[10px] text-slate-700 mt-0.5">Change: +{risk.observedCostChangePct}%</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-700 block font-medium">Schedule Indicator ({weights.scheduleWeight}%)</span>
                <span className="text-lg font-bold text-slate-800 font-mono">{risk.indicators.scheduleScore}/100</span>
                <p className="text-[10px] text-slate-700 mt-0.5">
                  Shift: {risk.scheduleShiftMonths !== null ? `${risk.scheduleShiftMonths} mos` : '0 mos'}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-700 block font-medium">Progress Indicator ({weights.progressWeight}%)</span>
                <span className="text-lg font-bold text-slate-800 font-mono">{risk.indicators.progressScore}/100</span>
                <p className="text-[10px] text-slate-700 mt-0.5">
                  Progress: {project.physicalProgress !== null ? `${project.physicalProgress}%` : 'N/A'}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-700 block font-medium">Data Quality Indicator ({weights.dataQualityWeight}%)</span>
                <span className="text-lg font-bold text-slate-800 font-mono">{risk.indicators.dataQualityScore}/100</span>
                <p className="text-[10px] text-slate-700 mt-0.5">Completeness: {risk.dataCompletenessPct}%</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
