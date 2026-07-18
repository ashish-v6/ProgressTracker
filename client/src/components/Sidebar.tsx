import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { formatDateKey } from '../services/mockData';
import { ProgressRing } from './ProgressRing';
import {
  FiLayout,
  FiCheckSquare,
  FiCalendar,
  FiBarChart2,
  FiTrendingUp,
  FiSettings,
  FiUser,
  FiLogOut,
  FiZap,
  FiRefreshCw
} from 'react-icons/fi';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { tasks } = useApp();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <FiLayout className="w-5 h-5" /> },
    { name: "Today's Tasks", path: '/today', icon: <FiCheckSquare className="w-5 h-5" /> },
    { name: 'Recurring Tasks', path: '/recurring', icon: <FiRefreshCw className="w-5 h-5" /> },
    { name: 'Calendar', path: '/calendar', icon: <FiCalendar className="w-5 h-5" /> },
    { name: 'Reports', path: '/reports', icon: <FiBarChart2 className="w-5 h-5" /> },
    { name: 'Analytics', path: '/analytics', icon: <FiTrendingUp className="w-5 h-5" /> },
    { name: 'Profile', path: '/profile', icon: <FiUser className="w-5 h-5" /> },
    { name: 'Settings', path: '/settings', icon: <FiSettings className="w-5 h-5" /> }
  ];

  // Calculate today's hour progress
  const todayStr = formatDateKey(new Date());
  const todayTasks = tasks.filter(t => t.dueDate === todayStr);
  const targetHoursToday = todayTasks.reduce((acc, t) => acc + t.targetHours, 0) || user?.preferences.workingHourGoal || 6;
  const actualHoursToday = todayTasks.reduce((acc, t) => acc + t.actualHours + (t.actualMinutes / 60), 0);
  const percentageToday = Math.min(100, Math.round((actualHoursToday / targetHoursToday) * 100)) || 0;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800">
      {/* Brand Header */}
      <div className="flex items-center space-x-3 px-6 py-6 border-b border-zinc-800">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
          <FiZap className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-zinc-100 tracking-wide">Progress Tracker</h2>
          <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider">Save time smartly</span>
        </div>
      </div>

      {/* Stats Quick-Overview */}
      {user && (
        <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-900/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ProgressRing
                percentage={percentageToday}
                size={48}
                strokeWidth={4.5}
                colorClass="stroke-blue-500"
                icon={
                  <span className="text-[9px] font-bold text-blue-400">
                    {Math.round(actualHoursToday * 10) / 10}h
                  </span>
                }
              />
              <div>
                <p className="text-[10px] font-semibold text-zinc-500">Daily Target</p>
                <p className="text-xs font-bold text-zinc-300">
                  {Math.round(actualHoursToday * 10) / 10} / {targetHoursToday} hrs
                </p>
              </div>
            </div>

            {/* Streak display */}
            <div className="flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 rounded-lg p-2">
              <FiZap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold text-zinc-300 mt-1">{user.streak}d</span>
              <span className="text-[8px] text-zinc-500 uppercase tracking-wider font-semibold">Streak</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center space-x-3.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-zinc-900 border-l-2 border-blue-500 text-zinc-100 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Footer Profile */}
      {user && (
        <div className="p-4 border-t border-zinc-800 bg-zinc-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <img
                src={user.avatarUrl || "/image.png"}
                alt={user.name}
                className="w-8 h-8 rounded-lg object-cover border border-zinc-800"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-200 truncate">{user.name}</p>
                <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <FiLogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Left side, fixed) */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 z-30">
        {sidebarContent}
      </div>

      {/* Mobile Drawer (Overlay backdrop & slide-in pane) */}
      {isOpen && (
        <div className="fixed inset-0 lg:hidden z-40 flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60"
          />

          {/* Sliding Sidebar Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative flex flex-col w-64 max-w-xs h-full z-50 shadow-2xl"
          >
            {sidebarContent}
          </motion.div>
        </div>
      )}
    </>
  );
};
export default Sidebar;
