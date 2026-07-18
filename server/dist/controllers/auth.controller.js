"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.refresh = exports.logout = exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const user_repository_1 = require("../repositories/user.repository");
const errors_1 = require("../utils/errors");
const async_handler_1 = require("../utils/async-handler");
const auth_dto_1 = require("../dtos/auth.dto");
// Cookie config helper
const setRefreshTokenCookie = (res, token) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: isProduction,
        // 'none' is required in production so cross-origin requests (Vercel → Render)
        // include the HttpOnly cookie. 'lax' is safe for local development (same-origin).
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });
};
exports.register = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { username, email, password, avatar } = req.body;
    const user = await auth_service_1.authService.register(username, email, password, avatar);
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: (0, auth_dto_1.formatUserResponse)(user)
    });
});
exports.login = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await auth_service_1.authService.login(email, password);
    // Store refresh token securely in an httpOnly cookie
    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
            user: (0, auth_dto_1.formatUserResponse)(user),
            accessToken
        }
    });
});
exports.logout = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const token = req.cookies.refreshToken;
    if (token) {
        await auth_service_1.authService.logout(token);
    }
    // Clear cookie from client browser
    // sameSite must match what was set on login, otherwise clearCookie has no effect
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
        data: null
    });
});
exports.refresh = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) {
        throw new errors_1.UnauthorizedError('Refresh token is missing');
    }
    const { accessToken, newRefreshToken } = await auth_service_1.authService.refreshToken(token);
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
exports.getMe = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.user || !req.user.id) {
        throw new errors_1.UnauthorizedError('Not authenticated');
    }
    const user = await user_repository_1.userRepository.findById(req.user.id);
    if (!user) {
        throw new errors_1.UnauthorizedError('User not found');
    }
    res.status(200).json({
        success: true,
        message: 'Current user retrieved successfully',
        data: (0, auth_dto_1.formatUserResponse)(user)
    });
});
//# sourceMappingURL=auth.controller.js.map