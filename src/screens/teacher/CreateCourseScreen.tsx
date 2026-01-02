import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { courseService } from '../../services/courseService';
import { Category } from '../../types';
import { logger } from '../../utils/logger';
import * as ImagePicker from 'expo-image-picker';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';

type NavigationProp = StackNavigationProp<RootStackParamList>;

type Step = 'details' | 'cover' | 'summary';

export const CreateCourseScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const [currentStep, setCurrentStep] = useState<Step>('details');
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [price, setPrice] = useState('');
    const [isFree, setIsFree] = useState(true);
    const [language, setLanguage] = useState('en');
    const [coverImage, setCoverImage] = useState<string | null>(null);

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

    const validateDetails = (): boolean => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a course title');
            return false;
        }
        if (!selectedCategoryId) {
            Alert.alert('Error', 'Please select a category');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (currentStep === 'details') {
            if (validateDetails()) {
                setCurrentStep('cover');
            }
        } else if (currentStep === 'cover') {
            setCurrentStep('summary');
        }
    };

    const handleBack = () => {
        if (currentStep === 'cover') {
            setCurrentStep('details');
        } else if (currentStep === 'summary') {
            setCurrentStep('cover');
        } else {
            navigation.goBack();
        }
    };

    const uploadCoverImage = async (courseId: string): Promise<string | null> => {
        if (!coverImage) return null;

        try {
            const formData = new FormData();
            const filename = coverImage.split('/').pop() || 'cover.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('cover', {
                uri: coverImage,
                name: filename,
                type,
            } as any);

            const response = await apiService.patch<any>(
                API_ENDPOINTS.COURSE_BY_ID(courseId),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return response.cover;
        } catch (error) {
            logger.error('Failed to upload cover image', error);
            return null;
        }
    };

    const handleCreateCourse = async () => {
        setIsLoading(true);
        try {
            const courseData: any = {
                title: title.trim(),
                description: description.trim(),
                category_id: selectedCategoryId,
                language,
                is_free: isFree,
                status: 'draft',
            };

            if (!isFree && price) {
                courseData.price = price;
            }

            logger.info('Creating course with data:', JSON.stringify(courseData));

            const newCourse = await courseService.createCourse(courseData);

            // Upload cover image if selected
            if (coverImage) {
                await uploadCoverImage(newCourse.id);
            }

            Alert.alert(
                'Success!',
                'Course created as draft. You can now add modules and lessons.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('CourseDetail', { courseId: newCourse.id }),
                    },
                ]
            );
        } catch (error: any) {
            logger.error('Failed to create course', error);
            logger.error('Error response:', JSON.stringify(error.response?.data));
            logger.error('Error status:', error.response?.status);
            const errorMessage = error.response?.data?.detail ||
                error.response?.data?.message ||
                JSON.stringify(error.response?.data) ||
                'Failed to create course';
            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            {(['details', 'cover', 'summary'] as Step[]).map((step, index) => (
                <View key={step} style={styles.stepItem}>
                    <View
                        style={[
                            styles.stepCircle,
                            currentStep === step && styles.stepCircleActive,
                            (currentStep === 'cover' && step === 'details') ||
                                (currentStep === 'summary' && step !== 'summary')
                                ? styles.stepCircleCompleted
                                : null,
                        ]}
                    >
                        {(currentStep === 'cover' && step === 'details') ||
                            (currentStep === 'summary' && step !== 'summary') ? (
                            <Ionicons name="checkmark" size={14} color={colors.text.inverse} />
                        ) : (
                            <Text style={styles.stepNumber}>{index + 1}</Text>
                        )}
                    </View>
                    <Text style={[styles.stepLabel, currentStep === step && styles.stepLabelActive]}>
                        {step === 'details' ? 'Details' : step === 'cover' ? 'Cover' : 'Summary'}
                    </Text>
                </View>
            ))}
        </View>
    );

    const renderDetailsStep = () => (
        <View style={styles.stepContent}>
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

            <Text style={styles.label}>Language</Text>
            <View style={styles.languageButtons}>
                {[
                    { code: 'en', label: 'English' },
                    { code: 'ru', label: 'Русский' },
                ].map((lang) => (
                    <TouchableOpacity
                        key={lang.code}
                        style={[styles.langButton, language === lang.code && styles.langButtonActive]}
                        onPress={() => setLanguage(lang.code)}
                    >
                        <Text
                            style={[
                                styles.langButtonText,
                                language === lang.code && styles.langButtonTextActive,
                            ]}
                        >
                            {lang.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Pricing</Text>
            <View style={styles.priceRow}>
                <TouchableOpacity
                    style={[styles.freeToggle, isFree && styles.freeToggleActive]}
                    onPress={() => setIsFree(true)}
                >
                    <Text style={[styles.freeToggleText, isFree && styles.freeToggleTextActive]}>
                        Free
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.freeToggle, !isFree && styles.freeToggleActive]}
                    onPress={() => setIsFree(false)}
                >
                    <Text style={[styles.freeToggleText, !isFree && styles.freeToggleTextActive]}>
                        Paid
                    </Text>
                </TouchableOpacity>
            </View>
            {!isFree && (
                <TextInput
                    style={styles.input}
                    placeholder="Enter price (e.g., 99.00)"
                    placeholderTextColor={colors.text.tertiary}
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="decimal-pad"
                />
            )}
        </View>
    );

    const renderCoverStep = () => (
        <View style={styles.stepContent}>
            <Text style={styles.label}>Course Cover Image</Text>
            <TouchableOpacity style={styles.coverPicker} onPress={pickImage}>
                {coverImage ? (
                    <Image source={{ uri: coverImage }} style={styles.coverImage} />
                ) : (
                    <View style={styles.coverPlaceholder}>
                        <Ionicons name="image-outline" size={48} color={colors.text.tertiary} />
                        <Text style={styles.coverPlaceholderText}>Tap to select image</Text>
                        <Text style={styles.coverHint}>Recommended size: 1920x1080</Text>
                    </View>
                )}
            </TouchableOpacity>
            <Text style={styles.hint}>You can add a cover image later</Text>
        </View>
    );

    const renderSummaryStep = () => (
        <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Review Your Course</Text>

            <View style={styles.summaryCard}>
                {coverImage && (
                    <Image source={{ uri: coverImage }} style={styles.summaryCover} />
                )}
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
                    <Text style={styles.summaryLabel}>Language:</Text>
                    <Text style={styles.summaryValue}>{language === 'en' ? 'English' : 'Русский'}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Price:</Text>
                    <Text style={styles.summaryValue}>{isFree ? 'Free' : `$${price || '0'}`}</Text>
                </View>
                {description && (
                    <View style={styles.summaryDescRow}>
                        <Text style={styles.summaryLabel}>Description:</Text>
                        <Text style={styles.summaryDesc}>{description}</Text>
                    </View>
                )}
            </View>

            <Text style={styles.hint}>
                Course will be created as a draft. After creation, you can add modules and lessons.
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Header */}
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
                    {currentStep === 'details' && renderDetailsStep()}
                    {currentStep === 'cover' && renderCoverStep()}
                    {currentStep === 'summary' && renderSummaryStep()}
                </ScrollView>

                {/* Bottom Buttons */}
                <View style={styles.bottomButtons}>
                    {currentStep === 'summary' ? (
                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton, isLoading && styles.disabledButton]}
                            onPress={handleCreateCourse}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={colors.text.inverse} />
                            ) : (
                                <Text style={styles.primaryButtonText}>Create Course</Text>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleNext}>
                            <Text style={styles.primaryButtonText}>Next</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        ...textStyles.h3,
        color: colors.text.primary,
    },
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.md,
        gap: spacing.xl,
    },
    stepItem: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    stepCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.neutral[200],
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepCircleActive: {
        backgroundColor: colors.primary.main,
    },
    stepCircleCompleted: {
        backgroundColor: colors.success,
    },
    stepNumber: {
        ...textStyles.caption,
        color: colors.text.secondary,
        fontWeight: '600',
    },
    stepLabel: {
        ...textStyles.caption,
        color: colors.text.tertiary,
    },
    stepLabelActive: {
        color: colors.primary.main,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
    },
    stepContent: {
        gap: spacing.md,
    },
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
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    categoryList: {
        marginBottom: spacing.sm,
    },
    categoryChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.neutral[100],
        borderRadius: borderRadius.round,
        marginRight: spacing.sm,
    },
    categoryChipSelected: {
        backgroundColor: colors.primary.main,
    },
    categoryChipText: {
        ...textStyles.body,
        color: colors.text.secondary,
    },
    categoryChipTextSelected: {
        color: colors.text.inverse,
    },
    languageButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    langButton: {
        flex: 1,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        backgroundColor: colors.neutral[100],
        alignItems: 'center',
    },
    langButtonActive: {
        backgroundColor: colors.primary.main,
    },
    langButtonText: {
        ...textStyles.body,
        color: colors.text.secondary,
    },
    langButtonTextActive: {
        color: colors.text.inverse,
    },
    priceRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    freeToggle: {
        flex: 1,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        backgroundColor: colors.neutral[100],
        alignItems: 'center',
    },
    freeToggleActive: {
        backgroundColor: colors.primary.main,
    },
    freeToggleText: {
        ...textStyles.body,
        color: colors.text.secondary,
    },
    freeToggleTextActive: {
        color: colors.text.inverse,
    },
    coverPicker: {
        aspectRatio: 16 / 9,
        backgroundColor: colors.neutral[100],
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    coverPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
    },
    coverPlaceholderText: {
        ...textStyles.body,
        color: colors.text.tertiary,
    },
    coverHint: {
        ...textStyles.caption,
        color: colors.text.tertiary,
    },
    hint: {
        ...textStyles.caption,
        color: colors.text.tertiary,
        textAlign: 'center',
    },
    sectionTitle: {
        ...textStyles.h3,
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
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
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryLabel: {
        ...textStyles.body,
        color: colors.text.secondary,
    },
    summaryValue: {
        ...textStyles.body,
        color: colors.text.primary,
        fontWeight: '600',
    },
    summaryDescRow: {
        marginTop: spacing.sm,
    },
    summaryDesc: {
        ...textStyles.body,
        color: colors.text.primary,
        marginTop: spacing.xs,
    },
    bottomButtons: {
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
    },
    button: {
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: colors.primary.main,
    },
    primaryButtonText: {
        ...textStyles.body,
        color: colors.text.inverse,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.6,
    },
});
