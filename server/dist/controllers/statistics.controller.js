"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryStats = exports.getYearlyStats = exports.getMonthlyStats = exports.getWeeklyStats = exports.getTodayStats = void 0;
const statistics_service_1 = require("../services/statistics.service");
const async_handler_1 = require("../utils/async-handler");
exports.getTodayStats = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const localDateStr = req.query.localDate || new Date().toISOString().split('T')[0];
    const date = new Date(localDateStr + 'T00:00:00.000Z');
    const start = new Date(date.getTime());
    start.setHours(0, 0, 0, 0);
    const end = new Date(date.getTime());
    end.setHours(23, 59, 59, 999);
    const stats = await statistics_service_1.statisticsService.getRangeStatistics(req.user.id, start, end);
    res.status(200).json({
        success: true,
        message: "Today's statistics retrieved successfully",
        data: stats
    });
});
exports.getWeeklyStats = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const localDateStr = req.query.localDate || new Date().toISOString().split('T')[0];
    const date = new Date(localDateStr + 'T00:00:00.000Z');
    const start = new Date(date.getTime());
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date.getTime());
    end.setHours(23, 59, 59, 999);
    const stats = await statistics_service_1.statisticsService.getRangeStatistics(req.user.id, start, end);
    res.status(200).json({
        success: true,
        message: 'Weekly statistics retrieved successfully',
        data: stats
    });
});
exports.getMonthlyStats = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const localDateStr = req.query.localDate || new Date().toISOString().split('T')[0];
    const date = new Date(localDateStr + 'T00:00:00.000Z');
    const start = new Date(date.getTime());
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date.getTime());
    end.setHours(23, 59, 59, 999);
    const stats = await statistics_service_1.statisticsService.getRangeStatistics(req.user.id, start, end);
    res.status(200).json({
        success: true,
        message: 'Monthly statistics retrieved successfully',
        data: stats
    });
});
exports.getYearlyStats = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const localDateStr = req.query.localDate || new Date().toISOString().split('T')[0];
    const date = new Date(localDateStr + 'T00:00:00.000Z');
    const start = new Date(date.getTime());
    start.setDate(start.getDate() - 364);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date.getTime());
    end.setHours(23, 59, 59, 999);
    const stats = await statistics_service_1.statisticsService.getRangeStatistics(req.user.id, start, end);
    res.status(200).json({
        success: true,
        message: 'Yearly statistics retrieved successfully',
        data: stats
    });
});
exports.getCategoryStats = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const stats = await statistics_service_1.statisticsService.getCategoryStatistics(req.user.id);
    res.status(200).json({
        success: true,
        message: 'Category statistics retrieved successfully',
        data: stats
    });
});
//# sourceMappingURL=statistics.controller.js.map