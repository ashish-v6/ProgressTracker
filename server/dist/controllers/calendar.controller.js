"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTasksByDate = exports.getCalendar = void 0;
const analytics_service_1 = require("../services/analytics.service");
const task_service_1 = require("../services/task.service");
const async_handler_1 = require("../utils/async-handler");
const errors_1 = require("../utils/errors");
exports.getCalendar = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const today = new Date();
    // Default to current year and month if not provided
    const yearQuery = req.query.year;
    const monthQuery = req.query.month;
    const year = yearQuery ? parseInt(yearQuery, 10) : today.getFullYear();
    const month = monthQuery ? parseInt(monthQuery, 10) : today.getMonth() + 1; // 1-indexed
    if (isNaN(year) || year < 1000 || year > 9999) {
        throw new errors_1.ValidationError('Invalid year format. Must be a 4-digit number.');
    }
    if (isNaN(month) || month < 1 || month > 12) {
        throw new errors_1.ValidationError('Invalid month. Must be between 1 and 12.');
    }
    const calendarData = await analytics_service_1.analyticsService.getCalendarData(req.user.id, year, month);
    res.status(200).json({
        success: true,
        message: 'Calendar summaries retrieved successfully',
        data: calendarData
    });
});
exports.getTasksByDate = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const dateStr = req.query.date;
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        throw new errors_1.ValidationError('Date query param is required and must be in YYYY-MM-DD format.');
    }
    const targetDate = new Date(dateStr + 'T00:00:00.000Z');
    const startOfDay = new Date(targetDate.getTime());
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate.getTime());
    endOfDay.setHours(23, 59, 59, 999);
    // Resolve and query all tasks for the user on this date (including recurring tasks)
    const tasks = await task_service_1.taskService.resolveRecurringTasksForDate(req.user.id, targetDate);
    res.status(200).json({
        success: true,
        message: 'Tasks retrieved successfully',
        data: tasks.map(t => ({
            id: t.id,
            title: t.title,
            category: t.category,
            color: t.color,
            actualHours: t.actualHours,
            actualMinutes: t.actualMinutes,
            targetHours: t.targetHours,
            targetMinutes: t.targetMinutes,
            completed: t.completed,
            status: t.status
        }))
    });
});
//# sourceMappingURL=calendar.controller.js.map