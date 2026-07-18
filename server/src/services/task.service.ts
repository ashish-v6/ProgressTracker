import { taskRepository } from '../repositories/task.repository';
import { streakService } from './streak.service';
import { recurringTaskService } from './recurring-task.service';
import { ITask } from '../interfaces/task.interface';
import { NotFoundError, ValidationError } from '../utils/errors';
import { Types } from 'mongoose';

class TaskService {
  /**
   * Create a standard or recurring task template
   */
  public async createTask(userId: string, taskData: Partial<ITask>): Promise<ITask> {
    const data = {
      ...taskData,
      createdBy: new Types.ObjectId(userId),
      completed: taskData.status === 'completed',
      completedAt: taskData.status === 'completed' ? new Date() : null,
      actualHours: 0,
      actualMinutes: 0
    };

    // Set repeatDays defaults based on rules if empty
    if (data.repeatRule && data.repeatRule !== 'none' && (!data.repeatDays || data.repeatDays.length === 0)) {
      if (data.repeatRule === 'weekdays') {
        data.repeatDays = [1, 2, 3, 4, 5];
      } else if (data.repeatRule === 'weekends') {
        data.repeatDays = [0, 6];
      } else if (data.repeatRule === 'daily') {
        data.repeatDays = [0, 1, 2, 3, 4, 5, 6];
      } else if (data.repeatRule === 'weekly' && data.dueDate) {
        data.repeatDays = [new Date(data.dueDate).getDay()];
      }
    }

    const task = await taskRepository.create(data);

    // If template is created and matches today, instantly instantiate today's instance
    if (task.repeatRule !== 'none') {
      await this.resolveRecurringTasksForDate(userId, new Date());
    }

    return task;
  }

  /**
   * Get single task details
   */
  public async getTaskById(userId: string, taskId: string): Promise<ITask> {
    const task = await taskRepository.findById(taskId);
    if (!task || task.createdBy.toString() !== userId) {
      throw new NotFoundError('Task not found');
    }
    return task;
  }

  /**
   * Update task details (and trigger streak recalculation if completed status flips)
   */
  public async updateTask(userId: string, taskId: string, updateData: Partial<ITask>): Promise<ITask> {
    const task = await taskRepository.findById(taskId);
    if (!task || task.createdBy.toString() !== userId) {
      throw new NotFoundError('Task not found');
    }

    // Determine if completed status changes (either via completed flag or status flag)
    const isCompleted = updateData.completed !== undefined 
      ? updateData.completed 
      : (updateData.status ? updateData.status === 'completed' : task.completed);

    const completionStatusFlipped = isCompleted !== task.completed;

    if (completionStatusFlipped) {
      updateData.completed = isCompleted;
      updateData.status = isCompleted ? 'completed' : 'pending';
      updateData.completedAt = isCompleted ? new Date() : null;
    } else if (updateData.status && updateData.status !== task.status) {
      // Status changed but didn't flip completed flag (e.g. pending -> in_progress)
      updateData.completed = updateData.status === 'completed';
      updateData.completedAt = updateData.status === 'completed' ? new Date() : null;
    }

    const updatedTask = await taskRepository.update(taskId, updateData);
    if (!updatedTask) {
      throw new NotFoundError('Task not found');
    }

    if (completionStatusFlipped) {
      await streakService.recalculateStreak(userId);
    }

    return updatedTask;
  }

  /**
   * Delete a task (cascades deletes to concrete instances if this is a recurring template)
   */
  public async deleteTask(userId: string, taskId: string): Promise<void> {
    const task = await taskRepository.findById(taskId);
    if (!task || task.createdBy.toString() !== userId) {
      throw new NotFoundError('Task not found');
    }

    // Delete the task itself
    await taskRepository.delete(taskId);

    // If it was a recurring template, delete associated daily tasks that are NOT completed
    if (task.repeatRule !== 'none' && !task.templateId) {
      await taskRepository.deleteMany({ 
        templateId: task._id,
        completed: false
      });
    }

    await streakService.recalculateStreak(userId);
  }

  /**
   * Duplicate a task (clones values)
   */
  public async duplicateTask(userId: string, taskId: string): Promise<ITask> {
    const task = await taskRepository.findById(taskId);
    if (!task || task.createdBy.toString() !== userId) {
      throw new NotFoundError('Task not found');
    }

    const cloneData = {
      title: `${task.title} (Copy)`,
      description: task.description,
      category: task.category,
      color: task.color,
      priority: task.priority,
      status: 'pending',
      targetHours: task.targetHours,
      targetMinutes: task.targetMinutes,
      actualHours: 0,
      actualMinutes: 0,
      completed: false,
      completedAt: null,
      repeatRule: 'none',
      repeatDays: [],
      dueDate: task.dueDate,
      notes: task.notes,
      tags: task.tags,
      createdBy: new Types.ObjectId(userId)
    };

    return taskRepository.create(cloneData);
  }

