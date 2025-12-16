import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/main/HomeScreen';
import { CoursesScreen } from '../screens/main/CoursesScreen';
import { ChatsScreen } from '../screens/main/ChatsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  const getIcon = (routeName: string, focused: boolean) => {
    let iconName: keyof typeof Ionicons.glyphMap;

    switch (routeName) {
      case 'Home':
        iconName = focused ? 'home' : 'home-outline';
        break;
      case 'Courses':
        iconName = focused ? 'book' : 'book-outline';
        break;
      case 'Chats':
        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
        break;
      case 'Profile':
        iconName = focused ? 'person' : 'person-outline';
        break;
      default:
        iconName = 'help-circle-outline';
    }

    return iconName;
  };

  return (
    <View style={[
      styles.tabBarContainer,
      { paddingBottom: Platform.OS === 'ios' ? insets.bottom : 12 }
    ]}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              {isFocused ? (
                <View style={styles.tabItemActiveContainer}>
                  <View style={styles.tabItemActive}>
                    <Ionicons
                      name={getIcon(route.name, true)}
                      size={24}
                      color="#FE7333"
                    />
                    <Text style={styles.tabLabelActive}>{label}</Text>
                  </View>
                  {/* Orange dot indicator */}
                  <View style={styles.activeDot} />
                </View>
              ) : (
                <Ionicons
                  name={getIcon(route.name, false)}
                  size={24}
                  color="#A3A3A3"
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Courses" component={CoursesScreen} />
      <Tab.Screen name="Chats" component={ChatsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(194, 194, 194, 0.10)',
    shadowOpacity: 1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -6 },
    elevation: 20,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActiveContainer: {
    alignItems: 'center',
  },
  tabItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFEDE4',
    borderRadius: 60,
    gap: 6,
  },
  tabLabelActive: {
    fontFamily: 'Rubik',
    fontSize: 12,
    fontWeight: '500',
    color: '#FD4F01',
    lineHeight: 16,
  },
  activeDot: {
    width: 6,
    height: 6,
    backgroundColor: '#FE7333',
    borderRadius: 9999,
    marginTop: 4,
  },
});
