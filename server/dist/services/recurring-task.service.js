"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recurringTaskService = void 0;
const mongoose_1 = require("mongoose");
const recurring_task_repository_1 = require("../repositories/recurring-task.repository");
const task_repository_1 = require("../repositories/task.repository");
const errors_1 = require("../utils/errors");
class RecurringTaskService {
    /**
     * Create a recurring task template
     */
    async createRecurringTask(userId, data) {
        const payload = {
            ...data,
            createdBy: new mongoose_1.Types.ObjectId(userId),
            status: 'active'
        };
        return recurring_task_repository_1.recurringTaskRepository.create(payload);
    }
    /**
     * Retrieve a recurring task template by ID
     */
    async getRecurringTaskById(userId, id) {
        const template = await recurring_task_repository_1.recurringTaskRepository.findById(id);
        if (!template || template.createdBy.toString() !== userId) {
            throw new errors_1.NotFoundError('Recurring task template not found');
        }
        return template;
    }
    /**
     * Update a recurring task template
     */
    async updateRecurringTask(userId, id, data) {
        const template = await this.getRecurringTaskById(userId, id);
        const updated = await recurring_task_repository_1.recurringTaskRepository.update(id, data);
        if (!updated) {
            throw new errors_1.NotFoundError('Recurring task template not found');
        }
        return updated;
    }
    /**
     * Delete a recurring task template
     * Business rule: Deleting a recurring template should NOT delete previously completed tasks.
     */
    async deleteRecurringTask(userId, id) {
        const template = await this.getRecurringTaskById(userId, id);
        // Delete the template
        await recurring_task_repository_1.recurringTaskRepository.delete(id);
        // Delete associated daily tasks that are NOT completed
        await task_repository_1.taskRepository.deleteMany({
            templateId: new mongoose_1.Types.ObjectId(id),
            completed: false
        });
    }
    /**
     * Pause a recurring task template
     * Business rule: Pausing a recurring task should stop future generation
     */
    async pauseRecurringTask(userId, id) {
        return this.updateRecurringTask(userId, id, { status: 'paused' });
    }
    /**
     * Resume a recurring task template
     * Business rule: Resuming should continue future generation
     */
    async resumeRecurringTask(userId, id) {
        return this.updateRecurringTask(userId, id, { status: 'active' });
    }
    /**
     * List all recurring tasks for a user
     */
    async listRecurringTasks(userId) {
        return recurring_task_repository_1.recurringTaskRepository.find({ createdBy: new mongoose_1.Types.ObjectId(userId) }, null, { sort: { createdAt: -1 } });
    }
    /**
     * Timezone-aware automatic task generation algorithm
     * Resolves, evaluates, and generates missing daily tasks for a user within a date range
     */
    async generateTasksForDateRange(userId, startDate, endDate) {
        const start = new Date(startDate.getTime());
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate.getTime());
        end.setHours(23, 59, 59, 999);
        // Only select active templates
        const templates = await recurring_task_repository_1.recurringTaskRepository.find({
            createdBy: new mongoose_1.Types.ObjectId(userId),
            status: 'active'
        });
        const checker = new Date(start.getTime());
        while (checker <= end) {
            const currentStart = new Date(checker.getTime());
            currentStart.setHours(0, 0, 0, 0);
            const currentEnd = new Date(checker.getTime());
            currentEnd.setHours(23, 59, 59, 999);
            for (const template of templates) {
                if (this.doesTemplateMatchDate(template, checker)) {
                    // Check if an instance (completed OR pending) has already been spawned for today
                    const existingTask = await task_repository_1.taskRepository.findOne({
                        templateId: template._id,
                        dueDate: { $gte: currentStart, $lte: currentEnd }
                    });
                    if (!existingTask) {
                        // Spawn the daily task
                        await task_repository_1.taskRepository.create({
                            title: template.title,
                            description: template.description || '',
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
                            dueDate: currentStart,
                            notes: template.notes || '',
                            tags: template.tags || [],
                            createdBy: template.createdBy,
                            templateId: template._id
                        });
                    }
                }
            }
            checker.setDate(checker.getDate() + 1);
        }
    }
    /**
     * Helper to check if a recurring task template falls on a given date
     */
    doesTemplateMatchDate(template, date) {
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday...
        const dayOfMonth = date.getDate(); // 1 to 31
        const rule = template.repeatRule;
        const days = template.repeatDays || [];
        // Do not generate tasks for dates before the template was created
        const templateCreatedDate = new Date(template.createdAt);
        templateCreatedDate.setHours(0, 0, 0, 0);
        const targetCheckDate = new Date(date.getTime());
        targetCheckDate.setHours(0, 0, 0, 0);
        if (targetCheckDate < templateCreatedDate) {
            return false;
        }
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
            return dayOfWeek === new Date(template.createdAt).getDay();
        }
        if (rule === 'monthly') {
            if (days.length > 0) {
                return days.includes(dayOfMonth);
            }
            return dayOfMonth === new Date(template.createdAt).getDate();
        }
        if (rule === 'custom') {
            return days.includes(dayOfWeek);
        }
        return false;
    }
}
exports.recurringTaskService = new RecurringTaskService();
exports.default = exports.recurringTaskService;
//# sourceMappingURL=recurring-task.service.js.map