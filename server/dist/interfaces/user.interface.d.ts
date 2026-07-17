import { Document } from 'mongoose';
export interface IUser extends Document {
    username: string;
    email: string;
    password?: string;
    avatar?: string;
    streak?: number;
    longestStreak?: number;
    lastActiveDate?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(password: string): Promise<boolean>;
}
export default IUser;
