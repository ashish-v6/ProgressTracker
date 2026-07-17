import { IUser } from '../interfaces/user.interface';
export interface UserResponseDto {
    id: string;
    username: string;
    email: string;
    avatar: string;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Strips password hash and structural metadata from User models
 */
export declare const formatUserResponse: (user: IUser) => UserResponseDto;