  /**
   * Bulk delete tasks
   */
  public async bulkDelete(userId: string, taskIds: string[]): Promise<void> {
    const objectIds = taskIds.map(id => new Types.ObjectId(id));
    await taskRepository.deleteMany({
      _id: { $in: objectIds },
      createdBy: new Types.ObjectId(userId)
    });

    await streakService.recalculateStreak(userId);
  }

  /**
   * Bulk complete tasks
   */
  public async bulkComplete(userId: string, taskIds: string[]): Promise<void> {
    const objectIds = taskIds.map(id => new Types.ObjectId(id));
    await taskRepository.updateMany(
      {
        _id: { $in: objectIds },
        createdBy: new Types.ObjectId(userId)
      },
      {
        $set: {
          status: 'completed',
          completed: true,
          completedAt: new Date()
        }
      }
    );

    await streakService.recalculateStreak(userId);
  }

  /**
   * Search, filter, and paginate tasks
   */
  public async queryTasks(
    userId: string,
    filters: any,
    options: any
  ): Promise<{ tasks: ITask[]; total: number; page: number; pages: number }> {
    return taskRepository.findTasks(userId, filters, options);
  }

  /**
   * Resolves and instantiates recurring templates for a specific date, returning all concrete tasks
   */
  public async resolveRecurringTasksForDate(userId: string, targetDate: Date): Promise<ITask[]> {
    const startOfDay = new Date(targetDate.getTime());
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate.getTime());
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Trigger generation for RecurringTask model templates first to ensure unified behavior
    await recurringTaskService.generateTasksForDateRange(userId, startOfDay, endOfDay);

    // 2. Get Task-model-based templates (legacy / alternative)
    const templates = await taskRepository.findRecurringTemplates(userId);

    // 3. Loop templates and check if they match the date
    for (const template of templates) {
      if (new Date(template.createdAt) > endOfDay) {
        continue;
      }

      if (this.doesTemplateMatchDate(template, targetDate)) {
        const instance = await taskRepository.findInstanceByTemplateAndDate(
          template.id,
          startOfDay,
          endOfDay
        );

        if (!instance) {
          try {
            await taskRepository.create({
              title: template.title,
              description: template.description,
              category: template.category,
              color: template.color,
              priority: template.priority,
              status: 'pending',
              targetHours: template.targetHours,
              targetMinutes: template.targetMinutes,
              actualHours: 0,
              actualMinutes: 0,
              completed: false,
              repeatRule: 'none',
              dueDate: startOfDay,
              notes: template.notes,
              tags: template.tags,
              createdBy: template.createdBy,
              templateId: template._id
            });
          } catch (error: any) {
            // Ignore duplicate key errors from concurrent requests
            if (error.code !== 11000) {
              throw error;
            }
          }
        }
      }
    }

    const result = await taskRepository.find(
      {
        createdBy: userId,
        dueDate: { $gte: startOfDay, $lte: endOfDay },
        repeatRule: 'none'
      },
      null,
      { sort: { createdAt: 1 } }
    );

