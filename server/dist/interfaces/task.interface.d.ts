import { Document, Types } from 'mongoose';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskRepeatRule = 'none' | 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'custom';
export interface ITask extends Document {
    title: string;
    description?: string;
    category: string;
    color?: string;
    priority: TaskPriority;
    status: TaskStatus;
    targetHours: number;
    targetMinutes: number;
    actualHours: number;
    actualMinutes: number;
    completed: boolean;
    repeatRule: TaskRepeatRule;
    repeatDays?: number[];
    dueDate: Date;
    completedAt?: Date | null;
    notes?: string;
    tags?: string[];
    createdBy: Types.ObjectId;
    templateId?: Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}
export default ITask;
