import type { Category, ColorPreset } from '../types';

export const DEFAULT_COLORS: ColorPreset[] = [
  { id: 'violet', name: 'Violet', hex: '#8b5cf6', bgClass: 'bg-violet-500/10 border-violet-500/30 text-violet-400', textClass: 'text-violet-400' },
  { id: 'emerald', name: 'Emerald', hex: '#10b981', bgClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', textClass: 'text-emerald-400' },
  { id: 'amber', name: 'Amber', hex: '#f59e0b', bgClass: 'bg-amber-500/10 border-amber-500/30 text-amber-400', textClass: 'text-amber-400' },
  { id: 'rose', name: 'Rose', hex: '#f43f5e', bgClass: 'bg-rose-500/10 border-rose-500/30 text-rose-400', textClass: 'text-rose-400' },
  { id: 'cyan', name: 'Cyan', hex: '#06b6d4', bgClass: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400', textClass: 'text-cyan-400' },
  { id: 'fuchsia', name: 'Fuchsia', hex: '#d946ef', bgClass: 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400', textClass: 'text-fuchsia-400' },
  { id: 'indigo', name: 'Indigo', hex: '#6366f1', bgClass: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400', textClass: 'text-indigo-400' },
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'study', name: 'Study', color: 'violet' },
  { id: 'work', name: 'Work', color: 'emerald' },
  { id: 'fitness', name: 'Fitness', color: 'amber' },
  { id: 'health', name: 'Health', color: 'rose' },
  { id: 'personal', name: 'Personal', color: 'cyan' },
  { id: 'creative', name: 'Creative', color: 'fuchsia' },
];

export const REPEAT_RULES = [
  { value: 'none', label: 'Do not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays (Mon-Fri)' },
  { value: 'weekends', label: 'Weekends (Sat-Sun)' },
  { value: 'monday', label: 'Every Monday' },
  { value: 'tuesday', label: 'Every Tuesday' },
  { value: 'wednesday', label: 'Every Wednesday' },
  { value: 'thursday', label: 'Every Thursday' },
  { value: 'friday', label: 'Every Friday' },
  { value: 'saturday', label: 'Every Saturday' },
  { value: 'sunday', label: 'Every Sunday' },
  { value: 'custom', label: 'Custom days' },
];

export const PRIORITIES = [
  { value: 'low', label: 'Low Priority', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  { value: 'medium', label: 'Medium Priority', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  { value: 'high', label: 'High Priority', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
];
