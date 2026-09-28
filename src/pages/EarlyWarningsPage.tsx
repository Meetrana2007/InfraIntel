import React, { useState, useMemo } from 'react';
import { useProjects } from '../context/ProjectContext';
import type { AlertType } from '../types/paimana';
import {
  Clock,
  TrendingUp,
  Percent,
  Split,
  FileQuestion,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export const EarlyWarningsPage: React.FC = () => {
  const { alerts, projects, openProjectDetails } = useProjects();

  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (selectedType !== 'All' && alert.alertType !== selectedType) return false;
      if (selectedSeverity !== 'All' && alert.severity !== selectedSeverity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          alert.projectName.toLowerCase().includes(q) ||
          alert.projectCode.toLowerCase().includes(q) ||
          alert.agency.toLowerCase().includes(q) ||
          alert.detectedSignal.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [alerts, selectedType, selectedSeverity, searchQuery]);

  const alertIcons: Record<AlertType, React.ReactNode> = {
    'Schedule Revision Detected': <Clock className="w-5 h-5 text-amber-600" />,
    'Significant Cost Change': <TrendingUp className="w-5 h-5 text-rose-600" />,
    'Low Physical Progress': <Percent className="w-5 h-5 text-amber-600" />,
    'High Expenditure-to-Progress Gap': <Split className="w-5 h-5 text-purple-600" />,
    'Missing Critical Data': <FileQuestion className="w-5 h-5 text-blue-600" />,
  };

  const highCount = alerts.filter(a => a.severity === 'High').length;
  const medCount = alerts.filter(a => a.severity === 'Medium').length;
  const lowCount = alerts.filter(a => a.severity === 'Low').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Early Warning & Attention Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated signal triggers detecting schedule slippages, cost escalation, expenditure-progress gaps, and data gaps.
          </p>
        </div>

        {/* Severity Summary Tally */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
            {highCount} High Attention
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
            {medCount} Medium
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
            {lowCount} Low
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Search */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Search Alerts</label>
            <input
              type="text"
              placeholder="Search by project name, agency, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Alert Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Signal Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All 5 Signal Types</option>
              <option value="Schedule Revision Detected">Warning 1: Schedule Revision Detected</option>
              <option value="Significant Cost Change">Warning 2: Significant Cost Change</option>
              <option value="Low Physical Progress">Warning 3: Low Physical Progress</option>
              <option value="High Expenditure-to-Progress Gap">Warning 4: High Expenditure-to-Progress Gap</option>
              <option value="Missing Critical Data">Warning 5: Missing Critical Data</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Severity Level</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Severities</option>
              <option value="High">High Severity</option>
              <option value="Medium">Medium Severity</option>
              <option value="Low">Low Severity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alert Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAlerts.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400">
            No early warnings match the selected criteria.
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const project = projects.find(p => p.projectCode === alert.projectCode);

            const severityBadge = {
              High: 'bg-rose-50 text-rose-700 border-rose-200',
              Medium: 'bg-amber-50 text-amber-700 border-amber-200',
              Low: 'bg-slate-100 text-slate-700 border-slate-200',
            }[alert.severity];

            return (
              <div
                key={alert.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-3 flex flex-col justify-between"
              >
                <div>
                  {/* Top Header of Card */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                        {alertIcons[alert.alertType]}
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                          EARLY WARNING SIGNAL
                        </span>
                        <h3 className="text-xs font-bold text-slate-900 leading-tight">
                          {alert.alertType}
                        </h3>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider shrink-0 ${severityBadge}`}>
                      {alert.severity}
                    </span>
                  </div>

                  {/* Project Details */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] font-medium text-slate-400 uppercase">Project:</span>
                      <p className="font-bold text-slate-900 mt-0.5 leading-snug">
                        {alert.projectName}
                      </p>
                      <p className="text-[11px] text-blue-700 font-mono">
                        {alert.agency} • {alert.projectCode} • {alert.state}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-700">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                        Detected Signal:
                      </span>
                      <p className="leading-relaxed">{alert.detectedSignal}</p>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Source Field: <strong className="text-slate-700">{alert.sourceField}</strong></span>
                      <span className="font-mono text-slate-400">{alert.timestamp}</span>
                    </div>

                    <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-100 text-slate-700">
                      <span className="text-[10px] font-bold text-blue-900 uppercase block mb-0.5">
                        Recommended Attention:
                      </span>
                      <p className="leading-relaxed text-[11px]">{alert.recommendedAttention}</p>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                {project && (
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => openProjectDetails(project)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      <span>Investigate Project</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
