import { taskService } from './task.service';
import { userRepository } from '../repositories/user.repository';
import { ITask } from '../interfaces/task.interface';

class AnalyticsService {
  /**
   * Helper to convert task actual hours and minutes to decimal hours
   */
  private getActualHoursDecimal(task: ITask): number {
    return task.actualHours + (task.actualMinutes / 60);
  }

  /**
   * Helper to convert task target hours and minutes to decimal hours
   */
  private getTargetHoursDecimal(task: ITask): number {
    return task.targetHours + (task.targetMinutes / 60);
  }

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
   * Fetch Dashboard Overview metrics
   */
  public async getDashboardData(userId: string): Promise<any> {
    const today = new Date();

    // 1. Resolve & Fetch Today's Tasks
    const todayTasks = await taskService.resolveRecurringTasksForDate(userId, today);
    const todayTotal = todayTasks.length;
    const todayCompleted = todayTasks.filter(t => t.completed).length;
    const todayPending = todayTotal - todayCompleted;
    const todayProgress = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

    // Today's Goal Progress (Actual Hours / Target Hours)
    let todayTargetHours = 0;
    let todayActualHours = 0;
    todayTasks.forEach(t => {
      todayTargetHours += this.getTargetHoursDecimal(t);
      todayActualHours += this.getActualHoursDecimal(t);
    });
    const goalProgress = todayTargetHours > 0 
      ? Math.round((todayActualHours / todayTargetHours) * 100) 
      : 0;

    // 2. Weekly Range (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const weeklyTasks = await taskService.resolveTasksForDateRange(userId, sevenDaysAgo, today);
    const weeklyTotal = weeklyTasks.length;
    const weeklyCompleted = weeklyTasks.filter(t => t.completed).length;
    const weeklyProgress = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;

    // 3. Monthly Range (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    const monthlyTasks = await taskService.resolveTasksForDateRange(userId, thirtyDaysAgo, today);
    const monthlyTotal = monthlyTasks.length;
    const monthlyCompleted = monthlyTasks.filter(t => t.completed).length;
    const monthlyProgress = monthlyTotal > 0 ? Math.round((monthlyCompleted / monthlyTotal) * 100) : 0;

    // 4. Lifetime Total Hours & Completed Tasks
    const allTasks = await taskService.queryTasks(userId, {}, { limit: 100000 });
    let totalHours = 0;
    let completedTasksCount = 0;
    let pendingTasksCount = 0;

    allTasks.tasks.forEach(t => {
      totalHours += this.getActualHoursDecimal(t);
      if (t.completed) {
        completedTasksCount++;
      } else {
        pendingTasksCount++;
      }
    });

    // 5. Streaks (from User Document)
    const user = await userRepository.findById(userId);
    const currentStreak = user?.streak || 0;
    const longestStreak = user?.longestStreak || 0;

    // 6. Productivity Score: weighted average of weekly completion rate and daily completion rate
    // Score = 60% of today's progress + 40% of weekly progress. If no tasks today, score is weekly progress.
    let productivityScore = weeklyProgress;
    if (todayTotal > 0) {
      productivityScore = Math.round((todayProgress * 0.6) + (weeklyProgress * 0.4));
    }

    return {
      todayProgress,
      weeklyProgress,
      monthlyProgress,
      totalHours: Number(totalHours.toFixed(2)),
      completedTasks: completedTasksCount,
      pendingTasks: pendingTasksCount,
      productivityScore,
      currentStreak,
      longestStreak,
      goalProgress
    };
  }

  /**
   * Fetch Analytics Charts and Performance breakdown
   */
  public async getAnalyticsData(userId: string): Promise<any> {
    const today = new Date();

    // 1. Weekly completion rates and hours spent (last 4 weeks, week by week)
    const weeklyBreakdown: any[] = [];
    for (let i = 3; i >= 0; i--) {
      const startOfWeek = new Date();
      startOfWeek.setDate(today.getDate() - (i * 7) - 6);
      startOfWeek.setHours(0,0,0,0);
      const endOfWeek = new Date();
      endOfWeek.setDate(today.getDate() - (i * 7));
      endOfWeek.setHours(23,59,59,999);

      const tasks = await taskService.resolveTasksForDateRange(userId, startOfWeek, endOfWeek);
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed).length;
      let hours = 0;
      tasks.forEach(t => hours += this.getActualHoursDecimal(t));

      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      weeklyBreakdown.push({
        label: `Week ${4 - i}`,
        completionRate: rate,
        hoursSpent: Number(hours.toFixed(2)),
        totalTasks: total,
        completedTasks: completed
      });
    }

