import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left sm:flex sm:justify-between sm:items-center text-xs text-slate-500 gap-4">
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-2 font-semibold text-slate-700 mb-1">
            <span>InfraGuard AI</span>
            <span>•</span>
            <span className="text-blue-700">Smart India Hackathon 2026 (Problem SIH26103)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            "From Project Monitoring to Proactive Risk Intelligence" — Analytical prototype for IPMD / MoSPI PAIMANA Flash Report data.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 text-center sm:text-right">
          <span className="inline-block px-2.5 py-1 bg-slate-100 border border-slate-200 rounded font-mono text-[11px] text-slate-600">
            DEMO PROTOTYPE — PAIMANA APRIL 2026 REPORT DATA
          </span>
          <p className="text-[10px] text-slate-400 mt-1">
            Deterministic Rule-Based Assessment Engine. Not an official government endorsement.
          </p>
        </div>
      </div>
    </footer>
  );
};
