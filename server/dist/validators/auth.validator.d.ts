import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    avatar: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodLiteral<"">]>>;
}, "strip", z.ZodTypeAny, {
    username: string;
    email: string;
    password: string;
    avatar?: string | undefined;
}, {
    username: string;
    email: string;
    password: string;
    avatar?: string | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
