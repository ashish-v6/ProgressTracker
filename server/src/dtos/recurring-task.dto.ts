import { IRecurringTask } from '../interfaces/recurring-task.interface';

export interface RecurringTaskResponseDto {
  id: string;
  title: string;
  description: string;
  category: string;
  color: string;
  priority: string;
  status: string;
  targetHours: number;
  targetMinutes: number;
  repeatRule: string;
  repeatDays: number[];
  notes: string;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Format recurring task mongoose model response into a clean DTO payload
 */
export const formatRecurringTaskResponse = (task: IRecurringTask): RecurringTaskResponseDto => {
  return {
    id: task._id ? task._id.toString() : task.id,
    title: task.title,
    description: task.description || '',
    category: task.category,
    color: task.color,
    priority: task.priority,
    status: task.status,
    targetHours: task.targetHours,
    targetMinutes: task.targetMinutes,
    repeatRule: task.repeatRule,
    repeatDays: task.repeatDays || [],
    notes: task.notes || '',
    tags: task.tags || [],
    createdBy: task.createdBy.toString(),
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  };
};
