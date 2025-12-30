import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Image,
    TextInput,
    SafeAreaView,
    Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Course } from '../../types';
import { courseService } from '../../services/courseService';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';
import { logApiError } from '../../utils/errorUtils';
import { logger } from '../../utils/logger';
import { RootStackParamList, MainTabParamList } from '../../navigation/types';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type HomeScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Home'>,
    NativeStackNavigationProp<RootStackParamList>
>;

export const HomeScreen: React.FC = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [favourites, setFavourites] = useState<Set<string | number>>(new Set());

    const loadCourses = useCallback(async () => {
        try {
            logger.debug('📥 Loading courses...');
            const coursesData = await courseService.getCourses({ status: 'published' });
            logger.debug('✅ Courses loaded:', coursesData.length);
            setCourses(coursesData);
        } catch (error) {
            logger.error('❌ Failed to load courses:', error);
            logApiError('Failed to load courses', error);
            setCourses([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadCourses();
        }, [loadCourses])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadCourses();
        setRefreshing(false);
    };

    const handleCoursePress = (course: Course) => {
        // Navigate to course detail
        navigation.navigate('CourseDetail', { courseId: course.id });
    };

    const handleSeeAllPress = () => {
        // Navigate to Courses tab
        navigation.navigate('Courses');
    };

    const handleBookmarkPress = (courseId: string | number) => {
        setFavourites(prev => {
            const newFavourites = new Set(prev);
            if (newFavourites.has(courseId)) {
                newFavourites.delete(courseId);
                // Call API to remove from favourites
                courseService.removeFromFavourites(String(courseId)).catch((e) => logger.error('Failed to remove from favourites', e));
            } else {
                newFavourites.add(courseId);
                // Call API to add to favourites
                courseService.addToFavourites(String(courseId)).catch((e) => logger.error('Failed to add to favourites', e));
            }
            return newFavourites;
        });
    };

    const handleSearchSubmit = () => {
        if (searchQuery.trim()) {
            // Navigate to Courses with search query
            navigation.navigate('Courses');
        }
    };

    const freeCourses = courses.filter(c => c.is_free === true || Number(c.price) === 0);

    const renderCourseCard = (course: Course, isLarge: boolean = false) => {
        const isFavourite = favourites.has(course.id) || course.is_favourite;
        const isEnrolled = (course as any).is_enrolled || false;

        return (
            <TouchableOpacity
                key={String(course.id)}
                style={[styles.courseCard, isLarge && styles.courseCardLarge]}
                activeOpacity={0.9}
                onPress={() => handleCoursePress(course)}
            >
                {(course.cover || course.thumbnail) ? (
                    <Image
                        source={{ uri: (course.cover || course.thumbnail)! }}
                        style={[styles.courseImage, isLarge && styles.courseImageLarge]}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.coursePlaceholder, isLarge && styles.courseImageLarge]}>
                        <Ionicons name="book" size={32} color={colors.neutral.white} />
                    </View>
                )}

                <View style={styles.courseContent}>
                    <View style={styles.courseTextContent}>
                        <View style={styles.courseTitleRow}>
                            <Text style={styles.courseTitle} numberOfLines={2}>
                                {course.title}
                            </Text>
                            {isEnrolled && (
                                <View style={styles.enrolledBadge}>
                                    <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                                </View>
                            )}
                        </View>
                        <Text style={styles.courseDescription} numberOfLines={1}>
                            {course.description}
                        </Text>
                    </View>

                    <View style={styles.courseFooter}>
                        <View style={styles.courseInfo}>
                            <View style={styles.courseInfoItem}>
                                <Ionicons name="layers-outline" size={20} color="#404040" />
                                <Text style={styles.courseInfoText}>
                                    {course.modules?.length || 5} modules
                                </Text>
                            </View>
                            <View style={styles.courseInfoDot} />
                            <View style={styles.courseInfoItem}>
                                <Ionicons name="ribbon-outline" size={20} color="#404040" />
                                <Text style={styles.courseInfoText}>certificate</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => handleBookmarkPress(course.id)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons
                                name={isFavourite ? "bookmark" : "bookmark-outline"}
                                size={20}
                                color={isFavourite ? "#FE7333" : "#404040"}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.headerContainer}>
                    <View>
                        <Text style={styles.greeting}>Welcome back!</Text>
                        <Text style={styles.headerTitle}>Explore Courses</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => navigation.navigate('CreateCourse')}
                    >
                        <Ionicons name="add" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <TouchableOpacity
                        style={styles.searchBar}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('Courses')}
                    >
                        <Ionicons name="search-outline" size={20} color="#A3A3A3" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search"
                            placeholderTextColor="#A3A3A3"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearchSubmit}
                            returnKeyType="search"
                        />
                    </TouchableOpacity>
                </View>

                {/* Free Courses Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Free courses</Text>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalScroll}
                    >
                        {freeCourses.length > 0 ? (
                            freeCourses.map((course) => renderCourseCard(course))
                        ) : (
                            courses.slice(0, 3).map((course) => renderCourseCard(course))
                        )}
                    </ScrollView>
                </View>

                {/* Popular Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Popular</Text>
                        <TouchableOpacity
                            style={styles.seeAllButton}
                            onPress={handleSeeAllPress}
                        >
                            <Text style={styles.seeAllText}>All</Text>
                            <Ionicons name="chevron-forward" size={20} color="#FD4F01" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalScroll}
                    >
                        {courses.slice(0, 5).map((course) => renderCourseCard(course, true))}
                    </ScrollView>
                </View>

                {/* For You Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>For you</Text>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalScroll}
                    >
                        {courses.slice(0, 5).map((course) => renderCourseCard(course, true))}
                    </ScrollView>
                </View>

                {courses.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="book-outline" size={64} color={colors.neutral[300]} />
                        <Text style={styles.emptyTitle}>No courses yet</Text>
                        <Text style={styles.emptySubtitle}>Check back later for new courses</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingBottom: 120,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    greeting: {
        fontFamily: 'Rubik',
        fontSize: 14,
        fontWeight: '400',
        color: '#737373',
        lineHeight: 20,
    },
    headerTitle: {
        fontFamily: 'Rubik',
        fontSize: 24,
        fontWeight: '700',
        color: '#171717',
        lineHeight: 32,
    },
    createButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FE7333',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'rgba(254, 115, 51, 0.3)',
        shadowOpacity: 1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 1000,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: 'rgba(207, 207, 207, 0.10)',
        shadowOpacity: 1,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Rubik',
        fontSize: 14,
        fontWeight: '400',
        color: '#171717',
    },
    section: {
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontFamily: 'Rubik',
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 24,
        color: '#171717',
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeAllText: {
        fontFamily: 'Rubik',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
        color: '#FD4F01',
    },
    horizontalScroll: {
        paddingHorizontal: 20,
        gap: 12,
    },
    courseCard: {
        width: 280,
        flexDirection: 'column',
    },
    courseCardLarge: {
        width: 338,
    },
    courseImage: {
        width: '100%',
        height: 160,
        backgroundColor: '#D9D9D9',
        borderRadius: 16,
    },
    courseImageLarge: {
        height: 196,
    },
    coursePlaceholder: {
        width: '100%',
        height: 160,
        backgroundColor: colors.primary.main,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'rgba(207, 207, 207, 0.10)',
        shadowOpacity: 1,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
    },
    courseContent: {
        marginTop: 12,
        gap: 8,
    },
    courseTextContent: {
        gap: 4,
    },
    courseTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    courseTitle: {
        flex: 1,
        fontFamily: 'Rubik',
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
        color: '#171717',
    },
    enrolledBadge: {
        flexShrink: 0,
    },
    courseDescription: {
        fontFamily: 'Rubik',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
        color: '#A3A3A3',
    },
    courseFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    courseInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    courseInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    courseInfoDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#404040',
        marginHorizontal: 4,
    },
    courseInfoText: {
        fontFamily: 'Rubik',
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
        color: '#404040',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 20,
    },
    emptyTitle: {
        fontFamily: 'Rubik',
        fontSize: 18,
        fontWeight: '700',
        color: '#171717',
        marginTop: 16,
    },
    emptySubtitle: {
        fontFamily: 'Rubik',
        fontSize: 14,
        fontWeight: '400',
        color: '#737373',
        marginTop: 8,
    },
});
