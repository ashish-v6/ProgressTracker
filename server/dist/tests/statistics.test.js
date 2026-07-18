"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const setup_1 = require("./setup");
describe('Statistics API', () => {
    let token;
    beforeEach(async () => {
        await (0, setup_1.clearDatabase)();
        // Register & Login user
        await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send({
            username: 'stats_user',
            email: 'stats@example.com',
            password: 'Password123!'
        });
        const loginRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({
            email: 'stats@example.com',
            password: 'Password123!'
        });
        token = loginRes.body.data.accessToken;
    });
    const localDateStr = new Date().toISOString().split('T')[0];
    describe('GET /api/statistics/today', () => {
        it('should retrieve today\'s task statistics successfully', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/statistics/today')
                .query({ localDate: localDateStr })
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.totalTasks).toBeDefined();
            expect(res.body.data.completedTasks).toBeDefined();
        });
    });
    describe('GET /api/statistics/weekly', () => {
        it('should retrieve weekly task statistics successfully', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/statistics/weekly')
                .query({ localDate: localDateStr })
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.completionRate).toBeDefined();
            expect(res.body.data.totalHours).toBeDefined();
        });
    });
    describe('GET /api/statistics/monthly', () => {
        it('should retrieve monthly task statistics successfully', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/statistics/monthly')
                .query({ localDate: localDateStr })
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data.totalTasks).toBeDefined();
        });
    });
    describe('GET /api/statistics/yearly', () => {
        it('should retrieve yearly task statistics successfully', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/statistics/yearly')
                .query({ localDate: localDateStr })
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data.totalTasks).toBeDefined();
        });
    });
    describe('GET /api/statistics/category', () => {
        it('should retrieve all-time task statistics by category successfully', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/statistics/category')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
});
//# sourceMappingURL=statistics.test.js.map