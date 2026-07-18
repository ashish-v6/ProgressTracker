import { IRecurringTask } from '../interfaces/recurring-task.interface';
declare class RecurringTaskService {
    /**
     * Create a recurring task template
     */
    createRecurringTask(userId: string, data: Partial<IRecurringTask>): Promise<IRecurringTask>;
    /**
     * Retrieve a recurring task template by ID
     */
    getRecurringTaskById(userId: string, id: string): Promise<IRecurringTask>;
    /**
     * Update a recurring task template
     */
    updateRecurringTask(userId: string, id: string, data: Partial<IRecurringTask>): Promise<IRecurringTask>;
    /**
     * Delete a recurring task template
     * Business rule: Deleting a recurring template should NOT delete previously completed tasks.
     */
    deleteRecurringTask(userId: string, id: string): Promise<void>;
    /**
     * Pause a recurring task template
     * Business rule: Pausing a recurring task should stop future generation
     */
    pauseRecurringTask(userId: string, id: string): Promise<IRecurringTask>;
    /**
     * Resume a recurring task template
     * Business rule: Resuming should continue future generation
     */
    resumeRecurringTask(userId: string, id: string): Promise<IRecurringTask>;
    /**
     * List all recurring tasks for a user
     */
    listRecurringTasks(userId: string): Promise<IRecurringTask[]>;
    /**
     * Timezone-aware automatic task generation algorithm
     * Resolves, evaluates, and generates missing daily tasks for a user within a date range
     */
    generateTasksForDateRange(userId: string, startDate: Date, endDate: Date): Promise<void>;
    /**
     * Helper to check if a recurring task template falls on a given date
     */
    private doesTemplateMatchDate;
}
export declare const recurringTaskService: RecurringTaskService;
export default recurringTaskService;
