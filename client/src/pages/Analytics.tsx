import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader } from '../components/Card';
import { StatisticsCard } from '../components/StatisticsCard';
import { ProgressBar } from '../components/ProgressBar';
import { Badge } from '../components/Badge';
import { formatDateKey } from '../services/mockData';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import {
  FiAward,
  FiZap,
  FiTarget,
  FiAlertCircle,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi';

export const Analytics: React.FC = () => {
  const { tasks, categories } = useApp();
  const { user } = useAuth();

  const todayStr = formatDateKey(new Date());

  // 1. Calculate General Lifetime Stats
  const totalCount = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const completedCount = completedTasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  const totalActualHours = tasks.reduce((acc, t) => acc + t.actualHours + (t.actualMinutes / 60), 0);
  
  // Unique days tracked
  const uniqueDays = new Set(tasks.map(t => t.dueDate));
  const uniqueDaysCount = uniqueDays.size || 1;
  const averageHoursPerDay = totalActualHours / uniqueDaysCount;

  // 2. Calculate Missed Tasks (pending/in_progress tasks with dueDate in the past)
  const missedTasksCount = tasks.filter(t => t.status !== 'completed' && t.dueDate < todayStr).length;

  // 3. Goal Completion Days (Days meeting daily goal)
  const dailyGoal = user?.preferences.workingHourGoal || 6;
  const hoursPerDayMap: Record<string, number> = {};
  tasks.forEach(t => {
    const hours = t.actualHours + (t.actualMinutes / 60);
    hoursPerDayMap[t.dueDate] = (hoursPerDayMap[t.dueDate] || 0) + hours;
  });

  const goalMetDays = Object.keys(hoursPerDayMap).filter(date => hoursPerDayMap[date] >= dailyGoal).length;
  const goalCompletionRate = uniqueDaysCount > 0 ? Math.round((goalMetDays / uniqueDaysCount) * 100) : 0;

  // 4. Most Productive Day of the Week (average hours)
  const dayOfWeekHours: Record<number, { sum: number; count: number }> = {
    0: { sum: 0, count: 0 },
    1: { sum: 0, count: 0 },
    2: { sum: 0, count: 0 },
    3: { sum: 0, count: 0 },
    4: { sum: 0, count: 0 },
    5: { sum: 0, count: 0 },
    6: { sum: 0, count: 0 }
  };

  // Group by date to get daily sums first
  const dailyHoursMap: Record<string, { date: Date; hours: number }> = {};
  tasks.forEach(t => {
    const hours = t.actualHours + (t.actualMinutes / 60);
    if (!dailyHoursMap[t.dueDate]) {
      dailyHoursMap[t.dueDate] = { date: new Date(t.dueDate), hours: 0 };
    }
    dailyHoursMap[t.dueDate].hours += hours;
  });

  Object.values(dailyHoursMap).forEach(({ date, hours }) => {
    const day = date.getDay();
    dayOfWeekHours[day].sum += hours;
    dayOfWeekHours[day].count += 1;
  });

  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let maxAvgHours = -1;
  let mostProductiveDayIndex = 1; // Default Monday

  for (let i = 0; i < 7; i++) {
    const avg = dayOfWeekHours[i].count > 0 ? dayOfWeekHours[i].sum / dayOfWeekHours[i].count : 0;
    if (avg > maxAvgHours) {
      maxAvgHours = avg;
      mostProductiveDayIndex = i;
    }
  }
  const mostProductiveDay = weekdayNames[mostProductiveDayIndex];

  // 5. Most Productive Category (highest total hours)
  const categoryHoursMap: Record<string, number> = {};
  tasks.forEach(t => {
    const hours = t.actualHours + (t.actualMinutes / 60);
    categoryHoursMap[t.category] = (categoryHoursMap[t.category] || 0) + hours;
  });

  let maxCategoryHours = -1;
  let mostProductiveCategoryStr = 'N/A';
  
  Object.keys(categoryHoursMap).forEach(catId => {
    if (categoryHoursMap[catId] > maxCategoryHours) {
      maxCategoryHours = categoryHoursMap[catId];
      const cat = categories.find(c => c.id === catId);
      mostProductiveCategoryStr = cat ? cat.name : catId;
    }
  });

  // 6. Radar Chart Data (Category Hours Share)
  const radarChartData = categories.map(cat => {
    const hours = categoryHoursMap[cat.id] || 0;
    return {
      subject: cat.name,
      hours: Math.round(hours * 10) / 10,
      fullMark: Math.max(...Object.values(categoryHoursMap), 10)
    };
  });

  // 7. Hours by Day-of-Week Chart Data
  const weekdayChartData = weekdayNames.map((name, idx) => {
    const stats = dayOfWeekHours[idx];
    return {
      day: name.substring(0, 3),
      hours: stats.count > 0 ? Math.round((stats.sum / stats.count) * 10) / 10 : 0
    };
  });

  return (
    <div className="space-y-6 text-sm">
      {/* Row 1: Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticsCard
          title="Avg Daily Hours"
          value={`${Math.round(averageHoursPerDay * 10) / 10}h`}
          icon={<FiClock className="w-5 h-5" />}
          description="Average focus duration"
          trend={{ value: 'Stable', isPositive: true }}
        />
        <StatisticsCard
          title="Longest Streak"
          value={`${user?.longestStreak || 0} Days`}
          icon={<FiAward className="w-5 h-5 text-amber-400" />}
          description="Record consistency"
          trend={{ value: 'Record', isPositive: true }}
        />
        <StatisticsCard
          title="Goal Completion"
          value={`${goalCompletionRate}%`}
          icon={<FiTarget className="w-5 h-5 text-emerald-400" />}
          description={`${goalMetDays} of ${uniqueDaysCount} days met goal`}
          trend={{ value: `${goalMetDays} days`, isPositive: goalCompletionRate >= 70 }}
        />
        <StatisticsCard
          title="Missed Tasks"
          value={`${missedTasksCount}`}
          icon={<FiAlertCircle className="w-5 h-5 text-rose-400" />}
          description="Tasks in past left pending"
          trend={{ value: 'Incomplete', isPositive: false }}
        />
      </div>

      {/* Row 2: Deep Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Focus Profile Chart */}
        <Card variant="glass" className="lg:col-span-1">
          <CardHeader>
            <div>
              <h3 className="text-lg font-bold text-white">Focus Dimension</h3>
              <p className="text-xs text-slate-500">Hourly density per category</p>
            </div>
          </CardHeader>

          <div className="h-56 mt-4 w-full flex items-center justify-center">
            {radarChartData.some(d => d.hours > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarChartData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                  <PolarRadiusAxis stroke="#475569" fontSize={8} />
                  <Radar name="Hours Logged" dataKey="hours" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-xs">Accumulate actual focus hours to view.</p>
            )}
          </div>
        </Card>

        {/* Day-of-week Productive Chart */}
        <Card variant="glass" className="lg:col-span-2">
          <CardHeader>
            <div>
              <h3 className="text-lg font-bold text-white">Focus Velocity by Weekday</h3>
              <p className="text-xs text-slate-500">Average logged hours per day of week</p>
            </div>
            <Badge variant="success">Productivity Index</Badge>
          </CardHeader>

          <div className="h-56 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#f8fafc'
                  }}
                  formatter={(value) => [`${value} hrs avg`]}
                />
                <Bar dataKey="hours" name="Average Hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row 3: Insights Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Highlights */}
        <Card variant="glass">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FiZap className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Focus Benchmarks</h3>
            </div>
            <Badge variant="info">Insights</Badge>
          </CardHeader>

          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/[0.01] border border-white/5 rounded-xl">
              <div className="space-y-0.5">
                <p className="text-xs text-slate-400 font-semibold">MOST PRODUCTIVE WEEKDAY</p>
                <p className="text-sm font-bold text-slate-200">{mostProductiveDay}</p>
              </div>
              <Badge variant="warning">Weekday Peak</Badge>
            </div>

            <div className="flex justify-between items-center p-3 bg-white/[0.01] border border-white/5 rounded-xl">
              <div className="space-y-0.5">
                <p className="text-xs text-slate-400 font-semibold">MOST PRODUCTIVE CATEGORY</p>
                <p className="text-sm font-bold text-slate-200">{mostProductiveCategoryStr}</p>
              </div>
              <Badge variant="primary">Category Peak</Badge>
            </div>

            <div className="flex justify-between items-center p-3 bg-white/[0.01] border border-white/5 rounded-xl">
              <div className="space-y-0.5">
                <p className="text-xs text-slate-400 font-semibold">ACTIVE DAYS TRACKED</p>
                <p className="text-sm font-bold text-slate-200">{uniqueDaysCount} Days</p>
              </div>
              <Badge variant="success">Consistency</Badge>
            </div>
          </div>
        </Card>

        {/* Completion analytics progress */}
        <Card variant="glass">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FiCheckCircle className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Execution Ratios</h3>
            </div>
          </CardHeader>

          <div className="mt-4 space-y-5">
            {/* Task completion bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-semibold uppercase">Task Completion Rate</span>
                <span className="text-slate-200 font-bold">{completionRate}%</span>
              </div>
              <ProgressBar percentage={completionRate} colorClass="bg-emerald-500" />
              <p className="text-[10px] text-slate-500">
                {completedCount} completed of {totalCount} total tasks created.
              </p>
            </div>

            {/* Goal meeting bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-semibold uppercase">Daily Goal Target Success</span>
                <span className="text-slate-200 font-bold">{goalCompletionRate}%</span>
              </div>
              <ProgressBar percentage={goalCompletionRate} colorClass="bg-blue-500" />
              <p className="text-[10px] text-slate-500">
                Days where total logged time met or exceeded the daily {dailyGoal}h preference.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
