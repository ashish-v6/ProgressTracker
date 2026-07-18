"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("../app"));
const setup_1 = require("./setup");
const task_model_1 = require("../models/task.model");
const analytics_service_1 = require("../services/analytics.service");
describe('Analytics API and Service', () => {
    let token;
    let userId;
    beforeEach(async () => {
        await (0, setup_1.clearDatabase)();
        // Register & Login user
        const registerRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send({
            username: 'analytics_user',
            email: 'anal@example.com',
            password: 'Password123!'
        });
        userId = registerRes.body.data.id;
        const loginRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({
            email: 'anal@example.com',
            password: 'Password123!'
        });
        token = loginRes.body.data.accessToken;
    });
    describe('GET /api/analytics', () => {
        it('should retrieve full analytics data successfully', async () => {
            // 1. Create completed tasks, in-progress tasks, pending tasks in the past and today
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            // Create a few tasks via direct DB insertions or API
            await task_model_1.Task.create([
                {
                    title: 'Yesterday Complete Task',
                    category: 'Backend',
                    color: '#4F46E5',
                    priority: 'high',
                    status: 'completed',
                    completed: true,
                    completedAt: yesterday,
                    dueDate: yesterday,
                    targetHours: 2,
                    targetMinutes: 0,
                    actualHours: 2,
                    actualMinutes: 30,
                    createdBy: new mongoose_1.default.Types.ObjectId(userId)
                },
                {
                    title: 'Two Days Ago Complete Task',
                    category: 'Frontend',
                    color: '#10B981',
                    priority: 'medium',
                    status: 'completed',
                    completed: true,
                    completedAt: twoDaysAgo,
                    dueDate: twoDaysAgo,
                    targetHours: 1,
                    targetMinutes: 0,
                    actualHours: 1,
                    actualMinutes: 0,
                    createdBy: new mongoose_1.default.Types.ObjectId(userId)
                },
                {
                    title: 'Today Complete Task',
                    category: 'Design',
                    color: '#F59E0B',
                    priority: 'low',
                    status: 'completed',
                    completed: true,
                    completedAt: today,
                    dueDate: today,
                    targetHours: 3,
                    targetMinutes: 0,
                    actualHours: 1,
                    actualMinutes: 0,
                    createdBy: new mongoose_1.default.Types.ObjectId(userId)
                }
            ]);
            // 2. Fetch analytics
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/analytics')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
            expect(res.body.data.daily).toBeDefined();
            expect(res.body.data.weekly).toBeDefined();
            expect(res.body.data.monthly).toBeDefined();
            expect(res.body.data.yearly).toBeDefined();
            expect(res.body.data.categoryBreakdown).toBeDefined();
            expect(res.body.data.averageHours).toBeDefined();
            expect(res.body.data.averageCompletion).toBeDefined();
            expect(res.body.data.heatmapData).toBeDefined();
        }, 60000);
        it('should also cover analytics service getStatistics method directly', async () => {
            const stats = await analytics_service_1.analyticsService.getStatistics(userId);
            expect(stats).toBeDefined();
            expect(stats.completionRate).toBeDefined();
            expect(stats.averageDailyHours).toBeDefined();
        });
    });
});
//# sourceMappingURL=analytics.test.js.map