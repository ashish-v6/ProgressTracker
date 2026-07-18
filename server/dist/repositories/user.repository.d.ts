import { IUser } from '../interfaces/user.interface';
import { BaseRepository } from './base.repository';
export declare class UserRepository extends BaseRepository<IUser> {
    constructor();
    findByEmail(email: string, selectPassword?: boolean): Promise<IUser | null>;
}
export declare const userRepository: UserRepository;
export default userRepository;
