declare class StreakService {
    /**
     * Recalculates current and longest streaks for a user based on completed tasks
     */
    recalculateStreak(userId: string): Promise<{
        currentStreak: number;
        longestStreak: number;
    }>;
}
export declare const streakService: StreakService;
export default streakService;
