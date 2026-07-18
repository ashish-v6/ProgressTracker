import request from 'supertest';
import app from '../app';
import { clearDatabase } from './setup';
import { Task } from '../models/task.model';

describe('Dashboard API', () => {
  let token: string;

  beforeEach(async () => {
    await clearDatabase();

    // Register & Login user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'dashboard_user',
        email: 'dash@example.com',
        password: 'Password123!'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'dash@example.com',
        password: 'Password123!'
      });
    token = loginRes.body.data.accessToken;
  });

  describe('GET /api/dashboard', () => {
    it('should retrieve dashboard summary metrics', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.today).toBeDefined();
      expect(res.body.data.stats30Days).toBeDefined();
      expect(res.body.data.streaks).toBeDefined();
      expect(res.body.data.productivityScore).toBeDefined();
    });
  });

  describe('GET /api/dashboard/streak', () => {
    it('should retrieve user streak details', async () => {
      const res = await request(app)
        .get('/api/dashboard/streak')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.streak).toBeDefined();
      expect(res.body.data.longestStreak).toBeDefined();
    });
  });

  describe('GET /api/dashboard/productivity-score', () => {
    it('should retrieve productivity score metrics', async () => {
      const res = await request(app)
        .get('/api/dashboard/productivity-score')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.productivityScore).toBeDefined();
    });
  });

  describe('GET /api/dashboard/goals', () => {
    it('should retrieve daily goal progress summary', async () => {
      const res = await request(app)
        .get('/api/dashboard/goals')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.completedHours).toBeDefined();
      expect(res.body.data.targetHours).toBeDefined();
      expect(res.body.data.remainingHours).toBeDefined();
    });
  });
});
