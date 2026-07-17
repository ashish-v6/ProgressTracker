import mongoose from 'mongoose';
import { ITimer } from '../interfaces/timer.interface';
export declare const Timer: mongoose.Model<ITimer, {}, {}, {}, mongoose.Document<unknown, {}, ITimer, {}, {}> & ITimer & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Timer;
