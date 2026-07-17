import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../components/Card';
import { Badge } from '../components/Badge';
import { reportsService } from '../services/reportsService';
import { useApp } from '../context/AppContext';
import { formatDateKey } from '../services/mockData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  FiInbox,
  FiAlertCircle
} from 'react-icons/fi';

type PeriodType = 'daily' | 'weekly' | 'monthly';

const COLORS = ['#10B981', '#EF4444']; // Emerald for completed, Red/Rose for pending
const TOOLTIP_STYLE = {
  backgroundColor: '#0F172A',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  color: '#F1F5F9',
  fontSize: '12px'
};

export const Reports: React.FC = () => {
  const { tasks } = useApp();
  const [period, setPeriod] = useState<PeriodType>('weekly');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const todayStr = formatDateKey(new Date());
      let data: any;

      if (period === 'daily') {
        data = await reportsService.getDailyReport(todayStr);
      } else if (period === 'weekly') {
        data = await reportsService.getWeeklyReport(todayStr);
      } else {
        data = await reportsService.getMonthlyReport(todayStr);
      }

      setReportData(data);
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || 'Failed to fetch report statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period, tasks]);

  const pieData = reportData
    ? [
        { name: 'Completed Tasks', value: reportData.completedTasks },
        { name: 'Pending Tasks', value: reportData.pendingTasks }
      ]
    : [];

  return (
    <div className="space-y-6 text-sm">
      {/* Header section with Period Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Performance Reports</h1>
          <p className="text-slate-400 text-xs mt-1">Review statistical charts for daily, weekly, and monthly completions.</p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex border border-white/10 p-1 bg-slate-900/60 rounded-xl">
          {(['daily', 'weekly', 'monthly'] as PeriodType[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-xs font-semibold capitalize rounded-lg transition-all ${
                period === p
                  ? 'bg-blue-600 text-white shadow shadow-blue-500/15'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-slate-900/50 border border-white/5 p-4 rounded-xl animate-pulse h-24 space-y-3">
                <div className="h-3 bg-white/10 rounded w-2/3"></div>
                <div className="h-6 bg-white/10 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-slate-900/50 border border-white/5 animate-pulse rounded-2xl"></div>
            <div className="h-80 bg-slate-900/50 border border-white/5 animate-pulse rounded-2xl"></div>
          </div>
        </div>
      ) : errorMsg ? (
        <Card variant="glass" className="border border-rose-500/20 bg-rose-500/5 p-6 flex items-center space-x-3 text-rose-400">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{errorMsg}</p>
        </Card>
      ) : !reportData ? (
        <Card variant="glass" className="p-12 text-center text-slate-500 space-y-2">
          <FiInbox className="w-8 h-8 mx-auto" />
          <p>No report information available.</p>
        </Card>
      ) : (
        <>
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Total Tasks */}
            <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between h-24 border border-white/5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</span>
              <span className="text-xl font-bold text-slate-100">{reportData.totalTasks}</span>
              <Badge variant="primary" className="text-[9px] py-0.5 self-start">Scheduled</Badge>
            </div>

            {/* Completed Tasks */}
            <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between h-24 border border-white/5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Completed Tasks</span>
              <span className="text-xl font-bold text-emerald-400">{reportData.completedTasks}</span>
              <Badge variant="success" className="text-[9px] py-0.5 self-start">Done</Badge>
            </div>

            {/* Pending Tasks */}
            <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between h-24 border border-white/5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pending Tasks</span>
              <span className="text-xl font-bold text-amber-500">{reportData.pendingTasks}</span>
              <Badge variant="warning" className="text-[9px] py-0.5 self-start">Remaining</Badge>
            </div>

            {/* Completion Percentage */}
            <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between h-24 border border-white/5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Completion Rate</span>
              <span className="text-xl font-bold text-blue-400">{reportData.completionPercentage}%</span>
              <Badge variant="info" className="text-[9px] py-0.5 self-start">Efficiency</Badge>
            </div>

            {/* Total Study Hours */}
            <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between h-24 border border-white/5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Study Duration</span>
              <span className="text-xl font-bold text-slate-100">{reportData.totalHours}h</span>
              <Badge variant="secondary" className="text-[9px] py-0.5 self-start">Total hours</Badge>
            </div>

            {/* Average Study Hours */}
            <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between h-24 border border-white/5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Daily Average</span>
              <span className="text-xl font-bold text-cyan-400">{reportData.averageStudyHours}h</span>
              <Badge variant="custom" className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] py-0.5 self-start">Hours/day</Badge>
            </div>
          </div>

          {/* Clean and Simple Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart: Study Hours duration */}
            <Card variant="glass">
              <CardHeader>
                <div>
                  <h3 className="text-base font-bold text-white">Study Duration Analysis</h3>
                  <p className="text-xs text-slate-500">
                    {period === 'daily'
                      ? 'Tracked focus hours logged per task today'
                      : period === 'weekly'
                      ? 'Total focus hours tracked daily over the week'
                      : 'Accumulated focus hours grouped week-by-week'}
                  </p>
                </div>
                <Badge variant="primary">Study Hours</Badge>
              </CardHeader>
              
              <div className="h-64 mt-4 w-full">
                {reportData.chartData && reportData.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                      <Bar dataKey="hours" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <FiInbox className="w-6 h-6 mb-2" />
                    <span>No hours tracked in this period.</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Pie Chart: Completed vs Pending tasks count */}
            <Card variant="glass">
              <CardHeader>
                <div>
                  <h3 className="text-base font-bold text-white">Completion Ratio</h3>
                  <p className="text-xs text-slate-500">Ratio of completed tasks against remaining/pending</p>
                </div>
                <Badge variant="success">Task Ratios</Badge>
              </CardHeader>

              <div className="h-64 mt-4 w-full flex items-center justify-center">
                {reportData.totalTasks > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => <span className="text-[10px] text-slate-400 capitalize">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <FiInbox className="w-6 h-6 mb-2" />
                    <span>No tasks recorded in this period.</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
export default Reports;
