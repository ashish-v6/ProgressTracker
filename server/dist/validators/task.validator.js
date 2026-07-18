"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryTaskSchema = exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string({
        required_error: 'Task title is required'
    })
        .min(1, 'Task title cannot be empty')
        .max(100, 'Task title cannot exceed 100 characters')
        .trim(),
    description: zod_1.z.string().optional().default(''),
    category: zod_1.z.string({
        required_error: 'Category is required'
    }).trim(),
    color: zod_1.z.string({
        required_error: 'Color is required'
    }).trim(),
    priority: zod_1.z.enum(['low', 'medium', 'high']).optional().default('medium'),
    status: zod_1.z.enum(['pending', 'in_progress', 'completed']).optional().default('pending'),
    targetHours: zod_1.z.number().int().nonnegative('Target hours must be non-negative').optional().default(0),
    targetMinutes: zod_1.z.number().int().nonnegative().max(59, 'Target minutes must be between 0 and 59').optional().default(0),
    repeatRule: zod_1.z.enum(['none', 'daily', 'weekdays', 'weekends', 'weekly', 'custom']).optional().default('none'),
    repeatDays: zod_1.z.array(zod_1.z.number().int().min(0).max(6)).optional().default([]),
    dueDate: zod_1.z.string({
        required_error: 'Due date is required'
    })
        .datetime({ message: 'Due date must be a valid ISO-8601 datetime string' })
        .transform((val) => new Date(val)),
    notes: zod_1.z.string().optional().default(''),
    tags: zod_1.z.array(zod_1.z.string().trim()).optional().default([])
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Task title cannot be empty').max(100, 'Task title cannot exceed 100 characters').trim().optional(),
    description: zod_1.z.string().optional(),
    category: zod_1.z.string().trim().optional(),
    color: zod_1.z.string().trim().optional(),
    priority: zod_1.z.enum(['low', 'medium', 'high']).optional(),
    status: zod_1.z.enum(['pending', 'in_progress', 'completed']).optional(),
    targetHours: zod_1.z.number().int().nonnegative('Target hours must be non-negative').optional(),
    targetMinutes: zod_1.z.number().int().nonnegative().max(59, 'Target minutes must be between 0 and 59').optional(),
    actualHours: zod_1.z.number().int().nonnegative('Actual hours must be non-negative').optional(),
    actualMinutes: zod_1.z.number().int().nonnegative().optional(),
    completed: zod_1.z.boolean().optional(),
    repeatRule: zod_1.z.enum(['none', 'daily', 'weekdays', 'weekends', 'weekly', 'custom']).optional(),
    repeatDays: zod_1.z.array(zod_1.z.number().int().min(0).max(6)).optional(),
    dueDate: zod_1.z.string().datetime({ message: 'Due date must be a valid ISO-8601 string' }).transform((val) => new Date(val)).optional(),
    notes: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string().trim()).optional()
});
exports.queryTaskSchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
    limit: zod_1.z.string().optional().transform((val) => val ? parseInt(val, 10) : 10),
    completed: zod_1.z.enum(['true', 'false']).optional().transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
    status: zod_1.z.enum(['pending', 'in_progress', 'completed']).optional(),
    priority: zod_1.z.enum(['low', 'medium', 'high']).optional(),
    category: zod_1.z.string().optional(),
    dueDate: zod_1.z.string().datetime().transform((val) => new Date(val)).optional(),
    startDate: zod_1.z.string().datetime().transform((val) => new Date(val)).optional(),
    endDate: zod_1.z.string().datetime().transform((val) => new Date(val)).optional(),
    tags: zod_1.z.string().optional(), // Can match a single tag or comma-separated tags
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z.string().optional().default('dueDate'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('asc')
});
//# sourceMappingURL=task.validator.js.map