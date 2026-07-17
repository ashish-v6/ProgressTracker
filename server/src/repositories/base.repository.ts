import { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';

export class BaseRepository<T extends Document> {
  protected readonly model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(item: any): Promise<T> {
    return this.model.create(item);
  }

  async findById(id: string, projection?: any, options?: any): Promise<T | null> {
    return this.model.findById(id, projection, options).exec() as any;
  }

  async findOne(filter: FilterQuery<T>, projection?: any, options?: any): Promise<T | null> {
    return this.model.findOne(filter, projection, options).exec() as any;
  }

  async find(filter: FilterQuery<T>, projection?: any, options?: any): Promise<T[]> {
    return this.model.find(filter, projection, options).exec() as any;
  }

  async update(id: string, update: UpdateQuery<T>, options: any = { new: true }): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, options).exec() as any;
  }

  async updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: any): Promise<any> {
    return this.model.updateOne(filter, update, options).exec() as any;
  }

  async delete(id: string, options?: any): Promise<T | null> {
    return this.model.findByIdAndDelete(id, options).exec() as any;
  }

  async deleteMany(filter: FilterQuery<T>): Promise<any> {
    return this.model.deleteMany(filter).exec();
  }

  async count(filter: FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }
}

export default BaseRepository;
