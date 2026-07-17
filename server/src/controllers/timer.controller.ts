import { Response } from 'express';
import { timerService } from '../services/timer.service';
import { AuthenticatedRequest } from '../types/express';
import { asyncHandler } from '../utils/async-handler';

export const startTimer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { taskId } = req.body;
  const timer = await timerService.startTimer(req.user!.id, taskId);

  res.status(201).json({
    success: true,
    message: 'Timer started successfully',
    data: timer
  });
});

export const pauseTimer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const timer = await timerService.pauseTimer(req.user!.id);

  res.status(200).json({
    success: true,
    message: 'Timer paused successfully',
    data: timer
  });
});

export const resumeTimer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const timer = await timerService.resumeTimer(req.user!.id);

  res.status(200).json({
    success: true,
    message: 'Timer resumed successfully',
    data: timer
  });
});

export const stopTimer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await timerService.stopTimer(req.user!.id);

  res.status(200).json({
    success: true,
    message: 'Timer stopped and duration logged successfully',
    data: result
  });
});

export const getTimerStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const status = await timerService.getTimerStatus(req.user!.id);

  res.status(200).json({
    success: true,
    message: 'Timer status retrieved successfully',
    data: status
  });
});
