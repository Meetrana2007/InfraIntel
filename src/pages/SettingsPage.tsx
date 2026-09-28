import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { DEFAULT_WEIGHTS } from '../utils/riskEngine';
import type { RiskWeights } from '../types/paimana';
import {
  Sliders,
  RotateCcw,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    weights,
    setWeights,
    thresholds,
    setThresholds,
    resetWeightsAndThresholds,
    resetToDefaultDataset,
    loadCustomProjects,
    projects,
  } = useProjects();

  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Calculate current sum of weights
  const totalWeight = weights.costWeight + weights.scheduleWeight + weights.progressWeight + weights.dataQualityWeight;

  const handleWeightChange = (key: keyof RiskWeights, value: number) => {
    setWeights(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyPreset = (preset: 'balanced' | 'cost' | 'schedule' | 'data') => {
    switch (preset) {
      case 'balanced':
        setWeights(DEFAULT_WEIGHTS);
        break;
      case 'cost':
        setWeights({ costWeight: 50, scheduleWeight: 25, progressWeight: 15, dataQualityWeight: 10 });
        break;
      case 'schedule':
        setWeights({ costWeight: 20, scheduleWeight: 50, progressWeight: 20, dataQualityWeight: 10 });
        break;
      case 'data':
        setWeights({ costWeight: 25, scheduleWeight: 25, progressWeight: 25, dataQualityWeight: 25 });
        break;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].projectCode) {
          loadCustomProjects(parsed);
          setImportStatus(`Successfully ingested ${parsed.length} projects from ${file.name}`);
        } else {
          setImportStatus('Invalid schema: Uploaded JSON must be an array of projects matching PAIMANA schema.');
        }
      } catch {
        setImportStatus('Error reading file: Ensure the uploaded file is valid JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              System Parameters & Configuration
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Customize risk indicator weights, categorical thresholds, and dataset feeds.
          </p>
        </div>

        <button
          onClick={resetWeightsAndThresholds}
          className="flex items-center gap-1.5 px-3 py-2 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore Prototype Defaults</span>
        </button>
      </div>

      {/* Section 1: Presets */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Indicator Weighting Presets</h3>
        <p className="text-xs text-slate-500">Quickly apply calibrated risk scoring priorities</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => applyPreset('balanced')}
            className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-colors cursor-pointer"
          >
            <span className="text-xs font-bold text-slate-900 block">Balanced (Default)</span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">30% Cost, 30% Sched, 30% Prog, 10% DQ</span>
          </button>
          <button
            onClick={() => applyPreset('cost')}
            className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-colors cursor-pointer"
          >
            <span className="text-xs font-bold text-slate-900 block">Cost-Sensitive</span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">50% Cost Escalation Focus</span>
          </button>
          <button
            onClick={() => applyPreset('schedule')}
            className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-colors cursor-pointer"
          >
            <span className="text-xs font-bold text-slate-900 block">Schedule-Critical</span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">50% Timeline Delay Focus</span>
          </button>
          <button
            onClick={() => applyPreset('data')}
            className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-colors cursor-pointer"
          >
            <span className="text-xs font-bold text-slate-900 block">High Governance</span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">25% Even Weight Across All</span>
          </button>
        </div>
      </div>

      {/* Section 2: Custom Sliders for Weights */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Custom Risk Indicator Weights</h3>
            <p className="text-xs text-slate-500">Fine-tune individual indicator contributions (Must sum to 100%)</p>
          </div>
          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
            totalWeight === 100
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            Sum: {totalWeight}%
          </span>
        </div>

        <div className="space-y-4">
          {/* Cost Weight */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
              <span>Observed Cost Change Weight</span>
              <span className="font-mono font-bold text-blue-700">{weights.costWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              step="5"
              value={weights.costWeight}
              onChange={(e) => handleWeightChange('costWeight', Number(e.target.value))}
              className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Schedule Weight */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
              <span>Schedule Shift Weight</span>
              <span className="font-mono font-bold text-blue-700">{weights.scheduleWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              step="5"
              value={weights.scheduleWeight}
              onChange={(e) => handleWeightChange('scheduleWeight', Number(e.target.value))}
              className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Progress Weight */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
              <span>Physical Progress Weight</span>
              <span className="font-mono font-bold text-blue-700">{weights.progressWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              step="5"
              value={weights.progressWeight}
              onChange={(e) => handleWeightChange('progressWeight', Number(e.target.value))}
              className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Data Quality Weight */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
              <span>Data Quality & Completeness Penalty Weight</span>
              <span className="font-mono font-bold text-blue-700">{weights.dataQualityWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={weights.dataQualityWeight}
              onChange={(e) => handleWeightChange('dataQualityWeight', Number(e.target.value))}
              className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Risk Threshold Cutoffs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">Categorical Risk Thresholds</h3>
          <p className="text-xs text-slate-500">Define score cutoffs for Low, Medium, and High risk bands</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Low Risk Maximum Bound (Current: {thresholds.lowMax})
            </label>
            <input
              type="number"
              min="20"
              max="50"
              value={thresholds.lowMax}
              onChange={(e) => setThresholds(prev => ({ ...prev, lowMax: Number(e.target.value) }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold"
            />
            <p className="text-[10px] text-slate-400 mt-1">Scores 0 to {thresholds.lowMax} are categorized as Low Risk (Green)</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Medium Risk Maximum Bound (Current: {thresholds.mediumMax})
            </label>
            <input
              type="number"
              min="51"
              max="85"
              value={thresholds.mediumMax}
              onChange={(e) => setThresholds(prev => ({ ...prev, mediumMax: Number(e.target.value) }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold"
            />
            <p className="text-[10px] text-slate-400 mt-1">Scores {thresholds.lowMax + 1} to {thresholds.mediumMax} are Medium (Orange); &gt; {thresholds.mediumMax} are High (Red)</p>
          </div>
        </div>
      </div>

      {/* Section 4: Dataset Administration & Custom JSON Upload */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">PAIMANA Dataset Administration</h3>
            <p className="text-xs text-slate-500">Currently active: {projects.length} Central Sector projects</p>
          </div>

          <button
            onClick={resetToDefaultDataset}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Reset to Default April 2026 Feed
          </button>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Ingest Custom PAIMANA Report Dataset (JSON)
          </label>
          <p className="text-[11px] text-slate-500">
            Judges or evaluators may upload alternative PAIMANA snapshot JSON files conforming to the official report schema.
          </p>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          {importStatus && (
            <p className="text-xs font-medium text-blue-700 mt-2">{importStatus}</p>
          )}
        </div>
      </div>
    </div>
  );
};
