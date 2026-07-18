import request from 'supertest';
import app from '../app';
import { clearDatabase } from './setup';

describe('Reports API', () => {
  let token: string;

  beforeEach(async () => {
    await clearDatabase();

    // Register & Login user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'reports_user',
        email: 'rep@example.com',
        password: 'Password123!'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'rep@example.com',
        password: 'Password123!'
      });
    token = loginRes.body.data.accessToken;
  });

  const localDateStr = new Date().toISOString().split('T')[0];

  describe('GET /api/reports/daily', () => {
    it('should retrieve daily study progress report', async () => {
      const res = await request(app)
        .get('/api/reports/daily')
        .query({ localDate: localDateStr })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalTasks).toBeDefined();
      expect(res.body.data.completedTasks).toBeDefined();
      expect(res.body.data.totalHours).toBeDefined();
      expect(res.body.data.chartData).toBeDefined();
    });

    it('should fail if localDate query param is missing', async () => {
      const res = await request(app)
        .get('/api/reports/daily')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/reports/weekly', () => {
    it('should retrieve weekly study progress report', async () => {
      const res = await request(app)
        .get('/api/reports/weekly')
        .query({ localDate: localDateStr })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalTasks).toBeDefined();
      expect(res.body.data.completionPercentage).toBeDefined();
      expect(res.body.data.chartData).toBeDefined();
    });
  });

  describe('GET /api/reports/monthly', () => {
    it('should retrieve monthly study progress report', async () => {
      const res = await request(app)
        .get('/api/reports/monthly')
        .query({ localDate: localDateStr })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalTasks).toBeDefined();
      expect(res.body.data.averageStudyHours).toBeDefined();
      expect(res.body.data.chartData).toBeDefined();
    });
  });
});
