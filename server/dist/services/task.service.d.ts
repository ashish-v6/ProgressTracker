import { ITask } from '../interfaces/task.interface';
declare class TaskService {
    /**
     * Create a standard or recurring task template
     */
    createTask(userId: string, taskData: Partial<ITask>): Promise<ITask>;
    /**
     * Get single task details
     */
    getTaskById(userId: string, taskId: string): Promise<ITask>;
    /**
     * Update task details (and trigger streak recalculation if completed status flips)
     */
    updateTask(userId: string, taskId: string, updateData: Partial<ITask>): Promise<ITask>;
    /**
     * Delete a task (cascades deletes to concrete instances if this is a recurring template)
     */
    deleteTask(userId: string, taskId: string): Promise<void>;
    /**
     * Duplicate a task (clones values)
     */
    duplicateTask(userId: string, taskId: string): Promise<ITask>;
    /**
     * Bulk delete tasks
     */
    bulkDelete(userId: string, taskIds: string[]): Promise<void>;
    /**
     * Bulk complete tasks
     */
    bulkComplete(userId: string, taskIds: string[]): Promise<void>;
    /**
     * Search, filter, and paginate tasks
     */
    queryTasks(userId: string, filters: any, options: any): Promise<{
        tasks: ITask[];
        total: number;
        page: number;
        pages: number;
    }>;
    /**
     * Resolves and instantiates recurring templates for a specific date, returning all concrete tasks
     */
    resolveRecurringTasksForDate(userId: string, targetDate: Date): Promise<ITask[]>;
    /**
     * Resolves and returns tasks for a range of dates
     */
    resolveTasksForDateRange(userId: string, startDate: Date, endDate: Date): Promise<ITask[]>;
    /**
     * Helper to check if a recurring task template matches a given day
     */
    private doesTemplateMatchDate;
}
export declare const taskService: TaskService;
export default taskService;
