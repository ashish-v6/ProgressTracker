declare class AnalyticsService {
    /**
     * Helper to convert task actual hours and minutes to decimal hours
     */
    private getActualHoursDecimal;
    /**
     * Helper to convert task target hours and minutes to decimal hours
     */
    private getTargetHoursDecimal;
    /**
     * Helper to format a local Date to YYYY-MM-DD
     */
    private formatLocalYYYYMMDD;
    /**
     * Fetch Dashboard Overview metrics
     */
    getDashboardData(userId: string): Promise<any>;
    /**
     * Fetch Analytics Charts and Performance breakdown
     */
    getAnalyticsData(userId: string): Promise<any>;
    /**
     * Fetch Calendar summaries
     */
    getCalendarData(userId: string, year: number, month: number): Promise<any>;
    /**
     * Fetch full statistical analytics report
     */
    getStatistics(userId: string): Promise<any>;
}
export declare const analyticsService: AnalyticsService;
export default analyticsService;
