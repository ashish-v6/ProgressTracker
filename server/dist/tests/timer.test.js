"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const setup_1 = require("./setup");
const task_model_1 = require("../models/task.model");
const timer_model_1 = require("../models/timer.model");
describe('Timer API', () => {
    let token;
    let taskId;
    beforeEach(async () => {
        await (0, setup_1.clearDatabase)();
        // Register & Login user
        await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send({
            username: 'timer_user',
            email: 'timer@example.com',
            password: 'Password123!'
        });
        const loginRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({
            email: 'timer@example.com',
            password: 'Password123!'
        });
        token = loginRes.body.data.accessToken;
        // Create a task to run the timer on
        const taskRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
            title: 'Task for Timer',
            category: 'Work',
            color: '#4F46E5',
            dueDate: new Date().toISOString()
        });
        taskId = taskRes.body.data.id;
    });
    describe('GET /api/timer/status', () => {
        it('should return idle state if no active timer is running', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/timer/status')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('idle');
        });
    });
    describe('POST /api/timer/start', () => {
        it('should start a timer successfully for a valid task', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/timer/start')
                .set('Authorization', `Bearer ${token}`)
                .send({ taskId });
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('running');
            expect(res.body.data.taskId).toBe(taskId);
        });
        it('should fail if a timer is already running', async () => {
            await (0, supertest_1.default)(app_1.default)
                .post('/api/timer/start')
                .set('Authorization', `Bearer ${token}`)
                .send({ taskId });
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/timer/start')
                .set('Authorization', `Bearer ${token}`)
                .send({ taskId });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('already active');
        });
    });
    describe('POST /api/timer/pause & resume & stop', () => {
        beforeEach(async () => {
            await (0, supertest_1.default)(app_1.default)
                .post('/api/timer/start')
                .set('Authorization', `Bearer ${token}`)
                .send({ taskId });
        });
        it('should pause a running timer', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/timer/pause')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('paused');
        });
        it('should resume a paused timer', async () => {
            // Pause first
            await (0, supertest_1.default)(app_1.default)
                .post('/api/timer/pause')
                .set('Authorization', `Bearer ${token}`);
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/timer/resume')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('running');
        });
        it('should stop a timer and accumulate study duration to the task', async () => {
            // Stop timer
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/timer/stop')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.addedMinutes).toBeDefined();
            // Check task updated actual hours/minutes
            const taskCheck = await task_model_1.Task.findById(taskId);
            expect(taskCheck).toBeDefined();
            expect(taskCheck.actualMinutes).toBeDefined();
            // Check active timer session is cleaned up
            const timerCheck = await timer_model_1.Timer.findOne({ taskId });
            expect(timerCheck).toBeNull();
        });
    });
});
//# sourceMappingURL=timer.test.js.map