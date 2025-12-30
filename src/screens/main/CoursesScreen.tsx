import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { Course, Category } from '../../types';
import { courseService } from '../../services/courseService';
import { colors } from '../../theme';
import { logApiError } from '../../utils/errorUtils';
import { logger } from '../../utils/logger';

const extractCategories = (data: unknown): Category[] => {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === 'object' && 'results' in data) {
    const results = (data as { results?: unknown }).results;
    if (Array.isArray(results)) {
      return results;
    }
  }

  return [];
};

export const CoursesScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      logger.debug('📥 Loading categories...');
      await courseService.getCategories();
      setCategoriesError(null);
    } catch (error) {
      logger.error('❌ Failed to load categories:', error);
      logApiError('Failed to load categories', error);
      setCategoriesError('Failed to load categories');
    }
  }, []);

  const loadCourses = useCallback(
    async (options?: { skipSpinner?: boolean }) => {
      if (!options?.skipSpinner) {
        setIsCoursesLoading(true);
      }

      try {
        logger.debug('📥 Loading courses...', { activeTab });
        let coursesData: Course[];

        if (activeTab === 'my') {
          coursesData = await courseService.getMyCourses();
        } else {
          coursesData = await courseService.getCourses();
        }

        logger.debug('✅ Courses loaded:', coursesData.length);
        setCourses(coursesData);
        setCoursesError(null);
      } catch (error) {
        logger.error('❌ Failed to load courses:', error);
        logApiError('Failed to load courses', error);
        setCourses([]);
        setCoursesError('Failed to load courses');
      } finally {
        if (!options?.skipSpinner) {
          setIsCoursesLoading(false);
        }
      }
    },
    [activeTab]
  );

  const initialize = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchCategories();
      await loadCourses({ skipSpinner: true });
      setHasInitialLoad(true);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCategories, loadCourses]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!hasInitialLoad) {
      return;
    }
    loadCourses();
  }, [activeTab, hasInitialLoad, loadCourses]);

  const onRefresh = async () => {
    setRefreshing(true);
    await initialize();
    setRefreshing(false);
  };

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) {
      return courses;
    }
    const query = searchQuery.toLowerCase();
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query)
    );
  }, [courses, searchQuery]);

  const renderCourse = ({ item }: { item: Course }) => {
    logger.debug('Course image URL:', item.cover);
    const isEnrolled = (item as any).is_enrolled || false;

    return (
      <TouchableOpacity
        style={styles.courseCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
      >
        {/* Course Image */}
        <View style={styles.courseImageContainer}>
          {item.cover ? (
            <Image
              source={{ uri: item.cover }}
              style={styles.courseImage}
              resizeMode="cover"
              onError={(error) => {
                logger.error('Image load error:', error.nativeEvent.error);
              }}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={48} color={colors.neutral[400]} />
            </View>
          )}
        </View>

        {/* Course Info */}
        <View style={styles.courseInfo}>
          <View style={styles.courseTitleRow}>
            <Text style={styles.courseTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {isEnrolled && (
              <View style={styles.enrolledBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              </View>
            )}
          </View>
          <Text style={styles.courseDescription} numberOfLines={1}>
            {item.description}
          </Text>

          {/* Course Meta */}
          <View style={styles.courseMetaRow}>
            <View style={styles.courseMetaLeft}>
              <View style={styles.metaItem}>
                <Ionicons name="book-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.metaText}>5 modules</Text>
              </View>
              <View style={styles.metaDot}>
                <View style={styles.dotInner} />
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="ribbon-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.metaText}>certificate</Text>
              </View>
            </View>
            <TouchableOpacity>
              <Ionicons name="bookmark-outline" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconButton} />
        <Text style={styles.headerTitle}>Courses</Text>
        <View style={styles.iconButton} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Ionicons name="search-outline" size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchText}
            placeholder="search..."
            placeholderTextColor={colors.text.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.segment, activeTab === 'all' && styles.segmentActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.segmentText, activeTab === 'all' && styles.segmentTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segment, activeTab === 'my' && styles.segmentActive]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.segmentText, activeTab === 'my' && styles.segmentTextActive]}>
            My courses
          </Text>
        </TouchableOpacity>
      </View>

      {/* Course List */}
      <FlatList
        data={filteredCourses}
        renderItem={renderCourse}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={64} color={colors.neutral[300]} />
            <Text style={styles.emptyTitle}>No courses found</Text>
            <Text style={styles.emptyBody}>
              {searchQuery ? 'Try adjusting your search query' : 'Pull down to refresh'}
            </Text>
          </View>
        }
        ListFooterComponent={
          isCoursesLoading ? (
            <View style={styles.footerSpinner}>
              <ActivityIndicator size="small" color={colors.primary.main} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 360,
    backgroundColor: colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#CFCFCF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Rubik',
    color: colors.text.primary,
    lineHeight: 24,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.neutral.white,
    borderRadius: 1000,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#CFCFCF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  searchText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Rubik',
    fontWeight: '400',
    color: colors.text.primary,
    lineHeight: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 4,
    backgroundColor: '#EFEFEF',
    borderRadius: 1000,
    gap: 0,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: colors.neutral.white,
    shadowColor: '#CFCFCF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  segmentText: {
    fontSize: 12,
    fontFamily: 'Rubik',
    fontWeight: '600',
    color: colors.text.tertiary,
    lineHeight: 16,
    textAlign: 'center',
  },
  segmentTextActive: {
    color: colors.text.primary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  courseCard: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 24,
  },
  courseImageContainer: {
    height: 196,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#D9D9D9',
    shadowColor: '#CFCFCF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D9D9D9',
  },
  courseInfo: {
    flexDirection: 'column',
    gap: 8,
  },
  courseTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  courseTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Rubik',
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 24,
  },
  enrolledBadge: {
    flexShrink: 0,
    marginTop: 2,
  },
  courseDescription: {
    fontSize: 14,
    fontFamily: 'Rubik',
    fontWeight: '500',
    color: colors.text.tertiary,
    lineHeight: 20,
  },
  courseMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseMetaLeft: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Rubik',
    fontWeight: '600',
    color: colors.text.secondary,
    lineHeight: 20,
  },
  metaDot: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotInner: {
    width: 4,
    height: 4,
    backgroundColor: colors.text.secondary,
    borderRadius: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Rubik',
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
  },
  emptyBody: {
    fontSize: 14,
    fontFamily: 'Rubik',
    fontWeight: '400',
    color: colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  footerSpinner: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
