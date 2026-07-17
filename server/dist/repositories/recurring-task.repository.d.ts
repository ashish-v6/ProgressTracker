import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import { IRecurringTask } from '../interfaces/recurring-task.interface';
declare class RecurringTaskRepository {
    create(data: Partial<IRecurringTask>): Promise<IRecurringTask>;
    findById(id: string): Promise<IRecurringTask | null>;
    findOne(query: FilterQuery<IRecurringTask>): Promise<IRecurringTask | null>;
    find(query: FilterQuery<IRecurringTask>, projection?: any, options?: QueryOptions): Promise<IRecurringTask[]>;
    update(id: string, data: UpdateQuery<IRecurringTask>): Promise<IRecurringTask | null>;
    updateOne(query: FilterQuery<IRecurringTask>, data: UpdateQuery<IRecurringTask>, options?: any): Promise<any>;
    delete(id: string): Promise<IRecurringTask | null>;
    deleteMany(query: FilterQuery<IRecurringTask>): Promise<any>;
}
export declare const recurringTaskRepository: RecurringTaskRepository;
export default recurringTaskRepository;
