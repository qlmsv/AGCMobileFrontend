import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import apiService from './api';
import { API_ENDPOINTS } from '../config/api';
import { logger } from '../utils/logger';

const STORAGE_KEYS = {
  PUSH_ENABLED: 'notifications.push_enabled',
  PUSH_TOKEN: 'notifications.push_token',
};

const EAS_PROJECT_ID =
  Constants.expoConfig?.extra?.eas?.projectId ??
  Constants.easConfig?.projectId ??
  '03c3678b-99e8-454f-b060-c34c8b58e10a';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type NotificationPayload = Record<string, string | number | boolean | null | undefined>;

async function ensureAndroidChannels() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync('default', {
    name: 'General',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });

  await Notifications.setNotificationChannelAsync('lesson-reminders', {
    name: 'Lesson Reminders',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 150, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    sound: 'default',
  });
}

async function requestPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    logger.warn('Push notifications require a physical device');
    return false;
  }

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;

  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  if (status !== 'granted') {
    logger.warn('Push notification permission not granted');
    return false;
  }

  return true;
}

async function storePushToken(token: string | null) {
  if (token) {
    await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
    return;
  }

  await AsyncStorage.removeItem(STORAGE_KEYS.PUSH_TOKEN);
}

async function getStoredPushToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN);
}

function normalizeNotificationData(data: NotificationPayload | undefined): Record<string, string> {
  return Object.fromEntries(
    Object.entries(data ?? {}).flatMap(([key, value]) => {
      if (value === null || value === undefined) {
        return [];
      }
      return [[key, String(value)]];
    })
  );
}

export const notificationService = {
  async isPushEnabled(): Promise<boolean> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.PUSH_ENABLED);
    return value === null ? true : value === 'true';
  },

  async setPushEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.PUSH_ENABLED, String(enabled));
  },

  async registerForPushNotificationsAsync(): Promise<string | undefined> {
    try {
      const enabled = await this.isPushEnabled();
      if (!enabled) {
        logger.info('Push registration skipped because user disabled notifications');
        return undefined;
      }

      await ensureAndroidChannels();

      const granted = await requestPermissions();
      if (!granted) {
        return undefined;
      }

      const response = await Notifications.getExpoPushTokenAsync({
        projectId: EAS_PROJECT_ID,
      });
      const token = response.data;

      await storePushToken(token);
      logger.info('Expo push token:', token.slice(0, 30) + '...');
      return token;
    } catch (error) {
      logger.error('Error getting Expo push token:', error);
      return undefined;
    }
  },

  async sendTokenToBackend(token: string) {
    try {
      await apiService.post(API_ENDPOINTS.PUSH_DEVICES, {
        token,
        device_name: Device.modelName ?? undefined,
        platform: Platform.OS,
      });
      await storePushToken(token);
      logger.info('Expo push token registered on backend');
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.response?.status === 404) {
        logger.info('Push device registration skipped until backend/auth is ready');
      } else {
        logger.error('Failed to send Expo push token to backend:', error);
      }
    }
  },

  async removeTokenFromBackend(token?: string | null) {
    const tokenToDelete = token ?? (await getStoredPushToken());
    if (!tokenToDelete) {
      return;
    }

    try {
      await apiService.post(API_ENDPOINTS.PUSH_DEVICE_BY_TOKEN, {
        token: tokenToDelete,
      });
      logger.info('Push token removed from backend');
    } catch (error: any) {
      if (error?.response?.status === 404 || error?.response?.status === 401) {
        logger.info('Push token cleanup skipped because token/session is already gone');
      } else {
        logger.error('Failed to remove push token from backend:', error);
      }
    } finally {
      await storePushToken(null);
    }
  },

  async syncPushRegistration(): Promise<string | undefined> {
    const token = await this.registerForPushNotificationsAsync();
    if (!token) {
      return undefined;
    }

    await this.sendTokenToBackend(token);
    return token;
  },

  async enablePushNotifications(): Promise<string | undefined> {
    await this.setPushEnabled(true);
    const token = await this.syncPushRegistration();
    if (token) {
      return token;
    }

    await this.setPushEnabled(false);
    await this.removeTokenFromBackend();
    return undefined;
  },

  async disablePushNotifications(): Promise<void> {
    await this.setPushEnabled(false);
    await this.removeTokenFromBackend();
  },

  async unregisterDevice(): Promise<void> {
    await this.removeTokenFromBackend();
  },

  setupForegroundHandler(callback: (notification: Notifications.Notification) => void): () => void {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      logger.info('Push foreground notification:', notification.request.content.title);
      callback(notification);
    });

    return () => subscription.remove();
  },

  setupNotificationResponseHandler(callback: (data: Record<string, string>) => void): () => void {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      callback(
        normalizeNotificationData(
          response.notification.request.content.data as NotificationPayload | undefined
        )
      );
    });

    return () => subscription.remove();
  },

  async handleInitialNotificationResponse(
    callback: (data: Record<string, string>) => void
  ): Promise<void> {
    const response = await Notifications.getLastNotificationResponseAsync();
    if (!response) {
      return;
    }

    callback(
      normalizeNotificationData(
        response.notification.request.content.data as NotificationPayload | undefined
      )
    );
    await Notifications.clearLastNotificationResponseAsync();
  },

  setupTokenRefreshHandler(): () => void {
    const subscription = Notifications.addPushTokenListener(async (token) => {
      const nextToken = token.data;
      const enabled = await this.isPushEnabled();

      await storePushToken(nextToken);
      if (!enabled) {
        logger.info('Push token refreshed while notifications are disabled');
        return;
      }

      await this.sendTokenToBackend(nextToken);
    });

    return () => subscription.remove();
  },

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
    return apiService.get(API_ENDPOINTS.NOTIFICATION_BY_ID(id));
  },

  async markNotificationAsRead(id: string): Promise<void> {
    await apiService.post(API_ENDPOINTS.MARK_NOTIFICATION_READ(id), {});
  },

  async markAllNotificationsAsRead(): Promise<void> {
    await apiService.post(API_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ, {});
  },

  async getUnreadCount(): Promise<{ unread: number }> {
    return apiService.get(API_ENDPOINTS.UNREAD_COUNT);
  },
};
