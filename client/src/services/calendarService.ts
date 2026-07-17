import api from './api';

class CalendarService {
  /**
   * Fetch calendar summary indicators (completed tasks, hours) for a given year/month
   */
  public async getMonthlySummary(year: number, month: number): Promise<any> {
    const response = await api.get('/calendar', {
      params: { year, month }
    });
    return response.data.data;
  }

  /**
   * Fetch details of all tasks due on a specific local YYYY-MM-DD date
   */
  public async getTasksByDate(dateStr: string): Promise<any> {
    const response = await api.get('/calendar/tasks', {
      params: { date: dateStr }
    });
    return response.data.data;
  }
}

export const calendarService = new CalendarService();
export default calendarService;
