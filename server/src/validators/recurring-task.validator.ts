import { z } from 'zod';

export const createRecurringTaskSchema = z.object({
  title: z.string({
    required_error: 'Title is required'
  })
  .min(1, 'Title cannot be empty')
  .max(100, 'Title cannot exceed 100 characters')
  .trim(),

  description: z.string().optional().default(''),
  
  category: z.string({
    required_error: 'Category is required'
  }).trim(),
  
  color: z.string({
    required_error: 'Color is required'
  }).trim(),
  
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  
  status: z.enum(['active', 'paused']).optional().default('active'),

  targetHours: z.number({
    required_error: 'Target hours is required'
  }).int().nonnegative('Target hours cannot be negative'),
  
  targetMinutes: z.number({
    required_error: 'Target minutes is required'
  }).int().nonnegative().max(59, 'Target minutes must be between 0 and 59'),
  
  repeatRule: z.enum(['daily', 'weekdays', 'weekends', 'weekly', 'monthly', 'custom'], {
    required_error: 'Repeat rule is required'
  }),
  
  repeatDays: z.array(z.number().int().min(0).max(31)).optional().default([]),
  
  notes: z.string().optional().default(''),
  
  tags: z.array(z.string().trim()).optional().default([])
});

export const updateRecurringTaskSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(100, 'Title cannot exceed 100 characters').trim().optional(),
  description: z.string().optional(),
  category: z.string().trim().optional(),
  color: z.string().trim().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['active', 'paused']).optional(),
  targetHours: z.number().int().nonnegative('Target hours cannot be negative').optional(),
  targetMinutes: z.number().int().nonnegative().max(59, 'Target minutes must be between 0 and 59').optional(),
  repeatRule: z.enum(['daily', 'weekdays', 'weekends', 'weekly', 'monthly', 'custom']).optional(),
  repeatDays: z.array(z.number().int().min(0).max(31)).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string().trim()).optional()
});

export type CreateRecurringTaskInput = z.infer<typeof createRecurringTaskSchema>;
export type UpdateRecurringTaskInput = z.infer<typeof updateRecurringTaskSchema>;
