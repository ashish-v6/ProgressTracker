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
describe('Tasks API', () => {
    let user1Token;
    let user2Token;
    let user1Id;
    let user2Id;
    beforeEach(async () => {
        await (0, setup_1.clearDatabase)();
        // Create User 1
        const registerRes1 = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send({
            username: 'userone',
            email: 'userone@example.com',
            password: 'Password123!'
        });
        user1Id = registerRes1.body.data.id;
        const loginRes1 = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({
            email: 'userone@example.com',
            password: 'Password123!'
        });
        user1Token = loginRes1.body.data.accessToken;
        // Create User 2
        const registerRes2 = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send({
            username: 'usertwo',
            email: 'usertwo@example.com',
            password: 'Password123!'
        });
        user2Id = registerRes2.body.data.id;
        const loginRes2 = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({
            email: 'usertwo@example.com',
            password: 'Password123!'
        });
        user2Token = loginRes2.body.data.accessToken;
    });
    const validTaskPayload = {
        title: 'Study Node.js',
        description: 'Read streams documentation',
        category: 'Backend',
        color: '#4F46E5',
        priority: 'high',
        targetHours: 2,
        targetMinutes: 30,
        dueDate: new Date().toISOString()
    };
    describe('POST /api/tasks', () => {
        it('should create a task successfully for an authorized user', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${user1Token}`)
                .send(validTaskPayload);
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe(validTaskPayload.title);
            expect(res.body.data.category).toBe(validTaskPayload.category);
            expect(res.body.data.status).toBe('pending');
            expect(res.body.data.completed).toBe(false);
        });
        it('should return 400 Bad Request if fields are invalid', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({
                title: '', // Empty title
                category: 'Backend',
                priority: 'invalid-priority', // invalid priority
                targetHours: -1, // negative target hours
                dueDate: 'invalid-date'
            });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
        it('should return 401 Unauthorized if token is missing', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/tasks')
                .send(validTaskPayload);
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });
    describe('GET /api/tasks', () => {
        beforeEach(async () => {
            // Create some tasks for User 1
            await (0, supertest_1.default)(app_1.default)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${user1Token}`)
                .send(validTaskPayload);
            await (0, supertest_1.default)(app_1.default)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({
                ...validTaskPayload,
                title: 'Study React',
                category: 'Frontend',
                priority: 'medium'
            });
            // Create a task for User 2
            await (0, supertest_1.default)(app_1.default)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${user2Token}`)
                .send({
                ...validTaskPayload,
                title: 'User Two Task'
            });
        });
        it('should list tasks only belonging to the authenticated user', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/tasks')
                .set('Authorization', `Bearer ${user1Token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.tasks.length).toBe(2);
            expect(res.body.data.tasks.every((t) => t.title !== 'User Two Task')).toBe(true);
        });
        it('should filter tasks by category', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/tasks')
                .query({ category: 'Frontend' })
                .set('Authorization', `Bearer ${user1Token}`);
            expect(res.status).toBe(200);
            expect(res.body.data.tasks.length).toBe(1);
            expect(res.body.data.tasks[0].title).toBe('Study React');
        });
        it('should paginate results', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/tasks')
                .query({ page: 1, limit: 1 })
                .set('Authorization', `Bearer ${user1Token}`);
            expect(res.status).toBe(200);
            expect(res.body.data.tasks.length).toBe(1);
            expect(res.body.data.total).toBe(2);
            expect(res.body.data.pages).toBe(2);
        });
    });
    describe('PATCH /api/tasks/:id', () => {
        let taskId;
        beforeEach(async () => {
            const taskRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${user1Token}`)
                .send(validTaskPayload);
            taskId = taskRes.body.data.id;
        });
        it('should update task details successfully', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .patch(`/api/tasks/${taskId}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .send({
                description: 'Updated read streams documentation',
                priority: 'medium'
            });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.description).toBe('Updated read streams documentation');
            expect(res.body.data.priority).toBe('medium');
        });
        it('should flip completion state correctly', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .patch(`/api/tasks/${taskId}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .send({
                status: 'completed'
            });
            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('completed');
            expect(res.body.data.completed).toBe(true);
            expect(res.body.data.completedAt).toBeDefined();
            const res2 = await (0, supertest_1.default)(app_1.default)
                .patch(`/api/tasks/${taskId}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .send({
                status: 'pending'
            });
            expect(res2.status).toBe(200);
            expect(res2.body.data.status).toBe('pending');
            expect(res2.body.data.completed).toBe(false);
            expect(res2.body.data.completedAt).toBeNull();
        });
        it('should return 404 if user attempts to edit another user\'s task', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .patch(`/api/tasks/${taskId}`)
                .set('Authorization', `Bearer ${user2Token}`)
                .send({
                title: 'Hack task'
            });
            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });
    describe('DELETE /api/tasks/:id', () => {
        let taskId;
        beforeEach(async () => {
            const taskRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${user1Token}`)
                .send(validTaskPayload);
            taskId = taskRes.body.data.id;
        });
        it('should delete task successfully', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/tasks/${taskId}`)
                .set('Authorization', `Bearer ${user1Token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            const dbCheck = await task_model_1.Task.findById(taskId);
            expect(dbCheck).toBeNull();
        });
        it('should return 404 for non-existent task ID', async () => {
            const fakeId = new mongoose_1.default.Types.ObjectId().toString();
            const res = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/tasks/${fakeId}`)
                .set('Authorization', `Bearer ${user1Token}`);
            expect(res.status).toBe(404);
        });
        it('should return 404 if deleting another user\'s task', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/tasks/${taskId}`)
                .set('Authorization', `Bearer ${user2Token}`);
            expect(res.status).toBe(404);
        });
    });
    describe('POST /api/tasks/:id/duplicate', () => {
        let taskId;
        beforeEach(async () => {
            const taskRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${user1Token}`)
                .send(validTaskPayload);
            taskId = taskRes.body.data.id;
        });
        it('should duplicate a task successfully', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post(`/api/tasks/${taskId}/duplicate`)
                .set('Authorization', `Bearer ${user1Token}`);
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toContain('Copy');
        });
        it('should return 404 for duplicating non-existent task', async () => {
            const fakeId = new mongoose_1.default.Types.ObjectId().toString();
            const res = await (0, supertest_1.default)(app_1.default)
                .post(`/api/tasks/${fakeId}/duplicate`)
                .set('Authorization', `Bearer ${user1Token}`);
            expect(res.status).toBe(404);
        });
    });
    describe('GET /api/tasks/upcoming', () => {
        it('should retrieve upcoming tasks list', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/tasks/upcoming')
                .set('Authorization', `Bearer ${user1Token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
        });
    });
    describe('POST /api/tasks/bulk-complete & bulk-delete', () => {
        let task1Id;
        let task2Id;
        beforeEach(async () => {
            const r1 = await (0, supertest_1.default)(app_1.default)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${user1Token}`)
                .send(validTaskPayload);
            task1Id = r1.body.data.id;
            const r2 = await (0, supertest_1.default)(app_1.default)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ ...validTaskPayload, title: 'Task 2' });
            task2Id = r2.body.data.id;
        });
        it('should bulk complete tasks successfully', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/tasks/bulk-complete')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ ids: [task1Id, task2Id] });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            const t1 = await task_model_1.Task.findById(task1Id);
            const t2 = await task_model_1.Task.findById(task2Id);
            expect(t1?.completed).toBe(true);
            expect(t2?.completed).toBe(true);
        });
        it('should bulk delete tasks successfully', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/tasks/bulk-delete')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ ids: [task1Id, task2Id] });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            const t1 = await task_model_1.Task.findById(task1Id);
            const t2 = await task_model_1.Task.findById(task2Id);
            expect(t1).toBeNull();
            expect(t2).toBeNull();
        });
        it('should fail bulk complete if ids array is missing or empty', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/tasks/bulk-complete')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ ids: [] });
            expect(res.status).toBe(400);
        });
        it('should fail bulk delete if ids array is missing or empty', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/tasks/bulk-delete')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ ids: [] });
            expect(res.status).toBe(400);
        });
    });
    describe('GET /api/tasks/:id', () => {
        let taskId;
        beforeEach(async () => {
            const taskRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${user1Token}`)
                .send(validTaskPayload);
            taskId = taskRes.body.data.id;
        });
        it('should retrieve a single task successfully', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get(`/api/tasks/${taskId}`)
                .set('Authorization', `Bearer ${user1Token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(taskId);
        });
    });
    describe('PATCH /api/tasks/:id/complete & incomplete', () => {
        let taskId;
        beforeEach(async () => {
            const taskRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${user1Token}`)
                .send(validTaskPayload);
            taskId = taskRes.body.data.id;
        });
        it('should mark task as complete and incomplete', async () => {
            const completeRes = await (0, supertest_1.default)(app_1.default)
                .patch(`/api/tasks/${taskId}/complete`)
                .set('Authorization', `Bearer ${user1Token}`);
            expect(completeRes.status).toBe(200);
            expect(completeRes.body.data.completed).toBe(true);
            const incompleteRes = await (0, supertest_1.default)(app_1.default)
                .patch(`/api/tasks/${taskId}/incomplete`)
                .set('Authorization', `Bearer ${user1Token}`);
            expect(incompleteRes.status).toBe(200);
            expect(incompleteRes.body.data.completed).toBe(false);
        });
    });
    describe('GET /api/tasks/upcoming validation', () => {
        it('should return 400 for invalid limitDays', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/tasks/upcoming?limitDays=-5')
                .set('Authorization', `Bearer ${user1Token}`);
            expect(res.status).toBe(400);
        });
    });
});
//# sourceMappingURL=tasks.test.js.map