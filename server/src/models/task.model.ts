import mongoose, { Schema } from 'mongoose';
import { ITask } from '../interfaces/task.interface';

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
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
      trim: true,
      default: 'General'
    },
    color: {
      type: String,
      trim: true,
      default: '#4F46E5' // Indigo default
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
        values: ['pending', 'in_progress', 'completed'],
        message: 'Status must be pending, in_progress, or completed'
      },
      default: 'pending',
      index: true
    },
    targetHours: {
      type: Number,
      default: 0,
      min: [0, 'Target hours cannot be negative']
    },
    targetMinutes: {
      type: Number,
      default: 0,
      min: [0, 'Target minutes cannot be negative'],
      max: [59, 'Target minutes cannot exceed 59']
    },
    actualHours: {
      type: Number,
      default: 0,
      min: [0, 'Actual hours cannot be negative']
    },
    actualMinutes: {
      type: Number,
      default: 0,
      min: [0, 'Actual minutes cannot be negative']
    },
    completed: {
      type: Boolean,
      default: false
    },
    repeatRule: {
      type: String,
      enum: ['none', 'daily', 'weekdays', 'weekends', 'weekly', 'custom'],
      default: 'none'
    },
    repeatDays: {
      type: [Number],
      default: []
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true
    },
    completedAt: {
      type: Date,
      default: null
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
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'RecurringTask',
      default: null,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for compound searches and filtering
TaskSchema.index({ createdBy: 1, dueDate: 1 });
TaskSchema.index({ createdBy: 1, status: 1 });
TaskSchema.index({ createdBy: 1, completed: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
export default Task;
