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
export declare const formatTaskResponse: (task: ITask) => TaskResponseDto;
