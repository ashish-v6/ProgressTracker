import api from './api';

class ReportsService {
  /**
   * Fetch daily focus statistics
   */
  public async getDailyReport(localDate: string): Promise<any> {
    const response = await api.get('/reports/daily', {
      params: { localDate }
    });
    return response.data.data;
  }

  /**
   * Fetch weekly focus statistics (past 7 days)
   */
  public async getWeeklyReport(localDate: string): Promise<any> {
    const response = await api.get('/reports/weekly', {
      params: { localDate }
    });
    return response.data.data;
  }

  /**
   * Fetch monthly focus statistics (past 30 days)
   */
  public async getMonthlyReport(localDate: string): Promise<any> {
    const response = await api.get('/reports/monthly', {
      params: { localDate }
    });
    return response.data.data;
  }
}

export const reportsService = new ReportsService();
export default reportsService;
