import apiService from './api';
import { API_ENDPOINTS } from '../config/api';
import { Notification } from '../types';

// Helper to extract data from paginated responses
const extractResults = <T>(data: any): T[] => {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
    return data.results;
  }
  return [];
};

export const notificationService = {
  async getNotifications(params?: { limit?: number; offset?: number }): Promise<Notification[]> {
    const data = await apiService.get(API_ENDPOINTS.NOTIFICATIONS, { params });
    return extractResults<Notification>(data);
  },

  async getNotification(id: number): Promise<Notification> {
    return await apiService.get<Notification>(`${API_ENDPOINTS.NOTIFICATIONS}${id}/`);
  },

  async markAsRead(id: number): Promise<void> {
    await apiService.post(`${API_ENDPOINTS.NOTIFICATIONS}${id}/mark_read/`);
  },

  async markAllAsRead(): Promise<void> {
    await apiService.post(`${API_ENDPOINTS.NOTIFICATIONS}mark_all_read/`);
  },

  async getUnreadCount(): Promise<{ unread: number }> {
    return await apiService.get<{ unread: number }>(API_ENDPOINTS.UNREAD_COUNT);
  },
};
