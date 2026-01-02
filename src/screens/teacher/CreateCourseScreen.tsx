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
    const [language, setLanguage] = useState('ru');
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
            Alert.alert('Ошибка', 'Введите название курса');
            return false;
        }
        if (!selectedCategoryId) {
            Alert.alert('Ошибка', 'Выберите категорию');
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

            // Note: Cover upload would need FormData handling
            // For now we create without cover
            const newCourse = await courseService.createCourse(courseData);

            Alert.alert(
                'Успешно!',
                'Курс создан как черновик. Добавьте модули и уроки.',
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
                'Не удалось создать курс';
            Alert.alert('Ошибка', errorMessage);
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
                        {step === 'details' ? 'Детали' : step === 'cover' ? 'Обложка' : 'Итог'}
                    </Text>
                </View>
            ))}
        </View>
    );

    const renderDetailsStep = () => (
        <View style={styles.stepContent}>
            <Text style={styles.label}>Название курса *</Text>
            <TextInput
                style={styles.input}
                placeholder="Введите название"
                placeholderTextColor={colors.text.tertiary}
                value={title}
                onChangeText={setTitle}
            />

            <Text style={styles.label}>Описание</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Опишите ваш курс"
                placeholderTextColor={colors.text.tertiary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
            />

            <Text style={styles.label}>Категория *</Text>
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

            <Text style={styles.label}>Язык</Text>
            <View style={styles.languageButtons}>
                {[
                    { code: 'ru', label: 'Русский' },
                    { code: 'en', label: 'English' },
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

            <Text style={styles.label}>Цена</Text>
            <View style={styles.priceRow}>
                <TouchableOpacity
                    style={[styles.freeToggle, isFree && styles.freeToggleActive]}
                    onPress={() => setIsFree(true)}
                >
                    <Text style={[styles.freeToggleText, isFree && styles.freeToggleTextActive]}>
                        Бесплатно
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.freeToggle, !isFree && styles.freeToggleActive]}
                    onPress={() => setIsFree(false)}
                >
                    <Text style={[styles.freeToggleText, !isFree && styles.freeToggleTextActive]}>
                        Платный
                    </Text>
                </TouchableOpacity>
            </View>
            {!isFree && (
                <TextInput
                    style={styles.input}
                    placeholder="Введите цену (например: 99.00)"
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
            <Text style={styles.label}>Обложка курса</Text>
            <TouchableOpacity style={styles.coverPicker} onPress={pickImage}>
                {coverImage ? (
                    <Image source={{ uri: coverImage }} style={styles.coverImage} />
                ) : (
                    <View style={styles.coverPlaceholder}>
                        <Ionicons name="image-outline" size={48} color={colors.text.tertiary} />
                        <Text style={styles.coverPlaceholderText}>Нажмите, чтобы выбрать</Text>
                        <Text style={styles.coverHint}>Рекомендуемый размер: 1920x1080</Text>
                    </View>
                )}
            </TouchableOpacity>
            <Text style={styles.hint}>Обложку можно добавить позже</Text>
        </View>
    );

    const renderSummaryStep = () => (
        <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Проверьте данные</Text>

            <View style={styles.summaryCard}>
                {coverImage && (
                    <Image source={{ uri: coverImage }} style={styles.summaryCover} />
                )}
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Название:</Text>
                    <Text style={styles.summaryValue}>{title}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Категория:</Text>
                    <Text style={styles.summaryValue}>
                        {categories.find((c) => c.id === selectedCategoryId)?.name || '-'}
                    </Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Язык:</Text>
                    <Text style={styles.summaryValue}>{language === 'ru' ? 'Русский' : 'English'}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Цена:</Text>
                    <Text style={styles.summaryValue}>{isFree ? 'Бесплатно' : `${price || '0'} ₽`}</Text>
                </View>
                {description && (
                    <View style={styles.summaryDescRow}>
                        <Text style={styles.summaryLabel}>Описание:</Text>
                        <Text style={styles.summaryDesc}>{description}</Text>
                    </View>
                )}
            </View>

            <Text style={styles.hint}>
                Курс будет создан как черновик. После создания вы сможете добавить модули и уроки.
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
                    <Text style={styles.headerTitle}>Создание курса</Text>
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
                                <Text style={styles.primaryButtonText}>Создать курс</Text>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleNext}>
                            <Text style={styles.primaryButtonText}>Далее</Text>
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
        padding: spacing.base,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    backButton: {
        width: 40,
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
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.neutral[200],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    stepCircleActive: {
        backgroundColor: colors.primary.main,
    },
    stepCircleCompleted: {
        backgroundColor: colors.success,
    },
    stepNumber: {
        ...textStyles.caption,
        color: colors.text.tertiary,
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
        padding: spacing.base,
        paddingBottom: spacing.xxl,
    },
    stepContent: {
        flex: 1,
    },
    label: {
        ...textStyles.bodyLarge,
        color: colors.text.primary,
        fontWeight: '600',
        marginBottom: spacing.sm,
        marginTop: spacing.md,
    },
    input: {
        backgroundColor: colors.neutral[100],
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: 16,
        color: colors.text.primary,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    textArea: {
        height: 100,
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
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    categoryChipSelected: {
        backgroundColor: colors.primary.main,
        borderColor: colors.primary.main,
    },
    categoryChipText: {
        ...textStyles.body,
        color: colors.text.primary,
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
        paddingVertical: spacing.md,
        backgroundColor: colors.neutral[100],
        borderRadius: borderRadius.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    langButtonActive: {
        backgroundColor: colors.primary.main,
        borderColor: colors.primary.main,
    },
    langButtonText: {
        ...textStyles.body,
        color: colors.text.primary,
    },
    langButtonTextActive: {
        color: colors.text.inverse,
        fontWeight: '600',
    },
    priceRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    freeToggle: {
        flex: 1,
        paddingVertical: spacing.md,
        backgroundColor: colors.neutral[100],
        borderRadius: borderRadius.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    freeToggleActive: {
        backgroundColor: colors.primary.main,
        borderColor: colors.primary.main,
    },
    freeToggleText: {
        ...textStyles.body,
        color: colors.text.primary,
    },
    freeToggleTextActive: {
        color: colors.text.inverse,
        fontWeight: '600',
    },
    coverPicker: {
        aspectRatio: 16 / 9,
        backgroundColor: colors.neutral[100],
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: colors.border.default,
        borderStyle: 'dashed',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    coverPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    coverPlaceholderText: {
        ...textStyles.body,
        color: colors.text.tertiary,
        marginTop: spacing.sm,
    },
    coverHint: {
        ...textStyles.caption,
        color: colors.text.tertiary,
        marginTop: spacing.xs,
    },
    hint: {
        ...textStyles.caption,
        color: colors.text.tertiary,
        marginTop: spacing.md,
        textAlign: 'center',
    },
    sectionTitle: {
        ...textStyles.h3,
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    summaryCard: {
        backgroundColor: colors.neutral[50],
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    summaryCover: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    summaryLabel: {
        ...textStyles.body,
        color: colors.text.tertiary,
    },
    summaryValue: {
        ...textStyles.body,
        color: colors.text.primary,
        fontWeight: '500',
    },
    summaryDescRow: {
        paddingVertical: spacing.sm,
    },
    summaryDesc: {
        ...textStyles.body,
        color: colors.text.secondary,
        marginTop: spacing.xs,
    },
    bottomButtons: {
        padding: spacing.base,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
        backgroundColor: colors.background.default,
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
        ...textStyles.bodyLarge,
        color: colors.text.inverse,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.6,
    },
});
