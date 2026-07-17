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
export declare const formatRecurringTaskResponse: (task: IRecurringTask) => RecurringTaskResponseDto;
