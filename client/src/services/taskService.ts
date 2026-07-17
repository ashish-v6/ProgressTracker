import api from './api';
import type { Task } from '../types';

export interface QueryTasksResult {
  tasks: Task[];
  total: number;
  page: number;
  pages: number;
}

class TaskService {
  /**
   * Create a new task
   */
  public async createTask(taskData: Omit<Task, 'id' | 'createdDate' | 'completedDate'>): Promise<Task> {
    // Map client date strings or objects to Backend ISO date schema formats
    const payload: any = {
      ...taskData,
      dueDate: new Date(taskData.dueDate).toISOString()
    };
    // Translate client customRepeatDays to server repeatDays parameter
    if (taskData.customRepeatDays) {
      payload.repeatDays = taskData.customRepeatDays;
      delete payload.customRepeatDays;
    }
    const response = await api.post('/tasks', payload);
    return this.mapBackendTaskToFrontend(response.data.data);
  }

  /**
   * Update an existing task
   */
  public async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    const payload: any = { ...taskData };
    if (taskData.dueDate) {
      payload.dueDate = new Date(taskData.dueDate).toISOString();
    }
    // Translate client customRepeatDays to server repeatDays parameter
    if (taskData.customRepeatDays) {
      payload.repeatDays = taskData.customRepeatDays;
      delete payload.customRepeatDays;
    }
    const response = await api.patch(`/tasks/${id}`, payload);
    return this.mapBackendTaskToFrontend(response.data.data);
  }

  /**
   * Delete a task
   */
  public async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  }

  /**
   * Retrieve details of a single task
   */
  public async getTask(id: string): Promise<Task> {
    const response = await api.get(`/tasks/${id}`);
    return this.mapBackendTaskToFrontend(response.data.data);
  }

  /**
   * Query, search, and paginate tasks list
   */
  public async listTasks(query: any): Promise<QueryTasksResult> {
    const params = { ...query };
    
    // Map dates to ISO strings if present
    if (params.dueDate) {
      params.dueDate = new Date(params.dueDate).toISOString();
    }
    if (params.startDate) {
      params.startDate = new Date(params.startDate).toISOString();
    }
    if (params.endDate) {
      params.endDate = new Date(params.endDate).toISOString();
    }

    const response = await api.get('/tasks', { params });
    const { tasks, total, page, pages } = response.data.data;
    
    return {
      tasks: tasks.map((t: any) => this.mapBackendTaskToFrontend(t)),
      total,
      page,
      pages
    };
  }

  /**
   * Duplicate a task
   */
  public async duplicateTask(id: string): Promise<Task> {
    const response = await api.post(`/tasks/${id}/duplicate`);
    return this.mapBackendTaskToFrontend(response.data.data);
  }

  /**
   * Mark task completed
   */
  public async markComplete(id: string): Promise<Task> {
    const response = await api.patch(`/tasks/${id}/complete`);
    return this.mapBackendTaskToFrontend(response.data.data);
  }

  /**
   * Mark task incomplete
   */
  public async markIncomplete(id: string): Promise<Task> {
    const response = await api.patch(`/tasks/${id}/incomplete`);
    return this.mapBackendTaskToFrontend(response.data.data);
  }

  /**
   * Bulk delete tasks
   */
  public async bulkDelete(ids: string[]): Promise<void> {
    await api.post('/tasks/bulk-delete', { ids });
  }

  /**
   * Bulk complete tasks
   */
  public async bulkComplete(ids: string[]): Promise<void> {
    await api.post('/tasks/bulk-complete', { ids });
  }

  /**
   * Mapper helper translating database structures to client schema models
   */
  private mapBackendTaskToFrontend(backendTask: any): Task {
    return {
      id: backendTask.id,
      title: backendTask.title,
      description: backendTask.description || '',
      category: backendTask.category,
      color: backendTask.color,
      priority: backendTask.priority,
      status: backendTask.status || 'pending',
      targetHours: backendTask.targetHours || 0,
      actualHours: backendTask.actualHours || 0,
      actualMinutes: backendTask.actualMinutes || 0,
      repeatRule: backendTask.repeatRule || 'none',
      customRepeatDays: backendTask.repeatDays || [],
      notes: backendTask.notes || '',
      tags: backendTask.tags || [],
      // Convert backend UTC dates to local YYYY-MM-DD strings for UI filters
      dueDate: this.formatDateString(new Date(backendTask.dueDate)),
      createdDate: backendTask.createdAt,
      completedDate: backendTask.completedAt || null
    };
  }

  /**
   * Helper formatting Date into YYYY-MM-DD local format
   */
  private formatDateString(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

export const taskService = new TaskService();
export default taskService;
