import mongoose from 'mongoose';
import { RefreshToken } from '../models/refresh-token.model';
import { clearDatabase } from './setup';

describe('RefreshToken Model Virtuals Tests', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it('should compute virtual properties isExpired and isActive correctly', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const activeToken = new RefreshToken({
      token: 'some_active_token',
      userId: new mongoose.Types.ObjectId(),
      expiresAt: futureDate,
      revoked: false
    });

    expect(activeToken.isExpired).toBe(false);
    expect(activeToken.isActive).toBe(true);

    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 1);

    const expiredToken = new RefreshToken({
      token: 'some_expired_token',
      userId: new mongoose.Types.ObjectId(),
      expiresAt: expiredDate,
      revoked: false
    });

    expect(expiredToken.isExpired).toBe(true);
    expect(expiredToken.isActive).toBe(false);

    const revokedToken = new RefreshToken({
      token: 'some_revoked_token',
      userId: new mongoose.Types.ObjectId(),
      expiresAt: futureDate,
      revoked: true
    });

    expect(revokedToken.isActive).toBe(false);
  });
});
