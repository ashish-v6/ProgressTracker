import mongoose, { Schema } from 'mongoose';
import { ITimer } from '../interfaces/timer.interface';

const TimerSchema = new Schema<ITimer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Guarantees only one active timer document per user
      index: true
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true
    },
    startTime: {
      type: Date,
      default: null
    },
    accumulatedMilliseconds: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['running', 'paused'],
      default: 'running'
    }
  },
  {
    timestamps: true
  }
);

export const Timer = mongoose.model<ITimer>('Timer', TimerSchema);
export default Timer;
