import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string({
    required_error: 'Username is required'
  })
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username cannot exceed 30 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
  .trim(),
  
  email: z.string({
    required_error: 'Email is required'
  })
  .email('Invalid email address format')
  .trim()
  .toLowerCase(),
  
  password: z.string({
    required_error: 'Password is required'
  })
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password cannot exceed 100 characters'),

  avatar: z.string().url('Avatar must be a valid URL').or(z.literal('')).optional()
});

export const loginSchema = z.object({
  email: z.string({
    required_error: 'Email is required'
  })
  .email('Invalid email address format')
  .trim()
  .toLowerCase(),
  
  password: z.string({
    required_error: 'Password is required'
  })
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
