import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import { RecurringTask } from '../models/recurring-task.model';
import { IRecurringTask } from '../interfaces/recurring-task.interface';

class RecurringTaskRepository {
  public async create(data: Partial<IRecurringTask>): Promise<IRecurringTask> {
    return RecurringTask.create(data);
  }

  public async findById(id: string): Promise<IRecurringTask | null> {
    return RecurringTask.findById(id);
  }

  public async findOne(query: FilterQuery<IRecurringTask>): Promise<IRecurringTask | null> {
    return RecurringTask.findOne(query);
  }

  public async find(
    query: FilterQuery<IRecurringTask>,
    projection?: any,
    options?: QueryOptions
  ): Promise<IRecurringTask[]> {
    return RecurringTask.find(query, projection, options);
  }

  public async update(id: string, data: UpdateQuery<IRecurringTask>): Promise<IRecurringTask | null> {
    return RecurringTask.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  public async updateOne(
    query: FilterQuery<IRecurringTask>,
    data: UpdateQuery<IRecurringTask>,
    options?: any
  ): Promise<any> {
    return RecurringTask.updateOne(query, data, options);
  }

  public async delete(id: string): Promise<IRecurringTask | null> {
    return RecurringTask.findByIdAndDelete(id);
  }

  public async deleteMany(query: FilterQuery<IRecurringTask>): Promise<any> {
    return RecurringTask.deleteMany(query);
  }
}

export const recurringTaskRepository = new RecurringTaskRepository();
export default recurringTaskRepository;
