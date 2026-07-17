import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string({
    required_error: 'Task title is required'
  })
  .min(1, 'Task title cannot be empty')
  .max(100, 'Task title cannot exceed 100 characters')
  .trim(),

  description: z.string().optional().default(''),
  
  category: z.string({
    required_error: 'Category is required'
  }).trim(),
  
  color: z.string({
    required_error: 'Color is required'
  }).trim(),
  
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  
  status: z.enum(['pending', 'in_progress', 'completed']).optional().default('pending'),

  targetHours: z.number().int().nonnegative('Target hours must be non-negative').optional().default(0),
  
  targetMinutes: z.number().int().nonnegative().max(59, 'Target minutes must be between 0 and 59').optional().default(0),
  
  repeatRule: z.enum(['none', 'daily', 'weekdays', 'weekends', 'weekly', 'custom']).optional().default('none'),
  
  repeatDays: z.array(z.number().int().min(0).max(6)).optional().default([]),
  
  dueDate: z.string({
    required_error: 'Due date is required'
  })
  .datetime({ message: 'Due date must be a valid ISO-8601 datetime string' })
  .transform((val) => new Date(val)),

  notes: z.string().optional().default(''),
  
  tags: z.array(z.string().trim()).optional().default([])
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Task title cannot be empty').max(100, 'Task title cannot exceed 100 characters').trim().optional(),
  description: z.string().optional(),
  category: z.string().trim().optional(),
  color: z.string().trim().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  targetHours: z.number().int().nonnegative('Target hours must be non-negative').optional(),
  targetMinutes: z.number().int().nonnegative().max(59, 'Target minutes must be between 0 and 59').optional(),
  actualHours: z.number().int().nonnegative('Actual hours must be non-negative').optional(),
  actualMinutes: z.number().int().nonnegative().optional(),
  completed: z.boolean().optional(),
  repeatRule: z.enum(['none', 'daily', 'weekdays', 'weekends', 'weekly', 'custom']).optional(),
  repeatDays: z.array(z.number().int().min(0).max(6)).optional(),
  dueDate: z.string().datetime({ message: 'Due date must be a valid ISO-8601 string' }).transform((val) => new Date(val)).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string().trim()).optional()
});

export const queryTaskSchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10),
  completed: z.enum(['true', 'false']).optional().transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.string().optional(),
  dueDate: z.string().datetime().transform((val) => new Date(val)).optional(),
  startDate: z.string().datetime().transform((val) => new Date(val)).optional(),
  endDate: z.string().datetime().transform((val) => new Date(val)).optional(),
  tags: z.string().optional(), // Can match a single tag or comma-separated tags
  search: z.string().optional(),
  sortBy: z.string().optional().default('dueDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc')
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type QueryTaskInput = z.infer<typeof queryTaskSchema>;
