import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FiMenu,
  FiPlay,
  FiPause,
  FiSquare,
  FiClock,
  FiSun,
  FiMoon,
  FiZap
} from 'react-icons/fi';

interface NavbarProps {
  onMenuOpen: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuOpen }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { tasks } = useApp();
  const { activeTaskId, elapsedSeconds, isRunning, pauseTimer, resumeTimer, stopTimer } = useTimer();

  // Determine current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/today') return "Today's Focus";
    if (path === '/calendar') return 'Activity Calendar';
    if (path === '/reports') return 'Performance Reports';
    if (path === '/analytics') return 'Productivity Analytics';
    if (path === '/settings') return 'Preferences & Settings';
    if (path === '/profile') return 'My Profile';
    return 'Progress Tracker';
  };

  const activeTask = tasks.find(t => t.id === activeTaskId);

  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    
    const fHrs = hrs > 0 ? `${hrs}:` : '';
    const fMins = String(mins).padStart(2, '0');
    const fSecs = String(secs).padStart(2, '0');
    
    return `${fHrs}${fMins}:${fSecs}`;
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-zinc-950/95 border-b border-zinc-800">
      {/* Left side: Hamburger (Mobile) & Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuOpen}
          className="lg:hidden p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors"
        >
          <FiMenu className="w-4 h-4" />
        </button>
        <h1 className="text-base font-semibold text-zinc-100 tracking-tight leading-none my-0 py-0">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right side: Global Timer & System Options */}
      <div className="flex items-center space-x-3">
        {/* Global Timer Widget */}
        {activeTaskId && activeTask && (
          <div className="flex items-center space-x-2.5 bg-blue-600/10 border border-blue-500/20 rounded-lg px-2.5 py-1 text-xs">
            <FiClock className="w-3.5 h-3.5 text-blue-400" />
            <div className="hidden md:block max-w-[120px]">
              <p className="text-[10px] text-zinc-400 leading-none truncate font-medium">{activeTask.title}</p>
            </div>
            
            <div className="flex items-center space-x-2 border-l border-zinc-800 pl-2.5">
              <span className="font-mono text-xs font-bold text-blue-400">
                {formatTime(elapsedSeconds)}
              </span>

              <button
                onClick={isRunning ? pauseTimer : resumeTimer}
                className="p-0.5 rounded hover:bg-zinc-800 text-zinc-350 transition-colors"
              >
                {isRunning ? <FiPause className="w-3 h-3" /> : <FiPlay className="w-3 h-3" />}
              </button>

              <button
                onClick={stopTimer}
                className="p-0.5 rounded hover:bg-red-500/25 text-red-400 transition-colors"
              >
                <FiSquare className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors shadow-sm"
          title="Toggle theme"
        >
          {theme === 'dark' ? <FiSun className="w-3.5 h-3.5 text-amber-500" /> : <FiMoon className="w-3.5 h-3.5 text-blue-500" />}
        </button>

        {/* User Quick Badge */}
        {user && (
          <div className="hidden sm:flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 rounded-lg py-1 px-2.5 text-xs text-zinc-300">
            <FiZap className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold text-[10px]">{user.streak}d streak</span>
          </div>
        )}
      </div>
    </header>
  );
};
export default Navbar;
