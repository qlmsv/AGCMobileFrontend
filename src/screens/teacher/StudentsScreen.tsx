import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    TextInput,
    Image,
} from 'react-native';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { courseService } from '../../services/courseService';
import { CourseStudent, Course } from '../../types';
import { EmptyState } from '../../components';
import { logger } from '../../utils/logger';

export const StudentsScreen: React.FC = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState<CourseStudent[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

    const isTeacher = user?.role === 'teacher';

    const fetchData = useCallback(async () => {
        if (!isTeacher) return;

        setIsLoading(true);
        try {
            // Fetch teacher's courses
            if (user?.id) {
                const coursesData = await courseService.getCourses({ author: user.id });
                setCourses(coursesData);
            }

            // Fetch all students
            const studentsData = await courseService.getMyStudents();
            setStudents(studentsData);
        } catch (error) {
            logger.error('Failed to fetch students', error);
        } finally {
            setIsLoading(false);
        }
    }, [isTeacher, user?.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchData();
        setIsRefreshing(false);
    }, [fetchData]);

    const filteredStudents = students.filter(student => {
        const matchesSearch = searchQuery === '' ||
            student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.profile?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.profile?.last_name?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
    });

    const renderStudentItem = ({ item }: { item: CourseStudent }) => (
        <View style={styles.studentCard}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {item.profile?.first_name?.[0]?.toUpperCase() || item.email?.[0]?.toUpperCase() || 'S'}
                </Text>
            </View>
            <View style={styles.studentInfo}>
                <Text style={styles.studentName}>
                    {item.profile?.first_name && item.profile?.last_name
                        ? `${item.profile.first_name} ${item.profile.last_name}`
                        : item.email || 'Unknown Student'}
                </Text>
                <Text style={styles.studentEmail}>{item.email}</Text>
            </View>
            <View style={[styles.statusBadge, item.role === 'teacher' && styles.teacherBadge]}>
                <Text style={[styles.statusText, item.role === 'teacher' && styles.teacherText]}>
                    {item.role === 'teacher' ? 'Teacher' : 'Student'}
                </Text>
            </View>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.listHeader}>
            {/* Search */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={colors.text.tertiary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search students..."
                    placeholderTextColor={colors.text.tertiary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Course Filter */}
            {courses.length > 0 && (
                <FlatList
                    horizontal
                    data={[{ id: 'all', title: 'All Courses' } as any, ...courses]}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.courseFilter}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const isSelected = item.id === 'all'
                            ? selectedCourseId === null
                            : selectedCourseId === item.id;
                        return (
                            <TouchableOpacity
                                style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                                onPress={() => setSelectedCourseId(item.id === 'all' ? null : item.id)}
                            >
                                <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>
                                    {item.title}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}

            {/* Stats */}
            <View style={styles.statsRow}>
                <Text style={styles.statsText}>
                    {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                </Text>
            </View>
        </View>
    );

    if (!isTeacher) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>My Students</Text>
                </View>
                <EmptyState
                    title="Teacher Only"
                    message="This feature is only available for teachers."
                    icon="school-outline"
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Students</Text>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
            ) : (
                <FlatList
                    data={filteredStudents}
                    renderItem={renderStudentItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={
                        <EmptyState
                            title="No Students Yet"
                            message="Students who enroll in your courses will appear here."
                            icon="people-outline"
                        />
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary.main}
                        />
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
    },
    title: {
        ...textStyles.h2,
        color: colors.text.primary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        gap: spacing.sm,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontFamily: 'Inter',
        fontSize: 16,
        color: colors.text.primary,
    },
    courseFilter: {
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
        gap: spacing.sm,
    },
    filterChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.round,
        backgroundColor: colors.neutral[100],
        marginRight: spacing.sm,
    },
    filterChipSelected: {
        backgroundColor: colors.primary.main,
    },
    filterText: {
        ...textStyles.caption,
        color: colors.text.primary,
        fontWeight: '500',
    },
    filterTextSelected: {
        color: colors.text.inverse,
    },
    statsRow: {
        paddingHorizontal: spacing.base,
        marginBottom: spacing.sm,
    },
    statsText: {
        ...textStyles.caption,
        color: colors.text.tertiary,
    },
    listContent: {
        paddingBottom: spacing.xxl,
    },
    studentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.default,
        marginHorizontal: spacing.base,
        marginBottom: spacing.sm,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.round,
        backgroundColor: colors.primary.light,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        ...textStyles.h4,
        color: colors.primary.main,
    },
    studentInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    studentName: {
        ...textStyles.bodyLarge,
        color: colors.text.primary,
        fontWeight: '500',
    },
    studentEmail: {
        ...textStyles.caption,
        color: colors.text.secondary,
    },
    enrollDate: {
        ...textStyles.caption,
        color: colors.text.tertiary,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        backgroundColor: colors.success + '20',
        borderRadius: borderRadius.sm,
    },
    statusText: {
        ...textStyles.caption,
        color: colors.success,
        fontWeight: '600',
    },
    teacherBadge: {
        backgroundColor: colors.primary.main + '20',
    },
    teacherText: {
        color: colors.primary.main,
    },
});
