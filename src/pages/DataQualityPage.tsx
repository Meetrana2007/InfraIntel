import React, { useMemo } from 'react';
import { useProjects } from '../context/ProjectContext';
import { auditDataQuality } from '../utils/dataQuality';
import { ProgressBar } from '../components/common/ProgressBar';
import { Database, Info, ExternalLink, ShieldCheck } from 'lucide-react';

export const DataQualityPage: React.FC = () => {
  const { projects, openProjectDetails } = useProjects();

  const audit = useMemo(() => {
    return auditDataQuality(projects);
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Data Quality & Completeness Audit
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Systematic inspection of reporting completeness across official PAIMANA flash report records.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Fidelity Standard: No Value Fabrication</span>
        </div>
      </div>

      {/* Top Banner: Global Data Completeness */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Overall PAIMANA Dataset Completeness
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl font-extrabold text-slate-900 font-mono">
                {audit.overallCompletenessPct}%
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                High Baseline Integrity
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Audited across 14 statutory fields for all {audit.totalProjects} projects in the April 2026 report.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <ProgressBar
              value={audit.overallCompletenessPct}
              label="System Average"
              color="emerald"
              height="lg"
            />
          </div>
        </div>

        {/* Informative Note on Reporting Snapshot Limitations */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-slate-800">Why are certain fields missing? </span>
            In official MoSPI Flash Reports, missing fields are authentic reflections of administrative status. For example, newer projects lack legacy OCMS codes; projects on track do not have revised completion dates; and certain projects may have pending quarterly physical measurement certification. InfraGuard AI respects these gaps as 'N/A' rather than synthesizing false numbers.
          </div>
        </div>
      </div>

      {/* Field-by-Field Completeness Audit Grid */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">Field-by-Field Reporting Health</h3>
          <p className="text-xs text-slate-500">Completeness rate for individual metadata and financial parameters</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {audit.fieldStats.map(stat => (
            <div
              key={stat.fieldName}
              className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200/80 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 truncate">{stat.fieldName}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                    stat.criticality === 'High'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {stat.criticality} Priority
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{stat.description}</p>
                <div className="mt-2 w-full">
                  <ProgressBar
                    value={stat.completenessPct}
                    showPercent={false}
                    color={stat.completenessPct >= 90 ? 'emerald' : stat.completenessPct >= 60 ? 'blue' : 'amber'}
                    height="sm"
                  />
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-base font-bold font-mono text-slate-900 block">
                  {stat.completenessPct}%
                </span>
                <span className="text-[10px] text-slate-400">
                  {stat.availableCount}/{audit.totalProjects} Present
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects with Missing Data Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Projects with Missing Critical Attributes</h3>
            <p className="text-xs text-slate-500">
              {audit.projectsWithMissingFields.length} projects have one or more unpopulated fields in the official flash report
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
            Needs Agency Update
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200">
                <th className="p-3">Project Title</th>
                <th className="p-3">Agency</th>
                <th className="p-3">State</th>
                <th className="p-3 text-center">Completeness</th>
                <th className="p-3">Specific Missing Fields</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {audit.projectsWithMissingFields.map(({ project, missing, completenessPct }) => (
                <tr key={project.projectCode} className="hover:bg-slate-50">
                  <td className="p-3 max-w-sm">
                    <div className="font-semibold text-slate-900 truncate">{project.projectName}</div>
                    <div className="text-[11px] font-mono text-blue-700">{project.projectCode}</div>
                  </td>
                  <td className="p-3 font-semibold text-slate-800">{project.agency}</td>
                  <td className="p-3 text-slate-600">{project.state}</td>
                  <td className="p-3 text-center font-mono font-bold text-slate-800">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {completenessPct}%
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {missing.map((field, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => openProjectDetails(project)}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-[11px] cursor-pointer"
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
