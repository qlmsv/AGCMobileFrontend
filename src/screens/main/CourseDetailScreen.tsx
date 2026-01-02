import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, textStyles, layout } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { courseService } from '../../services/courseService';
import { Course, Module } from '../../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { logger } from '../../utils/logger';
import { useAuth } from '../../contexts/AuthContext';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const CourseDetailScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<any>();
    const courseId = route.params?.courseId;
    const { user } = useAuth();

    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnrolling, setIsEnrolling] = useState(false);

    useEffect(() => {
        fetchCourseDetails();
    }, [courseId]);

    const fetchCourseDetails = async () => {
        try {
            const courseData = await courseService.getCourse(courseId);
            setCourse(courseData);
            // Assuming modules are nested or fetched separately. 
            // If nested in 'modules' field:
            if (courseData.modules) {
                setModules(courseData.modules);
            } else {
                // Try fetching modules if not nested
                // const modulesData = await courseService.getModules({ course: courseId });
                // setModules(modulesData);
                // Based on typings logic, let's assume valid nesting or empty
                setModules([]);
            }

        } catch (error) {
            logger.error('Error fetching course details:', error);
            Alert.alert('Error', 'Failed to load course details. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!course) return;
        setIsEnrolling(true);
        try {
            await courseService.enrollInCourse(course.id);
            Alert.alert('Success', 'Enrolled successfully!');
            fetchCourseDetails();
        } catch (error: any) {
            logger.error('Enrollment error:', error);
            const errorMessage = error.message || 'Could not enroll';
            const errorData = error.response?.data?.data; // Check API response structure if available
            const errorCode = errorData?.code;

            // Handle "Already Enrolled" case
            if (errorCode === 'already_enrolled' || errorMessage.includes('already enrolled') || errorMessage.includes('already_enrolled')) {
                Alert.alert('Info', 'You are already enrolled in this course.');
                fetchCourseDetails(); // Refresh to update UI
            } else if (errorMessage.includes('payment') || errorMessage.includes('purchase') || errorMessage.includes('pay') || errorCode === 'payment_required') {
                // Find the first paid module to initiate session
                // We assume paying for one module (or the main one) covers the course or flow
                // This is a simplification based on the available API
                const paidModule = modules.find(m => m.price && parseFloat(m.price) > 0) || modules[0];

                if (paidModule) {
                    Alert.alert(
                        'Payment Required',
                        `This course requires payment. Would you like to proceed to checkout?`,
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Buy Now',
                                onPress: async () => {
                                    try {
                                        setIsEnrolling(true);
                                        const session = await courseService.createStripeSession(paidModule.id);
                                        if (session && session.url) {
                                            navigation.navigate('Payment', { url: session.url });
                                        } else {
                                            Alert.alert('Error', 'Could not create payment session.');
                                        }
                                    } catch (payError) {
                                        logger.error('Payment session error', payError);
                                        Alert.alert('Error', 'Failed to initialize payment.');
                                    } finally {
                                        setIsEnrolling(false);
                                    }
                                }
                            }
                        ]
                    );
                } else {
                    Alert.alert('Enrollment Failed', errorMessage);
                }
            } else {
                Alert.alert('Enrollment Failed', errorMessage);
            }
        } finally {
            setIsEnrolling(false);
        }
    };

    const renderModule = (module: Module, index: number) => (
        <View key={module.id} style={styles.moduleContainer}>
            <Text style={styles.moduleTitle}>Module {index + 1}: {module.title}</Text>
            {module.lessons?.map((lesson, idx) => (
                <TouchableOpacity
                    key={lesson.id}
                    style={styles.lessonItem}
                    // Navigate only if enrolled or free preview - simple logic for now
                    onPress={() => navigation.navigate('LessonDetail', { lessonId: lesson.id })}
                >
                    <Ionicons
                        name="play-circle"
                        size={20}
                        color={colors.primary.main}
                    />
                    <Text style={styles.lessonTitle}>{idx + 1}. {lesson.title}</Text>
                    {/* Lock icon if locked? */}
                </TouchableOpacity>
            ))}
        </View>
    );

    if (isLoading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
        );
    }

    if (!course) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <Text>Course not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>Course Details</Text>
                <TouchableOpacity>
                    <Ionicons name="share-outline" size={24} color={colors.text.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Image
                    source={{ uri: course.cover || 'https://via.placeholder.com/300' }}
                    style={styles.courseImage}
                />

                <View style={styles.info}>
                    <View style={styles.pillContainer}>
                        <View style={styles.categoryPill}>
                            <Text style={styles.categoryText}>{course.category?.name || 'General'}</Text>
                        </View>
                        {course.is_free && (
                            <View style={styles.freePill}>
                                <Text style={styles.freeText}>FREE</Text>
                            </View>
                        )}
                        {course.is_enrolled && (
                            <View style={[styles.freePill, { backgroundColor: colors.success + '20' }]}>
                                <Text style={[styles.freeText, { color: colors.success }]}>ENROLLED</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.title}>{course.title}</Text>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Ionicons name="star" size={16} color="#FFC107" />
                            <Text style={styles.metaText}> {course.rating?.toFixed(1) || 'N/A'} (Reviews)</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={16} color={colors.text.tertiary} />
                            <Text style={styles.metaText}> {course.duration ? `${course.duration}h` : 'Flexible'}</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>About Course</Text>
                    <Text style={styles.description}>
                        {course.description || 'No description available for this course.'}
                    </Text>

                    <Text style={styles.sectionTitle}>Curriculum</Text>
                    {modules.length > 0 ? (
                        modules.map((m, i) => renderModule(m, i))
                    ) : (
                        <Text style={styles.emptyText}>No modules available yet.</Text>
                    )}

                    {/* Add Module button for course author */}
                    {course.author === user?.id && (
                        <TouchableOpacity
                            style={styles.addModuleButton}
                            onPress={() => navigation.navigate('AddModule', {
                                courseId: course.id,
                                modulesCount: modules.length
                            })}
                        >
                            <Ionicons name="add-circle-outline" size={20} color={colors.primary.main} />
                            <Text style={styles.addModuleText}>Add Module</Text>
                        </TouchableOpacity>
                    )}
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Price</Text>
                    <Text style={styles.priceValue}>
                        {course.is_free ? 'Free' : (course.price ? `$${course.price}` : 'Free')}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.enrollButton,
                        (isEnrolling || course.is_enrolled) && styles.disabledButton,
                        course.is_enrolled && { backgroundColor: colors.success }
                    ]}
                    onPress={handleEnroll}
                    disabled={isEnrolling || course.is_enrolled}
                >
                    {isEnrolling ? (
                        <ActivityIndicator color={colors.text.inverse} />
                    ) : (
                        <Text style={styles.enrollButtonText}>
                            {course.is_enrolled ? 'Already Enrolled' : 'Enroll Now'}
                        </Text>
                    )}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.base,
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
    content: {
        paddingBottom: 100,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    courseImage: {
        width: '100%',
        height: 240,
        backgroundColor: colors.neutral[200],
    },
    pillContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    categoryPill: {
        backgroundColor: colors.primary.light,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 4,
    },
    categoryText: {
        ...textStyles.caption,
        color: colors.primary.main,
    },
    freePill: {
        backgroundColor: colors.success + '20', // rough alpha
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 4,
    },
    freeText: {
        ...textStyles.caption,
        color: colors.success,
        fontWeight: '700',
    },
    metaRow: {
        flexDirection: 'row',
        gap: spacing.lg,
        marginBottom: spacing.lg,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        ...textStyles.caption,
        color: colors.text.secondary,
        marginLeft: 4,
    },
    info: {
        padding: spacing.base,
    },
    title: {
        ...textStyles.h2,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    sectionTitle: {
        ...textStyles.h4,
        color: colors.text.primary,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    moduleContainer: {
        marginBottom: spacing.md,
        backgroundColor: colors.neutral[50],
        borderRadius: borderRadius.lg,
        padding: spacing.sm,
    },
    moduleTitle: {
        ...textStyles.h4,
        color: colors.text.primary,
        marginBottom: spacing.xs,
        marginLeft: spacing.xs,
        fontSize: 16,
    },
    lessonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    lessonTitle: {
        ...textStyles.body,
        color: colors.text.primary,
        marginLeft: spacing.sm,
        flex: 1,
    },
    priceContainer: {
        justifyContent: 'center',
    },
    priceLabel: {
        ...textStyles.caption,
        color: colors.text.tertiary,
    },
    priceValue: {
        ...textStyles.h3,
        color: colors.primary.main,
    },
    enrollButton: {
        backgroundColor: colors.primary.main,
        height: 50,
        borderRadius: borderRadius.round,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        flex: 1,
        marginLeft: spacing.lg,
    },
    disabledButton: {
        backgroundColor: colors.neutral[300],
    },
    enrollButtonText: {
        ...textStyles.button,
        color: colors.text.inverse,
        fontSize: 16,
    },
    emptyText: {
        color: colors.text.tertiary,
        fontStyle: 'italic',
        marginTop: spacing.xs,
    },
    description: {
        ...textStyles.body,
        color: colors.text.secondary,
        lineHeight: 22,
    },
    footer: {
        flexDirection: 'row',
        padding: spacing.base,
        backgroundColor: colors.background.default,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
        alignItems: 'center',
    },
    addModuleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        marginTop: spacing.md,
        backgroundColor: colors.primary.main + '10',
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.primary.main,
        borderStyle: 'dashed',
        gap: spacing.sm,
    },
    addModuleText: {
        ...textStyles.body,
        color: colors.primary.main,
        fontWeight: '600',
    },
});
