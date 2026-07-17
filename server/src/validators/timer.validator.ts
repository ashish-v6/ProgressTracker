import { z } from 'zod';

export const startTimerSchema = z.object({
  taskId: z.string({
    required_error: 'Task ID is required'
  })
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Task ID format')
});

export type StartTimerInput = z.infer<typeof startTimerSchema>;
