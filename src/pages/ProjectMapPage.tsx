import React, { useState, useMemo } from 'react';
import { useProjects } from '../context/ProjectContext';
import { analyzeProjectRisk } from '../utils/riskEngine';
import { RiskBadge } from '../components/common/RiskBadge';
import { MapPin, ChevronRight } from 'lucide-react';

export const ProjectMapPage: React.FC = () => {
  const { projects, openProjectDetails, weights, thresholds } = useProjects();
  const [selectedState, setSelectedState] = useState<string>('Gujarat');

  // Aggregate project statistics by state
  const stateStats = useMemo(() => {
    const map = new Map<string, {
      state: string;
      projects: typeof projects;
      totalCost: number;
      avgProgress: number;
      highRiskCount: number;
      medRiskCount: number;
      lowRiskCount: number;
      highestRiskCategory: 'Low' | 'Medium' | 'High';
    }>();

    projects.forEach(p => {
      const cur = map.get(p.state) || {
        state: p.state,
        projects: [],
        totalCost: 0,
        avgProgress: 0,
        highRiskCount: 0,
        medRiskCount: 0,
        lowRiskCount: 0,
        highestRiskCategory: 'Low',
      };

      cur.projects.push(p);
      cur.totalCost += p.revisedCost;

      const risk = analyzeProjectRisk(p, weights, thresholds);
      if (risk.category === 'High') {
        cur.highRiskCount++;
        cur.highestRiskCategory = 'High';
      } else if (risk.category === 'Medium') {
        cur.medRiskCount++;
        if (cur.highestRiskCategory !== 'High') cur.highestRiskCategory = 'Medium';
      } else {
        cur.lowRiskCount++;
      }

      map.set(p.state, cur);
    });

    // Compute average progress
    map.forEach(data => {
      const valid = data.projects.filter(p => p.physicalProgress !== null);
      data.avgProgress = valid.length > 0
        ? Math.round(valid.reduce((a, b) => a + (b.physicalProgress ?? 0), 0) / valid.length)
        : 0;
    });

    return Array.from(map.values()).sort((a, b) => b.projects.length - a.projects.length);
  }, [projects, weights, thresholds]);

  const currentStateData = stateStats.find(s => s.state === selectedState) || stateStats[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            India State & Regional Project Map
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Geographical distribution of Central Sector infrastructure projects mapped at official state level.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> High Risk State
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ml-2" /> Medium Risk
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 ml-2" /> Low Risk
        </div>
      </div>

      {/* Main Two-Column Layout: State Grid + State Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive State Map & Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Select State / Multi-State Corridor</h3>
                <p className="text-xs text-slate-500">Click a state below to view its projects and risk posture</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                {stateStats.length} Jurisdictions
              </span>
            </div>

            {/* Grid of State Selection Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {stateStats.map((stat) => {
                const isSelected = stat.state === selectedState;
                let ringColor = 'border-slate-200 hover:border-slate-300';
                let dotColor = 'bg-emerald-500';

                if (stat.highestRiskCategory === 'High') {
                  dotColor = 'bg-rose-600';
                } else if (stat.highestRiskCategory === 'Medium') {
                  dotColor = 'bg-amber-500';
                }

                if (isSelected) {
                  ringColor = 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/40';
                }

                return (
                  <button
                    key={stat.state}
                    onClick={() => setSelectedState(stat.state)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${ringColor} bg-white shadow-2xs`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {stat.state}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between text-[11px] text-slate-500">
                      <span>{stat.projects.length} {stat.projects.length === 1 ? 'Project' : 'Projects'}</span>
                      <span className="font-mono font-semibold text-slate-700">{stat.avgProgress}% avg</span>
                    </div>
                    <div className="mt-1 text-[10px] text-slate-400 font-mono">
                      ₹{Math.round(stat.totalCost).toLocaleString('en-IN')} Cr
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mandatory Map Methodology Disclaimer */}
            <div className="mt-5 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 leading-relaxed">
              <span className="font-semibold text-slate-700">Data Integrity Notice: </span>
              PAIMANA Flash Reports supply state-level jurisdiction without GPS lat/long coordinates. Projects are aggregated strictly by reported State/Region to eliminate fabrication of unverified geographic coordinates.
            </div>
          </div>
        </div>

        {/* Right Column: Selected State Focus View (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {currentStateData && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              {/* Header of State Focus */}
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-slate-900">{currentStateData.state}</h3>
                  </div>
                  <RiskBadge category={currentStateData.highestRiskCategory} size="sm" />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {currentStateData.projects.length} central projects • ₹{Math.round(currentStateData.totalCost).toLocaleString('en-IN')} Cr cumulative revised cost
                </p>
              </div>

              {/* State Summary Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-medium">Projects</p>
                  <p className="text-base font-bold text-slate-800 mt-0.5">{currentStateData.projects.length}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-medium">Avg Progress</p>
                  <p className="text-base font-bold text-blue-700 mt-0.5">{currentStateData.avgProgress}%</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-medium">High Risk</p>
                  <p className="text-base font-bold text-rose-600 mt-0.5">{currentStateData.highRiskCount}</p>
                </div>
              </div>

              {/* Projects in State List */}
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Projects in {currentStateData.state}
                </span>

                {currentStateData.projects.map(project => {
                  const risk = analyzeProjectRisk(project, weights, thresholds);
                  return (
                    <div
                      key={project.projectCode}
                      className="p-3 bg-slate-50/70 hover:bg-blue-50/50 rounded-xl border border-slate-200 transition-colors space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                            {project.projectName}
                          </h4>
                          <span className="text-[10px] font-mono text-blue-700">
                            {project.agency} • {project.sector}
                          </span>
                        </div>
                        <RiskBadge category={risk.category} score={risk.overallScore} size="sm" />
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200/50 font-mono">
                        <span>Cost: ₹{project.revisedCost.toLocaleString('en-IN')} Cr</span>
                        <span>Progress: {project.physicalProgress !== null ? `${project.physicalProgress}%` : 'N/A'}</span>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => openProjectDetails(project)}
                          className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                        >
                          <span>View Details</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
