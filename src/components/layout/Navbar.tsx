import React from 'react';
import { useProjects } from '../../context/ProjectContext';
import { ShieldAlert, Bell, Search, RefreshCw, Bot, HelpCircle } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { filters, setFilters, resetFilters, alerts, setActiveTab, activeTab } = useProjects();

  const highSeverityAlertsCount = alerts.filter(a => a.severity === 'High').length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Official Required Prototype Notice Banner */}
      <div className="bg-blue-900 text-white text-[11px] font-medium tracking-wider uppercase py-1 px-4 text-center flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>DEMO PROTOTYPE — PAIMANA APRIL 2026 REPORT DATA</span>
        <span className="text-blue-300">|</span>
        <span className="text-blue-200">MoSPI Central Sector Infrastructure Monitoring</span>
        <span className="hidden md:inline text-blue-300">|</span>
        <span className="hidden md:inline bg-blue-800 text-blue-200 px-1.5 py-0.5 rounded text-[10px] font-mono">
          SIH26103
        </span>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-sm shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900">InfraGuard AI</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                v1.0 Demo
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block truncate max-w-md">
              AI-Powered Predictive Infrastructure Project Monitoring & Early Warning System
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md mx-2 hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects, agencies, codes (e.g. NHAI, Gujarat, DFCCIL)..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-9 pr-8 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* AI Assistant Quick Trigger */}
          <button
            onClick={() => setActiveTab('assistant')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              activeTab === 'assistant'
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Ask AI Intelligence Assistant"
          >
            <Bot className="w-4 h-4 text-blue-600" />
            <span className="hidden lg:inline">AI Assistant</span>
          </button>

          {/* Early Warning Alert Notification Pill */}
          <button
            onClick={() => setActiveTab('early-warnings')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              activeTab === 'early-warnings'
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title={`${alerts.length} Early Warning Signals Detected`}
          >
            <Bell className="w-4 h-4 text-rose-500" />
            <span className="hidden sm:inline">Warnings</span>
            {highSeverityAlertsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                {highSeverityAlertsCount}
              </span>
            )}
          </button>

          {/* Reset Filters / Reload button */}
          <button
            onClick={resetFilters}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Methodology Quick Link */}
          <button
            onClick={() => setActiveTab('methodology')}
            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="View Methodology & Limitations"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
