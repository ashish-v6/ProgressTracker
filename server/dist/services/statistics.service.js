"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statisticsService = void 0;
const mongoose_1 = require("mongoose");
const task_repository_1 = require("../repositories/task.repository");
const progress_service_1 = require("./progress.service");
class StatisticsService {
    /**
     * Helper to format a local Date to YYYY-MM-DD
     */
    formatLocalYYYYMMDD(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    /**
     * Calculate statistics for a user within a custom date range
     */
    async getRangeStatistics(userId, startDate, endDate) {
        const start = new Date(startDate.getTime());
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate.getTime());
        end.setHours(23, 59, 59, 999);
        // Fetch tasks in range
        const tasks = await task_repository_1.taskRepository.find({
            createdBy: new mongoose_1.Types.ObjectId(userId),
            dueDate: { $gte: start, $lte: end }
        });
        // Overdue tasks: due before today and not completed
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const overdueTasksCount = await task_repository_1.taskRepository.find({
            createdBy: new mongoose_1.Types.ObjectId(userId),
            dueDate: { $lt: todayStart },
            completed: false
        });
        const completed = tasks.filter(t => t.completed).length;
        const totalHours = tasks.reduce((sum, t) => sum + progress_service_1.progressService.getActualHoursDecimal(t), 0);
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
    async getCategoryStatistics(userId) {
        const allTasks = await task_repository_1.taskRepository.find({
            createdBy: new mongoose_1.Types.ObjectId(userId)
        });
        const categoryMap = {};
        allTasks.forEach(t => {
            const cat = t.category || 'General';
            if (!categoryMap[cat]) {
                categoryMap[cat] = { total: 0, completed: 0, hours: 0 };
            }
            categoryMap[cat].total++;
            if (t.completed) {
                categoryMap[cat].completed++;
            }
            categoryMap[cat].hours += progress_service_1.progressService.getActualHoursDecimal(t);
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
    async getProductivityHighlights(userId) {
        const allTasks = await task_repository_1.taskRepository.find({
            createdBy: new mongoose_1.Types.ObjectId(userId)
        });
        if (allTasks.length === 0) {
            return { mostProductiveDay: 'None', mostProductiveCategory: 'None' };
        }
        const completed = allTasks.filter(t => t.completed);
        // 1. Most Productive Day of the week
        const dayOfWeekCompletions = {
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
        if (maxCompletionsDay === 0)
            mostProductiveDay = 'None';
        // 2. Most Productive Category
        const categoryCompletions = {};
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
    async getProductivityHeatmap(userId) {
        const oneYearAgo = new Date();
        oneYearAgo.setDate(oneYearAgo.getDate() - 364);
        oneYearAgo.setHours(0, 0, 0, 0);
        const tasks = await task_repository_1.taskRepository.find({
            createdBy: new mongoose_1.Types.ObjectId(userId),
            dueDate: { $gte: oneYearAgo }
        });
        const heatmapMap = {};
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
exports.statisticsService = new StatisticsService();
exports.default = exports.statisticsService;
//# sourceMappingURL=statistics.service.js.map