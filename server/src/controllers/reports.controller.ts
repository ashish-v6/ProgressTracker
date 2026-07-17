import { Response } from 'express';
import { Types } from 'mongoose';
import { taskRepository } from '../repositories/task.repository';
import { AuthenticatedRequest } from '../types/express';
import { asyncHandler } from '../utils/async-handler';
import { ValidationError } from '../utils/errors';
import { ITask } from '../interfaces/task.interface';

// Helper to convert task actual hours and minutes to decimal hours
const getActualHoursDecimal = (task: ITask): number => {
  return task.actualHours + (task.actualMinutes / 60);
};

// Helper formatting YYYY-MM-DD
const formatLocalYYYYMMDD = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getDailyReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const localDateStr = req.query.localDate as string;
  if (!localDateStr || !/^\d{4}-\d{2}-\d{2}$/.test(localDateStr)) {
    throw new ValidationError('localDate query parameter in YYYY-MM-DD format is required.');
  }

  const targetDate = new Date(localDateStr + 'T00:00:00.000Z');
  const startOfDay = new Date(targetDate.getTime());
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate.getTime());
  endOfDay.setHours(23, 59, 59, 999);

  const tasks = await taskRepository.find({
    createdBy: new Types.ObjectId(req.user!.id),
    dueDate: { $gte: startOfDay, $lte: endOfDay }
  });

  const total = tasks.length;
  const completed = tasks.filter(t => t.completed || t.status === 'completed').length;
  const pending = total - completed;
  const totalHours = tasks.reduce((sum, t) => sum + getActualHoursDecimal(t), 0);

  // Chart data: hours spent per task today
  const chartData = tasks.map(t => ({
    name: t.title.length > 15 ? t.title.slice(0, 15) + '...' : t.title,
    hours: Number(getActualHoursDecimal(t).toFixed(1))
  }));

  res.status(200).json({
    success: true,
    message: 'Daily report generated successfully',
    data: {
      totalTasks: total,
      completedTasks: completed,
      pendingTasks: pending,
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalHours: Number(totalHours.toFixed(1)),
      averageStudyHours: Number(totalHours.toFixed(1)), // 1 day average is total hours
      chartData
    }
  });
});

export const getWeeklyReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const localDateStr = req.query.localDate as string;
  if (!localDateStr || !/^\d{4}-\d{2}-\d{2}$/.test(localDateStr)) {
    throw new ValidationError('localDate query parameter in YYYY-MM-DD format is required.');
  }

  const targetDate = new Date(localDateStr + 'T00:00:00.000Z');
  
  const start = new Date(targetDate.getTime());
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const end = new Date(targetDate.getTime());
  end.setHours(23, 59, 59, 999);

  const tasks = await taskRepository.find({
    createdBy: new Types.ObjectId(req.user!.id),
    dueDate: { $gte: start, $lte: end }
  });

  const total = tasks.length;
  const completed = tasks.filter(t => t.completed || t.status === 'completed').length;
  const pending = total - completed;
  const totalHours = tasks.reduce((sum, t) => sum + getActualHoursDecimal(t), 0);

  // Chart data: daily hours sum over past 7 days
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyHoursMap: Record<string, number> = {};
  
  // Initialize map
  for (let i = 6; i >= 0; i--) {
    const d = new Date(targetDate.getTime());
    d.setDate(d.getDate() - i);
    const dayLabel = weekdayNames[d.getDay()];
    dailyHoursMap[dayLabel] = 0;
  }

  tasks.forEach(t => {
    const dayLabel = weekdayNames[new Date(t.dueDate).getDay()];
    if (dailyHoursMap[dayLabel] !== undefined) {
      dailyHoursMap[dayLabel] += getActualHoursDecimal(t);
    }
  });

  const chartData = Object.keys(dailyHoursMap).map(day => ({
    name: day,
    hours: Number(dailyHoursMap[day].toFixed(1))
  }));

  res.status(200).json({
    success: true,
    message: 'Weekly report generated successfully',
    data: {
      totalTasks: total,
      completedTasks: completed,
      pendingTasks: pending,
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalHours: Number(totalHours.toFixed(1)),
      averageStudyHours: Number((totalHours / 7).toFixed(1)),
      chartData
    }
  });
});

export const getMonthlyReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const localDateStr = req.query.localDate as string;
  if (!localDateStr || !/^\d{4}-\d{2}-\d{2}$/.test(localDateStr)) {
    throw new ValidationError('localDate query parameter in YYYY-MM-DD format is required.');
  }

  const targetDate = new Date(localDateStr + 'T00:00:00.000Z');
  
  const start = new Date(targetDate.getTime());
  start.setDate(start.getDate() - 29);
  start.setHours(0, 0, 0, 0);

  const end = new Date(targetDate.getTime());
  end.setHours(23, 59, 59, 999);

  const tasks = await taskRepository.find({
    createdBy: new Types.ObjectId(req.user!.id),
    dueDate: { $gte: start, $lte: end }
  });

  const total = tasks.length;
  const completed = tasks.filter(t => t.completed || t.status === 'completed').length;
  const pending = total - completed;
  const totalHours = tasks.reduce((sum, t) => sum + getActualHoursDecimal(t), 0);

  // Chart data: split the 30 days into 4 logical weeks (Week 1, Week 2...)
  const weeklyHours = [0, 0, 0, 0];
  
  tasks.forEach(t => {
    const diffTime = Math.abs(new Date(t.dueDate).getTime() - start.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Distribute into 4 weeks (7.5 days per bucket)
    const weekIndex = Math.min(3, Math.floor(diffDays / 7.5));
    weeklyHours[weekIndex] += getActualHoursDecimal(t);
  });

  const chartData = weeklyHours.map((hours, index) => ({
    name: `Week ${index + 1}`,
    hours: Number(hours.toFixed(1))
  }));

  res.status(200).json({
    success: true,
    message: 'Monthly report generated successfully',
    data: {
      totalTasks: total,
      completedTasks: completed,
      pendingTasks: pending,
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalHours: Number(totalHours.toFixed(1)),
      averageStudyHours: Number((totalHours / 30).toFixed(1)),
      chartData
    }
  });
});
