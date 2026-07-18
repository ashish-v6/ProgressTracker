"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const setup_1 = require("./setup");
describe('Reports API', () => {
    let token;
    beforeEach(async () => {
        await (0, setup_1.clearDatabase)();
        // Register & Login user
        await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send({
            username: 'reports_user',
            email: 'rep@example.com',
            password: 'Password123!'
        });
        const loginRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({
            email: 'rep@example.com',
            password: 'Password123!'
        });
        token = loginRes.body.data.accessToken;
    });
    const localDateStr = new Date().toISOString().split('T')[0];
    describe('GET /api/reports/daily', () => {
        it('should retrieve daily study progress report', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/reports/daily')
                .query({ localDate: localDateStr })
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.totalTasks).toBeDefined();
            expect(res.body.data.completedTasks).toBeDefined();
            expect(res.body.data.totalHours).toBeDefined();
            expect(res.body.data.chartData).toBeDefined();
        });
        it('should fail if localDate query param is missing', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/reports/daily')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(400);
        });
    });
    describe('GET /api/reports/weekly', () => {
        it('should retrieve weekly study progress report', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/reports/weekly')
                .query({ localDate: localDateStr })
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.totalTasks).toBeDefined();
            expect(res.body.data.completionPercentage).toBeDefined();
            expect(res.body.data.chartData).toBeDefined();
        });
    });
    describe('GET /api/reports/monthly', () => {
        it('should retrieve monthly study progress report', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/reports/monthly')
                .query({ localDate: localDateStr })
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.totalTasks).toBeDefined();
            expect(res.body.data.averageStudyHours).toBeDefined();
            expect(res.body.data.chartData).toBeDefined();
        });
    });
});
//# sourceMappingURL=reports.test.js.map