    // 2. Daily completion and hours (last 7 days)
    const dailyBreakdown: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() - i);
      const start = new Date(targetDate.getTime());
      const tasks = await taskService.resolveRecurringTasksForDate(userId, start);
      
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed).length;
      let hours = 0;
      tasks.forEach(t => hours += this.getActualHoursDecimal(t));

      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      dailyBreakdown.push({
        date: this.formatLocalYYYYMMDD(targetDate),
        completionRate: rate,
        hoursSpent: Number(hours.toFixed(2)),
        totalTasks: total,
        completedTasks: completed
      });
    }

    // 3. Monthly breakdown (last 6 months)
    const monthlyBreakdown: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);

      const tasks = await taskService.resolveTasksForDateRange(userId, startOfMonth, endOfMonth);
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed).length;
      let hours = 0;
      tasks.forEach(t => hours += this.getActualHoursDecimal(t));

      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      monthlyBreakdown.push({
        month: startOfMonth.toLocaleString('default', { month: 'short' }),
        year: startOfMonth.getFullYear(),
        completionRate: rate,
        hoursSpent: Number(hours.toFixed(2))
      });
    }

    // 4. Yearly breakdown (last 1 year)
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31);
    const yearlyTasks = await taskService.resolveTasksForDateRange(userId, startOfYear, endOfYear);
    const yearlyTotal = yearlyTasks.length;
    const yearlyCompleted = yearlyTasks.filter(t => t.completed).length;
    let yearlyHours = 0;
    yearlyTasks.forEach(t => yearlyHours += this.getActualHoursDecimal(t));
    const yearlyRate = yearlyTotal > 0 ? Math.round((yearlyCompleted / yearlyTotal) * 100) : 0;

    // 5. Category Breakdown (all time)
    const allTasksRes = await taskService.queryTasks(userId, {}, { limit: 100000 });
    const allTasks = allTasksRes.tasks;

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
      categoryMap[cat].hours += this.getActualHoursDecimal(t);
    });

    const categoryBreakdown = Object.keys(categoryMap).map(name => ({
      category: name,
      totalTasks: categoryMap[name].total,
      completedTasks: categoryMap[name].completed,
      completionRate: categoryMap[name].total > 0 ? Math.round((categoryMap[name].completed / categoryMap[name].total) * 100) : 0,
      hoursSpent: Number(categoryMap[name].hours.toFixed(2))
    }));

    // 6. Averages over last 30 days
    const last30DaysTasks = await taskService.resolveTasksForDateRange(
      userId,
      new Date(today.getTime() - (29 * 24 * 60 * 60 * 1000)),
      today
    );
    let total30DayHours = 0;
    let total30DayCompleted = 0;
    last30DaysTasks.forEach(t => {
      total30DayHours += this.getActualHoursDecimal(t);
      if (t.completed) {
        total30DayCompleted++;
      }
    });

    const averageDailyHours = Number((total30DayHours / 30).toFixed(2));
    const averageCompletion = last30DaysTasks.length > 0 
      ? Math.round((total30DayCompleted / last30DaysTasks.length) * 100) 
      : 0;

    // 7. Heatmap data (completed tasks by date for last 365 days)
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 364);
    const yearTasks = await taskService.resolveTasksForDateRange(userId, oneYearAgo, today);

    const heatmapMap: Record<string, number> = {};
    yearTasks.forEach(t => {
      if (t.completed && t.completedAt) {
        const dateStr = this.formatLocalYYYYMMDD(new Date(t.completedAt));
        heatmapMap[dateStr] = (heatmapMap[dateStr] || 0) + 1;
      }
    });

    const heatmapData = Object.keys(heatmapMap).map(dateStr => ({
      date: dateStr,
      count: heatmapMap[dateStr]
    }));

    return {
      daily: dailyBreakdown,
      weekly: weeklyBreakdown,
      monthly: monthlyBreakdown,
      yearly: {
        totalTasks: yearlyTotal,
        completedTasks: yearlyCompleted,
        completionRate: yearlyRate,
        hoursSpent: Number(yearlyHours.toFixed(2))
      },
      categoryBreakdown,
      averageHours: averageDailyHours,
      averageCompletion,
      heatmapData
    };
  }

  /**
   * Fetch Calendar summaries
   */
  public async getCalendarData(userId: string, year: number, month: number): Promise<any> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0); // Last day of month

    // Resolve & retrieve all tasks for the month
    const tasks = await taskService.resolveTasksForDateRange(userId, startOfMonth, endOfMonth);

    // 1. Group tasks by specific day
    const dayMap: Record<string, { tasks: ITask[]; total: number; completed: number; hours: number }> = {};
    
    // Initialize day map for all days of the month
    const lastDay = endOfMonth.getDate();
    for (let day = 1; day <= lastDay; day++) {
      const dateStr = this.formatLocalYYYYMMDD(new Date(year, month - 1, day));
      dayMap[dateStr] = { tasks: [], total: 0, completed: 0, hours: 0 };
    }

    tasks.forEach(t => {
      const dateStr = this.formatLocalYYYYMMDD(t.dueDate);
      if (dayMap[dateStr]) {
        dayMap[dateStr].tasks.push(t);
        dayMap[dateStr].total++;
        if (t.completed) {
          dayMap[dateStr].completed++;
        }
        dayMap[dateStr].hours += this.getActualHoursDecimal(t);
      }
    });

    const monthlySummary = Object.keys(dayMap).map(dateStr => ({
      date: dateStr,
      totalTasks: dayMap[dateStr].total,
      completedTasks: dayMap[dateStr].completed,
      hoursSpent: Number(dayMap[dateStr].hours.toFixed(2))
    }));

    // 2. Year summary (monthly completion totals for target year)
    const yearSummary: any[] = [];
    for (let m = 1; m <= 12; m++) {
      const start = new Date(year, m - 1, 1);
      const end = new Date(year, m, 0);
      const monthTasks = await taskService.resolveTasksForDateRange(userId, start, end);
      
      const total = monthTasks.length;
      const completed = monthTasks.filter(t => t.completed).length;
      let hours = 0;
      monthTasks.forEach(t => hours += this.getActualHoursDecimal(t));

      yearSummary.push({
        month: m,
        monthName: start.toLocaleString('default', { month: 'short' }),
        totalTasks: total,
        completedTasks: completed,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        hoursSpent: Number(hours.toFixed(2))
      });
    }

    return {
      monthlySummary,
      yearSummary
    };
  }

  /**
   * Fetch full statistical analytics report
   */
  public async getStatistics(userId: string): Promise<any> {
    const allTasksRes = await taskService.queryTasks(userId, {}, { limit: 100000 });
    const allTasks = allTasksRes.tasks;

    if (allTasks.length === 0) {
      return {
        completionRate: 0,
        hoursPerCategory: [],
        averageDailyHours: 0,
        mostProductiveDay: 'None',
        mostProductiveCategory: 'None',
        currentStreak: 0,
        longestStreak: 0
      };
    }

    // 1. Completion Rate
    const completedTasks = allTasks.filter(t => t.completed);
    const completionRate = Math.round((completedTasks.length / allTasks.length) * 100);

    // 2. Hours per Category & Most Productive Category
    const categoryHoursMap: Record<string, number> = {};
    const categoryCompletionsMap: Record<string, number> = {};
    
    allTasks.forEach(t => {
      const cat = t.category || 'General';
      const hours = this.getActualHoursDecimal(t);
      categoryHoursMap[cat] = (categoryHoursMap[cat] || 0) + hours;
      if (t.completed) {
        categoryCompletionsMap[cat] = (categoryCompletionsMap[cat] || 0) + 1;
      }
    });

    const hoursPerCategory = Object.keys(categoryHoursMap).map(cat => ({
      category: cat,
      hours: Number(categoryHoursMap[cat].toFixed(2))
    }));

    let mostProductiveCategory = 'None';
    let maxCatCompletions = -1;
    Object.keys(categoryCompletionsMap).forEach(cat => {
      if (categoryCompletionsMap[cat] > maxCatCompletions) {
        maxCatCompletions = categoryCompletionsMap[cat];
        mostProductiveCategory = cat;
      }
    });

    // 3. Average Daily Hours
    // Get unique dates on which any tasks exist in database
    const uniqueDates = Array.from(new Set(allTasks.map(t => this.formatLocalYYYYMMDD(t.dueDate))));
    const totalDays = Math.max(1, uniqueDates.length);
    let totalHours = 0;
    allTasks.forEach(t => totalHours += this.getActualHoursDecimal(t));
    const averageDailyHours = Number((totalHours / totalDays).toFixed(2));

    // 4. Most Productive Day (Day of Week with highest total completions)
    const dayOfWeekCompletions: Record<string, number> = {
      'Sunday': 0, 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0, 'Friday': 0, 'Saturday': 0
    };
    const daysName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    completedTasks.forEach(t => {
      if (t.completedAt) {
        const dayName = daysName[new Date(t.completedAt).getDay()];
        dayOfWeekCompletions[dayName]++;
      }
    });

    let mostProductiveDay = 'None';
    let maxDayCompletions = -1;
    Object.keys(dayOfWeekCompletions).forEach(day => {
      if (dayOfWeekCompletions[day] > maxDayCompletions) {
        maxDayCompletions = dayOfWeekCompletions[day];
        mostProductiveDay = day;
      }
    });
    if (maxDayCompletions === 0) {
      mostProductiveDay = 'None';
    }

    // 5. Streaks from User Doc
    const user = await userRepository.findById(userId);

    return {
      completionRate,
      hoursPerCategory,
      averageDailyHours,
      mostProductiveDay,
      mostProductiveCategory,
      currentStreak: user?.streak || 0,
      longestStreak: user?.longestStreak || 0
    };
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
