import React from 'react';

interface ProgressBarProps {
  value: number | null;
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'auto';
  height?: 'sm' | 'md' | 'lg';
  subLabel?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercent = true,
  color = 'auto',
  height = 'md',
  subLabel,
}) => {
  if (value === null || value === undefined) {
    return (
      <div className="w-full">
        {label && (
          <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
            <span>{label}</span>
            <span className="font-mono text-slate-400">N/A</span>
          </div>
        )}
        <div className="w-full bg-slate-100 rounded-full h-2 flex items-center justify-center">
          <span className="text-[10px] text-slate-400 font-mono italic">Not Reported</span>
        </div>
      </div>
    );
  }

  const clamped = Math.min(max, Math.max(0, value));
  const pct = Math.round((clamped / max) * 100);

  let barBg = 'bg-blue-600';
  if (color === 'auto') {
    if (pct < 30) barBg = 'bg-amber-500';
    else if (pct < 70) barBg = 'bg-blue-600';
    else barBg = 'bg-emerald-600';
  } else {
    const colorMap = {
      blue: 'bg-blue-600',
      emerald: 'bg-emerald-600',
      amber: 'bg-amber-500',
      rose: 'bg-rose-600',
    };
    barBg = colorMap[color];
  }

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }[height];

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-xs mb-1">
          {label && <span className="font-medium text-slate-700">{label}</span>}
          {showPercent && (
            <span className="font-mono font-semibold text-slate-800 ml-auto">
              {pct}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${barBg} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {subLabel && (
        <p className="text-[11px] text-slate-500 mt-1">{subLabel}</p>
      )}
    </div>
  );
};
