import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '../../types';
import { courseService } from '../../services/courseService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { EmptyState } from '../../components';
import { logger } from '../../utils/logger';
import * as ImagePicker from 'expo-image-picker';
import { profileService } from '../../services/profileService';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const { logout, user, profile, refreshUser } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [favorites, setFavorites] = useState<Course[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchMyCourses = useCallback(async () => {
    try {
      if (user?.role === 'teacher') {
        const data = await courseService.getCourses({ author: user.id });
        setMyCourses(data);
      } else {
        const data = await courseService.getMyCourses();
        setMyCourses(data);
      }
    } catch (error) {
      logger.error('Failed to fetch my courses', error);
    }
  }, [user?.role, user?.id]);

  const fetchFavorites = useCallback(async () => {
    try {
      const data = await courseService.getFavouriteCourses();
      setFavorites(data);
    } catch (error) {
      logger.error('Failed to fetch favorites', error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([fetchMyCourses(), fetchFavorites()]);
    setIsRefreshing(false);
  }, [fetchMyCourses, fetchFavorites]);

  useEffect(() => {
    fetchMyCourses();
    fetchFavorites();
  }, [fetchMyCourses, fetchFavorites]);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await handleUploadAvatar(result.assets[0]);
      }
    } catch (error) {
      logger.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleUploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!profile?.id) return;

    setIsUploading(true);
    try {
      const filename = asset.uri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const fileToUpload = {
        uri: asset.uri,
        name: filename,
        type,
      };

      await profileService.uploadAvatar(profile.id, fileToUpload as any);

      // Refresh profile data
      if (refreshUser) {
        await refreshUser();
      }

      Alert.alert('Success', 'Avatar updated successfully');
    } catch (error) {
      logger.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const renderCourseItem = (course: Course) => (
    <TouchableOpacity
      key={course.id}
      style={styles.courseCard}
      onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
    >
      <Image
        source={{ uri: course.cover || undefined }}
        style={styles.courseImage}
        resizeMode="cover"
      />
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={1}>
          {course.title}
        </Text>
        {user?.role !== 'teacher' && (
          <>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: '45%' }]} />
            </View>
            <Text style={styles.progressText}>45% Complete</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconButton}>
            <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={styles.iconButton}>
            <Ionicons name="log-out-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.main}
          />
        }
      >
        <View style={styles.profileInfo}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handlePickImage}
            disabled={isUploading}
          >
            {profile?.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {profile?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            {isUploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
            <View style={styles.editIconContainer}>
              <Ionicons name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>
            {profile?.first_name
              ? `${profile.first_name} ${profile.last_name || ''}`
              : profile?.phone_number || user?.email}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.role === 'teacher' && (
            <View style={styles.teacherBadge}>
              <Text style={styles.teacherBadgeText}>Teacher</Text>
            </View>
          )}
        </View>

        {/* Dashboard Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{myCourses.length}</Text>
            <Text style={styles.statLabel}>{user?.role === 'teacher' ? 'Created' : 'Courses'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>
              {user?.role === 'teacher' ? 'Students' : 'Completed'}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Certificates</Text>
          </View>
        </View>

        {/* My Courses Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {user?.role === 'teacher' ? 'My Courses' : 'My Learning'}
          </Text>
          <TouchableOpacity
            onPress={() =>
              user?.role === 'teacher'
                ? navigation.navigate('CreateCourse')
                : navigation.navigate('Main', { screen: 'Courses' })
            }
          >
            <Text style={styles.seeAll}>
              {user?.role === 'teacher' ? 'Create New' : 'Find More'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.coursesList}>
          {myCourses.length > 0 ? (
            myCourses.map(renderCourseItem)
          ) : (
            <EmptyState
              title="Start Learning"
              message="You haven't enrolled in any courses yet."
              icon="book-outline"
              actionLabel="Browse Courses"
              onAction={() => navigation.navigate('Main', { screen: 'Courses' })}
            />
          )}
        </View>

        {/* My Favorites Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Favorites</Text>
        </View>

        <View style={styles.coursesList}>
          {favorites.length > 0 ? (
            favorites.map(renderCourseItem)
          ) : (
            <View style={styles.emptyFavorites}>
              <Ionicons name="heart-outline" size={32} color={colors.text.tertiary} />
              <Text style={styles.emptyFavoritesText}>No favorite courses yet</Text>
            </View>
          )}
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          {/* Teacher-only menu items */}
          {user?.role === 'teacher' && (
            <>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('Students')}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.iconBox, { backgroundColor: colors.primary.light }]}>
                    <Ionicons name="people-outline" size={20} color={colors.primary.main} />
                  </View>
                  <Text style={styles.menuText}>My Students</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  logger.info('CreateCourse button pressed!');
                  try {
                    navigation.navigate('CreateCourse');
                  } catch (error) {
                    logger.error('Navigation error:', error);
                    Alert.alert('Error', 'Failed to navigate to Create Course');
                  }
                }}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.iconBox, { backgroundColor: colors.success + '20' }]}>
                    <Ionicons name="add-circle-outline" size={20} color={colors.success} />
                  </View>
                  <Text style={styles.menuText}>Create Course</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Main', { screen: 'Schedule' })}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: colors.primary.light }]}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary.main} />
              </View>
              <Text style={styles.menuText}>My Schedule</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              Alert.alert(
                'Help & Support',
                'For assistance, please contact us at support@apexglobal.app or visit our website.',
                [{ text: 'OK' }]
              )
            }
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: colors.neutral[100] }]}>
                <Ionicons name="help-circle-outline" size={20} color={colors.text.primary} />
              </View>
              <Text style={styles.menuText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...textStyles.h2,
    color: colors.text.primary,
  },
  iconButton: {
    padding: spacing.sm,
  },
  profileInfo: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatarContainer: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.round,
    backgroundColor: colors.neutral[200],
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...textStyles.h1,
    color: colors.primary.main,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary.main,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background.default,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    ...textStyles.h3,
    color: colors.text.primary,
    marginBottom: 4,
  },
  email: {
    ...textStyles.body,
    color: colors.text.tertiary,
  },
  teacherBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: colors.primary.main,
    borderRadius: 4,
  },
  teacherBadgeText: {
    color: 'white',
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background.default,
    marginHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...textStyles.h3,
    color: colors.primary.main,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border.light,
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  seeAll: {
    ...textStyles.button,
    color: colors.primary.main,
    fontSize: 14,
  },
  coursesList: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  courseImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.neutral[200],
  },
  courseInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  courseTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: 3,
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 3,
  },
  progressText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  menuSection: {
    paddingHorizontal: spacing.base,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    ...textStyles.bodyLarge,
    color: colors.text.primary,
  },
  emptyFavorites: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  emptyFavoritesText: {
    ...textStyles.body,
    color: colors.text.tertiary,
  },
});
