import { Timer } from '../models/timer.model';
import { ITimer } from '../interfaces/timer.interface';
import { BaseRepository } from './base.repository';
import { Types } from 'mongoose';

export class TimerRepository extends BaseRepository<ITimer> {
  constructor() {
    super(Timer);
  }

  async findActiveByUserId(userId: string): Promise<ITimer | null> {
    return this.model.findOne({ userId: new Types.ObjectId(userId) }).exec();
  }
}

export const timerRepository = new TimerRepository();
export default timerRepository;