    return result;
  }
  /**
   * Resolves and returns tasks for a range of dates
   */
  public async resolveTasksForDateRange(userId: string, startDate: Date, endDate: Date): Promise<ITask[]> {
    const start = new Date(startDate.getTime());
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate.getTime());
    end.setHours(23, 59, 59, 999);

    const recurringTemplates = await recurringTaskService.listRecurringTasks(userId);
    const activeRecurringTemplates = recurringTemplates.filter(t => t.status === 'active');
    const legacyTemplates = await taskRepository.findRecurringTemplates(userId);

    const existingTasks = await taskRepository.find({
      createdBy: userId,
      dueDate: { $gte: start, $lte: end }
    });

    const getLocalDateStr = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const existingMap = new Set<string>();
    existingTasks.forEach(t => {
      if (t.templateId) {
        existingMap.add(`${t.templateId.toString()}_${getLocalDateStr(t.dueDate)}`);
      }
    });

    const newTasksToCreate: any[] = [];

    const doesLegacyMatch = (template: ITask, date: Date): boolean => {
      const dayOfWeek = date.getDay();
      const rule = template.repeatRule;
      const days = template.repeatDays || [];

      if (rule === 'daily') return true;
      if (rule === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5;
      if (rule === 'weekends') return dayOfWeek === 0 || dayOfWeek === 6;
      if (rule === 'weekly') {
        if (days.length > 0) return days.includes(dayOfWeek);
        return dayOfWeek === new Date(template.dueDate).getDay();
      }
      if (rule === 'custom') return days.includes(dayOfWeek);
      return false;
    };

    const doesRecurringMatch = (template: any, date: Date): boolean => {
      const dayOfWeek = date.getDay();
      const dayOfMonth = date.getDate();
      const rule = template.repeatRule;
      const days = template.repeatDays || [];

      const templateCreatedDate = new Date(template.createdAt);
      templateCreatedDate.setHours(0, 0, 0, 0);
      const targetCheckDate = new Date(date.getTime());
      targetCheckDate.setHours(0, 0, 0, 0);
      if (targetCheckDate < templateCreatedDate) return false;

      if (rule === 'daily') return true;
      if (rule === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5;
      if (rule === 'weekends') return dayOfWeek === 0 || dayOfWeek === 6;
      if (rule === 'weekly') {
        if (days.length > 0) return days.includes(dayOfWeek);
        return dayOfWeek === new Date(template.createdAt).getDay();
      }
      if (rule === 'monthly') {
        if (days.length > 0) return days.includes(dayOfMonth);
        return dayOfMonth === new Date(template.createdAt).getDate();
      }
      if (rule === 'custom') return days.includes(dayOfWeek);
      return false;
    };

    const checker = new Date(start.getTime());
    while (checker <= end) {
      const dateStr = getLocalDateStr(checker);
      const currentStart = new Date(checker.getTime());
      currentStart.setHours(0, 0, 0, 0);

      for (const template of activeRecurringTemplates) {
        if (doesRecurringMatch(template, checker)) {
          const key = `${template._id.toString()}_${dateStr}`;
          if (!existingMap.has(key)) {
            newTasksToCreate.push({
              title: template.title,
              description: template.description || '',
              category: template.category,
              color: template.color,
              priority: template.priority,
              status: 'pending',
              targetHours: template.targetHours,
              targetMinutes: template.targetMinutes,
              actualHours: 0,
              actualMinutes: 0,
              completed: false,
              repeatRule: 'none',
              dueDate: currentStart,
              notes: template.notes || '',
              tags: template.tags || [],
              createdBy: template.createdBy,
              templateId: template._id
            });
            existingMap.add(key);
          }
        }
      }

      for (const template of legacyTemplates) {
        if (new Date(template.createdAt) <= currentStart && doesLegacyMatch(template, checker)) {
          const key = `${template._id.toString()}_${dateStr}`;
          if (!existingMap.has(key)) {
            newTasksToCreate.push({
              title: template.title,
              description: template.description,
              category: template.category,
              color: template.color,
              priority: template.priority,
              status: 'pending',
              targetHours: template.targetHours,
              targetMinutes: template.targetMinutes,
              actualHours: 0,
              actualMinutes: 0,
              completed: false,
              repeatRule: 'none',
              dueDate: currentStart,
              notes: template.notes,
              tags: template.tags,
              createdBy: template.createdBy,
              templateId: template._id
            });
            existingMap.add(key);
          }
        }
      }

      checker.setDate(checker.getDate() + 1);
    }

    if (newTasksToCreate.length > 0) {
      await taskRepository.create(newTasksToCreate);
    }

    return taskRepository.find(
      {
        createdBy: userId,
        dueDate: { $gte: start, $lte: end },
        repeatRule: 'none'
      },
      null,
      { sort: { dueDate: 1, createdAt: 1 } }
    );
  }

  /**
   * Helper to check if a recurring task template matches a given day
   */
  private doesTemplateMatchDate(template: ITask, date: Date): boolean {
    const dayOfWeek = date.getDay();
    const rule = template.repeatRule;
    const days = template.repeatDays || [];

    if (rule === 'daily') {
      return true;
    }
    if (rule === 'weekdays') {
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    }
    if (rule === 'weekends') {
      return dayOfWeek === 0 || dayOfWeek === 6;
    }
    if (rule === 'weekly') {
      if (days.length > 0) {
        return days.includes(dayOfWeek);
      }
      return dayOfWeek === new Date(template.dueDate).getDay();
    }
    if (rule === 'custom') {
      return days.includes(dayOfWeek);
    }
    return false;
  }
}

export const taskService = new TaskService();
export default taskService;
