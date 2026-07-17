import { ITask } from '../interfaces/task.interface';
export interface ProductivityScoreConfig {
    completedTaskWeight: number;
    completedHourWeight: number;
    consistencyWeight: number;
    priorityWeight: {
        high: number;
        medium: number;
        low: number;
    };
    missedTaskPenalty: number;
    lateTaskPenalty: number;
}
declare class DashboardService {
    /**
     * Formatting local YYYY-MM-DD helper
     */
    private formatLocalYYYYMMDD;
    /**
     * Recalculates user's streak by traversing daily completions backwards
     */
    recalculateStreak(userId: string, clientLocalDateStr?: string): Promise<{
        streak: number;
        longestStreak: number;
    }>;
    /**
     * Generates a productivity score from 0 to 100 based on modular config weights
     */
    calculateProductivityScore(tasks: ITask[], currentStreak: number, config?: ProductivityScoreConfig): number;
    /**
     * Gather complete aggregate dashboard overview metrics
     */
    getDashboardSummary(userId: string, localDateStr: string): Promise<any>;
}
export declare const dashboardService: DashboardService;
export default dashboardService;
