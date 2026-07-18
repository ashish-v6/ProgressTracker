import { IRefreshToken } from '../interfaces/refresh-token.interface';
import { BaseRepository } from './base.repository';
export declare class RefreshTokenRepository extends BaseRepository<IRefreshToken> {
    constructor();
    findByToken(token: string): Promise<IRefreshToken | null>;
    revokeAllForUser(userId: string): Promise<void>;
}
export declare const refreshTokenRepository: RefreshTokenRepository;
export default refreshTokenRepository;
