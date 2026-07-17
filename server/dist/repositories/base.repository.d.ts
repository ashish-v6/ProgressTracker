import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';
export declare class BaseRepository<T extends Document> {
    protected readonly model: Model<T>;
    constructor(model: Model<T>);
    create(item: any): Promise<T>;
    findById(id: string, projection?: any, options?: any): Promise<T | null>;
    findOne(filter: FilterQuery<T>, projection?: any, options?: any): Promise<T | null>;
    find(filter: FilterQuery<T>, projection?: any, options?: any): Promise<T[]>;
    update(id: string, update: UpdateQuery<T>, options?: any): Promise<T | null>;
    updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: any): Promise<any>;
    delete(id: string, options?: any): Promise<T | null>;
    deleteMany(filter: FilterQuery<T>): Promise<any>;
    count(filter: FilterQuery<T>): Promise<number>;
}
export default BaseRepository;
