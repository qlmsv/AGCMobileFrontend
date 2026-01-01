import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { colors, spacing, borderRadius, textStyles, layout } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { courseService } from '../../services/courseService';
import { Course, Category } from '../../types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { EmptyState, CourseCard } from '../../components';
import { logger } from '../../utils/logger';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const SearchHeader = React.memo(({
    searchQuery,
    setSearchQuery,
    categories,
    selectedCategory,
    setSelectedCategory
}: {
    searchQuery: string;
    setSearchQuery: (text: string) => void;
    categories: Category[];
    selectedCategory: string | null;
    setSelectedCategory: (id: string | null) => void;
}) => (
    <View style={styles.listHeader}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.text.tertiary} />
            <TextInput
                style={styles.searchInput}
                placeholder="Search courses..."
                placeholderTextColor={colors.text.tertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>

        {/* Categories Filter */}
        <FlatList
            horizontal
            data={[{ id: 'all', name: 'All' } as Category, ...categories]}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
                const isSelected = item.id === 'all' ? selectedCategory === null : selectedCategory === item.id;
                return (
                    <TouchableOpacity
                        style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                        onPress={() => setSelectedCategory(item.id === 'all' ? null : item.id)}
                    >
                        <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                );
            }}
        />
    </View>
));

export const CoursesScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const [courses, setCourses] = useState<Course[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [coursesData, categoriesData] = await Promise.all([
                courseService.getCourses({
                    search: searchQuery,
                    category: selectedCategory || undefined,
                    ordering: '-created_at'
                }),
                categories.length === 0 ? courseService.getCategories() : Promise.resolve(categories)
            ]);

            setCourses(coursesData);
            if (categories.length === 0) {
                setCategories(categoriesData);
            }
        } catch (error) {
            logger.error('Error fetching courses:', error);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, selectedCategory]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [fetchData]);

    const renderCourseItem = ({ item }: { item: Course }) => (
        <CourseCard
            course={item}
            onPress={(course) => navigation.navigate('CourseDetail', { courseId: course.id })}
            variant="horizontal"
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Explore Courses</Text>
            </View>

            {isLoading && courses.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
            ) : (
                <FlatList
                    data={courses}
                    renderItem={renderCourseItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={
                        <SearchHeader
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            categories={categories}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                        />
                    }
                    ListEmptyComponent={
                        !isLoading ? (
                            <EmptyState
                                title="No Courses Found"
                                message="Try adjusting your search or category filters."
                                icon="search-outline"
                            />
                        ) : null
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    header: {
        padding: spacing.base,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
        backgroundColor: colors.background.default,
    },
    title: {
        ...textStyles.h2,
        color: colors.text.primary,
    },
    listHeader: {
        paddingVertical: spacing.md,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral[100],
        marginHorizontal: spacing.base,
        paddingHorizontal: spacing.md,
        height: 48,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontFamily: 'Inter',
        fontSize: 16,
        color: colors.text.primary,
    },
    categoriesList: {
        paddingHorizontal: spacing.base,
        gap: spacing.sm,
    },
    categoryChip: {
        paddingHorizontal: spacing.lg,
        paddingVertical: 8,
        borderRadius: borderRadius.round,
        backgroundColor: colors.neutral[100],
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    categoryChipSelected: {
        backgroundColor: colors.primary.main,
        borderColor: colors.primary.main,
    },
    categoryText: {
        ...textStyles.body,
        fontWeight: '500',
        color: colors.text.primary,
    },
    categoryTextSelected: {
        color: colors.text.inverse,
    },
    listContent: {
        paddingBottom: spacing.xxl,
    },
    courseCard: {
        flexDirection: 'row',
        backgroundColor: colors.background.default,
        marginHorizontal: spacing.base,
        marginBottom: spacing.md,
        borderRadius: borderRadius.lg,
        padding: spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    courseImage: {
        width: 100,
        height: 100,
        borderRadius: borderRadius.md,
        backgroundColor: colors.neutral[200],
    },
    courseInfo: {
        flex: 1,
        marginLeft: spacing.md,
        justifyContent: 'space-between',
        paddingVertical: spacing.xs,
    },
    courseCategory: {
        ...textStyles.caption,
        color: colors.primary.main,
    },
    courseTitle: {
        ...textStyles.h4,
        color: colors.text.primary,
        lineHeight: 20,
    },
    courseMeta: {
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        ...textStyles.body,
        color: colors.text.tertiary,
    },
});
