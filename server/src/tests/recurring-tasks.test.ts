import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { clearDatabase } from './setup';
import { RecurringTask } from '../models/recurring-task.model';
import { Task } from '../models/task.model';

describe('Recurring Tasks API', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    await clearDatabase();

    // Register test user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'recurring_user',
        email: 'rec@example.com',
        password: 'Password123!'
      });

    // Login test user
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'rec@example.com',
        password: 'Password123!'
      });
    token = loginRes.body.data.accessToken;
    userId = loginRes.body.data.user.id;
  });

  const validPayload = {
    title: 'Daily Exercise',
    description: 'Gym session for 1 hour',
    category: 'Health',
    color: '#10B981',
    priority: 'medium',
    targetHours: 1,
    targetMinutes: 0,
    repeatRule: 'daily',
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    notes: 'Don\'t skip leg day',
    tags: ['fitness', 'gym']
  };

  describe('POST /api/recurring-tasks', () => {
    it('should create a recurring task template successfully', async () => {
      const res = await request(app)
        .post('/api/recurring-tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(validPayload.title);
      expect(res.body.data.status).toBe('active');
    });

    it('should fail creation with invalid validation fields', async () => {
      const res = await request(app)
        .post('/api/recurring-tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: '', // empty title
          category: 'Health',
          color: '',
          targetHours: -1
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/recurring-tasks', () => {
    it('should list all recurring task templates', async () => {
      await request(app)
        .post('/api/recurring-tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(validPayload);

      const res = await request(app)
        .get('/api/recurring-tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe(validPayload.title);
    });
  });

  describe('GET /api/recurring-tasks/:id', () => {
    it('should get recurring task template details by id', async () => {
      const createRes = await request(app)
        .post('/api/recurring-tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(validPayload);
      const templateId = createRes.body.data.id;

      const res = await request(app)
        .get(`/api/recurring-tasks/${templateId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe(validPayload.title);
    });

    it('should return 404 for a non-existent template id', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/recurring-tasks/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/recurring-tasks/:id', () => {
    it('should update recurring task template successfully', async () => {
      const createRes = await request(app)
        .post('/api/recurring-tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(validPayload);
      const templateId = createRes.body.data.id;

      const res = await request(app)
        .put(`/api/recurring-tasks/${templateId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Daily Run',
          priority: 'high'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Daily Run');
      expect(res.body.data.priority).toBe('high');
    });
  });

  describe('PATCH /api/recurring-tasks/:id/pause & /resume', () => {
    it('should pause and resume recurring task templates', async () => {
      const createRes = await request(app)
        .post('/api/recurring-tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(validPayload);
      const templateId = createRes.body.data.id;

      // Pause
      const pauseRes = await request(app)
        .patch(`/api/recurring-tasks/${templateId}/pause`)
        .set('Authorization', `Bearer ${token}`);
      expect(pauseRes.status).toBe(200);
      expect(pauseRes.body.data.status).toBe('paused');

      // Resume
      const resumeRes = await request(app)
        .patch(`/api/recurring-tasks/${templateId}/resume`)
        .set('Authorization', `Bearer ${token}`);
      expect(resumeRes.status).toBe(200);
      expect(resumeRes.body.data.status).toBe('active');
    });
  });

  describe('DELETE /api/recurring-tasks/:id', () => {
    it('should delete template and uncompleted daily instances', async () => {
      const createRes = await request(app)
        .post('/api/recurring-tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(validPayload);
      const templateId = createRes.body.data.id;

      // Resolve today's tasks to instantiate it
      await request(app)
        .get('/api/tasks/today')
        .set('Authorization', `Bearer ${token}`);

      // Verify task instance exists
      const spawnedCountBefore = await Task.countDocuments({ templateId });
      expect(spawnedCountBefore).toBe(1);

      // Delete template
      const deleteRes = await request(app)
        .delete(`/api/recurring-tasks/${templateId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(deleteRes.status).toBe(200);

      // Verify template is deleted
      const templateCheck = await RecurringTask.findById(templateId);
      expect(templateCheck).toBeNull();

      // Verify uncompleted task instance is also cascade deleted
      const spawnedCountAfter = await Task.countDocuments({ templateId });
      expect(spawnedCountAfter).toBe(0);
    });

    it('should delete template and preserve completed daily instances', async () => {
      const createRes = await request(app)
        .post('/api/recurring-tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(validPayload);
      const templateId = createRes.body.data.id;

      // Resolve today's tasks to instantiate it
      await request(app)
        .get('/api/tasks/today')
        .set('Authorization', `Bearer ${token}`);

      const spawned = await Task.findOne({ templateId });
      expect(spawned).toBeDefined();

      // Mark completed
      await request(app)
        .patch(`/api/tasks/${spawned!.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'completed' });

      // Delete template
      await request(app)
        .delete(`/api/recurring-tasks/${templateId}`)
        .set('Authorization', `Bearer ${token}`);

      // Verify completed instance is preserved
      const spawnedCountAfter = await Task.countDocuments({ templateId });
      expect(spawnedCountAfter).toBe(1);
    });
  });
});
