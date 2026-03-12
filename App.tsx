import React, { useEffect, useCallback } from 'react';
import { Platform, View } from 'react-native';
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
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { notificationService } from './src/services/notificationService';
import { iapService } from './src/services/iapService';
import { logger } from './src/utils/logger';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { OfflineBanner } from './src/components/OfflineBanner';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import {
  flushPendingNavigation,
  navigate,
  navigationRef,
} from './src/navigation/navigationService';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

function handleNotificationNavigation(data: Record<string, string>) {
  if (data.chat_id) {
    navigate('ChatDetail', { chatId: data.chat_id });
    return;
  }

  if (data.lesson_id) {
    navigate('LessonDetail', { lessonId: data.lesson_id });
  }
}

function AppShell() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    notificationService.syncPushRegistration().catch((error) => {
      logger.error('[App] Failed to sync push registration:', error);
    });
  }, [isAuthenticated]);

  useEffect(() => {
    const unsubscribeForeground = notificationService.setupForegroundHandler((notification) => {
      logger.info('[App] Foreground notification:', notification.request.content.title);
    });
    const unsubscribeResponse = notificationService.setupNotificationResponseHandler(
      handleNotificationNavigation
    );
    const unsubscribeTokenRefresh = notificationService.setupTokenRefreshHandler();

    notificationService
      .handleInitialNotificationResponse(handleNotificationNavigation)
      .catch((error) => {
        logger.error('[App] Failed to process initial notification response:', error);
      });

    return () => {
      unsubscribeForeground();
      unsubscribeResponse();
      unsubscribeTokenRefresh();
    };
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={flushPendingNavigation}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
    >
      <RootNavigator />
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}

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
    if (!fontsLoaded) return;

    // Warm up IAP connection for iOS
    if (Platform.OS === 'ios') {
      iapService.initialize().catch((err) => {
        logger.error('[App] Failed to initialize IAP:', err);
      });
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <OfflineBanner />
            <AuthProvider>
              <AppShell />
            </AuthProvider>
          </View>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
