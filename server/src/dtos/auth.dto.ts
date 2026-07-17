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
export const formatUserResponse = (user: IUser): UserResponseDto => {
  return {
    id: user._id ? user._id.toString() : user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar || '',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};
