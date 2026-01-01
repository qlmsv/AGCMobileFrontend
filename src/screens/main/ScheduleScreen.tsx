import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { courseService } from '../../services/courseService';
import { Course } from '../../types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { logger } from '../../utils/logger';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const ScheduleScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const isTeacher = user?.role === 'teacher';

    const fetchCourses = useCallback(async () => {
        setIsLoading(true);
        try {
            if (isTeacher && user?.id) {
                const data = await courseService.getCourses({ author: user.id });
                setCourses(data);
            } else {
                const data = await courseService.getMyCourses();
                setCourses(data);
            }
        } catch (error) {
            logger.error('Failed to fetch courses for schedule', error);
        } finally {
            setIsLoading(false);
        }
    }, [isTeacher, user?.id]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchCourses();
        setIsRefreshing(false);
    }, [fetchCourses]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        // Get starting day (0 = Sunday, convert to Monday = 0)
        let startingDay = firstDay.getDay() - 1;
        if (startingDay < 0) startingDay = 6;

        const days: (number | null)[] = [];

        // Add empty cells for days before the first
        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }

        // Add the days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        return days;
    };

    const changeMonth = (direction: number) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + direction);
        setCurrentMonth(newMonth);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentMonth.getMonth() === today.getMonth() &&
            currentMonth.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (day: number) => {
        return (
            day === selectedDate.getDate() &&
            currentMonth.getMonth() === selectedDate.getMonth() &&
            currentMonth.getFullYear() === selectedDate.getFullYear()
        );
    };

    const handleDayPress = (day: number) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        setSelectedDate(newDate);
    };

    const renderCalendar = () => {
        const days = getDaysInMonth(currentMonth);
        const weeks: (number | null)[][] = [];

        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7));
        }

        return (
            <View style={styles.calendar}>
                {/* Month Header */}
                <View style={styles.monthHeader}>
                    <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthArrow}>
                        <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.monthText}>
                        {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </Text>
                    <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthArrow}>
                        <Ionicons name="chevron-forward" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                </View>

                {/* Day Labels */}
                <View style={styles.dayLabels}>
                    {DAYS.map((day) => (
                        <Text key={day} style={styles.dayLabel}>{day}</Text>
                    ))}
                </View>

                {/* Calendar Grid */}
                {weeks.map((week, weekIndex) => (
                    <View key={weekIndex} style={styles.week}>
                        {week.map((day, dayIndex) => (
                            <TouchableOpacity
                                key={dayIndex}
                                style={[
                                    styles.dayCell,
                                    day !== null && isToday(day) ? styles.todayCell : undefined,
                                    day !== null && isSelected(day) ? styles.selectedCell : undefined,
                                ]}
                                onPress={() => day && handleDayPress(day)}
                                disabled={!day}
                            >
                                {day && (
                                    <Text
                                        style={[
                                            styles.dayText,
                                            isToday(day) && styles.todayText,
                                            isSelected(day) && styles.selectedText,
                                        ]}
                                    >
                                        {day}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>
        );
    };

    const renderScheduleForDay = () => {
        // For now, show courses as schedule items (future: actual lesson schedule from API)
        const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
        const dateStr = selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        return (
            <View style={styles.scheduleSection}>
                <Text style={styles.scheduleTitle}>{dayName}, {dateStr}</Text>

                {isLoading ? (
                    <ActivityIndicator color={colors.primary.main} style={{ marginTop: spacing.lg }} />
                ) : courses.length === 0 ? (
                    <View style={styles.emptySchedule}>
                        <Ionicons name="calendar-outline" size={48} color={colors.text.tertiary} />
                        <Text style={styles.emptyText}>
                            {isTeacher ? 'No courses created yet' : 'No enrolled courses'}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.coursesList}>
                        {courses.slice(0, 3).map((course) => (
                            <TouchableOpacity
                                key={course.id}
                                style={styles.courseItem}
                                onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
                            >
                                <View style={styles.courseTime}>
                                    <Text style={styles.timeText}>All Day</Text>
                                </View>
                                <View style={styles.courseDetails}>
                                    <Text style={styles.courseTitle} numberOfLines={1}>{course.title}</Text>
                                    <Text style={styles.courseModules}>
                                        {course.modules?.length || 0} modules
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Schedule</Text>
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
                {renderCalendar()}
                {renderScheduleForDay()}
            </ScrollView>
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
    scrollContent: {
        paddingBottom: spacing.xxl,
    },
    calendar: {
        backgroundColor: colors.background.default,
        margin: spacing.base,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    monthArrow: {
        padding: spacing.sm,
    },
    monthText: {
        ...textStyles.h3,
        color: colors.text.primary,
    },
    dayLabels: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    dayLabel: {
        flex: 1,
        textAlign: 'center',
        ...textStyles.caption,
        color: colors.text.tertiary,
        fontWeight: '600',
    },
    week: {
        flexDirection: 'row',
    },
    dayCell: {
        flex: 1,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.round,
        margin: 2,
    },
    todayCell: {
        backgroundColor: colors.primary.light,
    },
    selectedCell: {
        backgroundColor: colors.primary.main,
    },
    dayText: {
        ...textStyles.body,
        color: colors.text.primary,
    },
    todayText: {
        color: colors.primary.main,
        fontWeight: '600',
    },
    selectedText: {
        color: colors.text.inverse,
        fontWeight: '600',
    },
    scheduleSection: {
        marginHorizontal: spacing.base,
    },
    scheduleTitle: {
        ...textStyles.h3,
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    emptySchedule: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    emptyText: {
        ...textStyles.body,
        color: colors.text.tertiary,
        marginTop: spacing.sm,
    },
    coursesList: {
        gap: spacing.sm,
    },
    courseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.default,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    courseTime: {
        width: 60,
        marginRight: spacing.md,
    },
    timeText: {
        ...textStyles.caption,
        color: colors.primary.main,
        fontWeight: '600',
    },
    courseDetails: {
        flex: 1,
    },
    courseTitle: {
        ...textStyles.bodyLarge,
        color: colors.text.primary,
        fontWeight: '500',
    },
    courseModules: {
        ...textStyles.caption,
        color: colors.text.tertiary,
    },
});
