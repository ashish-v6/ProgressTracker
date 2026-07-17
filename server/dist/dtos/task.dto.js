"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTaskResponse = void 0;
/**
 * Maps Mongoose document items to clean JSON transfer formats
 */
const formatTaskResponse = (task) => {
    return {
        id: task._id ? task._id.toString() : task.id,
        title: task.title,
        description: task.description || '',
        category: task.category,
        color: task.color || '#4F46E5',
        priority: task.priority,
        status: task.status,
        targetHours: task.targetHours,
        targetMinutes: task.targetMinutes,
        actualHours: task.actualHours,
        actualMinutes: task.actualMinutes,
        completed: task.completed,
        repeatRule: task.repeatRule,
        repeatDays: task.repeatDays || [],
        dueDate: task.dueDate,
        completedAt: task.completedAt || null,
        notes: task.notes || '',
        tags: task.tags || [],
        createdBy: task.createdBy.toString(),
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
    };
};
exports.formatTaskResponse = formatTaskResponse;
//# sourceMappingURL=task.dto.js.map