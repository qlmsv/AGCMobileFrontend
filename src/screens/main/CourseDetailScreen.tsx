import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { courseService } from '../../services/courseService';
import { Course, Module } from '../../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { logger } from '../../utils/logger';
import { useAuth } from '../../contexts/AuthContext';
import { secureImageUrl } from '../../utils/secureUrl';
import { iapService } from '../../services/iapService';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const CourseDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const courseId = route.params?.courseId;
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Tier display price for iOS comes from course.tier_info.price (set by backend)
  const getDisplayPrice = (): string => {
    if (course?.is_free || !course?.price || parseFloat(course.price) === 0) return 'Free';
    if (Platform.OS === 'ios' && course.tier_info?.price) {
      return `$${course.tier_info.price}`;
    }
    return `$${course?.price}`;
  };

  const fetchCourseDetails = useCallback(async () => {
    try {
      const courseData = await courseService.getCourse(courseId);
      setCourse(courseData);
      // Assuming modules are nested or fetched separately.
      // If nested in 'modules' field:
      if (courseData.modules) {
        setModules(courseData.modules);
      } else {
        // Try fetching modules if not nested
        // const modulesData = await courseService.getModules({ course: courseId });
        // setModules(modulesData);
        // Based on typings logic, let's assume valid nesting or empty
        setModules([]);
      }
    } catch (error) {
      logger.error('Error fetching course details:', error);
      Alert.alert('Error', 'Failed to load course details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  const handleEnroll = async () => {
    if (!course) return;
    setIsEnrolling(true);
    try {
      await courseService.enrollInCourse(course.id);
      Alert.alert('Success', 'Enrolled successfully!');
      fetchCourseDetails();
    } catch (error: any) {
      logger.error('Enrollment error:', error);
      const code = error?.response?.data?.code;

      if (code === 'already_enrolled') {
        fetchCourseDetails();
      } else if (code === 'payment_required') {
        if (Platform.OS === 'ios') {
          await handleIAPPurchase();
        } else {
          Alert.alert(
            'Payment Required',
            'Purchase this course to get access to all content.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Pay Now', onPress: () => { void handleStripeCheckout(); } },
            ]
          );
        }
      } else {
        const msg = error?.response?.data?.detail || error?.message || 'Enrollment failed';
        Alert.alert('Error', msg);
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleIAPPurchase = async () => {
    if (!course) return;
    try {
      setIsEnrolling(true);
      if (!iapService.isAvailable()) {
        Alert.alert('Error', 'In-App Purchases are not available on this device.');
        return;
      }
      const productId = course.tier_info?.product_id;
      if (!productId) {
        Alert.alert('Error', 'Unable to determine product for this course.');
        return;
      }
      logger.info('Initiating Apple IAP for course:', { courseId: course.id, productId });
      const result = await iapService.purchaseCourse(productId, course.id);
      if (result.success) {
        Alert.alert('Success', 'Purchase completed! You are now enrolled.');
        fetchCourseDetails();
      } else if (result.error !== 'Purchase cancelled') {
        logger.error('IAP purchase failed:', result.error);
        Alert.alert('Purchase Failed', result.error || 'Unable to complete purchase');
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Failed to complete purchase.';
      Alert.alert('Error', detail);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleStripeCheckout = async () => {
    if (!course) return;
    try {
      setIsEnrolling(true);
      const { checkout_url } = await courseService.createCourseStripeSession(course.id);
      if (checkout_url) {
        navigation.navigate('Payment', { url: checkout_url });
      } else {
        Alert.alert('Error', 'Payment session created but no URL received.');
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Failed to create payment session.';
      Alert.alert('Error', detail);
    } finally {
      setIsEnrolling(false);
    }
  };

  const renderModule = (module: Module, index: number) => {
    // Access is course-level: if not enrolled in the course, all modules are locked
    const hasAccess = course?.is_enrolled === true || module.has_access === true || module.has_access === 'true';
    const isLocked = !hasAccess;

    return (
      <View key={module.id} style={styles.moduleContainer}>
        <View style={styles.moduleHeader}>
          <Text style={styles.moduleTitle}>
            Module {index + 1}: {module.title}
          </Text>
          {isLocked && (
            <Ionicons name="lock-closed" size={16} color={colors.text.tertiary} />
          )}
        </View>

        {isLocked ? (
          <View style={styles.lockedModule}>
            <Text style={styles.lockedSubtext}>
              {module.lessons?.length || 0} lessons — purchase the course to unlock
            </Text>
          </View>
        ) : (
          <>
            {module.lessons?.map((lesson, idx) => (
              <TouchableOpacity
                key={lesson.id}
                style={styles.lessonItem}
                onPress={() => navigation.navigate('LessonDetail', { lessonId: lesson.id })}
              >
                <Ionicons name="play-circle" size={20} color={colors.primary.main} />
                <Text style={styles.lessonTitle}>
                  {idx + 1}. {lesson.title}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text>Course not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} testID="course-detail-screen">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Course Details
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {/* Edit button for course author */}
          {user?.id === course?.author && (
            <TouchableOpacity
              onPress={() => navigation.navigate('EditCourse', { courseId: course.id })}
            >
              <Ionicons name="create-outline" size={24} color={colors.primary.main} />
            </TouchableOpacity>
          )}
          <TouchableOpacity>
            <Ionicons name="share-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={{ uri: secureImageUrl(course.cover) }}
          style={styles.courseImage}
          resizeMode="cover"
        />

        <View style={styles.info}>
          <View style={styles.pillContainer}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{course.category?.name || 'General'}</Text>
            </View>
            {course.is_free && (
              <View style={styles.freePill}>
                <Text style={styles.freeText}>FREE</Text>
              </View>
            )}
            {course.is_enrolled && (
              <View style={[styles.freePill, { backgroundColor: colors.success + '20' }]}>
                <Text style={[styles.freeText, { color: colors.success }]}>ENROLLED</Text>
              </View>
            )}
          </View>

          <Text testID="course-title" style={styles.title}>
            {course.title}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={16} color="#FFC107" />
              <Text style={styles.metaText}> {course.rating?.toFixed(1) || 'N/A'} (Reviews)</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={colors.text.tertiary} />
              <Text style={styles.metaText}>
                {' '}
                {course.duration ? `${course.duration}h` : 'Flexible'}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>About Course</Text>
          <Text testID="course-description" style={styles.description}>
            {course.description || 'No description available for this course.'}
          </Text>

          <Text style={styles.sectionTitle}>Curriculum</Text>
          {modules.length > 0 ? (
            modules.map((m, i) => (
              <View key={m.id} testID="modules-list">
                {renderModule(m, i)}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No modules available yet.</Text>
          )}

          {/* Teacher actions */}
          {course.author === user?.id && (
            <>
              <TouchableOpacity
                style={styles.addModuleButton}
                onPress={() =>
                  navigation.navigate('AddModule', {
                    courseId: course.id,
                    modulesCount: modules.length,
                  })
                }
              >
                <Ionicons name="add-circle-outline" size={20} color={colors.primary.main} />
                <Text style={styles.addModuleText}>Add Module</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addModuleButton, { marginTop: spacing.sm }]}
                onPress={() => navigation.navigate('TeacherCertificates', { courseId: course.id })}
              >
                <Ionicons name="ribbon-outline" size={20} color={colors.primary.main} />
                <Text style={styles.addModuleText}>Issue Certificates</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceValue}>{getDisplayPrice()}</Text>
        </View>
        <TouchableOpacity
          testID="enroll-button"
          style={[
            styles.enrollButton,
            (isEnrolling || course.is_enrolled) && styles.disabledButton,
            course.is_enrolled && { backgroundColor: colors.success },
          ]}
          onPress={handleEnroll}
          disabled={isEnrolling || course.is_enrolled}
        >
          {isEnrolling ? (
            <ActivityIndicator color={colors.text.inverse} />
          ) : (
            <Text style={styles.enrollButtonText}>
              {course.is_enrolled
                ? 'Already Enrolled'
                : !course.is_free && Platform.OS === 'ios'
                  ? 'Purchase Course'
                  : 'Enroll Now'}
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
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  content: {
    paddingBottom: 100,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseImage: {
    width: '100%',
    height: 240,
    backgroundColor: colors.neutral[200],
  },
  pillContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  categoryPill: {
    backgroundColor: colors.primary.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    ...textStyles.caption,
    color: colors.primary.main,
  },
  freePill: {
    backgroundColor: colors.success + '20', // rough alpha
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  freeText: {
    ...textStyles.caption,
    color: colors.success,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginLeft: 4,
  },
  info: {
    padding: spacing.base,
  },
  title: {
    ...textStyles.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  moduleContainer: {
    marginBottom: spacing.md,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
  },
  moduleTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
    fontSize: 16,
    flex: 1,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  lockedModule: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  lockedSubtext: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  lessonTitle: {
    ...textStyles.body,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  priceContainer: {
    justifyContent: 'center',
  },
  priceLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  priceValue: {
    ...textStyles.h3,
    color: colors.primary.main,
  },
  enrollButton: {
    backgroundColor: colors.primary.main,
    height: 50,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    flex: 1,
    marginLeft: spacing.lg,
  },
  disabledButton: {
    backgroundColor: colors.neutral[300],
  },
  enrollButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
    fontSize: 16,
  },
  emptyText: {
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  description: {
    ...textStyles.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.base,
    backgroundColor: colors.background.default,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    alignItems: 'center',
  },
  addModuleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.primary.main + '10',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary.main,
    borderStyle: 'dashed',
    gap: spacing.sm,
  },
  addModuleText: {
    ...textStyles.body,
    color: colors.primary.main,
    fontWeight: '600',
  },
});
