export type Priority = 'low' | 'medium' | 'high';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export type RepeatRule =
  | 'none'
  | 'daily'
  | 'weekdays'
  | 'weekends'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'
  | 'custom';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string; // Category ID or name
  color: string;    // CSS/Tailwind Color class or hex code
  priority: Priority;
  targetHours: number;
  actualHours: number;
  actualMinutes: number;
  status: TaskStatus;
  repeatRule: RepeatRule;
  customRepeatDays?: number[]; // Array of weekday indices [0..6] (0 = Sunday)
  notes: string;
  tags?: string[];
  dueDate: string;       // Format: YYYY-MM-DD
  createdDate: string;   // ISO String
  completedDate: string | null; // ISO String or null
}

export interface Category {
  id: string;
  name: string;
  color: string; // tailwind color class prefix (e.g. 'purple', 'emerald') or hex
}

export interface ColorPreset {
  id: string;
  name: string;
  hex: string;
  bgClass: string;
  textClass: string;
}

export interface UserPreferences {
  workingHourGoal: number; // daily goal in hours
  notificationsEnabled: boolean;
  theme: 'dark' | 'light';
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  streak: number;
  longestStreak: number;
  totalStudyHours: number;
  preferences: UserPreferences;
}

export interface TimerState {
  taskId: string | null;
  elapsedSeconds: number;
  isRunning: boolean;
}

export interface ProductivitySummary {
  date: string; // YYYY-MM-DD
  score: number; // 0 - 100
  totalHours: number;
  tasksCompleted: number;
}

export interface RecurringTask {
  id: string;
  title: string;
  description: string;
  category: string;
  color: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'paused';
  targetHours: number;
  targetMinutes: number;
  repeatRule: 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'monthly' | 'custom';
  customRepeatDays: number[];
  notes: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
