import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useApp } from './AppContext';

interface TimerContextType {
  activeTaskId: string | null;
  elapsedSeconds: number;
  isRunning: boolean;
  startTimer: (taskId: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tasks, updateTask } = useApp();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('global_timer_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.activeTaskId || null;
      }
    } catch (e) {
      console.error('Failed to parse timer activeTaskId state:', e);
    }
    return null;
  });

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('global_timer_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        let seconds = parsed.elapsedSeconds || 0;
        if (parsed.activeTaskId && parsed.isRunning) {
          const lastTick = localStorage.getItem('global_timer_last_tick');
          if (lastTick) {
            const drift = Math.floor((Date.now() - parseInt(lastTick, 10)) / 1000);
            seconds += Math.max(0, drift);
          }
        }
        return seconds;
      }
    } catch (e) {
      console.error('Failed to parse timer elapsedSeconds state:', e);
    }
    return 0;
  });

  const [isRunning, setIsRunning] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('global_timer_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return !!parsed.isRunning;
      }
    } catch (e) {
      console.error('Failed to parse timer isRunning state:', e);
    }
    return false;
  });

  const timerInterval = useRef<number | null>(null);

  // Sync local storage on state change
  useEffect(() => {
    if (activeTaskId) {
      localStorage.setItem(
        'global_timer_state',
        JSON.stringify({ activeTaskId, elapsedSeconds, isRunning })
      );
      if (isRunning) {
        localStorage.setItem('global_timer_last_tick', Date.now().toString());
      }
    } else {
      localStorage.removeItem('global_timer_state');
      localStorage.removeItem('global_timer_last_tick');
    }
  }, [activeTaskId, elapsedSeconds, isRunning]);

  // Main ticking effect
  useEffect(() => {
    if (isRunning && activeTaskId) {
      timerInterval.current = window.setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
        localStorage.setItem('global_timer_last_tick', Date.now().toString());
      }, 1000);
    } else {
      if (timerInterval.current !== null) {
        window.clearInterval(timerInterval.current);
      }
    }

    return () => {
      if (timerInterval.current !== null) {
        window.clearInterval(timerInterval.current);
      }
    };
  }, [isRunning, activeTaskId]);

  const startTimer = (taskId: string) => {
    // If another timer is running, stop it and save progress first
    if (activeTaskId && activeTaskId !== taskId) {
      saveProgressAndStop();
    }
    setActiveTaskId(taskId);
    setElapsedSeconds(0);
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resumeTimer = () => {
    if (activeTaskId) {
      setIsRunning(true);
    }
  };

  const saveProgressAndStop = () => {
    if (!activeTaskId) return;

    const targetTask = tasks.find(t => t.id === activeTaskId);
    if (targetTask) {
      // Calculate elapsed minutes and hours
      const addedMinutes = Math.floor(elapsedSeconds / 60);
      
      let newMinutes = targetTask.actualMinutes + addedMinutes;
      let newHours = targetTask.actualHours + Math.floor(newMinutes / 60);
      newMinutes = newMinutes % 60;

      // Update task in state
      updateTask({
        ...targetTask,
        actualHours: newHours,
        actualMinutes: newMinutes,
        status: targetTask.status === 'pending' ? 'in_progress' : targetTask.status
      });
    }
  };

  const stopTimer = () => {
    saveProgressAndStop();
    setActiveTaskId(null);
    setElapsedSeconds(0);
    setIsRunning(false);
    localStorage.removeItem('global_timer_state');
    localStorage.removeItem('global_timer_last_tick');
  };

  const resetTimer = () => {
    setElapsedSeconds(0);
  };

  return (
    <TimerContext.Provider value={{
      activeTaskId,
      elapsedSeconds,
      isRunning,
      startTimer,
      pauseTimer,
      resumeTimer,
      stopTimer,
      resetTimer
    }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
