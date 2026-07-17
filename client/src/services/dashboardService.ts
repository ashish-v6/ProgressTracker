import api from './api';
import { formatDateKey } from './mockData';

class DashboardService {
  /**
   * Get main dashboard metrics summary
   */
  public async getDashboardSummary(): Promise<any> {
    const response = await api.get('/dashboard', {
      params: { localDate: formatDateKey(new Date()) }
    });
    return response.data.data;
  }

  /**
   * Get current and longest streak metrics
   */
  public async getStreakData(): Promise<any> {
    const response = await api.get('/dashboard/streak', {
      params: { localDate: formatDateKey(new Date()) }
    });
    return response.data.data;
  }

  /**
   * Get user productivity score
   */
  public async getProductivityScore(): Promise<any> {
    const response = await api.get('/dashboard/productivity-score', {
      params: { localDate: formatDateKey(new Date()) }
    });
    return response.data.data;
  }

  /**
   * Get goal completions progress summary
   */
  public async getGoalSummary(): Promise<any> {
    const response = await api.get('/dashboard/goals', {
      params: { localDate: formatDateKey(new Date()) }
    });
    return response.data.data;
  }

  /**
   * Get today's statistics
   */
  public async getTodayStats(): Promise<any> {
    const response = await api.get('/statistics/today', {
      params: { localDate: formatDateKey(new Date()) }
    });
    return response.data.data;
  }

  /**
   * Get weekly statistics
   */
  public async getWeeklyStats(): Promise<any> {
    const response = await api.get('/statistics/weekly', {
      params: { localDate: formatDateKey(new Date()) }
    });
    return response.data.data;
  }

  /**
   * Get monthly statistics
   */
  public async getMonthlyStats(): Promise<any> {
    const response = await api.get('/statistics/monthly', {
      params: { localDate: formatDateKey(new Date()) }
    });
    return response.data.data;
  }

  /**
   * Get yearly statistics
   */
  public async getYearlyStats(): Promise<any> {
    const response = await api.get('/statistics/yearly', {
      params: { localDate: formatDateKey(new Date()) }
    });
    return response.data.data;
  }

  /**
   * Get statistics categorized breakdown
   */
  public async getCategoryStats(): Promise<any> {
    const response = await api.get('/statistics/category');
    return response.data.data;
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
