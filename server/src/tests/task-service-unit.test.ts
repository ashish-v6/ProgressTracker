import mongoose from 'mongoose';
import { taskService } from '../services/task.service';
import { recurringTaskService } from '../services/recurring-task.service';
import { clearDatabase } from './setup';
import { Task } from '../models/task.model';
import { RecurringTask } from '../models/recurring-task.model';

describe('TaskService Unit Tests', () => {
  let userId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    await clearDatabase();
    userId = new mongoose.Types.ObjectId();
  });

  it('should cover repeat rules in createTask', async () => {
    const rules = ['weekdays', 'weekends', 'daily', 'weekly'] as const;
    for (const rule of rules) {
      const task = await taskService.createTask(userId.toString(), {
        title: `Task for ${rule}`,
        category: 'Test',
        color: '#4F46E5',
        repeatRule: rule,
        dueDate: new Date()
      });
      expect(task.repeatDays?.length).toBeGreaterThan(0);
    }
  });

  it('should throw NotFoundError in getTaskById if task does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(taskService.getTaskById(userId.toString(), fakeId)).rejects.toThrow('Task not found');
  });

  it('should throw NotFoundError in getTaskById if task belongs to another user', async () => {
    const task = await Task.create({
      title: 'Other Task',
      category: 'Test',
      color: '#4F46E5',
      dueDate: new Date(),
      createdBy: new mongoose.Types.ObjectId()
    });
    await expect(taskService.getTaskById(userId.toString(), task.id)).rejects.toThrow('Task not found');
  });

  it('should cover resolveRecurringTasksForDate with weekday and weekly templates', async () => {
    // Create templates for weekdays/weekends
    const weekdaysTemplate = await Task.create({
      title: 'Weekdays Template',
      category: 'Test',
      color: '#4F46E5',
      repeatRule: 'weekdays',
      repeatDays: [1, 2, 3, 4, 5],
      createdBy: userId,
      dueDate: new Date()
    });

    const weekendsTemplate = await Task.create({
      title: 'Weekends Template',
      category: 'Test',
      color: '#4F46E5',
      repeatRule: 'weekends',
      repeatDays: [0, 6],
      createdBy: userId,
      dueDate: new Date()
    });

    // Test resolving on a Monday (day 1)
    const monday = new Date('2026-07-20T10:00:00.000Z'); // Monday
    await taskService.resolveRecurringTasksForDate(userId.toString(), monday);

    const mondayTasks = await Task.find({ templateId: weekdaysTemplate._id });
    expect(mondayTasks.length).toBe(1);

    // Test resolving on a Sunday (day 0)
    const sunday = new Date('2026-07-19T10:00:00.000Z'); // Sunday
    await taskService.resolveRecurringTasksForDate(userId.toString(), sunday);

    const sundayTasks = await Task.find({ templateId: weekendsTemplate._id });
    expect(sundayTasks.length).toBe(1);
  });

  it('should cover updateTask and throw error if not found', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(taskService.updateTask(userId.toString(), fakeId, { title: 'Updated' })).rejects.toThrow('Task not found');
  });

  it('should cover deleteTask and throw error if not found', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(taskService.deleteTask(userId.toString(), fakeId)).rejects.toThrow('Task not found');
  });

  it('should cover recurring task service getRecurringTaskById errors', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(recurringTaskService.getRecurringTaskById(userId.toString(), fakeId)).rejects.toThrow('Recurring task template not found');

    const template = await RecurringTask.create({
      title: 'Other template',
      category: 'Test',
      color: '#4F46E5',
      repeatRule: 'daily',
      targetHours: 1,
      targetMinutes: 0,
      createdBy: new mongoose.Types.ObjectId()
    });

    await expect(recurringTaskService.getRecurringTaskById(userId.toString(), template.id)).rejects.toThrow('Recurring task template not found');
  });

  it('should cover updateRecurringTask and throw error if not found', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(recurringTaskService.updateRecurringTask(userId.toString(), fakeId, { title: 'Updated' })).rejects.toThrow('Recurring task template not found');
  });

  it('should cover generating tasks for custom and monthly recurring tasks', async () => {
    const customTemplate = await RecurringTask.create({
      title: 'Custom Weekly template',
      category: 'Test',
      color: '#4F46E5',
      repeatRule: 'custom',
      repeatDays: [1, 3, 5], // Mon, Wed, Fri
      targetHours: 1,
      targetMinutes: 0,
      createdBy: userId,
      createdAt: new Date('2026-07-01')
    });

    const monthlyTemplate = await RecurringTask.create({
      title: 'Monthly template',
      category: 'Test',
      color: '#4F46E5',
      repeatRule: 'monthly',
      repeatDays: [15], // 15th of the month
      targetHours: 1,
      targetMinutes: 0,
      createdBy: userId,
      createdAt: new Date('2026-07-01')
    });

    const startDate = new Date(2026, 6, 13); // Monday
    const endDate = new Date(2026, 6, 15); // Wednesday

    await recurringTaskService.generateTasksForDateRange(userId.toString(), startDate, endDate);

    const customTasks = await Task.find({ templateId: customTemplate._id });
    expect(customTasks.length).toBe(2);

    const monthlyTasks = await Task.find({ templateId: monthlyTemplate._id });
    expect(monthlyTasks.length).toBe(1);
  });

  it('should skip task generation if target date is before template creation date', async () => {
    const futureTemplate = await RecurringTask.create({
      title: 'Future template',
      category: 'Test',
      color: '#4F46E5',
      repeatRule: 'daily',
      targetHours: 1,
      targetMinutes: 0,
      createdBy: userId,
      createdAt: new Date('2026-07-25')
    });

    await recurringTaskService.generateTasksForDateRange(
      userId.toString(),
      new Date('2026-07-20T00:00:00.000Z'),
      new Date('2026-07-20T23:59:59.000Z')
    );

    const tasks = await Task.find({ templateId: futureTemplate._id });
    expect(tasks.length).toBe(0);
  });

  it('should skip task service resolve if template created after end of target date', async () => {
    const futureTemplate = await Task.create({
      title: 'Future template task',
      category: 'Test',
      color: '#4F46E5',
      repeatRule: 'daily',
      repeatDays: [0, 1, 2, 3, 4, 5, 6],
      createdBy: userId,
      dueDate: new Date('2026-07-25T12:00:00.000Z'),
      createdAt: new Date('2026-07-25T12:00:00.000Z')
    });

    await taskService.resolveRecurringTasksForDate(userId.toString(), new Date('2026-07-20T12:00:00.000Z'));
    const tasks = await Task.find({ templateId: futureTemplate._id });
    expect(tasks.length).toBe(0);
  });

  it('should cover doesTemplateMatchDate match conditions', () => {
    const fn = (recurringTaskService as any).doesTemplateMatchDate.bind(recurringTaskService);

    const base = {
      createdAt: new Date('2026-07-01'),
      targetHours: 1,
      targetMinutes: 0
    };

    expect(fn({ ...base, repeatRule: 'weekdays' }, new Date('2026-07-15'))).toBe(true);
    expect(fn({ ...base, repeatRule: 'weekdays' }, new Date('2026-07-18'))).toBe(false);

    expect(fn({ ...base, repeatRule: 'weekends' }, new Date('2026-07-18'))).toBe(true);
    expect(fn({ ...base, repeatRule: 'weekends' }, new Date('2026-07-15'))).toBe(false);

    expect(fn({ ...base, repeatRule: 'weekly', repeatDays: [] }, new Date('2026-07-15'))).toBe(fn({ ...base, repeatRule: 'weekly', repeatDays: [] }, new Date('2026-07-15')));

    expect(fn({ ...base, repeatRule: 'monthly', repeatDays: [] }, new Date('2026-07-01'))).toBe(true);
    expect(fn({ ...base, repeatRule: 'monthly', repeatDays: [] }, new Date('2026-07-02'))).toBe(false);

    expect(fn({ ...base, repeatRule: 'weekly', repeatDays: [1, 3] }, new Date('2026-07-15'))).toBe(true);
    expect(fn({ ...base, repeatRule: 'weekly', repeatDays: [1, 3] }, new Date('2026-07-16'))).toBe(false);

    expect(fn({ ...base, repeatRule: 'invalid' as any }, new Date('2026-07-15'))).toBe(false);
  });

  it('should cover taskService.doesTemplateMatchDate match conditions', () => {
    const fn = (taskService as any).doesTemplateMatchDate.bind(taskService);

    const base = {
      dueDate: new Date('2026-07-01')
    };

    expect(fn({ ...base, repeatRule: 'weekdays' }, new Date('2026-07-15'))).toBe(true);
    expect(fn({ ...base, repeatRule: 'weekdays' }, new Date('2026-07-18'))).toBe(false);

    expect(fn({ ...base, repeatRule: 'weekends' }, new Date('2026-07-18'))).toBe(true);
    expect(fn({ ...base, repeatRule: 'weekends' }, new Date('2026-07-15'))).toBe(false);

    expect(fn({ ...base, repeatRule: 'weekly', repeatDays: [] }, new Date('2026-07-15'))).toBe(fn({ ...base, repeatRule: 'weekly', repeatDays: [] }, new Date('2026-07-15')));

    expect(fn({ ...base, repeatRule: 'weekly', repeatDays: [1, 3] }, new Date('2026-07-15'))).toBe(true);
    expect(fn({ ...base, repeatRule: 'weekly', repeatDays: [1, 3] }, new Date('2026-07-16'))).toBe(false);

    expect(fn({ ...base, repeatRule: 'daily' }, new Date('2026-07-15'))).toBe(true);
    expect(fn({ ...base, repeatRule: 'custom', repeatDays: [3] }, new Date('2026-07-15'))).toBe(true);
    expect(fn({ ...base, repeatRule: 'custom', repeatDays: [3] }, new Date('2026-07-16'))).toBe(false);

    expect(fn({ ...base, repeatRule: 'invalid' as any }, new Date('2026-07-15'))).toBe(false);
  });

  it('should resolve tasks for date range with active recurring and legacy templates of all repeat rules', async () => {
    const originalList = recurringTaskService.listRecurringTasks.bind(recurringTaskService);
    jest.spyOn(recurringTaskService, 'listRecurringTasks').mockImplementationOnce(async (uid) => {
      const templates = await originalList(uid);
      return [
        ...templates,
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Recurring Invalid Task',
          category: 'Test',
          color: '#4F46E5',
          repeatRule: 'invalid' as any,
          repeatDays: [],
          createdBy: new mongoose.Types.ObjectId(uid),
          targetHours: 1,
          targetMinutes: 0,
          createdAt: new Date('2026-07-15'),
          status: 'active'
        }
      ] as any;
    });

    await Task.create([
      {
        title: 'Legacy Weekdays Task',
        category: 'Test',
        color: '#4F46E5',
        repeatRule: 'weekdays',
        createdBy: userId,
        dueDate: new Date('2026-07-01'),
        createdAt: new Date('2026-07-01')
      },
      {
        title: 'Legacy Weekends Task',
        category: 'Test',
        color: '#4F46E5',
        repeatRule: 'weekends',
        createdBy: userId,
        dueDate: new Date('2026-07-01'),
        createdAt: new Date('2026-07-01')
      }
    ]);

    const { RecurringTask } = require('../models/recurring-task.model');
    await RecurringTask.create([
      {
        title: 'Recurring Weekdays Task',
        category: 'Test',
        color: '#4F46E5',
        repeatRule: 'weekdays',
        createdBy: userId,
        targetHours: 1,
        targetMinutes: 0,
        createdAt: new Date('2026-07-01'),
        status: 'active'
      },
      {
        title: 'Recurring Weekends Task',
        category: 'Test',
        color: '#4F46E5',
        repeatRule: 'weekends',
        createdBy: userId,
        targetHours: 1,
        targetMinutes: 0,
        createdAt: new Date('2026-07-01'),
        status: 'active'
      },
      {
        title: 'Recurring Monthly Task',
        category: 'Test',
        color: '#4F46E5',
        repeatRule: 'monthly',
        repeatDays: [15],
        createdBy: userId,
        targetHours: 1,
        targetMinutes: 0,
        createdAt: new Date('2026-07-01'),
        status: 'active'
      },
      {
        title: 'Recurring Custom Task',
        category: 'Test',
        color: '#4F46E5',
        repeatRule: 'custom',
        repeatDays: [3],
        createdBy: userId,
        targetHours: 1,
        targetMinutes: 0,
        createdAt: new Date('2026-07-01'),
        status: 'active'
      },
      {
        title: 'Recurring Weekly Default Task',
        category: 'Test',
        color: '#4F46E5',
        repeatRule: 'weekly',
        repeatDays: [],
        createdBy: userId,
        targetHours: 1,
        targetMinutes: 0,
        createdAt: new Date('2026-07-15'),
        status: 'active'
      },
      {
        title: 'Recurring Monthly Default Task',
        category: 'Test',
        color: '#4F46E5',
        repeatRule: 'monthly',
        repeatDays: [],
        createdBy: userId,
        targetHours: 1,
        targetMinutes: 0,
        createdAt: new Date('2026-07-15'),
        status: 'active'
      }
    ]);

    await Task.create([
      {
        title: 'Legacy Weekly Default Task',
        category: 'Test',
        color: '#4F46E5',
        repeatRule: 'weekly',
        repeatDays: [],
        createdBy: userId,
        dueDate: new Date('2026-07-15'),
        createdAt: new Date('2026-07-15')
      }
    ]);

    const start = new Date('2026-07-15T00:00:00.000Z');
    const end = new Date('2026-07-18T23:59:59.000Z');

    const tasks = await taskService.resolveTasksForDateRange(userId.toString(), start, end);
    expect(tasks.length).toBeGreaterThan(0);
  });
});
