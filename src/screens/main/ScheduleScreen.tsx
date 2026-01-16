import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';
import { CalendarEvent } from '../../types';
import { logger } from '../../utils/logger';

// type NavigationProp = StackNavigationProp<RootStackParamList>;

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const ScheduleScreen: React.FC = () => {
  // const navigation = useNavigation<NavigationProp>();
  // const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSchedule = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiService.get<CalendarEvent[]>(API_ENDPOINTS.CALENDAR);
      logger.info('Calendar API response:', JSON.stringify(response).slice(0, 500));

      // Handle different response formats
      const eventsData = Array.isArray(response)
        ? response
        : (response as any)?.results || (response as any)?.events || [];

      setEvents(eventsData);
      logger.info('Loaded calendar events:', eventsData.length);
    } catch (error) {
      logger.error('Failed to fetch calendar', error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchSchedule();
    setIsRefreshing(false);
  }, [fetchSchedule]);

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

    // Add empty cells at the end to complete the last week
    while (days.length % 7 !== 0) {
      days.push(null);
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
            <Text key={day} style={styles.dayLabel}>
              {day}
            </Text>
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
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Use local date for comparison (YYYY-MM-DD format)
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const selectedDay = String(selectedDate.getDate()).padStart(2, '0');
    const selectedDateString = `${selectedYear}-${selectedMonth}-${selectedDay}`;

    // Filter events for the selected date
    const dayEvents = events.filter((event) => {
      try {
        const eventDate = new Date(event.starts_at);
        const eventYear = eventDate.getFullYear();
        const eventMonth = String(eventDate.getMonth() + 1).padStart(2, '0');
        const eventDay = String(eventDate.getDate()).padStart(2, '0');
        const eventDateString = `${eventYear}-${eventMonth}-${eventDay}`;
        return eventDateString === selectedDateString;
      } catch {
        return false;
      }
    });

    // Sort by starts_at
    dayEvents.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

    logger.debug('Selected date:', selectedDateString, 'Events for day:', dayEvents.length);

    return (
      <View style={styles.scheduleSection}>
        <Text style={styles.scheduleTitle}>
          {dayName}, {dateStr}
        </Text>

        {isLoading ? (
          <ActivityIndicator color={colors.primary.main} style={{ marginTop: spacing.lg }} />
        ) : dayEvents.length === 0 ? (
          <View style={styles.emptySchedule}>
            <Ionicons name="calendar-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No lessons scheduled for this day</Text>
          </View>
        ) : (
          <View style={styles.coursesList}>
            {dayEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.courseItem}
                onPress={() => {
                  // Open zoom link if available
                  if (event.zoom_link) {
                    logger.info('Opening zoom link:', event.zoom_link);
                  }
                }}
              >
                <View style={styles.courseTime}>
                  <Text style={styles.timeText}>
                    {new Date(event.starts_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </Text>
                  <Text style={[styles.timeText, { color: colors.text.tertiary }]}>
                    {new Date(event.ends_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </Text>
                </View>
                <View style={styles.courseDetails}>
                  <Text style={styles.courseTitle} numberOfLines={1}>
                    {event.title}
                  </Text>
                  <Text style={styles.courseModules} numberOfLines={1}>
                    {event.course_title || ''}
                    {event.module_title ? ` • ${event.module_title}` : ''}
                  </Text>
                </View>
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
