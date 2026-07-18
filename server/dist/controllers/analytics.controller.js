"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatistics = exports.getAnalytics = void 0;
const analytics_service_1 = require("../services/analytics.service");
const async_handler_1 = require("../utils/async-handler");
exports.getAnalytics = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const analyticsData = await analytics_service_1.analyticsService.getAnalyticsData(req.user.id);
    res.status(200).json({
        success: true,
        message: 'Analytics data retrieved successfully',
        data: analyticsData
    });
});
exports.getStatistics = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const stats = await analytics_service_1.analyticsService.getStatistics(req.user.id);
    res.status(200).json({
        success: true,
        message: 'Statistics calculated successfully',
        data: stats
    });
});
//# sourceMappingURL=analytics.controller.js.map