"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create(item) {
        return this.model.create(item);
    }
    async findById(id, projection, options) {
        return this.model.findById(id, projection, options).exec();
    }
    async findOne(filter, projection, options) {
        return this.model.findOne(filter, projection, options).exec();
    }
    async find(filter, projection, options) {
        return this.model.find(filter, projection, options).exec();
    }
    async update(id, update, options = { new: true }) {
        return this.model.findByIdAndUpdate(id, update, options).exec();
    }
    async updateOne(filter, update, options) {
        return this.model.updateOne(filter, update, options).exec();
    }
    async updateMany(filter, update, options) {
        return this.model.updateMany(filter, update, options).exec();
    }
    async delete(id, options) {
        return this.model.findByIdAndDelete(id, options).exec();
    }
    async deleteMany(filter) {
        return this.model.deleteMany(filter).exec();
    }
    async count(filter) {
        return this.model.countDocuments(filter).exec();
    }
}
exports.BaseRepository = BaseRepository;
exports.default = BaseRepository;
//# sourceMappingURL=base.repository.js.map