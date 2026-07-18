import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { clearDatabase } from './setup';
import { Task } from '../models/task.model';
import { Timer } from '../models/timer.model';
import { analyticsService } from '../services/analytics.service';

describe('Analytics API and Service', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    await clearDatabase();

    // Register & Login user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'analytics_user',
        email: 'anal@example.com',
        password: 'Password123!'
      });
    userId = registerRes.body.data.id;

    const loginRes = await request(app)
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
      await Task.create([
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
          createdBy: new mongoose.Types.ObjectId(userId)
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
          createdBy: new mongoose.Types.ObjectId(userId)
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
          createdBy: new mongoose.Types.ObjectId(userId)
        }
      ]);

      // 2. Fetch analytics
      const res = await request(app)
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
      const stats = await analyticsService.getStatistics(userId);
      expect(stats).toBeDefined();
      expect(stats.completionRate).toBeDefined();
      expect(stats.averageDailyHours).toBeDefined();
    });
  });
});
