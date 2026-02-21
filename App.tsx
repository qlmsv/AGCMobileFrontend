import React, { useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { notificationService } from './src/services/notificationService';
import { iapService } from './src/services/iapService';
import { logger } from './src/utils/logger';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    // Alias for code that uses 'Inter' directly if configured that way
    Inter: Inter_400Regular,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    // Register FCM background handler once (outside render)
    notificationService.setupBackgroundHandler();
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;

    // Warm up IAP connection for iOS
    if (Platform.OS === 'ios') {
      iapService.initialize().catch((err) => {
        logger.error('[App] Failed to initialize IAP:', err);
      });
    }

    // Register FCM token and send to backend
    notificationService.registerForPushNotificationsAsync().then((token) => {
      if (token) {
        notificationService.sendTokenToBackend(token);
      }
    });

    // Set up foreground notification handler
    const unsubscribe = notificationService.setupForegroundHandler((message) => {
      logger.info('[App] FCM foreground message:', message?.notification?.title);
    });

    return () => unsubscribe();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="dark" />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
