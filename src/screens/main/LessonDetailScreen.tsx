import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, textStyles, layout } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { courseService } from '../../services/courseService';
import { Lesson } from '../../types';
import { logger } from '../../utils/logger';

export const LessonDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const lessonId = route.params?.lessonId;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLesson = useCallback(async () => {
    try {
      const data = await courseService.getLesson(lessonId);
      setLesson(data);
    } catch (error: any) {
      logger.error('Error fetching lesson:', error);
      const status = error?.response?.status;
      const detail = error?.response?.data?.detail;

      if (status === 404) {
        Alert.alert(
          'Lesson Not Found',
          'This lesson may have been removed or is no longer available.'
        );
      } else if (status === 403) {
        Alert.alert(
          'Access Denied',
          detail || 'You need to enroll in this course to access this lesson.'
        );
      } else {
        Alert.alert('Error', detail || 'Could not load lesson details. Please try again.');
      }
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [lessonId, navigation]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (!lesson) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.inverse} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Video Player Placeholder - In real app, use expo-av Video component */}
        <View style={styles.videoPlaceholder}>
          {lesson.video_url ? (
            <View style={styles.playButton}>
              <Ionicons name="play" size={48} color={colors.primary.main} />
            </View>
          ) : (
            <View style={styles.noVideo}>
              <Ionicons name="document-text-outline" size={48} color={colors.neutral[400]} />
              <Text style={styles.noVideoText}>No video content</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{lesson.title}</Text>
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={16} color={colors.text.tertiary} />
            <Text style={styles.metaText}>
              {lesson.duration ? `${Math.floor(Number(lesson.duration) / 60)} mins` : 'Text only'}
            </Text>
          </View>

          <Text style={styles.text}>{lesson.content || 'No text content available.'}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.completeButton} onPress={() => navigation.goBack()}>
          <Text style={styles.completeButtonText}>Finish Lesson</Text>
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
    position: 'absolute',
    top: 50,
    left: spacing.base,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: borderRadius.round,
  },
  content: {
    flexGrow: 1,
  },
  videoPlaceholder: {
    height: 250,
    backgroundColor: colors.neutral[900],
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    padding: spacing.base,
  },
  title: {
    ...textStyles.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: 4,
  },
  metaText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  text: {
    ...textStyles.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  footer: {
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  completeButton: {
    backgroundColor: colors.primary.main,
    height: layout.button.height,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noVideo: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  noVideoText: {
    ...textStyles.body,
    color: colors.neutral[400],
  },
});
