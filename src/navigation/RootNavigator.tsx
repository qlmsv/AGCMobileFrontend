import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { EmailInputScreen } from '../screens/auth/EmailInputScreen';
import { VerifyCodeScreen } from '../screens/auth/VerifyCodeScreen';
import { CompleteRegistrationScreen } from '../screens/auth/CompleteRegistrationScreen';
import { CourseDetailScreen } from '../screens/main/CourseDetailScreen';
import { CreateCourseScreen } from '../screens/main/CreateCourseScreen';
import { CreateCourseModulesScreen } from '../screens/main/CreateCourseModulesScreen';
import { CreateModuleDetailScreen } from '../screens/main/CreateModuleDetailScreen';
import MainTabNavigator from './MainTabNavigator';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer key={isAuthenticated ? 'app' : 'auth'}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
            <Stack.Screen name="CreateCourse" component={CreateCourseScreen} />
            <Stack.Screen name="CreateCourseModules" component={CreateCourseModulesScreen} />
            <Stack.Screen name="CreateModuleDetail" component={CreateModuleDetailScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="EmailInput" component={EmailInputScreen} />
            <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
            <Stack.Screen name="CompleteRegistration" component={CompleteRegistrationScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
