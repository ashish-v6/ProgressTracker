import { Types } from 'mongoose';
import { taskRepository } from '../repositories/task.repository';
import { progressService } from './progress.service';
import { taskService } from './task.service';
import { ITask } from '../interfaces/task.interface';

class StatisticsService {
  /**
   * Helper to format a local Date to YYYY-MM-DD
   */
  private formatLocalYYYYMMDD(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Calculate statistics for a user within a custom date range
   */
  public async getRangeStatistics(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    completionRate: number;
    totalHours: number;
    averageDailyHours: number;
  }> {
    const start = new Date(startDate.getTime());
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate.getTime());
    end.setHours(23, 59, 59, 999);

    // Resolve and fetch tasks in range (fully instantiated for recurring templates)
    const tasks = await taskService.resolveTasksForDateRange(userId, start, end);

    // Overdue tasks: due before today and not completed
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const overdueTasksCount = await taskRepository.find({
      createdBy: new Types.ObjectId(userId),
      dueDate: { $lt: todayStart },
      completed: false
    });

    const completed = tasks.filter(t => t.completed).length;
    const totalHours = tasks.reduce((sum, t) => sum + progressService.getActualHoursDecimal(t), 0);

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const daysCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    return {
      totalTasks: tasks.length,
      completedTasks: completed,
      pendingTasks: tasks.length - completed,
      overdueTasks: overdueTasksCount.length,
      completionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
      totalHours: Number(totalHours.toFixed(2)),
      averageDailyHours: Number((totalHours / daysCount).toFixed(2))
    };
  }

  /**
   * Calculate category statistics breakdown (all-time)
   */
  public async getCategoryStatistics(userId: string): Promise<any[]> {
    const allTasks = await taskRepository.find({
      createdBy: new Types.ObjectId(userId)
    });

    const categoryMap: Record<string, { total: number; completed: number; hours: number }> = {};
    allTasks.forEach(t => {
      const cat = t.category || 'General';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { total: 0, completed: 0, hours: 0 };
      }
      categoryMap[cat].total++;
      if (t.completed) {
        categoryMap[cat].completed++;
      }
      categoryMap[cat].hours += progressService.getActualHoursDecimal(t);
    });

    return Object.keys(categoryMap).map(name => ({
      category: name,
      totalTasks: categoryMap[name].total,
      completedTasks: categoryMap[name].completed,
      completionRate: categoryMap[name].total > 0 ? Math.round((categoryMap[name].completed / categoryMap[name].total) * 100) : 0,
      hoursSpent: Number(categoryMap[name].hours.toFixed(2))
    }));
  }

  /**
   * Identifies the most productive category and weekday based on completions
   */
  public async getProductivityHighlights(userId: string): Promise<{
    mostProductiveDay: string;
    mostProductiveCategory: string;
  }> {
    const allTasks = await taskRepository.find({
      createdBy: new Types.ObjectId(userId)
    });

    if (allTasks.length === 0) {
      return { mostProductiveDay: 'None', mostProductiveCategory: 'None' };
    }

    const completed = allTasks.filter(t => t.completed);
    
    // 1. Most Productive Day of the week
    const dayOfWeekCompletions: Record<string, number> = {
      'Sunday': 0, 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0, 'Friday': 0, 'Saturday': 0
    };
    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    completed.forEach(t => {
      if (t.completedAt) {
        const name = weekdayNames[new Date(t.completedAt).getDay()];
        dayOfWeekCompletions[name]++;
      }
    });

    let mostProductiveDay = 'None';
    let maxCompletionsDay = -1;
    Object.keys(dayOfWeekCompletions).forEach(day => {
      if (dayOfWeekCompletions[day] > maxCompletionsDay) {
        maxCompletionsDay = dayOfWeekCompletions[day];
        mostProductiveDay = day;
      }
    });
    if (maxCompletionsDay === 0) mostProductiveDay = 'None';

    // 2. Most Productive Category
    const categoryCompletions: Record<string, number> = {};
    completed.forEach(t => {
      const cat = t.category || 'General';
      categoryCompletions[cat] = (categoryCompletions[cat] || 0) + 1;
    });

    let mostProductiveCategory = 'None';
    let maxCompletionsCat = -1;
    Object.keys(categoryCompletions).forEach(cat => {
      if (categoryCompletions[cat] > maxCompletionsCat) {
        maxCompletionsCat = categoryCompletions[cat];
        mostProductiveCategory = cat;
      }
    });

    return {
      mostProductiveDay,
      mostProductiveCategory
    };
  }

  /**
   * Get calendar activity heatmap (completed tasks by date for last 365 days)
   */
  public async getProductivityHeatmap(userId: string): Promise<any[]> {
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 364);
    oneYearAgo.setHours(0, 0, 0, 0);

    const tasks = await taskRepository.find({
      createdBy: new Types.ObjectId(userId),
      dueDate: { $gte: oneYearAgo }
    });

    const heatmapMap: Record<string, number> = {};
    tasks.forEach(t => {
      if (t.completed && t.completedAt) {
        const dateStr = this.formatLocalYYYYMMDD(new Date(t.completedAt));
        heatmapMap[dateStr] = (heatmapMap[dateStr] || 0) + 1;
      }
    });

    return Object.keys(heatmapMap).map(dateStr => ({
      date: dateStr,
      count: heatmapMap[dateStr]
    }));
  }
}

export const statisticsService = new StatisticsService();
export default statisticsService;
