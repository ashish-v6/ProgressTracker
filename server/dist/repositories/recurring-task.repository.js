"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recurringTaskRepository = void 0;
const recurring_task_model_1 = require("../models/recurring-task.model");
class RecurringTaskRepository {
    async create(data) {
        return recurring_task_model_1.RecurringTask.create(data);
    }
    async findById(id) {
        return recurring_task_model_1.RecurringTask.findById(id);
    }
    async findOne(query) {
        return recurring_task_model_1.RecurringTask.findOne(query);
    }
    async find(query, projection, options) {
        return recurring_task_model_1.RecurringTask.find(query, projection, options);
    }
    async update(id, data) {
        return recurring_task_model_1.RecurringTask.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }
    async updateOne(query, data, options) {
        return recurring_task_model_1.RecurringTask.updateOne(query, data, options);
    }
    async delete(id) {
        return recurring_task_model_1.RecurringTask.findByIdAndDelete(id);
    }
    async deleteMany(query) {
        return recurring_task_model_1.RecurringTask.deleteMany(query);
    }
}
exports.recurringTaskRepository = new RecurringTaskRepository();
exports.default = exports.recurringTaskRepository;
//# sourceMappingURL=recurring-task.repository.js.map