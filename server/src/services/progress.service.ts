import { ITask } from '../interfaces/task.interface';

class ProgressService {
  /**
   * Helper to convert task actual hours and minutes to decimal hours
   */
  public getActualHoursDecimal(task: ITask): number {
    return task.actualHours + (task.actualMinutes / 60);
  }

  /**
   * Helper to convert task target hours and minutes to decimal hours
   */
  public getTargetHoursDecimal(task: ITask): number {
    return task.targetHours + (task.targetMinutes / 60);
  }

  /**
   * Calculate task completion rate percentages for custom tasks set
   */
  public calculateCompletionRate(tasks: ITask[]): number {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  }

  /**
   * Calculate category completion rates distribution
   */
  public calculateCategoryCompletionRates(tasks: ITask[]): Record<string, { total: number; completed: number; rate: number }> {
    const categoryMap: Record<string, { total: number; completed: number; rate: number }> = {};
    
    tasks.forEach(t => {
      const cat = t.category || 'General';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { total: 0, completed: 0, rate: 0 };
      }
      categoryMap[cat].total++;
      if (t.completed) {
        categoryMap[cat].completed++;
      }
    });

    Object.keys(categoryMap).forEach(cat => {
      categoryMap[cat].rate = Math.round((categoryMap[cat].completed / categoryMap[cat].total) * 100);
    });

    return categoryMap;
  }

  /**
   * Calculate actual study hours and remaining target hours today
   */
  public calculateHoursProgress(tasks: ITask[], dailyGoalHours: number = 6): {
    completedHours: number;
    targetHours: number;
    remainingHours: number;
    completionPercentage: number;
  } {
    let target = 0;
    let actual = 0;

    tasks.forEach(t => {
      target += this.getTargetHoursDecimal(t);
      actual += this.getActualHoursDecimal(t);
    });

    // Use daily target preferences if no tasks have targets today
    const finalTarget = target > 0 ? target : dailyGoalHours;
    const remaining = Math.max(0, Number((finalTarget - actual).toFixed(2)));
    const completionPercentage = finalTarget > 0 ? Math.min(100, Math.round((actual / finalTarget) * 100)) : 0;

    return {
      completedHours: Number(actual.toFixed(2)),
      targetHours: Number(finalTarget.toFixed(2)),
      remainingHours: remaining,
      completionPercentage
    };
  }

  /**
   * Calculate average study metrics over a custom number of days
   */
  public calculateStudyAverages(tasks: ITask[], daysCount: number): {
    averageDailyHours: number;
    averageWeeklyHours: number;
    averageMonthlyHours: number;
  } {
    let totalHours = 0;
    tasks.forEach(t => totalHours += this.getActualHoursDecimal(t));

    const days = Math.max(1, daysCount);
    const averageDailyHours = Number((totalHours / days).toFixed(2));
    const averageWeeklyHours = Number((averageDailyHours * 7).toFixed(2));
    const averageMonthlyHours = Number((averageDailyHours * 30).toFixed(2));

    return {
      averageDailyHours,
      averageWeeklyHours,
      averageMonthlyHours
    };
  }
}

export const progressService = new ProgressService();
export default progressService;
