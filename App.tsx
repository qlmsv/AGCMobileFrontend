import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Rubik_400Regular,
  Rubik_500Medium,
  Rubik_600SemiBold,
  Rubik_700Bold,
} from '@expo-google-fonts/rubik';
import { Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import { AuthProvider } from './src/contexts/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { SplashScreen as SplashScreenComponent } from './src/screens/Splash/SplashScreen';

SplashScreen.preventAutoHideAsync().catch(() => {
  // It's safe to ignore the error, splash will auto-hide on failure
});

export default function App() {
  const [fontsLoaded] = useFonts({
    'Rubik-Regular': Rubik_400Regular,
    'Rubik-Medium': Rubik_500Medium,
    'Rubik-SemiBold': Rubik_600SemiBold,
    'Rubik-Bold': Rubik_700Bold,
    'Montserrat-Medium': Montserrat_500Medium,
  });

  const [isSplashFinished, setIsSplashFinished] = useState(false);

  // We move the hideAsync call to the Splash component itself to ensure smooth transition

  if (!fontsLoaded) {
    return null;
  }

  if (!isSplashFinished) {
    return <SplashScreenComponent onFinish={() => setIsSplashFinished(true)} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <RootNavigator />
          <StatusBar style="dark" />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
