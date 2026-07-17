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
    repeatDays?: number[];
    notes?: string;
    tags?: string[];
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export default IRecurringTask;
