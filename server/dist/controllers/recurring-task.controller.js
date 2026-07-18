"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRecurringTasks = exports.resumeRecurringTask = exports.pauseRecurringTask = exports.deleteRecurringTask = exports.updateRecurringTask = exports.getRecurringTask = exports.createRecurringTask = void 0;
const recurring_task_service_1 = require("../services/recurring-task.service");
const async_handler_1 = require("../utils/async-handler");
const recurring_task_dto_1 = require("../dtos/recurring-task.dto");
exports.createRecurringTask = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const template = await recurring_task_service_1.recurringTaskService.createRecurringTask(req.user.id, req.body);
    res.status(201).json({
        success: true,
        message: 'Recurring task template created successfully',
        data: (0, recurring_task_dto_1.formatRecurringTaskResponse)(template)
    });
});
exports.getRecurringTask = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const template = await recurring_task_service_1.recurringTaskService.getRecurringTaskById(req.user.id, req.params.id);
    res.status(200).json({
        success: true,
        message: 'Recurring task template retrieved successfully',
        data: (0, recurring_task_dto_1.formatRecurringTaskResponse)(template)
    });
});
exports.updateRecurringTask = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const template = await recurring_task_service_1.recurringTaskService.updateRecurringTask(req.user.id, req.params.id, req.body);
    res.status(200).json({
        success: true,
        message: 'Recurring task template updated successfully',
        data: (0, recurring_task_dto_1.formatRecurringTaskResponse)(template)
    });
});
exports.deleteRecurringTask = (0, async_handler_1.asyncHandler)(async (req, res) => {
    await recurring_task_service_1.recurringTaskService.deleteRecurringTask(req.user.id, req.params.id);
    res.status(200).json({
        success: true,
        message: 'Recurring task template and uncompleted instances deleted successfully',
        data: null
    });
});
exports.pauseRecurringTask = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const template = await recurring_task_service_1.recurringTaskService.pauseRecurringTask(req.user.id, req.params.id);
    res.status(200).json({
        success: true,
        message: 'Recurring task template paused successfully',
        data: (0, recurring_task_dto_1.formatRecurringTaskResponse)(template)
    });
});
exports.resumeRecurringTask = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const template = await recurring_task_service_1.recurringTaskService.resumeRecurringTask(req.user.id, req.params.id);
    res.status(200).json({
        success: true,
        message: 'Recurring task template resumed successfully',
        data: (0, recurring_task_dto_1.formatRecurringTaskResponse)(template)
    });
});
exports.listRecurringTasks = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const templates = await recurring_task_service_1.recurringTaskService.listRecurringTasks(req.user.id);
    res.status(200).json({
        success: true,
        message: 'Recurring task templates retrieved successfully',
        data: templates.map(t => (0, recurring_task_dto_1.formatRecurringTaskResponse)(t))
    });
});
//# sourceMappingURL=recurring-task.controller.js.map