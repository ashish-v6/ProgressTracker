import { Response } from 'express';
import { authService } from '../services/auth.service';
import { userRepository } from '../repositories/user.repository';
import { UnauthorizedError } from '../utils/errors';
import { AuthenticatedRequest } from '../types/express';
import { asyncHandler } from '../utils/async-handler';
import { formatUserResponse } from '../dtos/auth.dto';

// Cookie config helper
const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  });
};

export const register = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { username, email, password, avatar } = req.body;
  const user = await authService.register(username, email, password, avatar);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: formatUserResponse(user)
  });
});

export const login = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(email, password);

  // Store refresh token securely in an httpOnly cookie
  setRefreshTokenCookie(res, refreshToken);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: formatUserResponse(user),
      accessToken
    }
  });
});

export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const token = req.cookies.refreshToken;
  if (token) {
    await authService.logout(token);
  }

  // Clear cookie from client browser
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: null
  });
});

export const refresh = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    throw new UnauthorizedError('Refresh token is missing');
  }

  const { accessToken, newRefreshToken } = await authService.refreshToken(token);

  // Set the rotated refresh token in cookie
  setRefreshTokenCookie(res, newRefreshToken);

  res.status(200).json({
    success: true,
    message: 'Access token refreshed successfully',
    data: {
      accessToken
    }
  });
});

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !req.user.id) {
    throw new UnauthorizedError('Not authenticated');
  }

  const user = await userRepository.findById(req.user.id);
  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  res.status(200).json({
    success: true,
    message: 'Current user retrieved successfully',
    data: formatUserResponse(user)
  });
});
