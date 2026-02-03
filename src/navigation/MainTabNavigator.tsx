import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/main/HomeScreen';
import { CoursesScreen } from '../screens/main/CoursesScreen';

import { ChatsScreen } from '../screens/main/ChatsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { MainTabParamList } from './types';
import { colors } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 60 + insets.bottom,
          backgroundColor: colors.background.default,
          borderTopColor: colors.border.light,
          paddingTop: 8,
          paddingBottom: insets.bottom + 8,
        },
        tabBarActiveTintColor: colors.primary.main, // #FF5A05
        tabBarInactiveTintColor: colors.neutral[400],
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Courses') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Chats') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Schedule') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          }

          return (
            <View
              testID={`tab-icon-${route.name.toLowerCase()}`}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name={iconName} size={24} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          // @ts-ignore
          tabBarTestID: 'tab-home',
        }}
      />
      <Tab.Screen
        name="Courses"
        component={CoursesScreen}
        options={{
          // @ts-ignore
          tabBarTestID: 'tab-courses',
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={require('../screens/main/ScheduleScreen').ScheduleScreen}
        options={{
          // @ts-ignore
          tabBarTestID: 'tab-schedule',
          tabBarLabel: 'Schedule',
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          // @ts-ignore
          tabBarTestID: 'tab-chats',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          // @ts-ignore
          tabBarTestID: 'tab-profile',
        }}
      />
    </Tab.Navigator>
  );
};
