import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

// Minimalist, high contrast color palette matching the SaaS Vercel/Linear style
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6366F1'];
const GRID_COLOR = 'rgba(255, 255, 255, 0.04)';
const TOOLTIP_STYLE = {
  backgroundColor: '#09090B',
  border: '1px solid #27272A',
  borderRadius: '8px',
  color: '#F4F4F5',
  fontSize: '11px'
};

// 1. Weekly Hours Bar Chart
interface WeeklyHoursChartProps {
  data: { date: string; hours: number }[];
}

export const WeeklyHoursChart: React.FC<WeeklyHoursChartProps> = ({ data }) => {
  const chartData = data.map(d => {
    const dateObj = new Date(d.date);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    return { name: dayName, Hours: d.hours };
  });

  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="name" stroke="#71717A" fontSize={10} tickLine={false} />
          <YAxis stroke="#71717A" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.01)' }} />
          <Bar dataKey="Hours" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 2. Monthly Progress Line Chart
interface MonthlyProgressChartProps {
  data: { month: string; rate: number }[];
}

export const MonthlyProgressChart: React.FC<MonthlyProgressChartProps> = ({ data }) => {
  const chartData = data.map(d => ({ name: d.month, 'Completion %': d.rate }));

  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis dataKey="name" stroke="#71717A" fontSize={10} tickLine={false} />
          <YAxis stroke="#71717A" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Line
            type="monotone"
            dataKey="Completion %"
            stroke="#3B82F6"
            strokeWidth={2}
            activeDot={{ r: 4 }}
            dot={{ stroke: '#3B82F6', strokeWidth: 1.5, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// 3. Category Pie Chart
interface CategoryPieChartProps {
  data: { category: string; hours: number }[];
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const chartData = data.map(d => ({ name: d.category, value: d.hours }));

  return (
    <div className="h-60 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={75}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value} hrs`, 'Study Time']} />
          <Legend
            verticalAlign="bottom"
            height={32}
            iconType="circle"
            iconSize={6}
            formatter={(value) => <span className="text-[10px] text-zinc-400 capitalize">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// 4. Completion Trend Area Chart
interface CompletionTrendChartProps {
  data: { date: string; completionRate: number }[];
}

export const CompletionTrendChart: React.FC<CompletionTrendChartProps> = ({ data }) => {
  const chartData = data.map(d => {
    const dateObj = new Date(d.date);
    const label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { name: label, Rate: d.completionRate };
  });

  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="name" stroke="#71717A" fontSize={9} tickLine={false} />
          <YAxis stroke="#71717A" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Area type="monotone" dataKey="Rate" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#areaColor)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// 5. Last 30 Days Activity Log
interface Last30DaysActivityProps {
  data: { date: string; count: number }[];
}

export const Last30DaysActivity: React.FC<Last30DaysActivityProps> = ({ data }) => {
  const gridData = Array.from({ length: 30 }).map((_, idx) => {
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - (29 - idx));
    const key = checkDate.toISOString().split('T')[0];
    const match = data.find(d => d.date === key);
    return {
      date: key,
      count: match ? match.count : 0
    };
  });

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-zinc-950 border border-zinc-900';
    if (count === 1) return 'bg-blue-950/40 border border-blue-900/30 text-blue-400';
    if (count === 2) return 'bg-blue-900/40 border border-blue-800/40 text-blue-300';
    return 'bg-blue-600 border border-blue-500 text-white';
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-xs text-zinc-500">
        <span>30 days ago</span>
        <span>Today</span>
      </div>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {gridData.map((d, index) => (
          <div
            key={index}
            className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-all hover:scale-105 cursor-pointer ${getHeatmapColor(d.count)}`}
            title={`${d.date}: ${d.count} tasks completed`}
          >
            {d.count > 0 ? d.count : ''}
          </div>
        ))}
      </div>
      <div className="flex gap-4 justify-end text-[10px] text-zinc-500 pt-2">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-zinc-950 border border-zinc-900 rounded"></span> None</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-950/45 border border-blue-900/30 rounded"></span> Low</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-600 rounded"></span> High</span>
      </div>
    </div>
  );
};
