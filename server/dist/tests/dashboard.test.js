"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const setup_1 = require("./setup");
describe('Dashboard API', () => {
    let token;
    beforeEach(async () => {
        await (0, setup_1.clearDatabase)();
        // Register & Login user
        await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send({
            username: 'dashboard_user',
            email: 'dash@example.com',
            password: 'Password123!'
        });
        const loginRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({
            email: 'dash@example.com',
            password: 'Password123!'
        });
        token = loginRes.body.data.accessToken;
    });
    describe('GET /api/dashboard', () => {
        it('should retrieve dashboard summary metrics', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/dashboard')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.today).toBeDefined();
            expect(res.body.data.stats30Days).toBeDefined();
            expect(res.body.data.streaks).toBeDefined();
            expect(res.body.data.productivityScore).toBeDefined();
        });
    });
    describe('GET /api/dashboard/streak', () => {
        it('should retrieve user streak details', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/dashboard/streak')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.streak).toBeDefined();
            expect(res.body.data.longestStreak).toBeDefined();
        });
    });
    describe('GET /api/dashboard/productivity-score', () => {
        it('should retrieve productivity score metrics', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/dashboard/productivity-score')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.productivityScore).toBeDefined();
        });
    });
    describe('GET /api/dashboard/goals', () => {
        it('should retrieve daily goal progress summary', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/dashboard/goals')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.completedHours).toBeDefined();
            expect(res.body.data.targetHours).toBeDefined();
            expect(res.body.data.remainingHours).toBeDefined();
        });
    });
});
//# sourceMappingURL=dashboard.test.js.map