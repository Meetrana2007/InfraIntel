import React from 'react';
import { useProjects } from '../context/ProjectContext';
import { FilterBar } from '../components/dashboard/FilterBar';
import { ProjectTable } from '../components/project/ProjectTable';
import { exportProjectsToCSV } from '../utils/exportUtils';
import { FolderKanban, Download, CheckCircle2, AlertTriangle } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { filteredProjects, projects } = useProjects();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Central Infrastructure Projects Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official IPMD / MoSPI PAIMANA Flash Report (April 2026) — Projects costing ₹150 Crore and above.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportProjectsToCSV(filteredProjects, 'paimana_projects_filtered.csv')}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Filtered CSV</span>
          </button>
        </div>
      </div>

      {/* Dataset Filter Bar */}
      <FilterBar />

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs text-slate-500 font-medium">Projects in View</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {filteredProjects.length}{' '}
              <span className="text-xs font-normal text-slate-400">/ {projects.length} Total</span>
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
            <FolderKanban className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs text-slate-500 font-medium">Combined Revised Budget</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              ₹{Math.round(filteredProjects.reduce((a, b) => a + b.revisedCost, 0)).toLocaleString('en-IN')} Cr
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs text-slate-500 font-medium">Average Physical Progress</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {filteredProjects.length > 0
                ? (
                    filteredProjects
                      .map(p => p.physicalProgress)
                      .filter((v): v is number => v !== null)
                      .reduce((a, b) => a + b, 0) /
                    Math.max(
                      1,
                      filteredProjects.filter(p => p.physicalProgress !== null).length
                    )
                  ).toFixed(1)
                : 0}
              %
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <ProjectTable projects={filteredProjects} />
    </div>
  );
};
