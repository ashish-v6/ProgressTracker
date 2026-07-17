import { ITask } from '../interfaces/task.interface';

export interface TaskResponseDto {
  id: string;
  title: string;
  description: string;
  category: string;
  color: string;
  priority: string;
  status: string;
  targetHours: number;
  targetMinutes: number;
  actualHours: number;
  actualMinutes: number;
  completed: boolean;
  repeatRule: string;
  repeatDays: number[];
  dueDate: Date;
  completedAt: Date | null;
  notes: string;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Maps Mongoose document items to clean JSON transfer formats
 */
export const formatTaskResponse = (task: ITask): TaskResponseDto => {
  return {
    id: task._id ? task._id.toString() : task.id,
    title: task.title,
    description: task.description || '',
    category: task.category,
    color: task.color || '#4F46E5',
    priority: task.priority,
    status: task.status,
    targetHours: task.targetHours,
    targetMinutes: task.targetMinutes,
    actualHours: task.actualHours,
    actualMinutes: task.actualMinutes,
    completed: task.completed,
    repeatRule: task.repeatRule,
    repeatDays: task.repeatDays || [],
    dueDate: task.dueDate,
    completedAt: task.completedAt || null,
    notes: task.notes || '',
    tags: task.tags || [],
    createdBy: task.createdBy.toString(),
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  };
};
