export interface DashboardSummaryDto {
  today: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    completionPercentage: number;
    completedHours: number;
    targetHours: number;
    remainingHours: number;
  };
  stats30Days: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    completionRate: number;
    totalStudyHours: number;
    averageDailyHours: number;
  };
  streaks: {
    currentStreak: number;
    longestStreak: number;
  };
  productivityScore: number;
  highlights: {
    mostProductiveDay: string;
    mostProductiveCategory: string;
  };
}

export interface StreakDto {
  currentStreak: number;
  longestStreak: number;
}

export interface ProductivityScoreDto {
  productivityScore: number;
}

export interface RangeStatisticsDto {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  totalHours: number;
  averageDailyHours: number;
}
