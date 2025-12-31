import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { EmailInputScreen } from '../screens/auth/EmailInputScreen';
import { VerificationScreen } from '../screens/auth/VerificationScreen';
import { InformationScreen } from '../screens/auth/InformationScreen';
import { AuthStackParamList } from './types';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#FFFFFF' },
            }}
        >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="EmailInput" component={EmailInputScreen} />
            <Stack.Screen name="Verification" component={VerificationScreen} />
            <Stack.Screen name="Information" component={InformationScreen} />
        </Stack.Navigator>
    );
};
