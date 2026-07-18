"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskRepository = exports.TaskRepository = void 0;
const mongoose_1 = require("mongoose");
const task_model_1 = require("../models/task.model");
const base_repository_1 = require("./base.repository");
class TaskRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(task_model_1.Task);
    }
    /**
     * Search, filter, paginate, and sort tasks for a specific user
     */
    async findTasks(userId, filters, options) {
        const query = { createdBy: new mongoose_1.Types.ObjectId(userId) };
        // Completion filter
        if (filters.completed !== undefined) {
            query.completed = filters.completed;
        }
        // Status filter
        if (filters.status) {
            query.status = filters.status;
        }
        // Priority filter
        if (filters.priority) {
            query.priority = filters.priority;
        }
        // Category filter
        if (filters.category) {
            query.category = filters.category;
        }
        // Exact due date filter (ignores time)
        if (filters.dueDate) {
            const start = new Date(filters.dueDate.getTime());
            start.setHours(0, 0, 0, 0);
            const end = new Date(filters.dueDate.getTime());
            end.setHours(23, 59, 59, 999);
            query.dueDate = { $gte: start, $lte: end };
        }
        // Date range filter
        else if (filters.startDate || filters.endDate) {
            query.dueDate = {};
            if (filters.startDate) {
                query.dueDate.$gte = filters.startDate;
            }
            if (filters.endDate) {
                query.dueDate.$lte = filters.endDate;
            }
        }
        // Tags list filter
        if (filters.tags) {
            const tagsList = filters.tags.split(',').map(t => t.trim()).filter(Boolean);
            if (tagsList.length > 0) {
                query.tags = { $in: tagsList };
            }
        }
        // Search query (regex on title or description)
        if (filters.search) {
            query.$or = [
                { title: { $regex: filters.search, $options: 'i' } },
                { description: { $regex: filters.search, $options: 'i' } }
            ];
        }
        // Repeat rule filter
        if (filters.repeatRule) {
            query.repeatRule = filters.repeatRule;
        }
        else {
            // By default, exclude recurring templates from task lists
            query.repeatRule = 'none';
        }
        // Template ID filter
        if (filters.templateId !== undefined) {
            query.templateId = filters.templateId ? new mongoose_1.Types.ObjectId(filters.templateId) : null;
        }
        // Pagination defaults
        const page = Math.max(1, options.page || 1);
        const limit = Math.max(1, options.limit || 10);
        const skip = (page - 1) * limit;
        // Sorting
        const sortBy = options.sortBy || 'dueDate';
        const sortOrder = options.sortOrder === 'desc' ? -1 : 1;
        const sort = { [sortBy]: sortOrder };
        const total = await this.count(query);
        const tasks = await this.model
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec();
        return {
            tasks,
            total,
            page,
            pages: Math.ceil(total / limit)
        };
    }
    /**
     * Find all active recurring task templates for a user
     */
    async findRecurringTemplates(userId) {
        return this.model
            .find({
            createdBy: new mongoose_1.Types.ObjectId(userId),
            repeatRule: { $ne: 'none' },
            templateId: null // A template itself cannot be an instance
        })
            .exec();
    }
    /**
     * Find concrete instances generated from a specific template for a particular due date
     */
    async findInstanceByTemplateAndDate(templateId, startOfDay, endOfDay) {
        return this.model
            .findOne({
            templateId: new mongoose_1.Types.ObjectId(templateId),
            dueDate: { $gte: startOfDay, $lte: endOfDay }
        })
            .exec();
    }
}
exports.TaskRepository = TaskRepository;
exports.taskRepository = new TaskRepository();
exports.default = exports.taskRepository;
//# sourceMappingURL=task.repository.js.map