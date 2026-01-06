import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import apiService from './api';
import { API_ENDPOINTS } from '../config/api';
import { logger } from '../utils/logger';

// Config notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  async registerForPushNotificationsAsync(): Promise<string | undefined> {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        logger.warn('Failed to get push token for push notification!');
        return;
      }

      // Get the token
      try {
        // You might need projectId from app.json if you are using EAS
        // const projectId = ...
        const tokenData = await Notifications.getExpoPushTokenAsync();
        token = tokenData.data;
        logger.info('Expo Push Token:', token);
      } catch (error) {
        logger.error('Error getting push token:', error);
      }
    } else {
      logger.info('Must use physical device for Push Notifications');
    }

    return token;
  },

  async sendTokenToBackend(token: string) {
    try {
      // Get auth token to check if user is authenticated
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const authToken = await AsyncStorage.getItem('accessToken');

      if (!authToken) {
        logger.info('Push token: User not authenticated, skipping backend registration');
        return;
      }

      await apiService.post(API_ENDPOINTS.PUSH_DEVICES, {
        registration_id: token,
        type: 'expo',
      });
      logger.info('Push token registered successfully on backend');
    } catch (error: any) {
      // Silently handle 401/404 errors - endpoint may not exist yet
      if (error?.response?.status === 401 || error?.response?.status === 404) {
        logger.info('Push token: Backend endpoint not ready or requires auth');
      } else {
        logger.error('Failed to send token to backend:', error);
      }
    }
  },

  addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  },

  addNotificationResponseReceivedListener(callback: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },

  removeNotificationSubscription(subscription: Notifications.Subscription) {
    subscription.remove();
  },

  // Server-side notification API methods
  async getNotifications(params?: {
    ordering?: string;
    page?: number;
    search?: string;
  }): Promise<any[]> {
    const data = await apiService.get<any>(API_ENDPOINTS.NOTIFICATIONS, { params });
    // Handle paginated response
    if (data && Array.isArray(data.results)) {
      return data.results;
    }
    return Array.isArray(data) ? data : [];
  },

  async getNotification(id: string): Promise<any> {
    return await apiService.get(API_ENDPOINTS.NOTIFICATION_BY_ID(id));
  },

  async markNotificationAsRead(id: string): Promise<void> {
    await apiService.post(API_ENDPOINTS.MARK_NOTIFICATION_READ(id), {});
  },

  async markAllNotificationsAsRead(): Promise<void> {
    await apiService.post(API_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ, {});
  },

  async getUnreadCount(): Promise<{ count: number }> {
    return await apiService.get(API_ENDPOINTS.UNREAD_COUNT);
  },
};
