import React from 'react';

interface ProgressRingProps {
  percentage: number; // 0 to 100
  size?: number;       // diameter in pixels
  strokeWidth?: number;
  colorClass?: string;  // color class for stroke (e.g. stroke-blue-500)
  icon?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 120,
  strokeWidth = 10,
  colorClass = 'stroke-blue-500',
  icon
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Make sure percentage is bound between 0 and 100
  const cleanPercentage = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (cleanPercentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        {/* Track circle */}
        <circle
          className="stroke-slate-800"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className={`transition-all duration-700 ease-out ${colorClass}`}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Center Label / Icon */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        {icon ? (
          icon
        ) : (
          <span className="text-xl font-bold font-sans text-slate-100">
            {Math.round(cleanPercentage)}%
          </span>
        )}
      </div>
    </div>
  );
};
