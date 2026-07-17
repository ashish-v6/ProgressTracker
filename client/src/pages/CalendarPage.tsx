import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { TaskModal } from '../components/TaskModal';
import { DEFAULT_COLORS } from '../constants';
import { calendarService } from '../services/calendarService';
import { FiChevronLeft, FiChevronRight, FiPlus, FiCheckCircle, FiInfo } from 'react-icons/fi';

export const CalendarPage: React.FC = () => {
  const { categories, tasks } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Format dates into YYYY-MM-DD
  const formatLocalDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = formatLocalDate(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<any | null>(null);

  // API query states
  const [monthlySummary, setMonthlySummary] = useState<any[]>([]);
  const [selectedDateTasks, setSelectedDateTasks] = useState<any[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Calendar Calculation Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // Days array for grid
  const daysInMonth: Date[] = [];
  
  // Previous month padding
  const prevMonthDaysCount = new Date(year, month, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    daysInMonth.push(new Date(year, month - 1, prevMonthDaysCount - i));
  }

  // Current month days
  for (let i = 1; i <= totalDaysInMonth; i++) {
    daysInMonth.push(new Date(year, month, i));
  }

  // Next month padding to fill grid (multiple of 7, standard 42 cells)
  const remainingCells = 42 - daysInMonth.length;
  for (let i = 1; i <= remainingCells; i++) {
    daysInMonth.push(new Date(year, month + 1, i));
  }

  // Load monthly summaries whenever month/year changes
  const fetchMonthlySummary = async () => {
    setLoadingSummary(true);
    setErrorMsg(null);
    try {
      // API expects 1-indexed months
      const data = await calendarService.getMonthlySummary(year, month + 1);
      setMonthlySummary(data.monthlySummary || []);
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || 'Failed to retrieve monthly summaries.');
    } finally {
      setLoadingSummary(false);
    }
  };

  // Load selected date tasks
  const fetchSelectedDateTasks = async (dateStr: string) => {
    setLoadingTasks(true);
    try {
      const tasks = await calendarService.getTasksByDate(dateStr);
      setSelectedDateTasks(tasks);
    } catch (e) {
      console.error('Failed to load tasks for date:', dateStr, e);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchMonthlySummary();
  }, [currentDate, tasks]);

  useEffect(() => {
    fetchSelectedDateTasks(selectedDateStr);
  }, [selectedDateStr, tasks]);

  const getCategoryColor = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return DEFAULT_COLORS.find(c => c.id === (cat?.color || '')) || DEFAULT_COLORS[0];
  };

  // History panel aggregates
  const totalTasks = selectedDateTasks.length;
  const completedTasks = selectedDateTasks.filter(t => t.completed || t.status === 'completed').length;
  const pendingTasks = totalTasks - completedTasks;
  const totalStudyHours = selectedDateTasks.reduce((sum, t) => sum + t.actualHours + (t.actualMinutes / 60), 0);

  return (
    <div className="space-y-6 text-sm">
      {/* Page Header banner */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Calendar & History</h1>
          <p className="text-slate-400 text-xs mt-1">Review your historical logs and daily study completions.</p>
        </div>
      </div>

      {/* Main Grid View and Daily List row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Calendar View */}
        <Card variant="glass" className="lg:col-span-2 relative overflow-hidden">
          <CardHeader className="border-b-0 mb-2">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            
            <div className="flex space-x-1">
              <Button onClick={prevMonth} variant="ghost" size="sm" className="p-2">
                <FiChevronLeft className="w-4 h-4" />
              </Button>
              <Button onClick={() => setCurrentDate(new Date())} variant="ghost" size="sm">
                Today
              </Button>
              <Button onClick={nextMonth} variant="ghost" size="sm" className="p-2">
                <FiChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Days of Week label */}
          <div className="grid grid-cols-7 text-center text-slate-500 font-semibold text-xs py-2 border-b border-white/5">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Grid Cells */}
          {loadingSummary ? (
            <div className="grid grid-cols-7 gap-1.5 mt-2 animate-pulse">
              {Array.from({ length: 42 }).map((_, idx) => (
                <div key={idx} className="min-h-[72px] bg-white/5 rounded-xl border border-transparent" />
              ))}
            </div>
          ) : errorMsg ? (
            <div className="py-20 text-center text-rose-400">
              <p>{errorMsg}</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1.5 mt-2">
              {daysInMonth.map((day, index) => {
                const dayStr = formatLocalDate(day);
                const isSelected = selectedDateStr === dayStr;
                const isToday = todayStr === dayStr;
                const isCurrentMonth = day.getMonth() === month;

                // Match with monthlySummary metrics
                const summaryMatch = monthlySummary.find(s => s.date === dayStr);
                const hasCompletions = summaryMatch && summaryMatch.completedTasks > 0;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedDateStr(dayStr)}
                    className={`min-h-[72px] p-2 flex flex-col justify-between items-start rounded-xl transition-all border outline-none text-left ${
                      isSelected
                        ? 'bg-blue-600/10 border-blue-500 text-white shadow shadow-blue-500/10'
                        : isToday
                        ? 'bg-slate-900 border-blue-500/40 text-white font-bold'
                        : isCurrentMonth
                        ? 'bg-slate-950/20 border-white/5 hover:bg-white/[0.03] text-slate-300'
                        : 'bg-transparent border-transparent hover:bg-white/[0.01] text-slate-600'
                    }`}
                  >
                    <span className={`text-xs ${isToday && !isSelected ? 'text-blue-400 font-bold' : ''}`}>
                      {day.getDate()}
                    </span>

                    {/* Completion indicators */}
                    {hasCompletions && (
                      <div className="flex items-center space-x-1.5 mt-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow shadow-emerald-500/50" />
                        <span className="text-[9px] text-emerald-400 font-bold">
                          {summaryMatch.completedTasks} done
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {/* Sidebar Daily View Details */}
        <Card variant="glass" className="flex flex-col justify-between">
          <div className="space-y-4">
            <CardHeader className="mb-2">
              <div>
                <h3 className="text-base font-bold text-white">
                  {new Date(selectedDateStr + 'T00:00:00.000Z').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </h3>
                <p className="text-xs text-slate-500">History Panel Log</p>
              </div>
              <Badge variant="primary">{totalTasks} tasks</Badge>
            </CardHeader>

            {/* Quick Metrics panel */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900/50 p-2.5 rounded-xl border border-white/5">
                <p className="text-slate-500 font-medium">Completed</p>
                <p className="text-base font-bold text-emerald-400 mt-0.5">{completedTasks}</p>
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded-xl border border-white/5">
                <p className="text-slate-500 font-medium">Pending</p>
                <p className="text-base font-bold text-amber-400 mt-0.5">{pendingTasks}</p>
              </div>
              <div className="col-span-2 bg-slate-900/50 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Total study duration:</span>
                <span className="font-bold text-slate-200">{Number(totalStudyHours.toFixed(1))} hrs</span>
              </div>
            </div>

            {/* Task list box */}
            {loadingTasks ? (
              <div className="space-y-2.5 animate-pulse pt-2">
                {[1, 2].map(n => (
                  <div key={n} className="h-12 bg-white/5 rounded-xl" />
                ))}
              </div>
            ) : selectedDateTasks.length > 0 ? (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {selectedDateTasks.map(task => {
                  const col = getCategoryColor(task.category);
                  const isCompleted = task.completed || task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        setSelectedTaskForEdit(task);
                        setIsModalOpen(true);
                      }}
                      className="p-3 bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all rounded-xl cursor-pointer flex justify-between items-center gap-2 group"
                    >
                      <div className="min-w-0 space-y-1">
                        <h4 className={`text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors truncate ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                          {task.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                          <span className="capitalize">{task.category}</span>
                          <span>•</span>
                          <span>{task.actualHours}h {task.actualMinutes}m worked</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        {isCompleted ? (
                          <FiCheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.hex }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <FiInfo className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                <p className="text-xs">No tasks logged on this day.</p>
              </div>
            )}
          </div>

          <Button
            onClick={() => {
              setSelectedTaskForEdit(null);
              setIsModalOpen(true);
            }}
            className="w-full mt-4"
            leftIcon={<FiPlus className="w-4 h-4" />}
            variant="glass"
          >
            Add task to this date
          </Button>
        </Card>
      </div>

      {/* Task Modal Container */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTaskForEdit(null);
          fetchSelectedDateTasks(selectedDateStr);
          fetchMonthlySummary();
        }}
        taskToEdit={selectedTaskForEdit}
        defaultDate={selectedDateStr}
      />
    </div>
  );
};
export default CalendarPage;
