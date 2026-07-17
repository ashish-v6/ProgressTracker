import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { userRepository } from '../repositories/user.repository';
import { refreshTokenRepository } from '../repositories/refresh-token.repository';
import { UnauthorizedError, ConflictError, ForbiddenError } from '../utils/errors';
import { IUser } from '../interfaces/user.interface';

class AuthService {
  // Generate JWT Access Token (expires in 15 minutes)
  public generateAccessToken(userId: string): string {
    const secret = process.env.JWT_ACCESS_SECRET || 'default_access_secret_12345';
    const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any;
    return jwt.sign({ userId }, secret, { expiresIn });
  }

  // Generate Refresh Token (expires in 7 days) and save to database
  public async generateRefreshToken(userId: string): Promise<string> {
    const rawToken = crypto.randomBytes(40).toString('hex');
    const expiresInDays = 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    await refreshTokenRepository.create({
      token: rawToken,
      userId,
      expiresAt,
      revoked: false
    });

    return rawToken;
  }

  // Register User
  public async register(username: string, email: string, password: string, avatar?: string): Promise<IUser> {
    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) {
      throw new ConflictError('Email is already registered');
    }

    const existingUsername = await userRepository.findOne({ username });
    if (existingUsername) {
      throw new ConflictError('Username is already taken');
    }

    return userRepository.create({ username, email, password, avatar });
  }

  // Login User
  public async login(email: string, password: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user,
      accessToken,
      refreshToken
    };
  }

  // Refresh JWT access token with rotation and automatic reuse fraud detection
  public async refreshToken(token: string): Promise<{ accessToken: string; newRefreshToken: string }> {
    const refreshTokenDoc = await refreshTokenRepository.findByToken(token);
    
    if (!refreshTokenDoc) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Reuse Detection: If a revoked token is used, assume malicious reuse and revoke ALL sessions for security
    if (refreshTokenDoc.revoked) {
      const userId = refreshTokenDoc.userId._id.toString();
      await refreshTokenRepository.revokeAllForUser(userId);
      throw new ForbiddenError('Token reuse detected. All active sessions for this user have been revoked.');
    }

    if (new Date() >= refreshTokenDoc.expiresAt) {
      throw new UnauthorizedError('Refresh token has expired');
    }

    const userId = refreshTokenDoc.userId._id.toString();

    // Create a new pair of tokens (Token Rotation)
    const accessToken = this.generateAccessToken(userId);
    const newRefreshToken = await this.generateRefreshToken(userId);

    // Mark current refresh token as revoked and update replacement audit trail
    refreshTokenDoc.revoked = true;
    refreshTokenDoc.replacedByToken = newRefreshToken;
    await refreshTokenDoc.save();

    return {
      accessToken,
      newRefreshToken
    };
  }

  // Log out a specific session token
  public async logout(token: string): Promise<void> {
    const refreshTokenDoc = await refreshTokenRepository.findByToken(token);
    if (refreshTokenDoc) {
      refreshTokenDoc.revoked = true;
      await refreshTokenDoc.save();
    }
  }
}

export const authService = new AuthService();
export default authService;
