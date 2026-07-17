import { Document, Types } from 'mongoose';

export type RecurringTaskPriority = 'low' | 'medium' | 'high';
export type RecurringTaskStatus = 'active' | 'paused';
export type RecurringTaskRepeatRule = 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'monthly' | 'custom';

export interface IRecurringTask extends Document {
  title: string;
  description?: string;
  category: string;
  color: string;
  priority: RecurringTaskPriority;
  status: RecurringTaskStatus;
  targetHours: number;
  targetMinutes: number;
  repeatRule: RecurringTaskRepeatRule;
  repeatDays?: number[]; // Array of weekday numbers: 0 (Sunday) to 6 (Saturday) or day numbers (1-31 for monthly)
  notes?: string;
  tags?: string[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
export default IRecurringTask;
