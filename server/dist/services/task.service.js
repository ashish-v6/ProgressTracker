"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskService = void 0;
const task_repository_1 = require("../repositories/task.repository");
const streak_service_1 = require("./streak.service");
const errors_1 = require("../utils/errors");
const mongoose_1 = require("mongoose");
class TaskService {
    /**
     * Create a standard or recurring task template
     */
    async createTask(userId, taskData) {
        const data = {
            ...taskData,
            createdBy: new mongoose_1.Types.ObjectId(userId),
            completed: taskData.status === 'completed',
            completedAt: taskData.status === 'completed' ? new Date() : null,
            actualHours: 0,
            actualMinutes: 0
        };
        // Set repeatDays defaults based on rules if empty
        if (data.repeatRule && data.repeatRule !== 'none' && (!data.repeatDays || data.repeatDays.length === 0)) {
            if (data.repeatRule === 'weekdays') {
                data.repeatDays = [1, 2, 3, 4, 5];
            }
            else if (data.repeatRule === 'weekends') {
                data.repeatDays = [0, 6];
            }
            else if (data.repeatRule === 'daily') {
                data.repeatDays = [0, 1, 2, 3, 4, 5, 6];
            }
            else if (data.repeatRule === 'weekly' && data.dueDate) {
                data.repeatDays = [new Date(data.dueDate).getDay()];
            }
        }
        const task = await task_repository_1.taskRepository.create(data);
        // If template is created and matches today, instantly instantiate today's instance
        if (task.repeatRule !== 'none') {
            await this.resolveRecurringTasksForDate(userId, new Date());
        }
        return task;
    }
    /**
     * Get single task details
     */
    async getTaskById(userId, taskId) {
        const task = await task_repository_1.taskRepository.findById(taskId);
        if (!task || task.createdBy.toString() !== userId) {
            throw new errors_1.NotFoundError('Task not found');
        }
        return task;
    }
    /**
     * Update task details (and trigger streak recalculation if completed status flips)
     */
    async updateTask(userId, taskId, updateData) {
        const task = await task_repository_1.taskRepository.findById(taskId);
        if (!task || task.createdBy.toString() !== userId) {
            throw new errors_1.NotFoundError('Task not found');
        }
        // Determine if completed status changes (either via completed flag or status flag)
        const isCompleted = updateData.completed !== undefined
            ? updateData.completed
            : (updateData.status ? updateData.status === 'completed' : task.completed);
        const completionStatusFlipped = isCompleted !== task.completed;
        if (completionStatusFlipped) {
            updateData.completed = isCompleted;
            updateData.status = isCompleted ? 'completed' : 'pending';
            updateData.completedAt = isCompleted ? new Date() : null;
        }
        else if (updateData.status && updateData.status !== task.status) {
            // Status changed but didn't flip completed flag (e.g. pending -> in_progress)
            updateData.completed = updateData.status === 'completed';
            updateData.completedAt = updateData.status === 'completed' ? new Date() : null;
        }
        const updatedTask = await task_repository_1.taskRepository.update(taskId, updateData);
        if (!updatedTask) {
            throw new errors_1.NotFoundError('Task not found');
        }
        if (completionStatusFlipped) {
            await streak_service_1.streakService.recalculateStreak(userId);
        }
        return updatedTask;
    }
    /**
     * Delete a task (cascades deletes to concrete instances if this is a recurring template)
     */
    async deleteTask(userId, taskId) {
        const task = await task_repository_1.taskRepository.findById(taskId);
        if (!task || task.createdBy.toString() !== userId) {
            throw new errors_1.NotFoundError('Task not found');
        }
        // Delete the task itself
        await task_repository_1.taskRepository.delete(taskId);
        // If it was a recurring template, delete all associated concrete instances
        if (task.repeatRule !== 'none' && !task.templateId) {
            await task_repository_1.taskRepository.deleteMany({ templateId: task._id });
        }
        await streak_service_1.streakService.recalculateStreak(userId);
    }
    /**
     * Duplicate a task (clones values)
     */
    async duplicateTask(userId, taskId) {
        const task = await task_repository_1.taskRepository.findById(taskId);
        if (!task || task.createdBy.toString() !== userId) {
            throw new errors_1.NotFoundError('Task not found');
        }
        const cloneData = {
            title: `${task.title} (Copy)`,
            description: task.description,
            category: task.category,
            color: task.color,
            priority: task.priority,
            status: 'pending',
            targetHours: task.targetHours,
            targetMinutes: task.targetMinutes,
            actualHours: 0,
            actualMinutes: 0,
            completed: false,
            completedAt: null,
            repeatRule: 'none',
            repeatDays: [],
            dueDate: task.dueDate,
            notes: task.notes,
            tags: task.tags,
            createdBy: new mongoose_1.Types.ObjectId(userId)
        };
        return task_repository_1.taskRepository.create(cloneData);
    }
    /**
     * Bulk delete tasks
     */
    async bulkDelete(userId, taskIds) {
        const objectIds = taskIds.map(id => new mongoose_1.Types.ObjectId(id));
        await task_repository_1.taskRepository.deleteMany({
            _id: { $in: objectIds },
            createdBy: new mongoose_1.Types.ObjectId(userId)
        });
        await streak_service_1.streakService.recalculateStreak(userId);
    }
    /**
     * Bulk complete tasks
     */
    async bulkComplete(userId, taskIds) {
        const objectIds = taskIds.map(id => new mongoose_1.Types.ObjectId(id));
        await task_repository_1.taskRepository.updateOne({
            _id: { $in: objectIds },
            createdBy: new mongoose_1.Types.ObjectId(userId)
        }, {
            $set: {
                status: 'completed',
                completed: true,
                completedAt: new Date()
            }
        }, { multi: true });
        await streak_service_1.streakService.recalculateStreak(userId);
    }
    /**
     * Search, filter, and paginate tasks
     */
    async queryTasks(userId, filters, options) {
        return task_repository_1.taskRepository.findTasks(userId, filters, options);
    }
    /**
     * Resolves and instantiates recurring templates for a specific date, returning all concrete tasks
     */
    async resolveRecurringTasksForDate(userId, targetDate) {
        const startOfDay = new Date(targetDate.getTime());
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate.getTime());
        endOfDay.setHours(23, 59, 59, 999);
        // 1. Get templates
        const templates = await task_repository_1.taskRepository.findRecurringTemplates(userId);
        // 2. Loop templates and check if they match the date
        for (const template of templates) {
            if (new Date(template.createdAt) > endOfDay) {
                continue;
            }
            if (this.doesTemplateMatchDate(template, targetDate)) {
                const instance = await task_repository_1.taskRepository.findInstanceByTemplateAndDate(template.id, startOfDay, endOfDay);
                if (!instance) {
                    await task_repository_1.taskRepository.create({
                        title: template.title,
                        description: template.description,
                        category: template.category,
                        color: template.color,
                        priority: template.priority,
                        status: 'pending',
                        targetHours: template.targetHours,
                        targetMinutes: template.targetMinutes,
                        actualHours: 0,
                        actualMinutes: 0,
                        completed: false,
                        repeatRule: 'none',
                        dueDate: startOfDay,
                        notes: template.notes,
                        tags: template.tags,
                        createdBy: template.createdBy,
                        templateId: template._id
                    });
                }
            }
        }
        const result = await task_repository_1.taskRepository.find({
            createdBy: userId,
            dueDate: { $gte: startOfDay, $lte: endOfDay },
            repeatRule: 'none'
        }, null, { sort: { createdAt: 1 } });
        return result;
    }
    /**
     * Resolves and returns tasks for a range of dates
     */
    async resolveTasksForDateRange(userId, startDate, endDate) {
        const start = new Date(startDate.getTime());
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate.getTime());
        end.setHours(23, 59, 59, 999);
        const checker = new Date(start.getTime());
        while (checker <= end) {
            await this.resolveRecurringTasksForDate(userId, checker);
            checker.setDate(checker.getDate() + 1);
        }
        return task_repository_1.taskRepository.find({
            createdBy: userId,
            dueDate: { $gte: start, $lte: end },
            repeatRule: 'none'
        }, null, { sort: { dueDate: 1, createdAt: 1 } });
    }
    /**
     * Helper to check if a recurring task template matches a given day
     */
    doesTemplateMatchDate(template, date) {
        const dayOfWeek = date.getDay();
        const rule = template.repeatRule;
        const days = template.repeatDays || [];
        if (rule === 'daily') {
            return true;
        }
        if (rule === 'weekdays') {
            return dayOfWeek >= 1 && dayOfWeek <= 5;
        }
        if (rule === 'weekends') {
            return dayOfWeek === 0 || dayOfWeek === 6;
        }
        if (rule === 'weekly') {
            if (days.length > 0) {
                return days.includes(dayOfWeek);
            }
            return dayOfWeek === new Date(template.dueDate).getDay();
        }
        if (rule === 'custom') {
            return days.includes(dayOfWeek);
        }
        return false;
    }
}
exports.taskService = new TaskService();
exports.default = exports.taskService;
//# sourceMappingURL=task.service.js.map