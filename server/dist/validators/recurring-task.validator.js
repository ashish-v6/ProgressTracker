"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRecurringTaskSchema = exports.createRecurringTaskSchema = void 0;
const zod_1 = require("zod");
exports.createRecurringTaskSchema = zod_1.z.object({
    title: zod_1.z.string({
        required_error: 'Title is required'
    })
        .min(1, 'Title cannot be empty')
        .max(100, 'Title cannot exceed 100 characters')
        .trim(),
    description: zod_1.z.string().optional().default(''),
    category: zod_1.z.string({
        required_error: 'Category is required'
    }).trim(),
    color: zod_1.z.string({
        required_error: 'Color is required'
    }).trim(),
    priority: zod_1.z.enum(['low', 'medium', 'high']).optional().default('medium'),
    status: zod_1.z.enum(['active', 'paused']).optional().default('active'),
    targetHours: zod_1.z.number({
        required_error: 'Target hours is required'
    }).int().nonnegative('Target hours cannot be negative'),
    targetMinutes: zod_1.z.number({
        required_error: 'Target minutes is required'
    }).int().nonnegative().max(59, 'Target minutes must be between 0 and 59'),
    repeatRule: zod_1.z.enum(['daily', 'weekdays', 'weekends', 'weekly', 'monthly', 'custom'], {
        required_error: 'Repeat rule is required'
    }),
    repeatDays: zod_1.z.array(zod_1.z.number().int().min(0).max(31)).optional().default([]),
    notes: zod_1.z.string().optional().default(''),
    tags: zod_1.z.array(zod_1.z.string().trim()).optional().default([])
});
exports.updateRecurringTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title cannot be empty').max(100, 'Title cannot exceed 100 characters').trim().optional(),
    description: zod_1.z.string().optional(),
    category: zod_1.z.string().trim().optional(),
    color: zod_1.z.string().trim().optional(),
    priority: zod_1.z.enum(['low', 'medium', 'high']).optional(),
    status: zod_1.z.enum(['active', 'paused']).optional(),
    targetHours: zod_1.z.number().int().nonnegative('Target hours cannot be negative').optional(),
    targetMinutes: zod_1.z.number().int().nonnegative().max(59, 'Target minutes must be between 0 and 59').optional(),
    repeatRule: zod_1.z.enum(['daily', 'weekdays', 'weekends', 'weekly', 'monthly', 'custom']).optional(),
    repeatDays: zod_1.z.array(zod_1.z.number().int().min(0).max(31)).optional(),
    notes: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string().trim()).optional()
});
//# sourceMappingURL=recurring-task.validator.js.map