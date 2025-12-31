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
    // TODO: Confirm the exact endpoint for mobile device registration.
    // Common pattern for Django Expo: POST /api/notifications/devices/ or similar
    // For now we will try a generic 'devices' endpoint or just log it.
    try {
      // Example: await apiService.post('/notifications/devices/', { registration_id: token, type: 'expo' });
      logger.info('Simulating backend registration for token:', token);

      // If we were using the webpush endpoint:
      // await apiService.post(API_ENDPOINTS.WEBPUSH_SUBSCRIPTIONS, { ... });
      // But the formats don't match.
    } catch (error) {
      logger.error('Failed to send token to backend:', error);
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
  }
};
