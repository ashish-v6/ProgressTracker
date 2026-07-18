"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const setup_1 = require("./setup");
describe('Calendar API', () => {
    let token;
    beforeEach(async () => {
        await (0, setup_1.clearDatabase)();
        // Register & Login user
        await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send({
            username: 'calendar_user',
            email: 'cal@example.com',
            password: 'Password123!'
        });
        const loginRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({
            email: 'cal@example.com',
            password: 'Password123!'
        });
        token = loginRes.body.data.accessToken;
    });
    describe('GET /api/calendar', () => {
        it('should retrieve calendar monthly summaries successfully', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/calendar')
                .query({ year: 2026, month: 7 })
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.monthlySummary).toBeDefined();
            expect(res.body.data.yearSummary).toBeDefined();
        });
        it('should fail with validation errors for invalid year/month parameters', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/calendar')
                .query({ year: 'invalid', month: 13 })
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(400);
        });
    });
    describe('GET /api/calendar/tasks', () => {
        it('should retrieve tasks for a specific date successfully', async () => {
            const dateStr = '2026-07-18';
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/calendar/tasks')
                .query({ date: dateStr })
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
        it('should fail if date is missing or in wrong format', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/calendar/tasks')
                .query({ date: '18-07-2026' })
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(400);
        });
    });
});
//# sourceMappingURL=calendar.test.js.map