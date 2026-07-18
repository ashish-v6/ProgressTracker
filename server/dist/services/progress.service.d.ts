import { ITask } from '../interfaces/task.interface';
declare class ProgressService {
    /**
     * Helper to convert task actual hours and minutes to decimal hours
     */
    getActualHoursDecimal(task: ITask): number;
    /**
     * Helper to convert task target hours and minutes to decimal hours
     */
    getTargetHoursDecimal(task: ITask): number;
    /**
     * Calculate task completion rate percentages for custom tasks set
     */
    calculateCompletionRate(tasks: ITask[]): number;
    /**
     * Calculate category completion rates distribution
     */
    calculateCategoryCompletionRates(tasks: ITask[]): Record<string, {
        total: number;
        completed: number;
        rate: number;
    }>;
    /**
     * Calculate actual study hours and remaining target hours today
     */
    calculateHoursProgress(tasks: ITask[], dailyGoalHours?: number): {
        completedHours: number;
        targetHours: number;
        remainingHours: number;
        completionPercentage: number;
    };
    /**
     * Calculate average study metrics over a custom number of days
     */
    calculateStudyAverages(tasks: ITask[], daysCount: number): {
        averageDailyHours: number;
        averageWeeklyHours: number;
        averageMonthlyHours: number;
    };
}
export declare const progressService: ProgressService;
export default progressService;
