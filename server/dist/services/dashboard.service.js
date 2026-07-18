"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = void 0;
const mongoose_1 = require("mongoose");
const task_repository_1 = require("../repositories/task.repository");
const user_repository_1 = require("../repositories/user.repository");
const progress_service_1 = require("./progress.service");
const statistics_service_1 = require("./statistics.service");
const task_service_1 = require("./task.service");
const DEFAULT_SCORE_CONFIG = {
    completedTaskWeight: 0.4,
    completedHourWeight: 0.4,
    consistencyWeight: 0.2,
    priorityWeight: {
        high: 1.2,
        medium: 1.0,
        low: 0.8
    },
    missedTaskPenalty: 2,
    lateTaskPenalty: 1
};
class DashboardService {
    /**
     * Formatting local YYYY-MM-DD helper
     */
    formatLocalYYYYMMDD(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    /**
     * Recalculates user's streak by traversing daily completions backwards
     */
    async recalculateStreak(userId, clientLocalDateStr) {
        const localTodayStr = clientLocalDateStr || this.formatLocalYYYYMMDD(new Date());
        // Fetch all user tasks from the database sorted by dueDate
        const tasks = await task_repository_1.taskRepository.find({ createdBy: new mongoose_1.Types.ObjectId(userId) }, null, { sort: { dueDate: 1 } });
        if (tasks.length === 0) {
            return { streak: 0, longestStreak: 0 };
        }
        // Group tasks by local date string
        const dailyMap = {};
        tasks.forEach(t => {
            const dateKey = this.formatLocalYYYYMMDD(t.dueDate);
            if (!dailyMap[dateKey]) {
                dailyMap[dateKey] = { total: 0, completed: 0 };
            }
            dailyMap[dateKey].total++;
            if (t.completed) {
                dailyMap[dateKey].completed++;
            }
        });
        let currentStreak = 0;
        let checkDate = new Date(localTodayStr + 'T00:00:00.000Z');
        let isFirstDay = true;
        // Traverse backwards up to 365 days
        for (let i = 0; i < 365; i++) {
            const dateKey = this.formatLocalYYYYMMDD(checkDate);
            const dayData = dailyMap[dateKey];
            if (dayData) {
                if (dayData.completed > 0) {
                    currentStreak++;
                }
                else {
                    // If 0 tasks completed:
                    // Today: don't break the streak (the user might complete tasks later today)
                    // Other days: break the streak immediately
                    if (!isFirstDay) {
                        break;
                    }
                }
            }
            else {
                // If no tasks scheduled on this day, it's not a required day, so skip it (retains streak)
            }
            // Go to previous day
            checkDate.setDate(checkDate.getDate() - 1);
            isFirstDay = false;
        }
        // Update User streak doc
        const user = await user_repository_1.userRepository.findById(userId);
        let streak = currentStreak;
        let longestStreak = user?.longestStreak || 0;
        if (user) {
            longestStreak = Math.max(longestStreak, currentStreak);
            await user_repository_1.userRepository.update(userId, {
                streak,
                longestStreak
            });
        }
        return { streak, longestStreak };
    }
    /**
     * Generates a productivity score from 0 to 100 based on modular config weights
     */
    calculateProductivityScore(tasks, currentStreak, config = DEFAULT_SCORE_CONFIG) {
        if (tasks.length === 0)
            return 0;
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed);
        // 1. Task completion rate (weighted by priority)
        let totalPriorityPoints = 0;
        let completedPriorityPoints = 0;
        tasks.forEach(t => {
            const weight = config.priorityWeight[t.priority || 'medium'] || 1.0;
            totalPriorityPoints += weight;
            if (t.completed) {
                completedPriorityPoints += weight;
            }
        });
        const taskRate = totalPriorityPoints > 0
            ? (completedPriorityPoints / totalPriorityPoints) * 100
            : 0;
        // 2. Hour completion rate
        let targetHours = 0;
        let actualHours = 0;
        tasks.forEach(t => {
            targetHours += progress_service_1.progressService.getTargetHoursDecimal(t);
            actualHours += progress_service_1.progressService.getActualHoursDecimal(t);
        });
        const hourRate = targetHours > 0
            ? Math.min(100, (actualHours / targetHours) * 100)
            : 100;
        // 3. Consistency (streak bonus)
        const consistencyRate = Math.min(100, currentStreak * 5);
        // 4. Base weighted score
        let score = (taskRate * config.completedTaskWeight) +
            (hourRate * config.completedHourWeight) +
            (consistencyRate * config.consistencyWeight);
        // 5. Apply penalties
        const missedCount = total - completed.length;
        score -= (missedCount * config.missedTaskPenalty);
        // Bound output to 0-100 range
        return Math.max(0, Math.min(100, Math.round(score)));
    }
    /**
     * Gather complete aggregate dashboard overview metrics
     */
    async getDashboardSummary(userId, localDateStr) {
        const todayDate = new Date(localDateStr + 'T00:00:00.000Z');
        const startOfToday = new Date(todayDate.getTime());
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date(todayDate.getTime());
        endOfToday.setHours(23, 59, 59, 999);
        // Today's tasks (fully resolved/instantiated for recurring templates)
        const todayTasks = await task_service_1.taskService.resolveRecurringTasksForDate(userId, todayDate);
        // Recalculate streak
        const { streak, longestStreak } = await this.recalculateStreak(userId, localDateStr);
        // Averages and stats over last 30 days
        const thirtyDaysAgo = new Date(todayDate.getTime() - (29 * 24 * 60 * 60 * 1000));
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        const rangeStats = await statistics_service_1.statisticsService.getRangeStatistics(userId, thirtyDaysAgo, todayDate);
        const highlights = await statistics_service_1.statisticsService.getProductivityHighlights(userId);
        const score = this.calculateProductivityScore(todayTasks, streak);
        const hoursProgress = progress_service_1.progressService.calculateHoursProgress(todayTasks);
        return {
            today: {
                totalTasks: todayTasks.length,
                completedTasks: todayTasks.filter(t => t.completed).length,
                pendingTasks: todayTasks.filter(t => !t.completed).length,
                completionPercentage: todayTasks.length > 0
                    ? Math.round((todayTasks.filter(t => t.completed).length / todayTasks.length) * 100)
                    : 0,
                completedHours: hoursProgress.completedHours,
                targetHours: hoursProgress.targetHours,
                remainingHours: hoursProgress.remainingHours
            },
            stats30Days: {
                totalTasks: rangeStats.totalTasks,
                completedTasks: rangeStats.completedTasks,
                pendingTasks: rangeStats.pendingTasks,
                overdueTasks: rangeStats.overdueTasks,
                completionRate: rangeStats.completionRate,
                totalStudyHours: rangeStats.totalHours,
                averageDailyHours: rangeStats.averageDailyHours
            },
            streaks: {
                currentStreak: streak,
                longestStreak
            },
            productivityScore: score,
            highlights: {
                mostProductiveDay: highlights.mostProductiveDay,
                mostProductiveCategory: highlights.mostProductiveCategory
            }
        };
    }
}
exports.dashboardService = new DashboardService();
exports.default = exports.dashboardService;
//# sourceMappingURL=dashboard.service.js.map