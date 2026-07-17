"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timerRepository = exports.TimerRepository = void 0;
const timer_model_1 = require("../models/timer.model");
const base_repository_1 = require("./base.repository");
const mongoose_1 = require("mongoose");
class TimerRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(timer_model_1.Timer);
    }
    async findActiveByUserId(userId) {
        return this.model.findOne({ userId: new mongoose_1.Types.ObjectId(userId) }).exec();
    }
}
exports.TimerRepository = TimerRepository;
exports.timerRepository = new TimerRepository();
exports.default = exports.timerRepository;
//# sourceMappingURL=timer.repository.js.map