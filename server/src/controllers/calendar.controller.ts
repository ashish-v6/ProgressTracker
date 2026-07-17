import { Response } from 'express';
import { Types } from 'mongoose';
import { analyticsService } from '../services/analytics.service';
import { taskRepository } from '../repositories/task.repository';
import { AuthenticatedRequest } from '../types/express';
import { asyncHandler } from '../utils/async-handler';
import { ValidationError } from '../utils/errors';

export const getCalendar = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const today = new Date();
  
  // Default to current year and month if not provided
  const yearQuery = req.query.year as string;
  const monthQuery = req.query.month as string;

  const year = yearQuery ? parseInt(yearQuery, 10) : today.getFullYear();
  const month = monthQuery ? parseInt(monthQuery, 10) : today.getMonth() + 1; // 1-indexed

  if (isNaN(year) || year < 1000 || year > 9999) {
    throw new ValidationError('Invalid year format. Must be a 4-digit number.');
  }

  if (isNaN(month) || month < 1 || month > 12) {
    throw new ValidationError('Invalid month. Must be between 1 and 12.');
  }

  const calendarData = await analyticsService.getCalendarData(req.user!.id, year, month);

  res.status(200).json({
    success: true,
    message: 'Calendar summaries retrieved successfully',
    data: calendarData
  });
});

export const getTasksByDate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const dateStr = req.query.date as string;
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new ValidationError('Date query param is required and must be in YYYY-MM-DD format.');
  }

  const targetDate = new Date(dateStr + 'T00:00:00.000Z');
  
  const startOfDay = new Date(targetDate.getTime());
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate.getTime());
  endOfDay.setHours(23, 59, 59, 999);

  // We should query all tasks for the user on this date
  const tasks = await taskRepository.find({
    createdBy: new Types.ObjectId(req.user!.id),
    dueDate: { $gte: startOfDay, $lte: endOfDay }
  });

  res.status(200).json({
    success: true,
    message: 'Tasks retrieved successfully',
    data: tasks.map(t => ({
      id: t.id,
      title: t.title,
      category: t.category,
      color: t.color,
      actualHours: t.actualHours,
      actualMinutes: t.actualMinutes,
      targetHours: t.targetHours,
      targetMinutes: t.targetMinutes,
      completed: t.completed,
      status: t.status
    }))
  });
});
