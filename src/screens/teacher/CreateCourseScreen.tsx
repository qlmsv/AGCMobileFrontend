import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { courseService } from '../../services/courseService';
import { Category } from '../../types';
import { logger } from '../../utils/logger';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';

type NavigationProp = StackNavigationProp<RootStackParamList>;

type Step = 'main' | 'modules' | 'lessons' | 'summary';

interface TempLesson {
  tempId: string;
  title: string;
  description: string;
  duration_minutes: number;
  start_date: Date;
  start_time: string;
}

interface TempModule {
  tempId: string;
  title: string;
  description: string;
  lessons: TempLesson[];
}

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

const generateTempId = () => Math.random().toString(36).substr(2, 9);

// Tier-based pricing configuration
const TIER_PRICES = [
  { value: '10', label: '$10', tier: 'tier1', userPays: '$12.99' },
  { value: '25', label: '$25', tier: 'tier2', userPays: '$32.99' },
  { value: '100', label: '$100', tier: 'tier3', userPays: '$129.99' },
  { value: '200', label: '$200', tier: 'tier4', userPays: '$259.99' },
  { value: '300', label: '$300', tier: 'tier5', userPays: '$389.99' },
];

export const CreateCourseScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [currentStep, setCurrentStep] = useState<Step>('main');
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form state - Main Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [language] = useState('en');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [hasCertificate, setHasCertificate] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [coursePrice, setCoursePrice] = useState('0');

  // Lesson date/time picker state
  const [lessonPickerTarget, setLessonPickerTarget] = useState<{
    moduleIndex: number;
    lessonIndex: number;
    mode: 'date' | 'time';
  } | null>(null);

  // Modules & Lessons
  const [modules, setModules] = useState<TempModule[]>([]);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number>(0);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await courseService.getCategories();
      setCategories(data);
    } catch (error) {
      logger.error('Failed to load categories', error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCoverImage(result.assets[0].uri);
    }
  };

  // Module management
  const addModule = () => {
    setModules([
      ...modules,
      {
        tempId: generateTempId(),
        title: '',
        description: '',
        lessons: [],
      },
    ]);
  };

  const updateModule = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...modules];
    updated[index][field] = value;
    setModules(updated);
  };

  const removeModule = (index: number) => {
    const updated = modules.filter((_, i) => i !== index);
    setModules(updated);
    if (selectedModuleIndex >= updated.length) {
      setSelectedModuleIndex(Math.max(0, updated.length - 1));
    }
  };

  const removeAllModules = () => {
    Alert.alert('Remove All', 'Are you sure you want to remove all modules?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setModules([]) },
    ]);
  };

  // Lesson management
  const addLesson = (moduleIndex: number) => {
    const updated = [...modules];
    updated[moduleIndex].lessons.push({
      tempId: generateTempId(),
      title: '',
      description: '',
      duration_minutes: 0,
      start_date: new Date(),
      start_time: '12:00',
    });
    setModules(updated);
  };

  const updateLesson = (
    moduleIndex: number,
    lessonIndex: number,
    field: keyof TempLesson,
    value: string | number | Date
  ) => {
    const updated = [...modules];
    (updated[moduleIndex].lessons[lessonIndex] as any)[field] = value;
    setModules(updated);
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const updated = [...modules];
    updated[moduleIndex].lessons = updated[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
    setModules(updated);
  };

  // Validation
  const validateMain = (): boolean => {
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

  const validateModules = (): boolean => {
    if (modules.length === 0) {
      Alert.alert('Error', 'Please add at least one module');
      return false;
    }
    for (let i = 0; i < modules.length; i++) {
      if (!modules[i].title.trim()) {
        Alert.alert('Error', `Module ${i + 1} needs a title`);
        return false;
      }
    }
    return true;
  };

  const validateLessons = (): boolean => {
    for (let i = 0; i < modules.length; i++) {
      if (modules[i].lessons.length === 0) {
        Alert.alert('Error', `Module "${modules[i].title}" needs at least one lesson`);
        return false;
      }
      for (let j = 0; j < modules[i].lessons.length; j++) {
        if (!modules[i].lessons[j].title.trim()) {
          Alert.alert('Error', `Lesson ${j + 1} in "${modules[i].title}" needs a title`);
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 'main') {
      if (validateMain()) setCurrentStep('modules');
    } else if (currentStep === 'modules') {
      if (validateModules()) setCurrentStep('lessons');
    } else if (currentStep === 'lessons') {
      if (validateLessons()) setCurrentStep('summary');
    }
  };

  const handleBack = () => {
    if (currentStep === 'modules') setCurrentStep('main');
    else if (currentStep === 'lessons') setCurrentStep('modules');
    else if (currentStep === 'summary') setCurrentStep('lessons');
    else navigation.goBack();
  };

  const uploadCoverImage = async (courseId: string): Promise<string | null> => {
    if (!coverImage) return null;
    try {
      const formData = new FormData();
      const filename = coverImage.split('/').pop() || 'cover.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      formData.append('cover', { uri: coverImage, name: filename, type } as any);
      const response = await apiService.patch<any>(API_ENDPOINTS.COURSE_BY_ID(courseId), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.cover;
    } catch (error) {
      logger.error('Failed to upload cover image', error);
      return null;
    }
  };

  const handleCreateCourse = async () => {
    setIsLoading(true);
    try {
      // 1. Create course
      const parsedPrice = parseFloat(coursePrice || '0');
      const courseData: any = {
        title: title.trim(),
        description: description.trim(),
        category_id: selectedCategoryId,
        language,
        is_free: parsedPrice === 0,
        price: coursePrice || '0',
        status: 'published',
        duration,
        start_date: startDate.toISOString().split('T')[0],
        certificate: hasCertificate,
      };

      logger.info('Creating course:', JSON.stringify(courseData));
      const newCourse = await courseService.createCourse(courseData);
      logger.info('Course created:', newCourse.id);

      // Upload cover
      if (coverImage) await uploadCoverImage(newCourse.id);

      // 2. Create modules
      for (let i = 0; i < modules.length; i++) {
        const mod = modules[i];
        logger.info(`Creating module ${i + 1}:`, mod.title);
        const moduleRes = await apiService.post<any>(API_ENDPOINTS.COURSE_MODULES, {
          course: newCourse.id,
          title: mod.title.trim(),
          description: mod.description.trim(),
          position: i + 1,
          is_free: true,
          price: '0',
        });
        logger.info('Module created:', moduleRes.id);

        // 3. Create lessons for this module
        for (let j = 0; j < mod.lessons.length; j++) {
          const lesson = mod.lessons[j];
          logger.info(`Creating lesson ${j + 1}:`, lesson.title);

          // Combine date and time for start_time
          const lessonDate = lesson.start_date;
          const [hours, minutes] = lesson.start_time.split(':').map(Number);
          lessonDate.setHours(hours || 12, minutes || 0, 0, 0);

          await apiService.post(API_ENDPOINTS.COURSE_LESSONS, {
            module: moduleRes.id,
            title: lesson.title.trim(),
            description: lesson.description.trim(),
            duration_minutes: lesson.duration_minutes || 0,
            position: j + 1,
            start_time: lessonDate.toISOString(),
          });
        }
      }

      Alert.alert('Success!', 'Course created with all modules and lessons!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('CourseDetail', { courseId: newCourse.id }),
        },
      ]);
    } catch (error: any) {
      logger.error('Failed to create course', error);
      const errorMessage =
        error.response?.data?.detail ||
        JSON.stringify(error.response?.data) ||
        'Failed to create course';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const STEPS: Step[] = ['main', 'modules', 'lessons', 'summary'];
  const STEP_LABELS = {
    main: 'Main Info',
    modules: 'Modules',
    lessons: 'Lessons',
    summary: 'Summary',
  };

  const getStepIndex = (step: Step) => STEPS.indexOf(step);

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {STEPS.map((step, index) => {
        const currentIndex = getStepIndex(currentStep);
        const isActive = step === currentStep;
        const isCompleted = index < currentIndex;
        return (
          <View key={step} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                isActive && styles.stepCircleActive,
                isCompleted && styles.stepCircleCompleted,
              ]}
            >
              {isCompleted ? (
                <Ionicons name="checkmark" size={14} color={colors.text.inverse} />
              ) : (
                <Text style={[styles.stepNumber, isActive && styles.stepNumberActive]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
              {STEP_LABELS[step]}
            </Text>
          </View>
        );
      })}
    </View>
  );

  const renderMainStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.label}>Course Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter course title"
        placeholderTextColor={colors.text.tertiary}
        value={title}
        testID="course-title-input"
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
        {categories.map((cat, index) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              selectedCategoryId === cat.id && styles.categoryChipSelected,
            ]}
            testID={`category-option-${index}`}
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
            testID={`duration-option-${opt.value}`}
            style={[styles.optionButton, duration === opt.value && styles.optionButtonActive]}
            onPress={() => setDuration(opt.value)}
          >
            <Text style={[styles.optionText, duration === opt.value && styles.optionTextActive]}>
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
          minimumDate={new Date()}
        />
      )}

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

      <Text style={styles.label}>Course Price</Text>
      <View style={styles.tierSelector}>
        {TIER_PRICES.map((tier) => (
          <TouchableOpacity
            key={tier.value}
            style={[styles.tierOption, coursePrice === tier.value && styles.tierOptionSelected]}
            onPress={() => setCoursePrice(tier.value)}
          >
            <View style={styles.tierOptionContent}>
              <View style={styles.radioButton}>
                {coursePrice === tier.value && <View style={styles.radioButtonInner} />}
              </View>
              <View style={styles.tierInfo}>
                <Text style={styles.tierLabel}>{tier.label}</Text>
                <Text style={styles.tierHint}>Users pay: {tier.userPays}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.tierOption, coursePrice === '0' && styles.tierOptionSelected]}
          onPress={() => setCoursePrice('0')}
        >
          <View style={styles.tierOptionContent}>
            <View style={styles.radioButton}>
              {coursePrice === '0' && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.tierLabel}>Free Course</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Cover Image</Text>
      <TouchableOpacity style={styles.coverPicker} onPress={pickImage}>
        {coverImage ? (
          <Image source={{ uri: coverImage }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="image-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.coverPlaceholderText}>Tap to select image</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderModulesStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Module details</Text>
      <Text style={styles.sectionSubtitle}>
        Structure your course into modules to guide learners step by step.
      </Text>

      {modules.map((mod, index) => (
        <View key={mod.tempId} style={styles.moduleCard}>
          <View style={styles.moduleHeader}>
            <Text style={styles.moduleNumber}>Module {index + 1}</Text>
            <TouchableOpacity onPress={() => removeModule(index)}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Module title"
            placeholderTextColor={colors.text.tertiary}
            value={mod.title}
            testID={`module-title-${index}`}
            onChangeText={(val) => updateModule(index, 'title', val)}
          />
          <TextInput
            style={[styles.input, styles.textAreaSmall]}
            placeholder="Description (optional)"
            placeholderTextColor={colors.text.tertiary}
            value={mod.description}
            onChangeText={(val) => updateModule(index, 'description', val)}
            multiline
          />
        </View>
      ))}

      <TouchableOpacity testID="add-module-button" style={styles.addButton} onPress={addModule}>
        <Ionicons name="add" size={20} color={colors.text.primary} />
        <Text style={styles.addButtonText}>Add module</Text>
      </TouchableOpacity>

      {modules.length > 0 && (
        <TouchableOpacity style={styles.removeAllButton} onPress={removeAllModules}>
          <Ionicons name="remove" size={20} color={colors.text.inverse} />
          <Text style={styles.removeAllText}>Remove all</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderLessonsStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Lessons</Text>
      <Text style={styles.sectionSubtitle}>Create engaging lessons within each module.</Text>

      {modules.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.moduleTabsContainer}
        >
          {modules.map((mod, index) => (
            <TouchableOpacity
              key={mod.tempId}
              style={[styles.moduleTab, selectedModuleIndex === index && styles.moduleTabActive]}
              onPress={() => setSelectedModuleIndex(index)}
            >
              <Text
                style={[
                  styles.moduleTabText,
                  selectedModuleIndex === index && styles.moduleTabTextActive,
                ]}
              >
                {mod.title || `Module ${index + 1}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {modules.length > 0 && (
        <View style={styles.lessonSection}>
          <Text style={styles.lessonModuleTitle}>
            {modules[selectedModuleIndex]?.title || 'Module'}
          </Text>

          {modules[selectedModuleIndex]?.lessons.map((lesson, lessonIndex) => (
            <View key={lesson.tempId} style={styles.lessonCard}>
              <View style={styles.lessonHeader}>
                <Text style={styles.lessonNumber}>Lesson {lessonIndex + 1} *</Text>
                <TouchableOpacity onPress={() => removeLesson(selectedModuleIndex, lessonIndex)}>
                  <Ionicons name="close-circle" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Name of the lesson"
                placeholderTextColor={colors.text.tertiary}
                value={lesson.title}
                testID={`lesson-title-${lessonIndex}`}
                onChangeText={(val) => updateLesson(selectedModuleIndex, lessonIndex, 'title', val)}
              />
              <View style={styles.dateTimeRow}>
                <View style={styles.dateField}>
                  <Text style={styles.fieldLabel}>Date</Text>
                  <TouchableOpacity
                    style={styles.dateText}
                    onPress={() =>
                      setLessonPickerTarget({
                        moduleIndex: selectedModuleIndex,
                        lessonIndex,
                        mode: 'date',
                      })
                    }
                  >
                    <Text style={{ color: colors.text.primary }}>
                      {lesson.start_date.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.timeField}>
                  <Text style={styles.fieldLabel}>Time</Text>
                  <TouchableOpacity
                    style={styles.timeInput}
                    onPress={() =>
                      setLessonPickerTarget({
                        moduleIndex: selectedModuleIndex,
                        lessonIndex,
                        mode: 'time',
                      })
                    }
                  >
                    <Text style={{ color: colors.text.primary }}>
                      {lesson.start_time || '12:00'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              {lessonPickerTarget?.lessonIndex === lessonIndex && (
                <DateTimePicker
                  value={
                    lessonPickerTarget.mode === 'date'
                      ? lesson.start_date
                      : (() => {
                          const d = new Date();
                          const [h, m] = (lesson.start_time || '12:00').split(':').map(Number);
                          d.setHours(h || 12, m || 0, 0, 0);
                          return d;
                        })()
                  }
                  mode={lessonPickerTarget.mode}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(_, selected) => {
                    if (Platform.OS !== 'ios') setLessonPickerTarget(null);
                    if (selected) {
                      if (lessonPickerTarget.mode === 'date') {
                        updateLesson(
                          lessonPickerTarget.moduleIndex,
                          lessonPickerTarget.lessonIndex,
                          'start_date',
                          selected as any
                        );
                      } else {
                        const hh = String(selected.getHours()).padStart(2, '0');
                        const mm = String(selected.getMinutes()).padStart(2, '0');
                        updateLesson(
                          lessonPickerTarget.moduleIndex,
                          lessonPickerTarget.lessonIndex,
                          'start_time',
                          `${hh}:${mm}`
                        );
                      }
                    }
                    if (Platform.OS === 'ios') setLessonPickerTarget(null);
                  }}
                />
              )}
              <TextInput
                style={[styles.input, styles.textAreaSmall]}
                placeholder="Description"
                placeholderTextColor={colors.text.tertiary}
                value={lesson.description}
                onChangeText={(val) =>
                  updateLesson(selectedModuleIndex, lessonIndex, 'description', val)
                }
                multiline
                maxLength={250}
              />
              <Text style={styles.charCount}>{lesson.description.length}/250</Text>
            </View>
          ))}

          <TouchableOpacity
            testID="add-lesson-button"
            style={styles.addButton}
            onPress={() => addLesson(selectedModuleIndex)}
          >
            <Ionicons name="add" size={20} color={colors.text.primary} />
            <Text style={styles.addButtonText}>Add lesson</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderSummaryStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Review Your Course</Text>

      <View style={styles.summaryCard}>
        {coverImage && <Image source={{ uri: coverImage }} style={styles.summaryCover} />}

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Title:</Text>
          <Text style={styles.summaryValue}>{title}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Category:</Text>
          <Text style={styles.summaryValue}>
            {categories.find((c) => c.id === selectedCategoryId)?.name || '-'}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duration:</Text>
          <Text style={styles.summaryValue}>{duration}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Start Date:</Text>
          <Text style={styles.summaryValue}>{startDate.toLocaleDateString('en-GB')}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Price:</Text>
          <Text style={styles.summaryValue}>
            {coursePrice === '0' ? 'Free' : `$${coursePrice}`}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Certificate:</Text>
          <Text style={styles.summaryValue}>{hasCertificate ? 'Yes' : 'No'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Modules:</Text>
          <Text style={styles.summaryValue}>{modules.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Lessons:</Text>
          <Text style={styles.summaryValue}>
            {modules.reduce((sum, m) => sum + m.lessons.length, 0)}
          </Text>
        </View>
      </View>

      {modules.map((mod, i) => (
        <View key={mod.tempId} style={styles.summaryModuleCard}>
          <Text style={styles.summaryModuleTitle}>{mod.title}</Text>
          {mod.lessons.map((lesson, j) => (
            <Text key={lesson.tempId} style={styles.summaryLessonItem}>
              • {lesson.title}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Course</Text>
          <View style={styles.backButton} />
        </View>

        {renderStepIndicator()}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {currentStep === 'main' && renderMainStep()}
          {currentStep === 'modules' && renderModulesStep()}
          {currentStep === 'lessons' && renderLessonsStep()}
          {currentStep === 'summary' && renderSummaryStep()}
        </ScrollView>

        <View style={styles.bottomButtons}>
          {currentStep === 'summary' ? (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, isLoading && styles.disabledButton]}
              onPress={handleCreateCourse}
              testID="submit-course-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <Text style={styles.primaryButtonText}>Create Course</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              testID="continue-button"
              style={[styles.button, styles.primaryButton]}
              onPress={handleNext}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  keyboardView: { flex: 1 },
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
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.lg,
  },
  stepItem: { alignItems: 'center', gap: spacing.xs },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: { backgroundColor: colors.primary.main },
  stepCircleCompleted: { backgroundColor: colors.success },
  stepNumber: { ...textStyles.caption, color: colors.text.secondary, fontWeight: '600' },
  stepNumberActive: { color: colors.text.inverse },
  stepLabel: { ...textStyles.caption, color: colors.text.tertiary },
  stepLabelActive: { color: colors.primary.main, fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  stepContent: { gap: spacing.md },
  label: {
    ...textStyles.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...textStyles.body,
    color: colors.text.primary,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  textAreaSmall: { minHeight: 60, textAlignVertical: 'top' },
  categoryList: { marginBottom: spacing.sm },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.round,
    marginRight: spacing.sm,
  },
  categoryChipSelected: { backgroundColor: colors.primary.main },
  categoryChipText: { ...textStyles.body, color: colors.text.secondary },
  categoryChipTextSelected: { color: colors.text.inverse },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  optionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
  },
  optionButtonActive: { backgroundColor: colors.primary.main },
  optionText: { ...textStyles.body, color: colors.text.secondary },
  optionTextActive: { color: colors.text.inverse },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.md,
  },
  dateButtonText: { ...textStyles.body, color: colors.text.primary },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  toggleLabel: { ...textStyles.body, color: colors.text.primary },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[300],
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: { backgroundColor: colors.primary.main },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background.default,
  },
  toggleKnobActive: { alignSelf: 'flex-end' },
  coverPicker: {
    aspectRatio: 16 / 9,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  coverImage: { width: '100%', height: '100%' },
  coverPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  coverPlaceholderText: { ...textStyles.body, color: colors.text.tertiary },
  sectionTitle: { ...textStyles.h3, color: colors.text.primary },
  sectionSubtitle: { ...textStyles.body, color: colors.text.secondary, marginBottom: spacing.md },
  moduleCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  moduleNumber: { ...textStyles.body, fontWeight: '600', color: colors.text.primary },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    borderStyle: 'dashed',
  },
  addButtonText: { ...textStyles.body, color: colors.text.primary },
  removeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.neutral[800],
    borderRadius: borderRadius.md,
  },
  removeAllText: { ...textStyles.body, color: colors.text.inverse },
  moduleTabsContainer: { marginBottom: spacing.md },
  moduleTab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
  },
  moduleTabActive: { backgroundColor: colors.primary.main },
  moduleTabText: { ...textStyles.body, color: colors.text.secondary },
  moduleTabTextActive: { color: colors.text.inverse },
  lessonSection: { gap: spacing.md },
  lessonModuleTitle: { ...textStyles.h4, color: colors.text.primary },
  lessonCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  lessonHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lessonNumber: { ...textStyles.caption, fontWeight: '600', color: colors.text.secondary },
  summaryCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  summaryCover: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { ...textStyles.body, color: colors.text.secondary },
  summaryValue: { ...textStyles.body, color: colors.text.primary, fontWeight: '600' },
  summaryModuleCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  summaryModuleTitle: {
    ...textStyles.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  summaryLessonItem: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  bottomButtons: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.neutral[200] },
  button: { paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center' },
  primaryButton: { backgroundColor: colors.primary.main },
  primaryButtonText: { ...textStyles.body, color: colors.text.inverse, fontWeight: '600' },
  disabledButton: { opacity: 0.6 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  priceLabel: { ...textStyles.body, color: colors.text.primary },
  priceInput: {
    width: 100,
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    textAlign: 'center',
    ...textStyles.body,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  dateTimeRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
  dateField: { flex: 1 },
  timeField: { flex: 1 },
  fieldLabel: { ...textStyles.caption, color: colors.text.secondary, marginBottom: spacing.xs },
  dateText: {
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...textStyles.body,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  timeInput: {
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...textStyles.body,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  charCount: { ...textStyles.caption, color: colors.text.tertiary, textAlign: 'right' },
  // Tier selector styles
  tierSelector: {
    marginTop: spacing.md,
  },
  tierOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.background.card,
  },
  tierOptionSelected: {
    borderColor: colors.primary.main,
    borderWidth: 2,
    backgroundColor: colors.primary.light + '10',
  },
  tierOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary.main,
  },
  tierInfo: {
    flex: 1,
  },
  tierLabel: {
    ...textStyles.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  tierHint: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: 2,
  },
});
