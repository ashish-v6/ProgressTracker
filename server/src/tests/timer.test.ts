import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { clearDatabase } from './setup';
import { Task } from '../models/task.model';
import { Timer } from '../models/timer.model';

describe('Timer API', () => {
  let token: string;
  let taskId: string;

  beforeEach(async () => {
    await clearDatabase();

    // Register & Login user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'timer_user',
        email: 'timer@example.com',
        password: 'Password123!'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'timer@example.com',
        password: 'Password123!'
      });
    token = loginRes.body.data.accessToken;

    // Create a task to run the timer on
    const taskRes = await request(app)
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
      const res = await request(app)
        .get('/api/timer/status')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('idle');
    });
  });

  describe('POST /api/timer/start', () => {
    it('should start a timer successfully for a valid task', async () => {
      const res = await request(app)
        .post('/api/timer/start')
        .set('Authorization', `Bearer ${token}`)
        .send({ taskId });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('running');
      expect(res.body.data.taskId).toBe(taskId);
    });

    it('should fail if a timer is already running', async () => {
      await request(app)
        .post('/api/timer/start')
        .set('Authorization', `Bearer ${token}`)
        .send({ taskId });

      const res = await request(app)
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
      await request(app)
        .post('/api/timer/start')
        .set('Authorization', `Bearer ${token}`)
        .send({ taskId });
    });

    it('should pause a running timer', async () => {
      const res = await request(app)
        .post('/api/timer/pause')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('paused');
    });

    it('should resume a paused timer', async () => {
      // Pause first
      await request(app)
        .post('/api/timer/pause')
        .set('Authorization', `Bearer ${token}`);

      const res = await request(app)
        .post('/api/timer/resume')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('running');
    });

    it('should stop a timer and accumulate study duration to the task', async () => {
      // Stop timer
      const res = await request(app)
        .post('/api/timer/stop')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.addedMinutes).toBeDefined();

      // Check task updated actual hours/minutes
      const taskCheck = await Task.findById(taskId);
      expect(taskCheck).toBeDefined();
      expect(taskCheck!.actualMinutes).toBeDefined();

      // Check active timer session is cleaned up
      const timerCheck = await Timer.findOne({ taskId });
      expect(timerCheck).toBeNull();
    });
  });
});
