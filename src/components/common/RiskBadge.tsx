import React from 'react';
import { RiskCategory } from '../../types/paimana';

interface RiskBadgeProps {
  category: RiskCategory;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  category,
  score,
  showScore = true,
  size = 'md',
}) => {
  let colorClasses = '';
  let dotColor = '';

  switch (category) {
    case 'High':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20';
      dotColor = 'bg-rose-600';
      break;
    case 'Medium':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20';
      dotColor = 'bg-amber-500';
      break;
    case 'Low':
    default:
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20';
      dotColor = 'bg-emerald-600';
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs ${colorClasses} ${sizeClasses}`}
      title={`Risk Category: ${category}${score !== undefined ? ` (Score: ${score}/100)` : ''}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
      <span>{category} Risk</span>
      {showScore && score !== undefined && (
        <span className="opacity-80 font-mono text-[11px]">({score})</span>
      )}
    </span>
  );
};
