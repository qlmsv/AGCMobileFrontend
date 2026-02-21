/**
 * Notification Service — Firebase Cloud Messaging
 *
 * Replaces expo-notifications with @react-native-firebase/messaging.
 * To set up:
 *   npm install @react-native-firebase/app @react-native-firebase/messaging
 *   iOS:  add GoogleService-Info.plist, pod install, enable Push Notifications capability
 *   Android: add google-services.json, apply google-services plugin
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './api';
import { API_ENDPOINTS } from '../config/api';
import { logger } from '../utils/logger';

// Dynamic import so the app doesn't crash if the package is not yet installed
let messaging: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  messaging = require('@react-native-firebase/messaging').default;
} catch {
  logger.warn('Firebase messaging not available. Run: npm install @react-native-firebase/app @react-native-firebase/messaging');
}

export const notificationService = {
  /**
   * Request permission and return FCM token.
   * Returns undefined if permission denied or Firebase not set up.
   */
  async registerForPushNotificationsAsync(): Promise<string | undefined> {
    if (!messaging) return undefined;

    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const authorized =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (!authorized) {
          logger.warn('FCM: Permission not granted on iOS');
          return undefined;
        }
      }

      const token = await messaging().getToken();
      logger.info('FCM token:', token?.slice(0, 30) + '...');
      return token;
    } catch (error) {
      logger.error('Error getting FCM token:', error);
      return undefined;
    }
  },

  async sendTokenToBackend(token: string) {
    try {
      const authToken = await AsyncStorage.getItem('access_token');
      if (!authToken) {
        logger.info('FCM: User not authenticated, skipping backend registration');
        return;
      }

      await apiService.post(API_ENDPOINTS.PUSH_DEVICES, {
        token,
        type: 'fcm',
        platform: Platform.OS,
      });
      logger.info('FCM token registered on backend');
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.response?.status === 404) {
        logger.info('FCM: Backend endpoint not ready or requires auth');
      } else {
        logger.error('Failed to send FCM token to backend:', error);
      }
    }
  },

  /**
   * Subscribe to foreground messages. Returns unsubscribe function.
   */
  setupForegroundHandler(callback: (message: any) => void): () => void {
    if (!messaging) return () => {};
    return messaging().onMessage(async (message: any) => {
      logger.info('FCM foreground message:', message?.notification?.title);
      callback(message);
    });
  },

  /**
   * Register background message handler (call once on app init, outside render).
   */
  setupBackgroundHandler() {
    if (!messaging) return;
    messaging().setBackgroundMessageHandler(async (message: any) => {
      logger.info('FCM background message:', message?.notification?.title);
    });
  },

  // ── Server-side notification API methods (unchanged) ─────────────────────

  async getNotifications(params?: {
    ordering?: string;
    page?: number;
    search?: string;
  }): Promise<any[]> {
    const data = await apiService.get<any>(API_ENDPOINTS.NOTIFICATIONS, { params });
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
