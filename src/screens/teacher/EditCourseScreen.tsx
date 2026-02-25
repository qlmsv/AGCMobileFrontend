import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { courseService } from '../../services/courseService';
import { Category } from '../../types';
import { logger } from '../../utils/logger';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';
import { secureImageUrl } from '../../utils/secureUrl';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'EditCourse'>;

const DURATION_OPTIONS = [
  { value: '1 month', label: '1 month' },
  { value: '2 month', label: '2 month' },
  { value: '3 month', label: '3 month' },
  { value: '4 month', label: '4 month' },
  { value: '5 month', label: '5 month' },
  { value: '6 month', label: '6 month' },
  { value: '7 month', label: '7 month' },
  { value: '8 month', label: '8 month' },
  { value: '9 month', label: '9 month' },
  { value: '10 month', label: '10 month' },
  { value: '11 month', label: '11 month' },
  { value: '12 month', label: '12 month' },
];

export const EditCourseScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { courseId } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [newCoverImage, setNewCoverImage] = useState<string | null>(null);
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [hasCertificate, setHasCertificate] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  const loadCourseData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [course, categoriesData] = await Promise.all([
        courseService.getCourse(courseId),
        courseService.getCategories(),
      ]);

      setCategories(categoriesData);

      // Populate form with course data
      setTitle(course.title || '');
      setDescription(course.description || '');
      setSelectedCategoryId(course.category?.id || null);
      setCoverImage(course.cover || null);
      setDuration(course.duration || '');
      setStartDate(course.start_date ? new Date(course.start_date) : new Date());
      setHasCertificate(course.certificate ?? false);
      setStatus(course.status === 'published' ? 'published' : 'draft');

      logger.info('Course loaded for editing:', course.id);
    } catch (error) {
      logger.error('Failed to load course for editing', error);
      Alert.alert('Error', 'Failed to load course data');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [courseId, navigation]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNewCoverImage(result.assets[0].uri);
    }
  };

  const uploadCoverImage = async (): Promise<string | null> => {
    if (!newCoverImage) return null;
    try {
      const formData = new FormData();
      const filename = newCoverImage.split('/').pop() || 'cover.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      formData.append('cover', { uri: newCoverImage, name: filename, type } as any);
      const response = await apiService.patch<any>(API_ENDPOINTS.COURSE_BY_ID(courseId), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data) => data,
      });
      return response.cover;
    } catch (error) {
      logger.error('Failed to upload cover image', error);
      return null;
    }
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a course title');
      return false;
    }
    if (!selectedCategoryId) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    if (!duration) {
      Alert.alert('Error', 'Please select course duration');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const courseData: any = {
        title: title.trim(),
        description: description.trim(),
        category_id: selectedCategoryId,
        is_free: true,
        status,
        duration,
        start_date: startDate.toISOString().split('T')[0],
        certificate: hasCertificate,
      };

      logger.info('Updating course:', JSON.stringify(courseData));
      await apiService.patch(API_ENDPOINTS.COURSE_BY_ID(courseId), courseData);

      // Upload new cover if selected
      if (newCoverImage) {
        await uploadCoverImage();
      }

      Alert.alert('Success', 'Course updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      logger.error('Failed to update course', error);
      const errorMessage =
        error.response?.data?.detail ||
        JSON.stringify(error.response?.data) ||
        'Failed to update course';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Course</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Course Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter course title"
            placeholderTextColor={colors.text.tertiary}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your course"
            placeholderTextColor={colors.text.tertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategoryId === cat.id && styles.categoryChipSelected,
                ]}
                onPress={() => setSelectedCategoryId(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategoryId === cat.id && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Duration *</Text>
          <View style={styles.optionRow}>
            {DURATION_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.optionButton, duration === opt.value && styles.optionButtonActive]}
                onPress={() => setDuration(opt.value)}
              >
                <Text
                  style={[styles.optionText, duration === opt.value && styles.optionTextActive]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Starting Date *</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} />
            <Text style={styles.dateButtonText}>
              {startDate.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (date) setStartDate(date);
              }}
            />
          )}

          <Text style={styles.label}>Status</Text>
          <View style={styles.statusRow}>
            <TouchableOpacity
              style={[styles.statusButton, status === 'draft' && styles.statusButtonActive]}
              onPress={() => setStatus('draft')}
            >
              <Text style={[styles.statusText, status === 'draft' && styles.statusTextActive]}>
                Draft
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusButton,
                status === 'published' && styles.statusButtonActiveGreen,
              ]}
              onPress={() => setStatus('published')}
            >
              <Text style={[styles.statusText, status === 'published' && styles.statusTextActive]}>
                Published
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Ionicons name="ribbon-outline" size={24} color={colors.text.secondary} />
              <Text style={styles.toggleLabel}>Certificate of completion</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, hasCertificate && styles.toggleActive]}
              onPress={() => setHasCertificate(!hasCertificate)}
            >
              <View style={[styles.toggleKnob, hasCertificate && styles.toggleKnobActive]} />
            </TouchableOpacity>
          </View>

          <Text style={styles.hintText}>
            Courses are always free. Set paid access on module level in course modules.
          </Text>

          <Text style={styles.label}>Cover Image</Text>
          <TouchableOpacity style={styles.coverPicker} onPress={pickImage}>
            {newCoverImage || coverImage ? (
              <Image
                source={{ uri: newCoverImage || secureImageUrl(coverImage) }}
                style={styles.coverImage}
              />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Ionicons name="image-outline" size={48} color={colors.text.tertiary} />
                <Text style={styles.coverPlaceholderText}>Tap to select image</Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, isSaving && styles.disabledButton]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.text.inverse} />
            ) : (
              <Text style={styles.primaryButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  keyboardView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...textStyles.h3, color: colors.text.primary },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.base, paddingBottom: 100 },
  hintText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },
  label: {
    ...textStyles.bodyLarge,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...textStyles.body,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  categoryList: { marginBottom: spacing.sm },
  categoryChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.neutral[100],
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  categoryChipSelected: { backgroundColor: colors.primary.main, borderColor: colors.primary.main },
  categoryChipText: { ...textStyles.body, color: colors.text.primary },
  categoryChipTextSelected: { color: colors.text.inverse },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  optionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  optionButtonActive: { backgroundColor: colors.primary.main, borderColor: colors.primary.main },
  optionText: { ...textStyles.caption, color: colors.text.primary },
  optionTextActive: { color: colors.text.inverse },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral[100],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  dateButtonText: { ...textStyles.body, color: colors.text.primary },
  statusRow: { flexDirection: 'row', gap: spacing.md },
  statusButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  statusButtonActive: { backgroundColor: colors.neutral[400], borderColor: colors.neutral[400] },
  statusButtonActiveGreen: { backgroundColor: colors.success, borderColor: colors.success },
  statusText: { ...textStyles.body, color: colors.text.primary },
  statusTextActive: { color: colors.text.inverse, fontWeight: '600' },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  toggleLabel: { ...textStyles.body, color: colors.text.primary },
  toggle: {
    width: 50,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.neutral[300],
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleActive: { backgroundColor: colors.primary.main },
  toggleKnob: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'white' },
  toggleKnobActive: { alignSelf: 'flex-end' },
  coverPicker: {
    height: 180,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[100],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
  },
  coverImage: { width: '100%', height: '100%' },
  coverPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  coverPlaceholderText: { ...textStyles.body, color: colors.text.tertiary },
  bottomButtons: { padding: spacing.base, borderTopWidth: 1, borderTopColor: colors.border.light },
  button: { paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center' },
  primaryButton: { backgroundColor: colors.primary.main },
  primaryButtonText: { ...textStyles.button, color: colors.text.inverse },
  disabledButton: { opacity: 0.6 },
});
