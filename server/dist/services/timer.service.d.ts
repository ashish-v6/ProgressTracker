import { ITimer } from '../interfaces/timer.interface';
declare class TimerService {
    /**
     * Start a timer for a user on a specific task
     */
    startTimer(userId: string, taskId: string): Promise<ITimer>;
    /**
     * Pause a running timer
     */
    pauseTimer(userId: string): Promise<ITimer>;
    /**
     * Resume a paused timer
     */
    resumeTimer(userId: string): Promise<ITimer>;
    /**
     * Stop the timer, compute total duration, and add it to the task actual duration
     */
    stopTimer(userId: string): Promise<{
        task: any;
        addedMinutes: number;
    }>;
    /**
     * Fetch current timer status details dynamically
     */
    getTimerStatus(userId: string): Promise<any>;
}
export declare const timerService: TimerService;
export default timerService;
