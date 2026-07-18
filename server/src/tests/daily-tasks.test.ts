import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { clearDatabase } from './setup';
import { Task } from '../models/task.model';
import { RecurringTask } from '../models/recurring-task.model';

describe('Daily Tasks Duplication API Tests', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    await clearDatabase();

    // Register test user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'qa_engineer',
        email: 'qa@example.com',
        password: 'Password123!'
      });

    // Login test user
    const loginRes = await request(app)
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
      const templateRes = await request(app)
        .post('/api/recurring-tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(recurringPayload);

      expect(templateRes.status).toBe(201);
      const templateId = templateRes.body.data.id;

      // 2. Call the generation endpoint multiple times (Simulate multiple page refreshes / sequential calls)
      const localDateStr = new Date().toISOString().split('T')[0];

      const call1 = await request(app)
        .get('/api/tasks/today')
        .query({ localDate: localDateStr })
        .set('Authorization', `Bearer ${token}`);
      expect(call1.status).toBe(200);

      const call2 = await request(app)
        .get('/api/tasks/today')
        .query({ localDate: localDateStr })
        .set('Authorization', `Bearer ${token}`);
      expect(call2.status).toBe(200);

      const call3 = await request(app)
        .get('/api/tasks/today')
        .query({ localDate: localDateStr })
        .set('Authorization', `Bearer ${token}`);
      expect(call3.status).toBe(200);

      // 3. Verify exactly ONE task is generated in the database for today
      const spawnedTasks = await Task.find({
        templateId,
        createdBy: userId
      });

      expect(spawnedTasks.length).toBe(1);
      expect(spawnedTasks[0].title).toBe(recurringPayload.title);
    });

    it('should prevent duplication during high concurrency (concurrent API calls)', async () => {
      // 1. Create recurring task template
      const templateRes = await request(app)
        .post('/api/recurring-tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(recurringPayload);
      const templateId = templateRes.body.data.id;

      // 2. Call the generation endpoint concurrently (Simulates rapid multi-tab clicking / simultaneous requests)
      const localDateStr = new Date().toISOString().split('T')[0];

      const responses = await Promise.all([
        request(app).get('/api/tasks/today').query({ localDate: localDateStr }).set('Authorization', `Bearer ${token}`),
        request(app).get('/api/tasks/today').query({ localDate: localDateStr }).set('Authorization', `Bearer ${token}`),
        request(app).get('/api/tasks/today').query({ localDate: localDateStr }).set('Authorization', `Bearer ${token}`),
        request(app).get('/api/tasks/today').query({ localDate: localDateStr }).set('Authorization', `Bearer ${token}`),
        request(app).get('/api/tasks/today').query({ localDate: localDateStr }).set('Authorization', `Bearer ${token}`)
      ]);

      // All responses should finish with 200 OK (gracefully handling concurrency)
      responses.forEach(res => {
        expect(res.status).toBe(200);
      });

      // 3. Assert exactly one task exists in the database
      const spawnedTasks = await Task.find({
        templateId,
        createdBy: userId
      });

      expect(spawnedTasks.length).toBe(1);
    });

    it('should survive server restart and multiple logouts/logins without duplication', async () => {
      // 1. Create recurring task template
      const templateRes = await request(app)
        .post('/api/recurring-tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(recurringPayload);
      const templateId = templateRes.body.data.id;
      const localDateStr = new Date().toISOString().split('T')[0];

      // 2. Call generation
      await request(app)
        .get('/api/tasks/today')
        .query({ localDate: localDateStr })
        .set('Authorization', `Bearer ${token}`);

      // 3. Simulate Logout
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      // 4. Simulate Server Restart / Dropping mongoose connection and reconnecting
      await mongoose.connection.close();
      const MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/progresstracker_test';
      await mongoose.connect(MONGODB_URI);

      // 5. Login again
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'qa@example.com',
          password: 'Password123!'
        });
      const newToken = loginRes.body.data.accessToken;

      // 6. Call generation again after login/restart
      await request(app)
        .get('/api/tasks/today')
        .query({ localDate: localDateStr })
        .set('Authorization', `Bearer ${newToken}`);

      // 7. Verify exactly one task is in database
      const spawnedTasks = await Task.find({
        templateId,
        createdBy: userId
      });

      expect(spawnedTasks.length).toBe(1);
    });

    it('should reject direct mongoose duplicate insertions for the same template and date', async () => {
      const templateId = new mongoose.Types.ObjectId();
      const dueDate = new Date();
      dueDate.setHours(0, 0, 0, 0);

      // Create first task instance directly via mongoose model
      await Task.create({
        title: 'Mongoose Direct 1',
        category: 'Tech',
        dueDate,
        createdBy: new mongoose.Types.ObjectId(userId),
        templateId
      });

      // Attempt to create second task instance for the same template and date should fail due to unique index
      let error: any;
      try {
        await Task.create({
          title: 'Mongoose Direct 2',
          category: 'Tech',
          dueDate,
          createdBy: new mongoose.Types.ObjectId(userId),
          templateId
        });
      } catch (err: any) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // duplicate key error
    });
  });
});
