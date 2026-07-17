import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Task, Category, ColorPreset } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_COLORS } from '../constants';
import { formatDateKey } from '../services/mockData';
import { useAuth } from './AuthContext';
import { taskService } from '../services/taskService';

interface AppContextType {
  tasks: Task[];
  categories: Category[];
  colors: ColorPreset[];
  addTask: (taskData: Omit<Task, 'id' | 'createdDate' | 'completedDate'>) => void;
  updateTask: (updatedTask: Task) => void;
  deleteTask: (id: string) => void;
  duplicateTask: (id: string) => void;
  addCategory: (name: string, color: string) => void;
  deleteCategory: (id: string) => void;
  importDatabase: (jsonString: string) => boolean;
  exportDatabase: () => string;
  refreshRecurringTasks: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { updateProfile, user, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors] = useState<ColorPreset[]>(DEFAULT_COLORS);

  // Initialize database categories
  useEffect(() => {
    const savedCategories = localStorage.getItem('task_categories');
    let loadedCategories: Category[] = DEFAULT_CATEGORIES;
    if (savedCategories) {
      loadedCategories = JSON.parse(savedCategories);
      setCategories(loadedCategories);
    } else {
      localStorage.setItem('task_categories', JSON.stringify(DEFAULT_CATEGORIES));
      setCategories(DEFAULT_CATEGORIES);
    }
  }, []);

  // Fetch tasks from server when authenticated
  const fetchTasks = async () => {
    try {
      const result = await taskService.listTasks({ limit: 10000 });
      setTasks(result.tasks);
      recalculateStreakAndHours(result.tasks);
    } catch (e) {
      console.error('Failed to fetch tasks from server:', e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [isAuthenticated]);

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    recalculateStreakAndHours(newTasks);
  };

  const recalculateStreakAndHours = (taskList: Task[]) => {
    // Calculate total hours
    const totalHours = taskList.reduce((acc, t) => acc + t.actualHours + (t.actualMinutes / 60), 0);
    
    // Calculate streak
    let activeDays = new Set<string>();
    taskList.forEach(t => {
      if (t.status === 'completed' && t.completedDate) {
        activeDays.add(t.dueDate);
      }
    });

    const todayStr = formatDateKey(new Date());
    let currentStreak = 0;
    const checkDate = new Date();
    
    while (true) {
      const key = formatDateKey(checkDate);
      if (activeDays.has(key)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If checkDate is today, check if yesterday was active
        if (key === todayStr) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayKey = formatDateKey(checkDate);
          if (activeDays.has(yesterdayKey)) {
            currentStreak = 1;
            checkDate.setDate(checkDate.getDate() - 1);
            while (activeDays.has(formatDateKey(checkDate))) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
            }
          }
        }
        break;
      }
    }

    // Longest streak
    let longestStreak = user?.longestStreak || 0;
    let runningStreak = 0;
    const sortedDates = Array.from(activeDays).sort();
    
    if (sortedDates.length > 0) {
      let lastDate = new Date(sortedDates[0]);
      runningStreak = 1;
      let localLongest = 1;
      
      for (let j = 1; j < sortedDates.length; j++) {
        const currentDate = new Date(sortedDates[j]);
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          runningStreak++;
        } else if (diffDays > 1) {
          runningStreak = 1;
        }
        
        if (runningStreak > localLongest) {
          localLongest = runningStreak;
        }
        lastDate = currentDate;
      }
      longestStreak = Math.max(longestStreak, localLongest);
    }

    updateProfile({
      streak: currentStreak,
      longestStreak,
      totalStudyHours: Math.round(totalHours * 10) / 10
    });
  };

  const refreshRecurringTasks = () => {
    // Resolved dynamically on backend queries
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'createdDate' | 'completedDate'>) => {
    try {
      const created = await taskService.createTask(taskData);
      const list = [...tasks, created];
      saveTasks(list);
    } catch (e) {
      console.error('Failed to create task:', e);
    }
  };

  const updateTask = async (updatedTask: Task) => {
    try {
      const updated = await taskService.updateTask(updatedTask.id, updatedTask);
      const list = tasks.map(t => t.id === updated.id ? updated : t);
      saveTasks(list);
    } catch (e) {
      console.error('Failed to update task:', e);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      const list = tasks.filter(t => t.id !== id);
      saveTasks(list);
    } catch (e) {
      console.error('Failed to delete task:', e);
    }
  };

  const duplicateTask = async (id: string) => {
    try {
      const duplicated = await taskService.duplicateTask(id);
      const list = [...tasks, duplicated];
      saveTasks(list);
    } catch (e) {
      console.error('Failed to duplicate task:', e);
    }
  };

  const addCategory = (name: string, color: string) => {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    if (categories.some(c => c.id === id)) return;
    
    const newCategory: Category = { id, name, color };
    const updated = [...categories, newCategory];
    setCategories(updated);
    localStorage.setItem('task_categories', JSON.stringify(updated));
  };

  const deleteCategory = (id: string) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    localStorage.setItem('task_categories', JSON.stringify(updated));
  };

  const exportDatabase = (): string => {
    const data = {
      tasks,
      categories,
      user
    };
    return JSON.stringify(data, null, 2);
  };

  const importDatabase = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.tasks && Array.isArray(parsed.tasks) && parsed.categories && Array.isArray(parsed.categories)) {
        setTasks(parsed.tasks);
        setCategories(parsed.categories);
        localStorage.setItem('task_list', JSON.stringify(parsed.tasks));
        localStorage.setItem('task_categories', JSON.stringify(parsed.categories));
        
        if (parsed.user) {
          updateProfile(parsed.user);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      tasks,
      categories,
      colors,
      addTask,
      updateTask,
      deleteTask,
      duplicateTask,
      addCategory,
      deleteCategory,
      importDatabase,
      exportDatabase,
      refreshRecurringTasks
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
