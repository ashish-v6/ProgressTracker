import { Types } from 'mongoose';
import { recurringTaskRepository } from '../repositories/recurring-task.repository';
import { taskRepository } from '../repositories/task.repository';
import { IRecurringTask } from '../interfaces/recurring-task.interface';
import { NotFoundError } from '../utils/errors';

class RecurringTaskService {
  /**
   * Create a recurring task template
   */
  public async createRecurringTask(userId: string, data: Partial<IRecurringTask>): Promise<IRecurringTask> {
    const payload = {
      ...data,
      createdBy: new Types.ObjectId(userId),
      status: 'active' as const
    };
    return recurringTaskRepository.create(payload);
  }

  /**
   * Retrieve a recurring task template by ID
   */
  public async getRecurringTaskById(userId: string, id: string): Promise<IRecurringTask> {
    const template = await recurringTaskRepository.findById(id);
    if (!template || template.createdBy.toString() !== userId) {
      throw new NotFoundError('Recurring task template not found');
    }
    return template;
  }

  /**
   * Update a recurring task template
   */
  public async updateRecurringTask(userId: string, id: string, data: Partial<IRecurringTask>): Promise<IRecurringTask> {
    const template = await this.getRecurringTaskById(userId, id);
    const updated = await recurringTaskRepository.update(id, data);
    if (!updated) {
      throw new NotFoundError('Recurring task template not found');
    }
    return updated;
  }

  /**
   * Delete a recurring task template
   * Business rule: Deleting a recurring template should NOT delete previously completed tasks.
   */
  public async deleteRecurringTask(userId: string, id: string): Promise<void> {
    const template = await this.getRecurringTaskById(userId, id);
    
    // Delete the template
    await recurringTaskRepository.delete(id);

    // Delete associated daily tasks that are NOT completed
    await taskRepository.deleteMany({
      templateId: new Types.ObjectId(id),
      completed: false
    });
  }

  /**
   * Pause a recurring task template
   * Business rule: Pausing a recurring task should stop future generation
   */
  public async pauseRecurringTask(userId: string, id: string): Promise<IRecurringTask> {
    return this.updateRecurringTask(userId, id, { status: 'paused' });
  }

  /**
   * Resume a recurring task template
   * Business rule: Resuming should continue future generation
   */
  public async resumeRecurringTask(userId: string, id: string): Promise<IRecurringTask> {
    return this.updateRecurringTask(userId, id, { status: 'active' });
  }

  /**
   * List all recurring tasks for a user
   */
  public async listRecurringTasks(userId: string): Promise<IRecurringTask[]> {
    return recurringTaskRepository.find(
      { createdBy: new Types.ObjectId(userId) },
      null,
      { sort: { createdAt: -1 } }
    );
  }

  /**
   * Timezone-aware automatic task generation algorithm
   * Resolves, evaluates, and generates missing daily tasks for a user within a date range
   */
  public async generateTasksForDateRange(userId: string, startDate: Date, endDate: Date): Promise<void> {
    const start = new Date(startDate.getTime());
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate.getTime());
    end.setHours(23, 59, 59, 999);

    // Only select active templates
    const templates = await recurringTaskRepository.find({
      createdBy: new Types.ObjectId(userId),
      status: 'active'
    });

    const checker = new Date(start.getTime());
    while (checker <= end) {
      const currentStart = new Date(checker.getTime());
      currentStart.setHours(0, 0, 0, 0);
      const currentEnd = new Date(checker.getTime());
      currentEnd.setHours(23, 59, 59, 999);

      for (const template of templates) {
        if (this.doesTemplateMatchDate(template, checker)) {
          // Check if an instance (completed OR pending) has already been spawned for today
          const existingTask = await taskRepository.findOne({
            templateId: template._id,
            dueDate: { $gte: currentStart, $lte: currentEnd }
          });

          if (!existingTask) {
            // Spawn the daily task
            await taskRepository.create({
              title: template.title,
              description: template.description || '',
              category: template.category,
              color: template.color,
              priority: template.priority as any,
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
          }
        }
      }
      checker.setDate(checker.getDate() + 1);
    }
  }

  /**
   * Helper to check if a recurring task template falls on a given date
   */
  private doesTemplateMatchDate(template: IRecurringTask, date: Date): boolean {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday...
    const dayOfMonth = date.getDate(); // 1 to 31
    const rule = template.repeatRule;
    const days = template.repeatDays || [];

    // Do not generate tasks for dates before the template was created
    const templateCreatedDate = new Date(template.createdAt);
    templateCreatedDate.setHours(0, 0, 0, 0);
    const targetCheckDate = new Date(date.getTime());
    targetCheckDate.setHours(0, 0, 0, 0);
    if (targetCheckDate < templateCreatedDate) {
      return false;
    }

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
      return dayOfWeek === new Date(template.createdAt).getDay();
    }
    if (rule === 'monthly') {
      if (days.length > 0) {
        return days.includes(dayOfMonth);
      }
      return dayOfMonth === new Date(template.createdAt).getDate();
    }
    if (rule === 'custom') {
      return days.includes(dayOfWeek);
    }
    return false;
  }
}

export const recurringTaskService = new RecurringTaskService();
export default recurringTaskService;
