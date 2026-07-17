import { timerRepository } from '../repositories/timer.repository';
import { taskRepository } from '../repositories/task.repository';
import { NotFoundError, ValidationError } from '../utils/errors';
import { ITimer } from '../interfaces/timer.interface';

class TimerService {
  /**
   * Start a timer for a user on a specific task
   */
  public async startTimer(userId: string, taskId: string): Promise<ITimer> {
    // 1. Verify task exists and belongs to this user
    const task = await taskRepository.findById(taskId);
    if (!task || task.createdBy.toString() !== userId) {
      throw new NotFoundError('Task not found');
    }

    // 2. Check if user already has a timer document
    const existingTimer = await timerRepository.findActiveByUserId(userId);
    if (existingTimer) {
      throw new ValidationError('A timer is already active. Please pause, stop, or cancel it first.');
    }

    // 3. Create and return new timer session
    return timerRepository.create({
      userId,
      taskId,
      startTime: new Date(),
      accumulatedMilliseconds: 0,
      status: 'running'
    });
  }

  /**
   * Pause a running timer
   */
  public async pauseTimer(userId: string): Promise<ITimer> {
    const timer = await timerRepository.findActiveByUserId(userId);
    if (!timer) {
      throw new NotFoundError('No active timer session found');
    }

    if (timer.status === 'paused') {
      return timer;
    }

    // Accumulate elapsed milliseconds for the current segment
    const segmentDuration = new Date().getTime() - new Date(timer.startTime!).getTime();
    timer.accumulatedMilliseconds += segmentDuration;
    timer.status = 'paused';
    timer.startTime = null;

    await timer.save();
    return timer;
  }

  /**
   * Resume a paused timer
   */
  public async resumeTimer(userId: string): Promise<ITimer> {
    const timer = await timerRepository.findActiveByUserId(userId);
    if (!timer) {
      throw new NotFoundError('No active timer session found');
    }

    if (timer.status === 'running') {
      return timer;
    }

    // Start a new running segment
    timer.status = 'running';
    timer.startTime = new Date();

    await timer.save();
    return timer;
  }

  /**
   * Stop the timer, compute total duration, and add it to the task actual duration
   */
  public async stopTimer(userId: string): Promise<{ task: any; addedMinutes: number }> {
    const timer = await timerRepository.findActiveByUserId(userId);
    if (!timer) {
      throw new NotFoundError('No active timer session found');
    }

    // Calculate final total elapsed milliseconds
    let totalMs = timer.accumulatedMilliseconds;
    if (timer.status === 'running' && timer.startTime) {
      totalMs += new Date().getTime() - new Date(timer.startTime).getTime();
    }

    // Convert to minutes (rounded)
    const addedMinutes = Math.round(totalMs / (1000 * 60));

    // Update the task duration
    const task = await taskRepository.findById(timer.taskId.toString());
    if (!task) {
      // Clean up orphaned timer if task was deleted
      await timerRepository.delete(timer.id);
      throw new NotFoundError('Task associated with this timer was not found');
    }

    const currentTotalMinutes = (task.actualHours * 60) + task.actualMinutes;
    const newTotalMinutes = currentTotalMinutes + addedMinutes;

    task.actualHours = Math.floor(newTotalMinutes / 60);
    task.actualMinutes = newTotalMinutes % 60;
    
    // Auto-complete checking (optional UX feature: if target is met, mark complete? 
    // Usually best to let users mark completion explicitly, but we'll stick to updating time).
    await task.save();

    // Clean up timer session
    await timerRepository.delete(timer.id);

    return {
      task,
      addedMinutes
    };
  }

  /**
   * Fetch current timer status details dynamically
   */
  public async getTimerStatus(userId: string): Promise<any> {
    const timer = await timerRepository.findActiveByUserId(userId);
    if (!timer) {
      return { status: 'idle' };
    }

    // Calculate live dynamic milliseconds
    let elapsedMs = timer.accumulatedMilliseconds;
    if (timer.status === 'running' && timer.startTime) {
      elapsedMs += new Date().getTime() - new Date(timer.startTime).getTime();
    }

    return {
      id: timer.id,
      taskId: timer.taskId,
      status: timer.status,
      startTime: timer.startTime,
      accumulatedMs: timer.accumulatedMilliseconds,
      elapsedMs,
      elapsedMinutes: Math.floor(elapsedMs / (1000 * 60))
    };
  }
}

export const timerService = new TimerService();
export default timerService;
