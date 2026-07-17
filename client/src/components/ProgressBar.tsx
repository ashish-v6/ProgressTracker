import React from 'react';

interface ProgressBarProps {
  percentage: number;
  height?: 'xs' | 'sm' | 'md' | 'lg';
  colorClass?: string; // e.g., 'bg-blue-500'
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  height = 'sm',
  colorClass = 'bg-blue-500',
  showLabel = false
}) => {
  const cleanPercentage = Math.min(100, Math.max(0, percentage));

  const heights = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3.5',
    lg: 'h-5',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-slate-400">Progress</span>
          <span className="text-xs font-bold text-slate-200">{Math.round(cleanPercentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-800 rounded-full overflow-hidden ${heights[height]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${cleanPercentage}%` }}
        />
      </div>
    </div>
  );
};
