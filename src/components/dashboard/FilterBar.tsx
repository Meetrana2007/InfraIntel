import React from 'react';
import { useProjects } from '../../context/ProjectContext';
import { Filter, RotateCcw } from 'lucide-react';

export const FilterBar: React.FC = () => {
  const { projects, filters, setFilters, resetFilters } = useProjects();

  const states = ['All', ...Array.from(new Set(projects.map(p => p.state))).sort()];
  const ministries = ['All', ...Array.from(new Set(projects.map(p => p.ministry))).sort()];
  const sectors = ['All', ...Array.from(new Set(projects.map(p => p.sector))).sort()];
  const agencies = ['All', ...Array.from(new Set(projects.map(p => p.agency))).sort()];

  const isFiltered = (
    filters.state !== 'All' ||
    filters.ministry !== 'All' ||
    filters.sector !== 'All' ||
    filters.agency !== 'All' ||
    filters.riskCategory !== 'All' ||
    filters.minProgress > 0 ||
    filters.maxProgress < 100 ||
    filters.searchQuery !== ''
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Dataset Dynamic Filters
          </span>
        </div>
        {isFiltered && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
        {/* State Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">State / Region</label>
          <select
            value={filters.state}
            onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            {states.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Ministry Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ministry</label>
          <select
            value={filters.ministry}
            onChange={(e) => setFilters(prev => ({ ...prev, ministry: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 truncate"
          >
            {ministries.map(m => (
              <option key={m} value={m}>
                {m.replace('Ministry of ', 'Mo ')}
              </option>
            ))}
          </select>
        </div>

        {/* Sector Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Sector</label>
          <select
            value={filters.sector}
            onChange={(e) => setFilters(prev => ({ ...prev, sector: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            {sectors.map(sec => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
        </div>

        {/* Implementing Agency Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Agency</label>
          <select
            value={filters.agency}
            onChange={(e) => setFilters(prev => ({ ...prev, agency: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            {agencies.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* Risk Category Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Prototype Risk</label>
          <select
            value={filters.riskCategory}
            onChange={(e) => setFilters(prev => ({ ...prev, riskCategory: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="All">All Categories</option>
            <option value="High">High Risk (70-100)</option>
            <option value="Medium">Medium Risk (40-69)</option>
            <option value="Low">Low Risk (0-39)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
