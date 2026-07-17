import React from 'react';
import { Card } from './Card';

interface StatisticsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: number | string;
    isPositive: boolean;
  };
  gradient?: string;
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  icon,
  description,
  trend
}) => {
  return (
    <Card variant="interactive" className="relative overflow-hidden group">
      <div className="relative flex justify-between items-start">
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-zinc-500 tracking-wider uppercase">{title}</p>
          <h3 className="text-xl font-semibold text-zinc-100 tracking-tight">{value}</h3>
          
          {(description || trend) && (
            <div className="flex items-center space-x-2 text-[11px]">
              {trend && (
                <span className={`font-bold ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {trend.value}
                </span>
              )}
              {description && <span className="text-zinc-500">{description}</span>}
            </div>
          )}
        </div>
        
        {icon && (
          <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 text-zinc-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
