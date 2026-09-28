import React from 'react';
import {
  BookOpen,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            System Methodology, Architecture & Scientific Integrity
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Smart India Hackathon 2026 (Problem Statement SIH26103) Technical & Operational Specification.
        </p>
      </div>

      {/* Critical Explicit Disclaimer Banner (Mandatory Requirement) */}
      <div className="p-5 bg-amber-50/80 border-2 border-amber-300 rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>MANDATORY SCIENTIFIC INTEGRITY DECLARATION</span>
        </div>
        <p className="text-xs text-amber-900/90 leading-relaxed">
          "The current prototype does not claim validated predictive accuracy because the provided report is primarily a snapshot rather than a complete longitudinal training dataset."
        </p>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          InfraGuard AI utilizes a transparent, deterministic mathematical risk assessment engine built directly on the parameters reported in the April 2026 PAIMANA Flash Report. It does not fabricate training accuracy figures or represent heuristic indicators as a validated ML model without historical monthly time-series data.
        </p>
      </div>

      {/* Section 1: PAIMANA Differentiation Architecture */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
            System Position & Role Clarity
          </span>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            InfraGuard AI is an Intelligence Augmentation Layer, NOT a PAIMANA Replacement
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            PAIMANA (operated by IPMD / MoSPI) serves as the official national repository for continuous project monitoring and agency progress submissions. InfraGuard AI operates atop this data to provide automated risk signal detection, cross-project benchmarking, and decision support.
          </p>
        </div>

        {/* Visual Workflow Diagram */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-4 text-center">
            Information Flow & Value Transformation Architecture
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 items-center text-center">
            {/* Step 1 */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 block">SOURCE</span>
              <span className="text-xs font-bold text-slate-900 mt-0.5 block">PAIMANA</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Monthly Flash Data</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 mx-auto hidden sm:block" />

            {/* Step 2 */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-blue-600 block">PROCESSING</span>
              <span className="text-xs font-bold text-slate-900 mt-0.5 block">Data Layer</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Normalize & Audit</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 mx-auto hidden sm:block" />

            {/* Step 3 */}
            <div className="bg-blue-600 text-white p-3 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold text-blue-200 block">INTELLIGENCE</span>
              <span className="text-xs font-bold mt-0.5 block">InfraGuard AI</span>
              <span className="text-[10px] text-blue-100 mt-1 block">Multi-indicator Engine</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 mx-auto hidden sm:block" />

            {/* Step 4 */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-amber-600 block">EARLY WARNING</span>
              <span className="text-xs font-bold text-slate-900 mt-0.5 block">Decision Support</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Actionable Signals</span>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-3">Attribute</th>
                <th className="p-3">PAIMANA (MoSPI Official Portal)</th>
                <th className="p-3 text-blue-900 bg-blue-50/50">InfraGuard AI (Intelligence Layer)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-600">
              <tr>
                <td className="p-3 font-semibold text-slate-900">Primary Objective</td>
                <td className="p-3">Statutory project monitoring, data collection, and milestone tracking.</td>
                <td className="p-3 font-medium text-blue-950 bg-blue-50/30">
                  Risk signal extraction, early warning triggers, and executive decision support.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Analytical Depth</td>
                <td className="p-3">Descriptive reporting of current project state (costs, dates, progress).</td>
                <td className="p-3 font-medium text-blue-950 bg-blue-50/30">
                  Diagnostic risk scores, cross-project peer cohorts, and what-if scenario simulations.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Flagging Philosophy</td>
                <td className="p-3">Classifies delays based on whether target date has lapsed.</td>
                <td className="p-3 font-medium text-blue-950 bg-blue-50/30">
                  Detects compound signals (e.g. high expenditure ratio coupled with low physical progress).
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Mathematical Specification of Prototype Risk Engine */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
            Mathematical Specification
          </span>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Deterministic Indicator Formulations & Weighting
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            InfraGuard AI calculates four normalized sub-scores (0 to 100) before computing a configurable weighted composite score.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Indicator 1 */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">1. Cost Indicator (Default Weight: 30%)</span>
              <span className="font-mono text-blue-600 font-bold">I_cost</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Calculates percentage escalation between original approved cost and revised cost:
            </p>
            <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-800">
              Observed Cost Change % = ((Revised Cost - Original Cost) / Original Cost) × 100
            </div>
            <p className="text-[11px] text-slate-500">
              Graduated scale: ≤0% → 10, ≤10% → 25, ≤25% → 50, ≤50% → 75, &gt;50% → 100.
            </p>
          </div>

          {/* Indicator 2 */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">2. Schedule Indicator (Default Weight: 30%)</span>
              <span className="font-mono text-blue-600 font-bold">I_sched</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Evaluates milestone shift between original target completion and revised completion date:
            </p>
            <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-800">
              Schedule Shift (Months) = DiffMonths(Original Target, Revised Target)
            </div>
            <p className="text-[11px] text-slate-500">
              Graduated scale: 0 mos → 15, ≤12 mos → 40, ≤24 mos → 65, ≤36 mos → 85, &gt;36 mos → 98.
            </p>
          </div>

          {/* Indicator 3 */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">3. Progress Indicator (Default Weight: 30%)</span>
              <span className="font-mono text-blue-600 font-bold">I_prog</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Evaluates execution pacing based on reported civil/structural progress percentage:
            </p>
            <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-800">
              Physical Progress % as certified by nodal agency in Flash Report
            </div>
            <p className="text-[11px] text-slate-500">
              Graduated scale: ≥80% → 15, ≥60% → 35, ≥40% → 55, ≥20% → 75, &lt;20% → 90, N/A → 65.
            </p>
          </div>

          {/* Indicator 4 */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">4. Data Quality Indicator (Default Weight: 10%)</span>
              <span className="font-mono text-blue-600 font-bold">I_dq</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Assesses completeness of key statutory identifiers (PMGID, Legacy OCMS, Progress):
            </p>
            <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-800">
              Completeness % = (Populated Mandatory Fields / Total Tracked Fields) × 100
            </div>
            <p className="text-[11px] text-slate-500">
              Penalizes uncertainty: 0 missing → 10, 1 missing → 35, 2 missing → 60, ≥3 missing → 85.
            </p>
          </div>
        </div>

        {/* Composite Formula */}
        <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 text-xs space-y-2">
          <span className="font-bold text-blue-950 uppercase tracking-wide block">
            Overall Composite Risk Calculation
          </span>
          <div className="p-2 bg-white rounded border border-blue-200 font-mono text-slate-800">
            Overall Risk Score = (I_cost × W_cost + I_sched × W_sched + I_prog × W_prog + I_dq × W_dq) / (W_cost + W_sched + W_prog + W_dq)
          </div>
          <p className="text-[11px] text-slate-600">
            Risk Thresholds: <strong>0–39 = Low Risk</strong>, <strong>40–69 = Medium Risk</strong>, <strong>70–100 = High Risk</strong> (Fully customizable in Settings).
          </p>
        </div>
      </div>

      {/* Section 3: Future Machine Learning Roadmap */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
            Phase 2 Transition Roadmap
          </span>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Future Longitudinal Machine Learning Architecture
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            When 24–36 months of longitudinal monthly PAIMANA data are ingested, the system will upgrade from heuristic indicators to trained gradient boosted decision trees.
          </p>
        </div>

        {/* ML Pipeline Flow */}
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block">STAGE 1</span>
              <span className="font-bold text-slate-900 mt-1 block">Longitudinal Ingestion</span>
              <p className="text-[10px] text-slate-500 mt-1">Monthly snapshot ingestion to establish project trajectory</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block">STAGE 2</span>
              <span className="font-bold text-slate-900 mt-1 block">Feature Engineering</span>
              <p className="text-[10px] text-slate-500 mt-1">Velocity, burn rate, seasonality, contractor historical delay index</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block">STAGE 3</span>
              <span className="font-bold text-slate-900 mt-1 block">Model Training</span>
              <p className="text-[10px] text-slate-500 mt-1">XGBoost & Random Forest with time-based cross-validation</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block">STAGE 4</span>
              <span className="font-bold text-slate-900 mt-1 block">SHAP Explainability</span>
              <p className="text-[10px] text-slate-500 mt-1">Feature attributions showing exact drivers behind flags</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
