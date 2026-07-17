import { Response } from 'express';
import { taskService } from '../services/task.service';
import { taskRepository } from '../repositories/task.repository';
import { recurringTaskService } from '../services/recurring-task.service';
import { AuthenticatedRequest } from '../types/express';
import { asyncHandler } from '../utils/async-handler';
import { ValidationError } from '../utils/errors';
import { formatTaskResponse } from '../dtos/task.dto';

export const createTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = await taskService.createTask(req.user!.id, req.body);
  
  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: formatTaskResponse(task)
  });
});

export const getTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = await taskService.getTaskById(req.user!.id, req.params.id);

  res.status(200).json({
    success: true,
    message: 'Task retrieved successfully',
    data: formatTaskResponse(task)
  });
});

export const updateTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = await taskService.updateTask(req.user!.id, req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: formatTaskResponse(task)
  });
});

export const deleteTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await taskService.deleteTask(req.user!.id, req.params.id);

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
    data: null
  });
});

export const duplicateTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const duplicated = await taskService.duplicateTask(req.user!.id, req.params.id);

  res.status(201).json({
    success: true,
    message: 'Task duplicated successfully',
    data: formatTaskResponse(duplicated)
  });
});

export const markComplete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = await taskService.updateTask(req.user!.id, req.params.id, { status: 'completed' });

  res.status(200).json({
    success: true,
    message: 'Task marked as completed',
    data: formatTaskResponse(task)
  });
});

export const markIncomplete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = await taskService.updateTask(req.user!.id, req.params.id, { status: 'pending' });

  res.status(200).json({
    success: true,
    message: 'Task marked as incomplete',
    data: formatTaskResponse(task)
  });
});

export const bulkDelete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new ValidationError('Task IDs array must be provided');
  }

  await taskService.bulkDelete(req.user!.id, ids);

  res.status(200).json({
    success: true,
    message: 'Tasks bulk deleted successfully',
    data: null
  });
});

export const bulkComplete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new ValidationError('Task IDs array must be provided');
  }

  await taskService.bulkComplete(req.user!.id, ids);

  res.status(200).json({
    success: true,
    message: 'Tasks bulk completed successfully',
    data: null
  });
});

export const listTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder, ...filters } = req.query as any;

  const result = await taskService.queryTasks(
    req.user!.id,
    filters,
    { page, limit, sortBy, sortOrder }
  );

  res.status(200).json({
    success: true,
    message: 'Tasks retrieved successfully',
    data: {
      tasks: result.tasks.map(t => formatTaskResponse(t)),
      total: result.total,
      page: result.page,
      pages: result.pages
    }
  });
});

export const getTodayTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const localDateStr = req.query.localDate as string || new Date().toISOString().split('T')[0];
  const targetDate = new Date(localDateStr + 'T00:00:00.000Z');
  
  const startOfDay = new Date(targetDate.getTime());
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate.getTime());
  endOfDay.setHours(23, 59, 59, 999);

  // 1. Generate any missing recurring tasks for today
  await recurringTaskService.generateTasksForDateRange(req.user!.id, startOfDay, endOfDay);

  // 2. Fetch all daily tasks due today
  const tasks = await taskRepository.find(
    {
      createdBy: req.user!.id,
      dueDate: { $gte: startOfDay, $lte: endOfDay }
    },
    null,
    { sort: { createdAt: 1 } }
  );

  res.status(200).json({
    success: true,
    message: "Today's tasks resolved successfully",
    data: tasks.map(t => formatTaskResponse(t))
  });
});

export const getUpcomingTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const limitDaysStr = req.query.limitDays as string;
  const limitDays = limitDaysStr ? parseInt(limitDaysStr, 10) : 7;
  
  if (isNaN(limitDays) || limitDays <= 0) {
    throw new ValidationError('Limit days must be a positive number');
  }

  const localDateStr = req.query.localDate as string || new Date().toISOString().split('T')[0];
  const startDate = new Date(localDateStr + 'T00:00:00.000Z');
  
  const endDate = new Date(startDate.getTime());
  endDate.setDate(endDate.getDate() + limitDays);

  const startOfDay = new Date(startDate.getTime());
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(endDate.getTime());
  endOfDay.setHours(23, 59, 59, 999);

  // 1. Generate any missing recurring tasks for this range
  await recurringTaskService.generateTasksForDateRange(req.user!.id, startOfDay, endOfDay);

  // 2. Fetch all daily tasks in the range
  const tasks = await taskRepository.find(
    {
      createdBy: req.user!.id,
      dueDate: { $gte: startOfDay, $lte: endOfDay }
    },
    null,
    { sort: { dueDate: 1, createdAt: 1 } }
  );

  res.status(200).json({
    success: true,
    message: `Upcoming tasks for the next ${limitDays} days retrieved successfully`,
    data: tasks.map(t => formatTaskResponse(t))
  });
});
