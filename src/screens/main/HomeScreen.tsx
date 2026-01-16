import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { homeService } from '../../services/homeService';
import { courseService } from '../../services/courseService';
import { Banner, Category, Course } from '../../types';
import { CourseCard } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';
import { secureImageUrl } from '../../utils/secureUrl';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cats, courses, bans] = await Promise.all([
        courseService.getCategories(),
        homeService.getPopularCourses(),
        homeService.getBanners(),
      ]);
      setCategories(cats);
      setPopularCourses(courses);
      setBanners(bans);
    } catch (error) {
      logger.error('Failed to fetch home data', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchData();
  };

  const handleBannerPress = (banner: Banner) => {
    if (banner.link_url) {
      Linking.openURL(banner.link_url).catch((err) => {
        logger.error('Failed to open banner link', err);
      });
    }
  };

  const handleCoursePress = (course: Course) => {
    navigation.navigate('CourseDetail', { courseId: course.id });
  };

  const renderCourseCard = ({ item }: { item: Course }) => (
    <CourseCard course={item} onPress={handleCoursePress} variant="vertical" />
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.username}>{profile?.first_name || 'Student'}</Text>
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={() =>
            navigation.navigate('Main', {
              screen: 'Courses',
              params: { initialSearch: '' },
            })
          }
        >
          <Ionicons name="search" size={20} color={colors.text.tertiary} />
          <Text style={styles.searchPlaceholder}>Search for courses...</Text>
        </TouchableOpacity>

        {/* Banners */}
        {banners.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bannerScroll}>
            {banners.map((banner) => (
              <TouchableOpacity
                key={banner.id}
                style={styles.bannerContainer}
                onPress={() => handleBannerPress(banner)}
                activeOpacity={banner.link_url ? 0.7 : 1}
              >
                <Image source={{ uri: secureImageUrl(banner.image_url) }} style={styles.bannerImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Courses' })}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryBadge}
              onPress={() =>
                navigation.navigate('Main', {
                  screen: 'Courses',
                  params: { initialSearch: cat.name },
                })
              }
            >
              <Text style={styles.categoryText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Popular Courses */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Courses</Text>
        </View>
        <FlatList
          data={popularCourses}
          renderItem={renderCourseCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.coursesList}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  greeting: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  username: {
    ...textStyles.h2,
    color: colors.text.primary,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    marginHorizontal: spacing.base,
    paddingHorizontal: spacing.md,
    height: 48,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  searchPlaceholder: {
    ...textStyles.body,
    color: colors.text.tertiary,
  },
  bannerScroll: {
    paddingLeft: spacing.base,
    marginBottom: spacing.xl,
  },
  bannerContainer: {
    width: 300,
    height: 160,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary.light,
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  categoriesList: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  categoryBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  categoryText: {
    ...textStyles.body,
    fontWeight: '500',
    color: colors.text.primary,
  },
  coursesList: {
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  courseCard: {
    width: 260,
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 4,
  },
  courseImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    backgroundColor: colors.neutral[200],
  },
  courseContent: {
    padding: spacing.md,
  },
  courseCategory: {
    ...textStyles.caption,
    color: colors.primary.main,
    marginBottom: 4,
  },
  courseTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    height: 44,
    marginBottom: spacing.sm,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coursePrice: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    ...textStyles.caption,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
