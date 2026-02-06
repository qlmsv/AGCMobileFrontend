import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { CourseDetailScreen } from '../screens/main/CourseDetailScreen';
import { LessonDetailScreen } from '../screens/main/LessonDetailScreen';
import { ChatDetailScreen } from '../screens/main/ChatDetailScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { EditProfileScreen } from '../screens/main/EditProfileScreen';
import { StudentsScreen } from '../screens/teacher/StudentsScreen';
import { CreateCourseScreen } from '../screens/teacher/CreateCourseScreen';
import { EditCourseScreen } from '../screens/teacher/EditCourseScreen';
import { AddModuleScreen } from '../screens/teacher/AddModuleScreen';
import { TermsScreen } from '../screens/main/TermsScreen';
import { PrivacyScreen } from '../screens/main/PrivacyScreen';
import { useAuth } from '../contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { RootStackParamList } from './types';
import { colors } from '../theme';

// Only import PaymentScreen for Android (Stripe compliance for iOS)
let PaymentScreen: any = null;
if (Platform.OS !== 'ios') {
  PaymentScreen = require('../screens/main/PaymentScreen').PaymentScreen;
}

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background.default,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
          <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
          <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          {/* Payment screen only for Android - iOS uses IAP (App Store Guideline 3.1.1) */}
          {Platform.OS !== 'ios' && PaymentScreen && (
            <Stack.Screen name="Payment" component={PaymentScreen} />
          )}
          <Stack.Screen name="Students" component={StudentsScreen} />
          <Stack.Screen name="CreateCourse" component={CreateCourseScreen} />
          <Stack.Screen name="EditCourse" component={EditCourseScreen} />
          <Stack.Screen name="AddModule" component={AddModuleScreen} />
          <Stack.Screen name="Terms" component={TermsScreen} />
          <Stack.Screen name="Privacy" component={PrivacyScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};
