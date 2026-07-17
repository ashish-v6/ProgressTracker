import mongoose, { Schema } from 'mongoose';
import { IRecurringTask } from '../interfaces/recurring-task.interface';

const RecurringTaskSchema = new Schema<IRecurringTask>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      trim: true
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be low, medium, or high'
      },
      default: 'medium'
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'paused'],
        message: 'Status must be active or paused'
      },
      default: 'active',
      index: true
    },
    targetHours: {
      type: Number,
      required: [true, 'Target hours is required'],
      min: [0, 'Target hours cannot be negative']
    },
    targetMinutes: {
      type: Number,
      required: [true, 'Target minutes is required'],
      min: [0, 'Target minutes cannot be negative'],
      max: [59, 'Target minutes cannot exceed 59']
    },
    repeatRule: {
      type: String,
      enum: {
        values: ['daily', 'weekdays', 'weekends', 'weekly', 'monthly', 'custom'],
        message: 'Repeat rule must be daily, weekdays, weekends, weekly, monthly, or custom'
      },
      required: [true, 'Repeat rule is required']
    },
    repeatDays: {
      type: [Number],
      default: []
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    tags: {
      type: [String],
      default: []
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Optimize query searches for generating tasks
RecurringTaskSchema.index({ createdBy: 1, status: 1 });

export const RecurringTask = mongoose.model<IRecurringTask>('RecurringTask', RecurringTaskSchema);
export default RecurringTask;
