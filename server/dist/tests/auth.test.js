"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const setup_1 = require("./setup");
const user_model_1 = require("../models/user.model");
const refresh_token_model_1 = require("../models/refresh-token.model");
describe('Authentication API', () => {
    beforeEach(async () => {
        await (0, setup_1.clearDatabase)();
    });
    const testUser = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'Password123!',
        avatar: 'http://example.com/avatar.png'
    };
    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send(testUser);
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.username).toBe(testUser.username);
            expect(res.body.data.email).toBe(testUser.email);
            expect(res.body.data.password).toBeUndefined();
        });
        it('should return 409 Conflict if email is already taken', async () => {
            await (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(testUser);
            const res = await (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(testUser);
            expect(res.status).toBe(409);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Email is already registered');
        });
        it('should return 409 Conflict if username is already taken', async () => {
            await (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(testUser);
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                ...testUser,
                email: 'different@example.com'
            });
            expect(res.status).toBe(409);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Username is already taken');
        });
        it('should return 400 Bad Request for validation errors', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                username: 'u',
                email: 'invalid-email',
                password: '123'
            });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });
    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(testUser);
        });
        it('should login successfully with correct credentials', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: testUser.email,
                password: testUser.password
            });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.accessToken).toBeDefined();
            expect(res.body.data.user.email).toBe(testUser.email);
            // Check HttpOnly Cookie is set
            const cookies = res.headers['set-cookie'];
            expect(cookies).toBeDefined();
            expect(cookies[0]).toContain('refreshToken');
            expect(cookies[0]).toContain('HttpOnly');
        });
        it('should return 401 Unauthorized for invalid password', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: testUser.email,
                password: 'WrongPassword123'
            });
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Invalid email or password');
        });
        it('should return 401 Unauthorized for non-existent email', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: 'nonexistent@example.com',
                password: testUser.password
            });
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });
    describe('GET /api/auth/me', () => {
        let token;
        beforeEach(async () => {
            await (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(testUser);
            const loginRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: testUser.email,
                password: testUser.password
            });
            token = loginRes.body.data.accessToken;
        });
        it('should return user profile details for a valid token', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.username).toBe(testUser.username);
        });
        it('should return 401 Unauthorized when Authorization header is missing', async () => {
            const res = await (0, supertest_1.default)(app_1.default).get('/api/auth/me');
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
        it('should return 401 Unauthorized for an invalid token', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalidtokenhere');
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
        it('should return 401 Unauthorized if user document is deleted/not found', async () => {
            await user_model_1.User.deleteMany({});
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(401);
        });
    });
    describe('POST /api/auth/refresh', () => {
        let refreshTokenCookie;
        beforeEach(async () => {
            await (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(testUser);
            const loginRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: testUser.email,
                password: testUser.password
            });
            const cookies = loginRes.headers['set-cookie'];
            refreshTokenCookie = cookies[0].split(';')[0];
        });
        it('should issue a new access token and rotate the refresh token', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/refresh')
                .set('Cookie', [refreshTokenCookie]);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.accessToken).toBeDefined();
            const newCookies = res.headers['set-cookie'];
            expect(newCookies).toBeDefined();
            expect(newCookies[0]).toContain('refreshToken');
            expect(newCookies[0]).not.toBe(refreshTokenCookie);
        });
        it('should return 401 Unauthorized if refresh token is missing', async () => {
            const res = await (0, supertest_1.default)(app_1.default).post('/api/auth/refresh');
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
        it('should revoke all user sessions and return 403 Forbidden if a revoked token is reused', async () => {
            // First refresh (uses the original token, revoking it and rotating)
            const res1 = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/refresh')
                .set('Cookie', [refreshTokenCookie]);
            expect(res1.status).toBe(200);
            // Second refresh (attempts to reuse the revoked original token)
            const res2 = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/refresh')
                .set('Cookie', [refreshTokenCookie]);
            expect(res2.status).toBe(403);
            expect(res2.body.success).toBe(false);
            expect(res2.body.message).toContain('Token reuse detected');
            // Verify all tokens for this user are now revoked in the database
            const dbTokens = await refresh_token_model_1.RefreshToken.find({});
            expect(dbTokens.every(t => t.revoked)).toBe(true);
        });
        it('should return 401 if refresh token is expired', async () => {
            const dbToken = await refresh_token_model_1.RefreshToken.findOne({});
            if (dbToken) {
                dbToken.expiresAt = new Date(Date.now() - 10000);
                await dbToken.save();
            }
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/refresh')
                .set('Cookie', [refreshTokenCookie]);
            expect(res.status).toBe(401);
            expect(res.body.message).toContain('expired');
        });
        it('should return 401 if refresh token is valid format but not in database', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/refresh')
                .set('Cookie', ['refreshToken=somerandomtokennotindatabase']);
            expect(res.status).toBe(401);
        });
    });
    describe('POST /api/auth/logout', () => {
        let refreshTokenCookie;
        beforeEach(async () => {
            await (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(testUser);
            const loginRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: testUser.email,
                password: testUser.password
            });
            const cookies = loginRes.headers['set-cookie'];
            refreshTokenCookie = cookies[0].split(';')[0];
        });
        it('should logout and clear refresh token successfully', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/logout')
                .set('Cookie', [refreshTokenCookie]);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            // Verify cookie is cleared in response
            const cookies = res.headers['set-cookie'];
            expect(cookies[0]).toContain('refreshToken=;');
            // Verify token is revoked in database
            const tokenVal = refreshTokenCookie.split('=')[1];
            const dbToken = await refresh_token_model_1.RefreshToken.findOne({ token: tokenVal });
            expect(dbToken?.revoked).toBe(true);
        });
        it('should not fail if logout is called with a token not in database', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/logout')
                .set('Cookie', ['refreshToken=somerandomtokennotindatabase']);
            expect(res.status).toBe(200);
        });
    });
});
//# sourceMappingURL=auth.test.js.map