"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatRecurringTaskResponse = void 0;
/**
 * Format recurring task mongoose model response into a clean DTO payload
 */
const formatRecurringTaskResponse = (task) => {
    return {
        id: task._id ? task._id.toString() : task.id,
        title: task.title,
        description: task.description || '',
        category: task.category,
        color: task.color,
        priority: task.priority,
        status: task.status,
        targetHours: task.targetHours,
        targetMinutes: task.targetMinutes,
        repeatRule: task.repeatRule,
        repeatDays: task.repeatDays || [],
        notes: task.notes || '',
        tags: task.tags || [],
        createdBy: task.createdBy.toString(),
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
    };
};
exports.formatRecurringTaskResponse = formatRecurringTaskResponse;
//# sourceMappingURL=recurring-task.dto.js.map