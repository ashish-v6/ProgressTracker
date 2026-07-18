"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoalSummary = exports.getProductivityScore = exports.getStreakData = exports.getDashboard = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const async_handler_1 = require("../utils/async-handler");
exports.getDashboard = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const localDateStr = req.query.localDate || new Date().toISOString().split('T')[0];
    const dashboardData = await dashboard_service_1.dashboardService.getDashboardSummary(req.user.id, localDateStr);
    res.status(200).json({
        success: true,
        message: 'Dashboard summary retrieved successfully',
        data: dashboardData
    });
});
exports.getStreakData = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const localDateStr = req.query.localDate || new Date().toISOString().split('T')[0];
    const streaks = await dashboard_service_1.dashboardService.recalculateStreak(req.user.id, localDateStr);
    res.status(200).json({
        success: true,
        message: 'Streak details retrieved successfully',
        data: streaks
    });
});
exports.getProductivityScore = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const localDateStr = req.query.localDate || new Date().toISOString().split('T')[0];
    const data = await dashboard_service_1.dashboardService.getDashboardSummary(req.user.id, localDateStr);
    res.status(200).json({
        success: true,
        message: 'Productivity score retrieved successfully',
        data: {
            productivityScore: data.productivityScore
        }
    });
});
exports.getGoalSummary = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const localDateStr = req.query.localDate || new Date().toISOString().split('T')[0];
    const data = await dashboard_service_1.dashboardService.getDashboardSummary(req.user.id, localDateStr);
    res.status(200).json({
        success: true,
        message: 'Goal progress summary retrieved successfully',
        data: {
            completedHours: data.today.completedHours,
            targetHours: data.today.targetHours,
            remainingHours: data.today.remainingHours,
            completionPercentage: data.today.completionPercentage
        }
    });
});
//# sourceMappingURL=dashboard.controller.js.map