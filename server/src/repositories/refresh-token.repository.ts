import { RefreshToken } from '../models/refresh-token.model';
import { IRefreshToken } from '../interfaces/refresh-token.interface';
import { BaseRepository } from './base.repository';

export class RefreshTokenRepository extends BaseRepository<IRefreshToken> {
  constructor() {
    super(RefreshToken);
  }

  async findByToken(token: string): Promise<IRefreshToken | null> {
    return this.model.findOne({ token }).populate('userId').exec();
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.model.updateMany(
      { userId, revoked: false },
      { $set: { revoked: true } }
    ).exec();
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
export default refreshTokenRepository;
