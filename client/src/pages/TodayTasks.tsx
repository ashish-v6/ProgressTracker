import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Task, TaskStatus } from '../types';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';
import { PRIORITIES } from '../constants';
import { formatDateKey } from '../services/mockData';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FiPlus, FiSearch, FiFilter, FiTrendingUp } from 'react-icons/fi';

export const TodayTasks: React.FC = () => {
  const { tasks, categories, updateTask } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_desc');

  const todayStr = formatDateKey(new Date());

  // Filter tasks due today
  const todayTasks = tasks.filter(t => t.dueDate === todayStr);

  // Apply search & filter rules
  const filteredTasks = todayTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Apply sorting rules
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'title_asc':
        return a.title.localeCompare(b.title);
      case 'title_desc':
        return b.title.localeCompare(a.title);
      case 'priority_desc': {
        const order = { high: 3, medium: 2, low: 1 };
        return order[b.priority] - order[a.priority];
      }
      case 'hours_desc':
        return b.targetHours - a.targetHours;
      case 'hours_asc':
        return a.targetHours - b.targetHours;
      case 'created_desc':
        return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      default:
        return 0;
    }
  });

  // Split tasks by status column
  const pendingTasks = sortedTasks.filter(t => t.status === 'pending');
  const inProgressTasks = sortedTasks.filter(t => t.status === 'in_progress');
  const completedTasks = sortedTasks.filter(t => t.status === 'completed');

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const task = tasks.find(t => t.id === taskId);
    
    if (task && task.status !== targetStatus) {
      let completedDate = task.completedDate;
      if (targetStatus === 'completed') {
        completedDate = new Date().toISOString();
      } else {
        completedDate = null;
      }

      updateTask({
        ...task,
        status: targetStatus,
        completedDate
      });
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 text-sm">
      {/* Top Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Today's Focus</h2>
          <p className="text-slate-400 mt-1">
            Organize tasks and track your focus. Drag tasks between columns to update status.
          </p>
        </div>
        
        <Button
          onClick={() => {
            setSelectedTask(null);
            setIsModalOpen(true);
          }}
          leftIcon={<FiPlus className="w-4 h-4" />}
          variant="primary"
        >
          Add Task for Today
        </Button>
      </div>

      {/* Filters and Search Bar */}
      <Card variant="glass" padding="sm" className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-white/5 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-slate-200 outline-none transition-colors"
          />
        </div>

        {/* Filter Category */}
        <div className="flex items-center space-x-2">
          <FiFilter className="text-slate-500 shrink-0 w-4 h-4" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-900 border border-white/5 focus:border-blue-500 rounded-xl px-3 py-2 text-slate-300 outline-none cursor-pointer capitalize"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Filter Priority */}
        <div className="flex items-center space-x-2">
          <FiFilter className="text-slate-500 shrink-0 w-4 h-4" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full bg-slate-900 border border-white/5 focus:border-blue-500 rounded-xl px-3 py-2 text-slate-300 outline-none cursor-pointer"
          >
            <option value="all">All Priorities</option>
            {PRIORITIES.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center space-x-2">
          <FiTrendingUp className="text-slate-500 shrink-0 w-4 h-4" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-slate-900 border border-white/5 focus:border-blue-500 rounded-xl px-3 py-2 text-slate-300 outline-none cursor-pointer"
          >
            <option value="created_desc">Newest Created</option>
            <option value="title_asc">Title (A-Z)</option>
            <option value="title_desc">Title (Z-A)</option>
            <option value="priority_desc">Priority (High-Low)</option>
            <option value="hours_desc">Hours (High-Low)</option>
            <option value="hours_asc">Hours (Low-High)</option>
          </select>
        </div>
      </Card>

      {/* Board Columns (Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Pending Column */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'pending')}
          className="flex flex-col bg-slate-900/30 rounded-2xl border border-white/5 p-4 min-h-[500px]"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <h3 className="font-bold text-slate-200">Pending Tasks</h3>
            </div>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-lg font-bold">
              {pendingTasks.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            {pendingTasks.length > 0 ? (
              pendingTasks.map(task => (
                <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
              ))
            ) : (
              <div className="text-center py-12 text-slate-600 text-xs border-2 border-dashed border-white/5 rounded-xl">
                Drag tasks here to set pending
              </div>
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'in_progress')}
          className="flex flex-col bg-slate-900/30 rounded-2xl border border-white/5 p-4 min-h-[500px]"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
              <h3 className="font-bold text-slate-200">In Progress</h3>
            </div>
            <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/25 px-2 py-0.5 rounded-lg font-bold">
              {inProgressTasks.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            {inProgressTasks.length > 0 ? (
              inProgressTasks.map(task => (
                <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
              ))
            ) : (
              <div className="text-center py-12 text-slate-600 text-xs border-2 border-dashed border-white/5 rounded-xl">
                Drag tasks here to start tracking
              </div>
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'completed')}
          className="flex flex-col bg-emerald-950/5 rounded-2xl border border-white/5 p-4 min-h-[500px]"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="font-bold text-slate-200">Completed</h3>
            </div>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-lg font-bold">
              {completedTasks.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            {completedTasks.length > 0 ? (
              completedTasks.map(task => (
                <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
              ))
            ) : (
              <div className="text-center py-12 text-slate-600 text-xs border-2 border-dashed border-white/5 rounded-xl">
                Drag tasks here to mark complete
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Modal Container */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        taskToEdit={selectedTask}
        defaultDate={todayStr}
      />
    </div>
  );
};
