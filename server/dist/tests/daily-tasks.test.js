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
describe('Daily Tasks Duplication API Tests', () => {
    let token;
    let userId;
    beforeEach(async () => {
        await (0, setup_1.clearDatabase)();
        // Register test user
        await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send({
            username: 'qa_engineer',
            email: 'qa@example.com',
            password: 'Password123!'
        });
        // Login test user
        const loginRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({
            email: 'qa@example.com',
            password: 'Password123!'
        });
        token = loginRes.body.data.accessToken;
        userId = loginRes.body.data.user.id;
    });
    const recurringPayload = {
        title: 'Daily Coding Practice',
        description: 'Solve one algorithmic problem every day',
        category: 'Studies',
        color: '#3B82F6',
        priority: 'high',
        targetHours: 1,
        targetMinutes: 0,
        repeatRule: 'daily',
        repeatDays: [0, 1, 2, 3, 4, 5, 6]
    };
    describe('Daily Task Generation Idempotency and Concurrency', () => {
        it('should generate exactly ONE task for today and remain idempotent', async () => {
            // 1. Create a recurring task template
            const templateRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/recurring-tasks')
                .set('Authorization', `Bearer ${token}`)
                .send(recurringPayload);
            expect(templateRes.status).toBe(201);
            const templateId = templateRes.body.data.id;
            // 2. Call the generation endpoint multiple times (Simulate multiple page refreshes / sequential calls)
            const localDateStr = new Date().toISOString().split('T')[0];
            const call1 = await (0, supertest_1.default)(app_1.default)
                .get('/api/tasks/today')
                .query({ localDate: localDateStr })
                .set('Authorization', `Bearer ${token}`);
            expect(call1.status).toBe(200);
            const call2 = await (0, supertest_1.default)(app_1.default)
                .get('/api/tasks/today')
                .query({ localDate: localDateStr })
                .set('Authorization', `Bearer ${token}`);
            expect(call2.status).toBe(200);
            const call3 = await (0, supertest_1.default)(app_1.default)
                .get('/api/tasks/today')
                .query({ localDate: localDateStr })
                .set('Authorization', `Bearer ${token}`);
            expect(call3.status).toBe(200);
            // 3. Verify exactly ONE task is generated in the database for today
            const spawnedTasks = await task_model_1.Task.find({
                templateId,
                createdBy: userId
            });
            expect(spawnedTasks.length).toBe(1);
            expect(spawnedTasks[0].title).toBe(recurringPayload.title);
        });
        it('should prevent duplication during high concurrency (concurrent API calls)', async () => {
            // 1. Create recurring task template
            const templateRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/recurring-tasks')
                .set('Authorization', `Bearer ${token}`)
                .send(recurringPayload);
            const templateId = templateRes.body.data.id;
            // 2. Call the generation endpoint concurrently (Simulates rapid multi-tab clicking / simultaneous requests)
            const localDateStr = new Date().toISOString().split('T')[0];
            const responses = await Promise.all([
                (0, supertest_1.default)(app_1.default).get('/api/tasks/today').query({ localDate: localDateStr }).set('Authorization', `Bearer ${token}`),
                (0, supertest_1.default)(app_1.default).get('/api/tasks/today').query({ localDate: localDateStr }).set('Authorization', `Bearer ${token}`),
                (0, supertest_1.default)(app_1.default).get('/api/tasks/today').query({ localDate: localDateStr }).set('Authorization', `Bearer ${token}`),
                (0, supertest_1.default)(app_1.default).get('/api/tasks/today').query({ localDate: localDateStr }).set('Authorization', `Bearer ${token}`),
                (0, supertest_1.default)(app_1.default).get('/api/tasks/today').query({ localDate: localDateStr }).set('Authorization', `Bearer ${token}`)
            ]);
            // All responses should finish with 200 OK (gracefully handling concurrency)
            responses.forEach(res => {
                expect(res.status).toBe(200);
            });
            // 3. Assert exactly one task exists in the database
            const spawnedTasks = await task_model_1.Task.find({
                templateId,
                createdBy: userId
            });
            expect(spawnedTasks.length).toBe(1);
        });
        it('should survive server restart and multiple logouts/logins without duplication', async () => {
            // 1. Create recurring task template
            const templateRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/recurring-tasks')
                .set('Authorization', `Bearer ${token}`)
                .send(recurringPayload);
            const templateId = templateRes.body.data.id;
            const localDateStr = new Date().toISOString().split('T')[0];
            // 2. Call generation
            await (0, supertest_1.default)(app_1.default)
                .get('/api/tasks/today')
                .query({ localDate: localDateStr })
                .set('Authorization', `Bearer ${token}`);
            // 3. Simulate Logout
            await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${token}`);
            // 4. Simulate Server Restart / Dropping mongoose connection and reconnecting
            await mongoose_1.default.connection.close();
            const MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/progresstracker_test';
            await mongoose_1.default.connect(MONGODB_URI);
            // 5. Login again
            const loginRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: 'qa@example.com',
                password: 'Password123!'
            });
            const newToken = loginRes.body.data.accessToken;
            // 6. Call generation again after login/restart
            await (0, supertest_1.default)(app_1.default)
                .get('/api/tasks/today')
                .query({ localDate: localDateStr })
                .set('Authorization', `Bearer ${newToken}`);
            // 7. Verify exactly one task is in database
            const spawnedTasks = await task_model_1.Task.find({
                templateId,
                createdBy: userId
            });
            expect(spawnedTasks.length).toBe(1);
        });
        it('should reject direct mongoose duplicate insertions for the same template and date', async () => {
            const templateId = new mongoose_1.default.Types.ObjectId();
            const dueDate = new Date();
            dueDate.setHours(0, 0, 0, 0);
            // Create first task instance directly via mongoose model
            await task_model_1.Task.create({
                title: 'Mongoose Direct 1',
                category: 'Tech',
                dueDate,
                createdBy: new mongoose_1.default.Types.ObjectId(userId),
                templateId
            });
            // Attempt to create second task instance for the same template and date should fail due to unique index
            let error;
            try {
                await task_model_1.Task.create({
                    title: 'Mongoose Direct 2',
                    category: 'Tech',
                    dueDate,
                    createdBy: new mongoose_1.default.Types.ObjectId(userId),
                    templateId
                });
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.code).toBe(11000); // duplicate key error
        });
    });
});
//# sourceMappingURL=daily-tasks.test.js.map