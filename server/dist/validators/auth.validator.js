"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    username: zod_1.z.string({
        required_error: 'Username is required'
    })
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username cannot exceed 30 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
        .trim(),
    email: zod_1.z.string({
        required_error: 'Email is required'
    })
        .email('Invalid email address format')
        .trim()
        .toLowerCase(),
    password: zod_1.z.string({
        required_error: 'Password is required'
    })
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password cannot exceed 100 characters'),
    avatar: zod_1.z.string().url('Avatar must be a valid URL').or(zod_1.z.literal('')).optional()
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string({
        required_error: 'Email is required'
    })
        .email('Invalid email address format')
        .trim()
        .toLowerCase(),
    password: zod_1.z.string({
        required_error: 'Password is required'
    })
});
//# sourceMappingURL=auth.validator.js.map