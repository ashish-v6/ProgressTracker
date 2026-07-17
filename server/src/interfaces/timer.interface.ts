import { Document, Types } from 'mongoose';

export type TimerStatus = 'running' | 'paused';

export interface ITimer extends Document {
  userId: Types.ObjectId;
  taskId: Types.ObjectId;
  startTime?: Date | null;
  accumulatedMilliseconds: number;
  status: TimerStatus;
  createdAt: Date;
  updatedAt: Date;
}
