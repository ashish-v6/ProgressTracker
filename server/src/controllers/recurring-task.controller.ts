import { Response } from 'express';
import { recurringTaskService } from '../services/recurring-task.service';
import { AuthenticatedRequest } from '../types/express';
import { asyncHandler } from '../utils/async-handler';
import { formatRecurringTaskResponse } from '../dtos/recurring-task.dto';

export const createRecurringTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const template = await recurringTaskService.createRecurringTask(req.user!.id, req.body);
  
  res.status(201).json({
    success: true,
    message: 'Recurring task template created successfully',
    data: formatRecurringTaskResponse(template)
  });
});

export const getRecurringTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const template = await recurringTaskService.getRecurringTaskById(req.user!.id, req.params.id);

  res.status(200).json({
    success: true,
    message: 'Recurring task template retrieved successfully',
    data: formatRecurringTaskResponse(template)
  });
});

export const updateRecurringTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const template = await recurringTaskService.updateRecurringTask(req.user!.id, req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Recurring task template updated successfully',
    data: formatRecurringTaskResponse(template)
  });
});

export const deleteRecurringTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await recurringTaskService.deleteRecurringTask(req.user!.id, req.params.id);

  res.status(200).json({
    success: true,
    message: 'Recurring task template and uncompleted instances deleted successfully',
    data: null
  });
});

export const pauseRecurringTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const template = await recurringTaskService.pauseRecurringTask(req.user!.id, req.params.id);

  res.status(200).json({
    success: true,
    message: 'Recurring task template paused successfully',
    data: formatRecurringTaskResponse(template)
  });
});

export const resumeRecurringTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const template = await recurringTaskService.resumeRecurringTask(req.user!.id, req.params.id);

  res.status(200).json({
    success: true,
    message: 'Recurring task template resumed successfully',
    data: formatRecurringTaskResponse(template)
  });
});

export const listRecurringTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const templates = await recurringTaskService.listRecurringTasks(req.user!.id);

  res.status(200).json({
    success: true,
    message: 'Recurring task templates retrieved successfully',
    data: templates.map(t => formatRecurringTaskResponse(t))
  });
});
