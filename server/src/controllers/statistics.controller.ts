import { Response } from 'express';
import { statisticsService } from '../services/statistics.service';
import { AuthenticatedRequest } from '../types/express';
import { asyncHandler } from '../utils/async-handler';

export const getTodayStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const localDateStr = req.query.localDate as string || new Date().toISOString().split('T')[0];
  const date = new Date(localDateStr + 'T00:00:00.000Z');
  
  const start = new Date(date.getTime());
  start.setHours(0, 0, 0, 0);
  const end = new Date(date.getTime());
  end.setHours(23, 59, 59, 999);

  const stats = await statisticsService.getRangeStatistics(req.user!.id, start, end);

  res.status(200).json({
    success: true,
    message: "Today's statistics retrieved successfully",
    data: stats
  });
});

export const getWeeklyStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const localDateStr = req.query.localDate as string || new Date().toISOString().split('T')[0];
  const date = new Date(localDateStr + 'T00:00:00.000Z');
  
  const start = new Date(date.getTime());
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date.getTime());
  end.setHours(23, 59, 59, 999);

  const stats = await statisticsService.getRangeStatistics(req.user!.id, start, end);

  res.status(200).json({
    success: true,
    message: 'Weekly statistics retrieved successfully',
    data: stats
  });
});

export const getMonthlyStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const localDateStr = req.query.localDate as string || new Date().toISOString().split('T')[0];
  const date = new Date(localDateStr + 'T00:00:00.000Z');
  
  const start = new Date(date.getTime());
  start.setDate(start.getDate() - 29);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date.getTime());
  end.setHours(23, 59, 59, 999);

  const stats = await statisticsService.getRangeStatistics(req.user!.id, start, end);

  res.status(200).json({
    success: true,
    message: 'Monthly statistics retrieved successfully',
    data: stats
  });
});

export const getYearlyStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const localDateStr = req.query.localDate as string || new Date().toISOString().split('T')[0];
  const date = new Date(localDateStr + 'T00:00:00.000Z');
  
  const start = new Date(date.getTime());
  start.setDate(start.getDate() - 364);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date.getTime());
  end.setHours(23, 59, 59, 999);

  const stats = await statisticsService.getRangeStatistics(req.user!.id, start, end);

  res.status(200).json({
    success: true,
    message: 'Yearly statistics retrieved successfully',
    data: stats
  });
});

export const getCategoryStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const stats = await statisticsService.getCategoryStatistics(req.user!.id);

  res.status(200).json({
    success: true,
    message: 'Category statistics retrieved successfully',
    data: stats
  });
});
