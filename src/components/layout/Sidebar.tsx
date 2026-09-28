import React from 'react';
import { useProjects } from '../../context/ProjectContext';
import {
  LayoutDashboard,
  FolderKanban,
  Activity,
  AlertTriangle,
  MapPin,
  FileSpreadsheet,
  Bot,
  Database,
  BookOpen,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, alerts, projects } = useProjects();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'risk-analytics', label: 'Risk Analytics', icon: Activity },
    {
      id: 'early-warnings',
      label: 'Early Warnings',
      icon: AlertTriangle,
      badge: alerts.length > 0 ? alerts.length : undefined,
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    { id: 'map', label: 'Project Map', icon: MapPin },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'assistant', label: 'AI Assistant', icon: Bot, isSpecial: true },
    { id: 'data-quality', label: 'Data Quality', icon: Database },
    { id: 'methodology', label: 'Methodology', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 hidden md:flex flex-col justify-between min-h-[calc(100vh-6rem)]">
      <div className="p-4 space-y-6">
        {/* Navigation Section */}
        <div>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Intelligence Suite
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.badgeColor || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dataset Status Box */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>PAIMANA Feed Active</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            April 2026 Snapshot: <span className="font-semibold text-slate-700">{projects.length}</span> Central Projects
          </p>
          <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>₹150+ Cr Outlay</span>
            <span>IPMD / MoSPI</span>
          </div>
        </div>
      </div>

      {/* PAIMANA vs InfraIntel Differentiator Callout */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700 block mb-0.5">Role Distinction:</span>
          <span>PAIMANA records project state; InfraIntel evaluates risk signals & decision triggers.</span>
        </div>
      </div>
    </aside>
  );
};
