import { ITask } from '../interfaces/task.interface';
import { BaseRepository } from './base.repository';
export declare class TaskRepository extends BaseRepository<ITask> {
    constructor();
    /**
     * Search, filter, paginate, and sort tasks for a specific user
     */
    findTasks(userId: string, filters: {
        completed?: boolean;
        status?: string;
        priority?: string;
        category?: string;
        dueDate?: Date;
        startDate?: Date;
        endDate?: Date;
        tags?: string;
        search?: string;
        repeatRule?: string;
        templateId?: string | null;
    }, options: {
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        tasks: ITask[];
        total: number;
        page: number;
        pages: number;
    }>;
    /**
     * Find all active recurring task templates for a user
     */
    findRecurringTemplates(userId: string): Promise<ITask[]>;
    /**
     * Find concrete instances generated from a specific template for a particular due date
     */
    findInstanceByTemplateAndDate(templateId: string, startOfDay: Date, endOfDay: Date): Promise<ITask | null>;
}
export declare const taskRepository: TaskRepository;
export default taskRepository;
