import mongoose from 'mongoose';
import { IRefreshToken } from '../interfaces/refresh-token.interface';
export declare const RefreshToken: mongoose.Model<IRefreshToken, {}, {}, {}, mongoose.Document<unknown, {}, IRefreshToken, {}, {}> & IRefreshToken & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default RefreshToken;
