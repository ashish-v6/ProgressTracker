"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const user_repository_1 = require("../repositories/user.repository");
const refresh_token_repository_1 = require("../repositories/refresh-token.repository");
const errors_1 = require("../utils/errors");
class AuthService {
    // Generate JWT Access Token (expires in 15 minutes)
    generateAccessToken(userId) {
        const secret = process.env.JWT_ACCESS_SECRET || 'default_access_secret_12345';
        const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN || '15m');
        return jsonwebtoken_1.default.sign({ userId }, secret, { expiresIn });
    }
    // Generate Refresh Token (expires in 7 days) and save to database
    async generateRefreshToken(userId) {
        const rawToken = crypto_1.default.randomBytes(40).toString('hex');
        const expiresInDays = 7;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);
        await refresh_token_repository_1.refreshTokenRepository.create({
            token: rawToken,
            userId,
            expiresAt,
            revoked: false
        });
        return rawToken;
    }
    // Register User
    async register(username, email, password, avatar) {
        const existingEmail = await user_repository_1.userRepository.findByEmail(email);
        if (existingEmail) {
            throw new errors_1.ConflictError('Email is already registered');
        }
        const existingUsername = await user_repository_1.userRepository.findOne({ username });
        if (existingUsername) {
            throw new errors_1.ConflictError('Username is already taken');
        }
        return user_repository_1.userRepository.create({ username, email, password, avatar });
    }
    // Login User
    async login(email, password) {
        const user = await user_repository_1.userRepository.findByEmail(email, true);
        if (!user) {
            throw new errors_1.UnauthorizedError('Invalid email or password');
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new errors_1.UnauthorizedError('Invalid email or password');
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
    async refreshToken(token) {
        const refreshTokenDoc = await refresh_token_repository_1.refreshTokenRepository.findByToken(token);
        if (!refreshTokenDoc) {
            throw new errors_1.UnauthorizedError('Invalid refresh token');
        }
        // Reuse Detection: If a revoked token is used, assume malicious reuse and revoke ALL sessions for security
        if (refreshTokenDoc.revoked) {
            const userId = refreshTokenDoc.userId._id.toString();
            await refresh_token_repository_1.refreshTokenRepository.revokeAllForUser(userId);
            throw new errors_1.ForbiddenError('Token reuse detected. All active sessions for this user have been revoked.');
        }
        if (new Date() >= refreshTokenDoc.expiresAt) {
            throw new errors_1.UnauthorizedError('Refresh token has expired');
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
    async logout(token) {
        const refreshTokenDoc = await refresh_token_repository_1.refreshTokenRepository.findByToken(token);
        if (refreshTokenDoc) {
            refreshTokenDoc.revoked = true;
            await refreshTokenDoc.save();
        }
    }
}
exports.authService = new AuthService();
exports.default = exports.authService;
//# sourceMappingURL=auth.service.js.map