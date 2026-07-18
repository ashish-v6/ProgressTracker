declare class StatisticsService {
    /**
     * Helper to format a local Date to YYYY-MM-DD
     */
    private formatLocalYYYYMMDD;
    /**
     * Calculate statistics for a user within a custom date range
     */
    getRangeStatistics(userId: string, startDate: Date, endDate: Date): Promise<{
        totalTasks: number;
        completedTasks: number;
        pendingTasks: number;
        overdueTasks: number;
        completionRate: number;
        totalHours: number;
        averageDailyHours: number;
    }>;
    /**
     * Calculate category statistics breakdown (all-time)
     */
    getCategoryStatistics(userId: string): Promise<any[]>;
    /**
     * Identifies the most productive category and weekday based on completions
     */
    getProductivityHighlights(userId: string): Promise<{
        mostProductiveDay: string;
        mostProductiveCategory: string;
    }>;
    /**
     * Get calendar activity heatmap (completed tasks by date for last 365 days)
     */
    getProductivityHeatmap(userId: string): Promise<any[]>;
}
export declare const statisticsService: StatisticsService;
export default statisticsService;
