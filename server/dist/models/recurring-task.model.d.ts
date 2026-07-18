import mongoose from 'mongoose';
import { IRecurringTask } from '../interfaces/recurring-task.interface';
export declare const RecurringTask: mongoose.Model<IRecurringTask, {}, {}, {}, mongoose.Document<unknown, {}, IRecurringTask, {}, {}> & IRecurringTask & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default RecurringTask;
