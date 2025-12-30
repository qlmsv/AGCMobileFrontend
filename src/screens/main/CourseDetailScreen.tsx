import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Course } from '../../types';
import { courseService } from '../../services/courseService';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { logApiError } from '../../utils/errorUtils';
import { logger } from '../../utils/logger';
import { RootStackParamList } from '../../navigation/types';

type CourseDetailRouteProp = RouteProp<RootStackParamList, 'CourseDetail'>;
type CourseDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CourseDetail'>;

export const CourseDetailScreen: React.FC = () => {
  const route = useRoute<CourseDetailRouteProp>();
  const navigation = useNavigation<CourseDetailNavigationProp>();
  const { courseId } = route.params;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'content'>('about');
  const [isFavourite, setIsFavourite] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const loadCourse = useCallback(async () => {
    try {
      logger.debug('📥 Loading course:', courseId);
      const courseData = await courseService.getCourse(String(courseId));
      logger.debug('✅ Course loaded:', courseData.title);
      setCourse(courseData);
      setIsFavourite(courseData.is_favourite || false);
      // Check if user is already enrolled (you can add this field to Course type)
      setIsEnrolled((courseData as any).is_enrolled || false);
    } catch (error) {
      logger.error('❌ Failed to load course:', error);
      logApiError('Failed to load course', error);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useFocusEffect(
    useCallback(() => {
      loadCourse();
    }, [loadCourse])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourse();
    setRefreshing(false);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleBookmark = async () => {
    if (!course) return;

    try {
      if (isFavourite) {
        await courseService.removeFromFavourites(course.id);
        setIsFavourite(false);
      } else {
        await courseService.addToFavourites(course.id);
        setIsFavourite(true);
      }
    } catch (error) {
      logger.error('Failed to update favourite:', error);
    }
  };

  const handleBuyCourse = async () => {
    if (!course) return;

    if (isEnrolled) {
      Alert.alert('Already Enrolled', 'You are already enrolled in this course!');
      return;
    }

    // If course is free, enroll directly
    if (course.is_free || Number(course.price) === 0) {
      Alert.alert(
        'Enroll in Course',
        `Do you want to enroll in "${course.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enroll',
            onPress: async () => {
              setIsEnrolling(true);
              try {
                await courseService.enrollInCourse(course.id);
                setIsEnrolled(true);
                Alert.alert(
                  'Success!',
                  'You have successfully enrolled in this course!',
                  [{ text: 'OK' }]
                );
                // Reload course data
                await loadCourse();
              } catch (error) {
                logger.error('Failed to enroll:', error);
                Alert.alert(
                  'Enrollment Failed',
                  'Failed to enroll in the course. Please try again.',
                  [{ text: 'OK' }]
                );
              } finally {
                setIsEnrolling(false);
              }
            },
          },
        ]
      );
    } else {
      // For paid courses, show payment flow
      Alert.alert(
        'Purchase Course',
        `This course costs $${course.price}. Payment integration coming soon!`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: () => {
              // TODO: Implement payment flow
              logger.debug('TODO: Open payment for course:', course.id);
              Alert.alert('Coming Soon', 'Payment integration will be available soon!');
            },
          },
        ]
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color="#404040" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Course</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Course not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="#404040" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Course</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBookmark}>
          <Ionicons
            name={isFavourite ? "bookmark" : "bookmark-outline"}
            size={24}
            color={isFavourite ? "#FE7333" : "#404040"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Course Image */}
        {course.cover ? (
          <Image
            source={{ uri: course.cover }}
            style={styles.courseImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.courseImage, styles.coursePlaceholder]}>
            <Ionicons name="book" size={48} color={colors.neutral.white} />
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'about' && styles.tabActive]}
            onPress={() => setActiveTab('about')}
          >
            <Text style={[styles.tabText, activeTab === 'about' && styles.tabTextActive]}>
              About
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'content' && styles.tabActive]}
            onPress={() => setActiveTab('content')}
          >
            <Text style={[styles.tabText, activeTab === 'content' && styles.tabTextActive]}>
              Content
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'about' ? (
          <View style={styles.aboutSection}>
            {/* Title & Description */}
            <View style={styles.titleSection}>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.courseDescription}>
                {course.description}
                <Text style={styles.seeMoreText}> See more...</Text>
              </Text>
            </View>

            {/* Course Info */}
            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Duration of the course</Text>
                <Text style={styles.infoValue}>{course.duration || '6 days'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Duration of the lessons</Text>
                <Text style={styles.infoValue}>45 min</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Language</Text>
                <Text style={styles.infoValue}>{course.language || 'English'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Class</Text>
                <Text style={styles.infoValue}>{course.category?.name || 'Business and professional skills'}</Text>
              </View>
            </View>

            {/* Coach Card */}
            <TouchableOpacity
              style={styles.coachCard}
              onPress={() => logger.debug('TODO: View coach profile')}
            >
              <View style={styles.coachInfo}>
                <View style={styles.coachAvatar}>
                  <Ionicons name="person" size={20} color="#A3A3A3" />
                </View>
                <View>
                  <Text style={styles.coachName}>Sebastian Vettel</Text>
                  <Text style={styles.coachRole}>Entrepreneur and researcher</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#A3A3A3" />
            </TouchableOpacity>

            {/* Course Content Info */}
            <View style={styles.contentInfoSection}>
              <Text style={styles.sectionTitle}>Course content</Text>
              <View style={styles.contentInfoList}>
                <View style={styles.contentInfoItem}>
                  <Ionicons name="layers-outline" size={20} color="#404040" />
                  <Text style={styles.contentInfoText}>{course.modules?.length || 5} modules</Text>
                </View>
                <View style={styles.contentInfoItem}>
                  <Ionicons name="ribbon-outline" size={20} color="#404040" />
                  <Text style={styles.contentInfoText}>Certificate of completion</Text>
                </View>
                <View style={styles.contentInfoItem}>
                  <Ionicons name="globe-outline" size={20} color="#404040" />
                  <Text style={styles.contentInfoText}>Access anywhere, anytime</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.contentSection}>
            {/* Modules List */}
            {(course.modules || []).map((module, index) => (
              <TouchableOpacity
                key={module.id || index}
                style={styles.moduleCard}
                onPress={() => logger.debug('TODO: Open module:', module.id)}
              >
                <View style={styles.moduleInfo}>
                  <Ionicons name="folder-outline" size={24} color="#737373" />
                  <View>
                    <Text style={styles.moduleTitle}>{module.title || `Module ${index + 1}`}</Text>
                    <Text style={styles.moduleLessons}>
                      {module.lessons?.length || 7} lessons
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#A3A3A3" />
              </TouchableOpacity>
            ))}

            {(!course.modules || course.modules.length === 0) && (
              <>
                {[1, 2, 3, 4, 5].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={styles.moduleCard}
                    onPress={() => logger.debug('TODO: Open module:', num)}
                  >
                    <View style={styles.moduleInfo}>
                      <Ionicons name="folder-outline" size={24} color="#737373" />
                      <View>
                        <Text style={styles.moduleTitle}>Module {num}</Text>
                        <Text style={styles.moduleLessons}>7 lessons</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#A3A3A3" />
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.buyButton, (isEnrolling || isEnrolled) && styles.buyButtonDisabled]}
          onPress={handleBuyCourse}
          disabled={isEnrolling || isEnrolled}
        >
          {isEnrolling ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buyButtonText}>
              {isEnrolled
                ? 'Already Enrolled'
                : course.is_free || Number(course.price) === 0
                  ? 'Enroll for Free'
                  : `Buy for $${course.price}`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 360,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(207, 207, 207, 0.10)',
    shadowOpacity: 1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  headerTitle: {
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '600',
    color: '#171717',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  courseImage: {
    width: '90%',
    height: 200,
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 16,
    alignSelf: 'center',
  },
  coursePlaceholder: {
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 4,
    backgroundColor: '#EFEFEF',
    borderRadius: 1000,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 1000,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(207, 207, 207, 0.10)',
    shadowOpacity: 1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  tabText: {
    fontFamily: 'Rubik',
    fontSize: 12,
    fontWeight: '600',
    color: '#A3A3A3',
  },
  tabTextActive: {
    color: '#171717',
  },
  aboutSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  titleSection: {
    gap: 8,
  },
  courseTitle: {
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    color: '#171717',
  },
  courseDescription: {
    fontFamily: 'Rubik',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: '#404040',
  },
  seeMoreText: {
    color: '#FD4F01',
    fontWeight: '700',
  },
  infoSection: {
    gap: 12,
  },
  infoItem: {
    gap: 4,
  },
  infoLabel: {
    fontFamily: 'Rubik',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#404040',
  },
  infoValue: {
    fontFamily: 'Rubik',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: '#171717',
  },
  coachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: 'rgba(207, 207, 207, 0.10)',
    shadowOpacity: 1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coachAvatar: {
    width: 40,
    height: 40,
    borderRadius: 200,
    backgroundColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coachName: {
    fontFamily: 'Rubik',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: '#171717',
  },
  coachRole: {
    fontFamily: 'Rubik',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: '#A3A3A3',
  },
  contentInfoSection: {
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    color: '#171717',
  },
  contentInfoList: {
    gap: 12,
  },
  contentInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contentInfoText: {
    fontFamily: 'Rubik',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: '#404040',
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 8,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: 'rgba(207, 207, 207, 0.10)',
    shadowOpacity: 1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  moduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moduleTitle: {
    fontFamily: 'Rubik',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: '#171717',
  },
  moduleLessons: {
    fontFamily: 'Rubik',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: '#A3A3A3',
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  buyButton: {
    backgroundColor: '#262626',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 1000,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  buyButtonDisabled: {
    backgroundColor: '#A3A3A3',
    opacity: 0.6,
  },
  buyButtonText: {
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    color: '#FFFFFF',
  },
  errorText: {
    fontFamily: 'Rubik',
    fontSize: 16,
    color: '#737373',
  },
});
