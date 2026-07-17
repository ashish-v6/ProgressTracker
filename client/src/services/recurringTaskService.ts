import api from './api';
import type { RecurringTask } from '../types';

class RecurringTaskService {
  /**
   * Create a recurring task template
   */
  public async createRecurringTask(
    data: Omit<RecurringTask, 'id' | 'status' | 'createdBy' | 'createdAt' | 'updatedAt'>
  ): Promise<RecurringTask> {
    const payload: any = { ...data };
    
    // Translate client customRepeatDays to server repeatDays parameter
    if (data.customRepeatDays) {
      payload.repeatDays = data.customRepeatDays;
      delete payload.customRepeatDays;
    }
    
    const response = await api.post('/recurring-tasks', payload);
    return this.mapBackendToFrontend(response.data.data);
  }

  /**
   * Update a recurring task template
   */
  public async updateRecurringTask(id: string, data: Partial<RecurringTask>): Promise<RecurringTask> {
    const payload: any = { ...data };
    
    // Translate client customRepeatDays to server repeatDays parameter
    if (data.customRepeatDays) {
      payload.repeatDays = data.customRepeatDays;
      delete payload.customRepeatDays;
    }

    const response = await api.put(`/recurring-tasks/${id}`, payload);
    return this.mapBackendToFrontend(response.data.data);
  }

  /**
   * Delete a recurring task template
   */
  public async deleteRecurringTask(id: string): Promise<void> {
    await api.delete(`/recurring-tasks/${id}`);
  }

  /**
   * Pause a recurring task template
   */
  public async pauseRecurringTask(id: string): Promise<RecurringTask> {
    const response = await api.patch(`/recurring-tasks/${id}/pause`);
    return this.mapBackendToFrontend(response.data.data);
  }

  /**
   * Resume a recurring task template
   */
  public async resumeRecurringTask(id: string): Promise<RecurringTask> {
    const response = await api.patch(`/recurring-tasks/${id}/resume`);
    return this.mapBackendToFrontend(response.data.data);
  }

  /**
   * List all recurring task templates
   */
  public async listRecurringTasks(): Promise<RecurringTask[]> {
    const response = await api.get('/recurring-tasks');
    return response.data.data.map((item: any) => this.mapBackendToFrontend(item));
  }

  /**
   * Get detail of single template
   */
  public async getRecurringTask(id: string): Promise<RecurringTask> {
    const response = await api.get(`/recurring-tasks/${id}`);
    return this.mapBackendToFrontend(response.data.data);
  }

  /**
   * Helper mapping backend task DTO to frontend model
   */
  private mapBackendToFrontend(item: any): RecurringTask {
    return {
      id: item.id,
      title: item.title,
      description: item.description || '',
      category: item.category,
      color: item.color,
      priority: item.priority || 'medium',
      status: item.status || 'active',
      targetHours: item.targetHours || 0,
      targetMinutes: item.targetMinutes || 0,
      repeatRule: item.repeatRule,
      customRepeatDays: item.repeatDays || [],
      notes: item.notes || '',
      tags: item.tags || [],
      createdBy: item.createdBy,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
  }
}

export const recurringTaskService = new RecurringTaskService();
export default recurringTaskService;
