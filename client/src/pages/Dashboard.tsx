import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { StatisticsCard } from '../components/StatisticsCard';
import { Card, CardHeader } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import type { Task } from '../types';
import { DEFAULT_COLORS } from '../constants';
import { TaskModal } from '../components/TaskModal';
import { dashboardService } from '../services/dashboardService';
import { formatDateKey } from '../services/mockData';
import { ProgressRing } from '../components/ProgressRing';
import {
  WeeklyHoursChart,
  CategoryPieChart,
  CompletionTrendChart,
  Last30DaysActivity
} from '../components/DashboardCharts';
import {
  FiClock,
  FiZap,
  FiTrendingUp,
  FiActivity,
  FiCheckCircle,
  FiCalendar,
  FiPlus,
  FiInbox
} from 'react-icons/fi';

// Skeleton Placeholder component

// Skeleton Placeholder component
const SkeletonCard: React.FC = () => (
  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg animate-pulse space-y-3">
    <div className="h-3 bg-white/5 rounded w-1/3"></div>
    <div className="h-6 bg-white/5 rounded w-2/3"></div>
    <div className="h-3 bg-white/5 rounded w-1/2"></div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { tasks, categories } = useApp();
  const { user } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Dashboard API state
  const [summary, setSummary] = useState<any>(null);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [monthlyStats, setMonthlyStats] = useState<any>(null);
  const [categoryStats, setCategoryStats] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, weeklyRes, monthlyRes, categoryRes] = await Promise.all([
        dashboardService.getDashboardSummary(),
        dashboardService.getWeeklyStats(),
        dashboardService.getMonthlyStats(),
        dashboardService.getCategoryStats()
      ]);
      
      setSummary(summaryRes);
      setWeeklyStats(weeklyRes);
      setMonthlyStats(monthlyRes);
      setCategoryStats(categoryRes);

      // Extract heatmap log counts from recent activities
      const recentCompletions = tasks
        .filter(t => t.status === 'completed' && t.completedDate)
        .map(t => ({
          date: t.completedDate!.split('T')[0],
          count: 1
        }));
      setHeatmapData(recentCompletions);
    } catch (e) {
      console.error('Failed to load dashboard metrics from backend:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [tasks]);

  const todayStr = formatDateKey(new Date());
  const tomorrowStr = (() => {
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    return formatDateKey(tom);
  })();

  const upcomingTasks = tasks
    .filter(t => (t.dueDate === todayStr || t.dueDate === tomorrowStr) && t.status !== 'completed')
    .slice(0, 5);

  const recentlyCompleted = tasks
    .filter(t => t.status === 'completed' && t.completedDate)
    .sort((a, b) => new Date(b.completedDate!).getTime() - new Date(a.completedDate!).getTime())
    .slice(0, 4);

  const getCategoryColor = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return DEFAULT_COLORS.find(c => c.id === (cat?.color || '')) || DEFAULT_COLORS[0];
  };

  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6 text-sm">
        <div className="h-6 bg-white/5 animate-pulse rounded w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-white/5 animate-pulse rounded-lg"></div>
          <div className="h-64 bg-white/5 animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }

  const todayProgressVal = summary?.today?.completionPercentage ?? 0;
  const hoursProgressVal = summary?.today?.targetHours > 0 
    ? Math.min(100, Math.round((summary.today.completedHours / summary.today.targetHours) * 100)) 
    : 0;

  const last7DaysList = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const weeklyFocusPoints = last7DaysList.map(dateKey => {
    const dayTasks = tasks.filter(t => t.dueDate === dateKey);
    const dayHours = dayTasks.reduce((sum, t) => sum + t.actualHours + (t.actualMinutes / 60), 0);
    return {
      date: dateKey,
      hours: Number(dayHours.toFixed(1))
    };
  });

  const weeklyCompletionTrend = last7DaysList.map(dateKey => {
    const dayTasks = tasks.filter(t => t.dueDate === dateKey);
    const completed = dayTasks.filter(t => t.status === 'completed').length;
    const rate = dayTasks.length > 0 ? Math.round((completed / dayTasks.length) * 100) : 0;
    return {
      date: dateKey,
      completionRate: rate
    };
  });

  return (
    <div className="space-y-6 text-xs md:text-sm">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">
            Welcome back, {user?.name.split(' ')[0]}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            {summary?.today?.totalTasks > 0
              ? `You have completed ${summary.today.completedTasks} of ${summary.today.totalTasks} tasks today.`
              : 'No tasks scheduled for today. Add a task to start tracking.'}
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedTask(null);
            setIsModalOpen(true);
          }}
          variant="primary"
          size="sm"
          leftIcon={<FiPlus className="w-4 h-4" />}
          className="self-start sm:self-auto"
        >
          Add New Task
        </Button>
      </div>

      {/* Row 1: Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticsCard
          title="Today's Focus"
          value={`${summary?.today?.completedHours ?? 0}h`}
          icon={<FiClock className="w-4.5 h-4.5" />}
          description={`Target: ${summary?.today?.targetHours ?? 0} hrs`}
          trend={{ value: `${hoursProgressVal}% goal`, isPositive: hoursProgressVal >= 100 }}
        />
        <StatisticsCard
          title="Current Streak"
          value={`${summary?.streaks?.currentStreak ?? 0} Days`}
          icon={<FiZap className="w-4.5 h-4.5" />}
          description={`Longest: ${summary?.streaks?.longestStreak ?? 0} Days`}
          trend={{ value: 'Active Streak', isPositive: true }}
        />
        <StatisticsCard
          title="Monthly Work"
          value={`${summary?.stats30Days?.totalStudyHours ?? 0}h`}
          icon={<FiTrendingUp className="w-4.5 h-4.5" />}
          description={`Daily Avg: ${summary?.stats30Days?.averageDailyHours ?? 0} hrs`}
          trend={{ value: `${summary?.stats30Days?.completionRate ?? 0}% completions`, isPositive: true }}
        />
        <StatisticsCard
          title="Productivity Score"
          value={`${summary?.productivityScore ?? 0}`}
          icon={<FiActivity className="w-4.5 h-4.5" />}
          description={`Overdue items: ${summary?.stats30Days?.overdueTasks ?? 0}`}
          trend={{ value: 'Excellent', isPositive: (summary?.productivityScore ?? 0) >= 85 }}
        />
      </div>

      {/* Row 2: Progress Engine Rings and Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="glass" className="flex items-center space-x-4 p-4">
          <ProgressRing percentage={todayProgressVal} size={56} strokeWidth={5} colorClass="stroke-blue-500" />
          <div>
            <h4 className="font-semibold text-zinc-200 text-xs md:text-sm">Tasks Completed</h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">Today's completion rate</p>
          </div>
        </Card>

        <Card variant="glass" className="flex items-center space-x-4 p-4">
          <ProgressRing percentage={hoursProgressVal} size={56} strokeWidth={5} colorClass="stroke-emerald-500" />
          <div>
            <h4 className="font-semibold text-zinc-200 text-xs md:text-sm">Target Time Goal</h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">Today's hours progress</p>
          </div>
        </Card>

        <Card variant="glass" className="p-4 flex flex-col justify-between h-24">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-zinc-500">Weekly Progress</span>
            <span className="font-bold text-zinc-200">{weeklyStats?.completionRate ?? 0}%</span>
          </div>
          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              style={{ width: `${weeklyStats?.completionRate ?? 0}%` }}
              className="h-full bg-blue-500 transition-all duration-300"
            />
          </div>
          <span className="text-[10px] text-zinc-500">Weekly completion target</span>
        </Card>

        <Card variant="glass" className="p-4 flex flex-col justify-between h-24">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-zinc-500">Monthly Progress</span>
            <span className="font-bold text-zinc-200">{monthlyStats?.completionRate ?? 0}%</span>
          </div>
          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              style={{ width: `${monthlyStats?.completionRate ?? 0}%` }}
              className="h-full bg-emerald-500 transition-all duration-300"
            />
          </div>
          <span className="text-[10px] text-zinc-500">Monthly completion target</span>
        </Card>
      </div>

      {/* Row 3: Charts focus split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="glass" className="lg:col-span-2">
          <CardHeader>
            <div>
              <h3 className="text-xs md:text-sm font-semibold text-zinc-100">Weekly Focus Analysis</h3>
              <p className="text-[11px] text-zinc-500">Study duration logged over the last 7 days</p>
            </div>
            <Badge variant="primary">{weeklyStats?.totalHours ?? 0} hrs logged</Badge>
          </CardHeader>
          <div className="mt-4">
            <WeeklyHoursChart data={weeklyFocusPoints} />
          </div>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <div>
              <h3 className="text-xs md:text-sm font-semibold text-zinc-100">Category Split</h3>
              <p className="text-[11px] text-zinc-500">Distribution of logged study hours</p>
            </div>
          </CardHeader>
          <div className="mt-2">
            {categoryStats && categoryStats.length > 0 ? (
              <CategoryPieChart data={categoryStats} />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-zinc-500 space-y-2">
                <FiInbox className="w-6 h-6 text-zinc-650" />
                <span className="text-xs">No logged category hours yet</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Row 4: Trend Analysis & Contribution heatmaps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="glass" className="lg:col-span-2">
          <CardHeader>
            <div>
              <h3 className="text-xs md:text-sm font-semibold text-zinc-100">Weekly Completion Trend</h3>
              <p className="text-[11px] text-zinc-500">Percentage of tasks resolved over time</p>
            </div>
          </CardHeader>
          <div className="mt-4">
            <CompletionTrendChart data={weeklyCompletionTrend} />
          </div>
        </Card>

        <Card variant="glass" className="flex flex-col justify-between">
          <CardHeader className="pb-1">
            <div>
              <h3 className="text-xs md:text-sm font-semibold text-zinc-100">Productivity Highlights</h3>
              <p className="text-[11px] text-zinc-500">Key metrics indicating performance</p>
            </div>
          </CardHeader>
          <div className="space-y-2.5 mt-2.5">
            <div className="flex justify-between items-center p-3 bg-zinc-950/40 border border-zinc-800 rounded-lg">
              <span className="text-[11px] text-zinc-400 font-medium">Most Productive Day</span>
              <Badge variant="primary" className="capitalize">{summary?.highlights?.mostProductiveDay || 'N/A'}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-950/40 border border-zinc-800 rounded-lg">
              <span className="text-[11px] text-zinc-400 font-medium">Top Performing Category</span>
              <Badge variant="success" className="capitalize">{summary?.highlights?.mostProductiveCategory || 'N/A'}</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 5: Contribution grids and statistics breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="glass" className="lg:col-span-2">
          <CardHeader className="pb-1">
            <div>
              <h3 className="text-xs md:text-sm font-semibold text-zinc-100">Recent Activity Heatmap</h3>
              <p className="text-[11px] text-zinc-500">Completed items grid over the last 30 days</p>
            </div>
          </CardHeader>
          <div className="pt-2">
            <Last30DaysActivity data={heatmapData} />
          </div>
        </Card>

        <Card variant="glass">
          <CardHeader className="pb-1">
            <div>
              <h3 className="text-xs md:text-sm font-semibold text-zinc-100">Quick Statistics</h3>
              <p className="text-[11px] text-zinc-500 font-medium">Fast aggregate performance values</p>
            </div>
          </CardHeader>
          <div className="grid grid-cols-2 gap-2 text-xs mt-2.5">
            <div className="bg-zinc-950/45 p-2 rounded-lg border border-zinc-800">
              <p className="text-zinc-500 font-medium text-[10px]">Total Tasks</p>
              <p className="text-base font-semibold text-zinc-200 mt-0.5">{summary?.stats30Days?.totalTasks ?? 0}</p>
            </div>
            <div className="bg-zinc-950/45 p-2 rounded-lg border border-zinc-800">
              <p className="text-zinc-500 font-medium text-[10px]">Completed</p>
              <p className="text-base font-semibold text-emerald-400 mt-0.5">{summary?.stats30Days?.completedTasks ?? 0}</p>
            </div>
            <div className="bg-zinc-950/45 p-2 rounded-lg border border-zinc-800">
              <p className="text-zinc-500 font-medium text-[10px]">Pending</p>
              <p className="text-base font-semibold text-amber-500 mt-0.5">{summary?.stats30Days?.pendingTasks ?? 0}</p>
            </div>
            <div className="bg-zinc-950/45 p-2 rounded-lg border border-zinc-800">
              <p className="text-zinc-500 font-medium text-[10px]">Overdue</p>
              <p className="text-base font-semibold text-red-400 mt-0.5">{summary?.stats30Days?.overdueTasks ?? 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 6: Upcoming and Completed tasks lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="glass">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FiCalendar className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs md:text-sm font-semibold text-zinc-100">Upcoming Focus</h3>
            </div>
            <Badge variant="primary">{upcomingTasks.length} pending</Badge>
          </CardHeader>

          <div className="space-y-2 mt-4">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map(task => {
                const colorObj = getCategoryColor(task.category);
                return (
                  <div
                    key={task.id}
                    onClick={() => handleEditClick(task)}
                    className="flex justify-between items-center p-2.5 bg-zinc-900/40 border border-zinc-850 hover:bg-zinc-800/40 rounded-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colorObj.hex }} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-200 group-hover:text-blue-400 transition-colors truncate">
                          {task.title}
                        </p>
                        <p className="text-[10px] text-zinc-550">
                          Due: {task.dueDate === todayStr ? 'Today' : 'Tomorrow'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="custom" className={`${colorObj.bgClass} text-[9px]`}>
                      {task.targetHours}h goal
                    </Badge>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-zinc-500">
                <FiCheckCircle className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                <p className="text-xs">No pending tasks for today or tomorrow!</p>
              </div>
            )}
          </div>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FiCheckCircle className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs md:text-sm font-semibold text-zinc-100">Recently Completed</h3>
            </div>
            <Badge variant="success">Completed Logs</Badge>
          </CardHeader>

          <div className="space-y-2 mt-4">
            {recentlyCompleted.length > 0 ? (
              recentlyCompleted.map(task => {
                const colorObj = getCategoryColor(task.category);
                return (
                  <div
                    key={task.id}
                    className="flex justify-between items-center p-2.5 bg-zinc-900/40 border border-zinc-850 hover:bg-zinc-800/40 rounded-lg transition-all"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-4.5 h-4.5 rounded-full bg-emerald-500/10 text-emerald-450 border border-emerald-500/25 flex items-center justify-center shrink-0 text-xs font-bold">
                        ✓
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-300 line-through truncate">{task.title}</p>
                        <p className="text-[10px] text-zinc-500">
                          Done: {task.completedDate ? new Date(task.completedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                    </div>
                    <Badge variant="custom" className={`${colorObj.bgClass} text-[9px]`}>
                      {task.actualHours}h {task.actualMinutes}m
                    </Badge>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-zinc-500">
                <p className="text-xs">No completed tasks yet. Finish a task to log hours!</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Edit Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        taskToEdit={selectedTask}
      />
    </div>
  );
};
export default Dashboard;
