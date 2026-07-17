import { Response } from 'express';
import { analyticsService } from '../services/analytics.service';
import { AuthenticatedRequest } from '../types/express';
import { asyncHandler } from '../utils/async-handler';

export const getAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const analyticsData = await analyticsService.getAnalyticsData(req.user!.id);

  res.status(200).json({
    success: true,
    message: 'Analytics data retrieved successfully',
    data: analyticsData
  });
});

export const getStatistics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const stats = await analyticsService.getStatistics(req.user!.id);

  res.status(200).json({
    success: true,
    message: 'Statistics calculated successfully',
    data: stats
  });
});
