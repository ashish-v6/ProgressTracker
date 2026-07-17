import { IUser } from '../interfaces/user.interface';
declare class AuthService {
    generateAccessToken(userId: string): string;
    generateRefreshToken(userId: string): Promise<string>;
    register(username: string, email: string, password: string, avatar?: string): Promise<IUser>;
    login(email: string, password: string): Promise<{
        user: IUser;
        accessToken: string;
        refreshToken: string;
    }>;
    refreshToken(token: string): Promise<{
        accessToken: string;
        newRefreshToken: string;
    }>;
    logout(token: string): Promise<void>;
}
export declare const authService: AuthService;
export default authService;
