"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTimerSchema = void 0;
const zod_1 = require("zod");
exports.startTimerSchema = zod_1.z.object({
    taskId: zod_1.z.string({
        required_error: 'Task ID is required'
    })
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Task ID format')
});
//# sourceMappingURL=timer.validator.js.map