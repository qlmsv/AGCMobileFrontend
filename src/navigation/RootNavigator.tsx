import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { CourseDetailScreen } from '../screens/main/CourseDetailScreen';
import { LessonDetailScreen } from '../screens/main/LessonDetailScreen';
import { ChatDetailScreen } from '../screens/main/ChatDetailScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { EditProfileScreen } from '../screens/main/EditProfileScreen';
import { PaymentScreen } from '../screens/main/PaymentScreen';
import { StudentsScreen } from '../screens/teacher/StudentsScreen';
import { useAuth } from '../contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { RootStackParamList } from './types';
import { colors } from '../theme';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
                    <Stack.Screen name="Payment" component={PaymentScreen} />
                    <Stack.Screen name="Students" component={StudentsScreen} />
                </>
            ) : (
                <Stack.Screen name="Auth" component={AuthNavigator} />
            )}
        </Stack.Navigator>
    );
};
