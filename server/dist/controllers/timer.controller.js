"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimerStatus = exports.stopTimer = exports.resumeTimer = exports.pauseTimer = exports.startTimer = void 0;
const timer_service_1 = require("../services/timer.service");
const async_handler_1 = require("../utils/async-handler");
exports.startTimer = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { taskId } = req.body;
    const timer = await timer_service_1.timerService.startTimer(req.user.id, taskId);
    res.status(201).json({
        success: true,
        message: 'Timer started successfully',
        data: timer
    });
});
exports.pauseTimer = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const timer = await timer_service_1.timerService.pauseTimer(req.user.id);
    res.status(200).json({
        success: true,
        message: 'Timer paused successfully',
        data: timer
    });
});
exports.resumeTimer = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const timer = await timer_service_1.timerService.resumeTimer(req.user.id);
    res.status(200).json({
        success: true,
        message: 'Timer resumed successfully',
        data: timer
    });
});
exports.stopTimer = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const result = await timer_service_1.timerService.stopTimer(req.user.id);
    res.status(200).json({
        success: true,
        message: 'Timer stopped and duration logged successfully',
        data: result
    });
});
exports.getTimerStatus = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const status = await timer_service_1.timerService.getTimerStatus(req.user.id);
    res.status(200).json({
        success: true,
        message: 'Timer status retrieved successfully',
        data: status
    });
});
//# sourceMappingURL=timer.controller.js.map