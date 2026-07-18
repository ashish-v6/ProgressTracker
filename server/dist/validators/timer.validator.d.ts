import { z } from 'zod';
export declare const startTimerSchema: z.ZodObject<{
    taskId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    taskId: string;
}, {
    taskId: string;
}>;
export type StartTimerInput = z.infer<typeof startTimerSchema>;
