"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpcomingTasks = exports.getTodayTasks = exports.listTasks = exports.bulkComplete = exports.bulkDelete = exports.markIncomplete = exports.markComplete = exports.duplicateTask = exports.deleteTask = exports.updateTask = exports.getTask = exports.createTask = void 0;
const task_service_1 = require("../services/task.service");
const async_handler_1 = require("../utils/async-handler");
const errors_1 = require("../utils/errors");
const task_dto_1 = require("../dtos/task.dto");
exports.createTask = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const task = await task_service_1.taskService.createTask(req.user.id, req.body);
    res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: (0, task_dto_1.formatTaskResponse)(task)
    });
});
exports.getTask = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const task = await task_service_1.taskService.getTaskById(req.user.id, req.params.id);
    res.status(200).json({
        success: true,
        message: 'Task retrieved successfully',
        data: (0, task_dto_1.formatTaskResponse)(task)
    });
});
exports.updateTask = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const task = await task_service_1.taskService.updateTask(req.user.id, req.params.id, req.body);
    res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: (0, task_dto_1.formatTaskResponse)(task)
    });
});
exports.deleteTask = (0, async_handler_1.asyncHandler)(async (req, res) => {
    await task_service_1.taskService.deleteTask(req.user.id, req.params.id);
    res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
        data: null
    });
});
exports.duplicateTask = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const duplicated = await task_service_1.taskService.duplicateTask(req.user.id, req.params.id);
    res.status(201).json({
        success: true,
        message: 'Task duplicated successfully',
        data: (0, task_dto_1.formatTaskResponse)(duplicated)
    });
});
exports.markComplete = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const task = await task_service_1.taskService.updateTask(req.user.id, req.params.id, { status: 'completed' });
    res.status(200).json({
        success: true,
        message: 'Task marked as completed',
        data: (0, task_dto_1.formatTaskResponse)(task)
    });
});
exports.markIncomplete = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const task = await task_service_1.taskService.updateTask(req.user.id, req.params.id, { status: 'pending' });
    res.status(200).json({
        success: true,
        message: 'Task marked as incomplete',
        data: (0, task_dto_1.formatTaskResponse)(task)
    });
});
exports.bulkDelete = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new errors_1.ValidationError('Task IDs array must be provided');
    }
    await task_service_1.taskService.bulkDelete(req.user.id, ids);
    res.status(200).json({
        success: true,
        message: 'Tasks bulk deleted successfully',
        data: null
    });
});
exports.bulkComplete = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new errors_1.ValidationError('Task IDs array must be provided');
    }
    await task_service_1.taskService.bulkComplete(req.user.id, ids);
    res.status(200).json({
        success: true,
        message: 'Tasks bulk completed successfully',
        data: null
    });
});
exports.listTasks = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { page, limit, sortBy, sortOrder, ...filters } = req.query;
    const result = await task_service_1.taskService.queryTasks(req.user.id, filters, { page, limit, sortBy, sortOrder });
    res.status(200).json({
        success: true,
        message: 'Tasks retrieved successfully',
        data: {
            tasks: result.tasks.map(t => (0, task_dto_1.formatTaskResponse)(t)),
            total: result.total,
            page: result.page,
            pages: result.pages
        }
    });
});
exports.getTodayTasks = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const localDateStr = req.query.localDate || new Date().toISOString().split('T')[0];
    const targetDate = new Date(localDateStr + 'T00:00:00.000Z');
    const startOfDay = new Date(targetDate.getTime());
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate.getTime());
    endOfDay.setHours(23, 59, 59, 999);
    // 1. Generate and resolve recurring tasks for today (from both template systems)
    const tasks = await task_service_1.taskService.resolveRecurringTasksForDate(req.user.id, targetDate);
    res.status(200).json({
        success: true,
        message: "Today's tasks resolved successfully",
        data: tasks.map(t => (0, task_dto_1.formatTaskResponse)(t))
    });
});
exports.getUpcomingTasks = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const limitDaysStr = req.query.limitDays;
    const limitDays = limitDaysStr ? parseInt(limitDaysStr, 10) : 7;
    if (isNaN(limitDays) || limitDays <= 0) {
        throw new errors_1.ValidationError('Limit days must be a positive number');
    }
    const localDateStr = req.query.localDate || new Date().toISOString().split('T')[0];
    const startDate = new Date(localDateStr + 'T00:00:00.000Z');
    const endDate = new Date(startDate.getTime());
    endDate.setDate(endDate.getDate() + limitDays);
    const startOfDay = new Date(startDate.getTime());
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(endDate.getTime());
    endOfDay.setHours(23, 59, 59, 999);
    // 1. Generate and resolve recurring tasks for this range (from both template systems)
    const tasks = await task_service_1.taskService.resolveTasksForDateRange(req.user.id, startOfDay, endOfDay);
    res.status(200).json({
        success: true,
        message: `Upcoming tasks for the next ${limitDays} days retrieved successfully`,
        data: tasks.map(t => (0, task_dto_1.formatTaskResponse)(t))
    });
});
//# sourceMappingURL=task.controller.js.map