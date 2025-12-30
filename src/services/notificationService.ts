import apiService from './api';
import { API_ENDPOINTS } from '../config/api';
import { NotificationDelivery, WebPushSubscription } from '../types';

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
  async getNotifications(params?: {
    ordering?: string;
    page?: number;
    search?: string;
  }): Promise<NotificationDelivery[]> {
    const data = await apiService.get(API_ENDPOINTS.NOTIFICATIONS, { params });
    return extractResults<NotificationDelivery>(data);
  },

  async getNotification(id: string): Promise<NotificationDelivery> {
    return await apiService.get<NotificationDelivery>(
      API_ENDPOINTS.NOTIFICATION_BY_ID(id)
    );
  },

  async markAsRead(id: string): Promise<NotificationDelivery> {
    return await apiService.post<NotificationDelivery>(
      API_ENDPOINTS.MARK_NOTIFICATION_READ(id),
      {}
    );
  },

  async markAllAsRead(): Promise<NotificationDelivery> {
    return await apiService.post<NotificationDelivery>(
      API_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ,
      {}
    );
  },

  async getUnreadCount(): Promise<{ unread_count: number }> {
    return await apiService.get<{ unread_count: number }>(API_ENDPOINTS.UNREAD_COUNT);
  },

  // WebPush subscriptions
  async createWebPushSubscription(
    subscription: Omit<WebPushSubscription, 'id' | 'user_agent' | 'created_at'>
  ): Promise<WebPushSubscription> {
    return await apiService.post<WebPushSubscription>(
      API_ENDPOINTS.WEBPUSH_SUBSCRIPTIONS,
      subscription
    );
  },

  async deleteWebPushSubscription(id: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.WEBPUSH_SUBSCRIPTION_BY_ID(id));
  },
};
