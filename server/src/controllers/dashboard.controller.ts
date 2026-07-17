import { Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { AuthenticatedRequest } from '../types/express';
import { asyncHandler } from '../utils/async-handler';

export const getDashboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const localDateStr = req.query.localDate as string || new Date().toISOString().split('T')[0];
  const dashboardData = await dashboardService.getDashboardSummary(req.user!.id, localDateStr);

  res.status(200).json({
    success: true,
    message: 'Dashboard summary retrieved successfully',
    data: dashboardData
  });
});

export const getStreakData = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const localDateStr = req.query.localDate as string || new Date().toISOString().split('T')[0];
  const streaks = await dashboardService.recalculateStreak(req.user!.id, localDateStr);

  res.status(200).json({
    success: true,
    message: 'Streak details retrieved successfully',
    data: streaks
  });
});

export const getProductivityScore = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const localDateStr = req.query.localDate as string || new Date().toISOString().split('T')[0];
  const data = await dashboardService.getDashboardSummary(req.user!.id, localDateStr);

  res.status(200).json({
    success: true,
    message: 'Productivity score retrieved successfully',
    data: {
      productivityScore: data.productivityScore
    }
  });
});

export const getGoalSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const localDateStr = req.query.localDate as string || new Date().toISOString().split('T')[0];
  const data = await dashboardService.getDashboardSummary(req.user!.id, localDateStr);

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
