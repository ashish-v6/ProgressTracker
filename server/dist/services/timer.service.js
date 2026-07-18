"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timerService = void 0;
const timer_repository_1 = require("../repositories/timer.repository");
const task_repository_1 = require("../repositories/task.repository");
const errors_1 = require("../utils/errors");
class TimerService {
    /**
     * Start a timer for a user on a specific task
     */
    async startTimer(userId, taskId) {
        // 1. Verify task exists and belongs to this user
        const task = await task_repository_1.taskRepository.findById(taskId);
        if (!task || task.createdBy.toString() !== userId) {
            throw new errors_1.NotFoundError('Task not found');
        }
        // 2. Check if user already has a timer document
        const existingTimer = await timer_repository_1.timerRepository.findActiveByUserId(userId);
        if (existingTimer) {
            throw new errors_1.ValidationError('A timer is already active. Please pause, stop, or cancel it first.');
        }
        // 3. Create and return new timer session
        return timer_repository_1.timerRepository.create({
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
    async pauseTimer(userId) {
        const timer = await timer_repository_1.timerRepository.findActiveByUserId(userId);
        if (!timer) {
            throw new errors_1.NotFoundError('No active timer session found');
        }
        if (timer.status === 'paused') {
            return timer;
        }
        // Accumulate elapsed milliseconds for the current segment
        const segmentDuration = new Date().getTime() - new Date(timer.startTime).getTime();
        timer.accumulatedMilliseconds += segmentDuration;
        timer.status = 'paused';
        timer.startTime = null;
        await timer.save();
        return timer;
    }
    /**
     * Resume a paused timer
     */
    async resumeTimer(userId) {
        const timer = await timer_repository_1.timerRepository.findActiveByUserId(userId);
        if (!timer) {
            throw new errors_1.NotFoundError('No active timer session found');
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
    async stopTimer(userId) {
        const timer = await timer_repository_1.timerRepository.findActiveByUserId(userId);
        if (!timer) {
            throw new errors_1.NotFoundError('No active timer session found');
        }
        // Calculate final total elapsed milliseconds
        let totalMs = timer.accumulatedMilliseconds;
        if (timer.status === 'running' && timer.startTime) {
            totalMs += new Date().getTime() - new Date(timer.startTime).getTime();
        }
        // Convert to minutes (rounded)
        const addedMinutes = Math.round(totalMs / (1000 * 60));
        // Update the task duration
        const task = await task_repository_1.taskRepository.findById(timer.taskId.toString());
        if (!task) {
            // Clean up orphaned timer if task was deleted
            await timer_repository_1.timerRepository.delete(timer.id);
            throw new errors_1.NotFoundError('Task associated with this timer was not found');
        }
        const currentTotalMinutes = (task.actualHours * 60) + task.actualMinutes;
        const newTotalMinutes = currentTotalMinutes + addedMinutes;
        task.actualHours = Math.floor(newTotalMinutes / 60);
        task.actualMinutes = newTotalMinutes % 60;
        // Auto-complete checking (optional UX feature: if target is met, mark complete? 
        // Usually best to let users mark completion explicitly, but we'll stick to updating time).
        await task.save();
        // Clean up timer session
        await timer_repository_1.timerRepository.delete(timer.id);
        return {
            task,
            addedMinutes
        };
    }
    /**
     * Fetch current timer status details dynamically
     */
    async getTimerStatus(userId) {
        const timer = await timer_repository_1.timerRepository.findActiveByUserId(userId);
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
exports.timerService = new TimerService();
exports.default = exports.timerService;
//# sourceMappingURL=timer.service.js.map