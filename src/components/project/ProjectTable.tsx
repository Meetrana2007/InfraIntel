import React, { useState, useMemo } from 'react';
import type { Project } from '../../types/paimana';
import { useProjects } from '../../context/ProjectContext';
import { analyzeProjectRisk } from '../../utils/riskEngine';
import { RiskBadge } from '../common/RiskBadge';
import { exportProjectsToCSV } from '../../utils/exportUtils';
import {
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface ProjectTableProps {
  projects: Project[];
}

type SortField =
  | 'serialNo'
  | 'projectName'
  | 'agency'
  | 'state'
  | 'originalCost'
  | 'revisedCost'
  | 'cumulativeExpenditure'
  | 'physicalProgress'
  | 'riskScore';

export const ProjectTable: React.FC<ProjectTableProps> = ({ projects }) => {
  const { openProjectDetails, weights, thresholds } = useProjects();

  const [sortField, setSortField] = useState<SortField>('serialNo');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      let valA: any = a[sortField as keyof Project];
      let valB: any = b[sortField as keyof Project];

      if (sortField === 'riskScore') {
        valA = analyzeProjectRisk(a, weights, thresholds).overallScore;
        valB = analyzeProjectRisk(b, weights, thresholds).overallScore;
      } else if (sortField === 'physicalProgress') {
        valA = a.physicalProgress ?? -1;
        valB = b.physicalProgress ?? -1;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [projects, sortField, sortAsc, weights, thresholds]);

  const totalPages = Math.ceil(sortedProjects.length / pageSize) || 1;
  const paginatedProjects = sortedProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Table Top Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Official PAIMANA Monitored Projects Directory</h3>
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">{projects.length}</span> projects from April 2026 report
          </p>
        </div>

        <button
          onClick={() => exportProjectsToCSV(projects, 'paimana_central_projects_april_2026.csv')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          <span>Export Table (CSV)</span>
        </button>
      </div>

      {/* Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200 tracking-wider">
              <th className="p-3 w-12 text-center">#</th>
              <th
                onClick={() => handleSort('projectName')}
                className="p-3 cursor-pointer hover:bg-slate-200/60 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Project Name & Code</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('agency')}
                className="p-3 cursor-pointer hover:bg-slate-200/60 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Agency</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('state')}
                className="p-3 cursor-pointer hover:bg-slate-200/60 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>State</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="p-3">Sector</th>
              <th
                onClick={() => handleSort('originalCost')}
                className="p-3 text-right cursor-pointer hover:bg-slate-200/60 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Orig Cost</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('revisedCost')}
                className="p-3 text-right cursor-pointer hover:bg-slate-200/60 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Rev Cost</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('cumulativeExpenditure')}
                className="p-3 text-right cursor-pointer hover:bg-slate-200/60 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Expenditure</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('physicalProgress')}
                className="p-3 text-center cursor-pointer hover:bg-slate-200/60 transition-colors"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Progress</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="p-3 text-center">Completion (Orig / Rev)</th>
              <th
                onClick={() => handleSort('riskScore')}
                className="p-3 text-center cursor-pointer hover:bg-slate-200/60 transition-colors"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Risk Level</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 text-slate-700">
            {paginatedProjects.length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center py-10 text-slate-400 italic">
                  No projects match the selected filters.
                </td>
              </tr>
            ) : (
              paginatedProjects.map((p) => {
                const risk = analyzeProjectRisk(p, weights, thresholds);
                return (
                  <tr
                    key={p.projectCode}
                    className="hover:bg-blue-50/40 transition-colors"
                  >
                    <td className="p-3 text-center font-mono text-slate-400 font-medium">
                      {p.serialNo}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900 line-clamp-1 max-w-xs">
                        {p.projectName}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-mono">
                        <span className="text-blue-700 font-semibold">{p.projectCode}</span>
                        {p.pmgid && <span className="opacity-75">• PMG: {p.pmgid}</span>}
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">
                      {p.agency}
                    </td>
                    <td className="p-3 whitespace-nowrap text-slate-600">
                      {p.state}
                    </td>
                    <td className="p-3 whitespace-nowrap text-slate-600">
                      <span className="truncate max-w-[110px] block" title={p.sector}>
                        {p.sector}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-600">
                      ₹{p.originalCost.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      ₹{p.revisedCost.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-600">
                      ₹{p.cumulativeExpenditure.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-center">
                      {p.physicalProgress !== null ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="font-mono font-bold text-slate-900">
                            {p.physicalProgress}%
                          </span>
                          <span className={`text-[9px] uppercase font-bold tracking-wider ${
                            p.physicalProgress < 25 ? 'text-amber-600' : p.physicalProgress < 75 ? 'text-blue-600' : 'text-emerald-600'
                          }`}>
                            {p.physicalProgress < 25 ? 'Low' : p.physicalProgress < 75 ? 'Mod' : 'High'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">N/A</span>
                      )}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap text-[11px]">
                      <div className="font-mono text-slate-500">{p.originalCompletionDate}</div>
                      <div className={`font-mono font-bold ${p.revisedCompletionDate ? 'text-amber-700' : 'text-slate-400'}`}>
                        {p.revisedCompletionDate || 'Unrevised'}
                      </div>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <RiskBadge category={risk.category} score={risk.overallScore} size="sm" />
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => openProjectDetails(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] rounded border border-blue-200 transition-colors cursor-pointer"
                        title="View Full Details"
                      >
                        <span>Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing {(currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, sortedProjects.length)} of {sortedProjects.length} entries
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2.5 py-1 font-mono text-xs font-semibold text-slate-700">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
