import { ITimer } from '../interfaces/timer.interface';
import { BaseRepository } from './base.repository';
export declare class TimerRepository extends BaseRepository<ITimer> {
    constructor();
    findActiveByUserId(userId: string): Promise<ITimer | null>;
}
export declare const timerRepository: TimerRepository;
export default timerRepository;
