import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { logger } from '../../utils/logger';

type CreateModuleDetailRouteProp = RouteProp<RootStackParamList, 'CreateModuleDetail'>;

export const CreateModuleDetailScreen = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute<CreateModuleDetailRouteProp>();
    const { title } = route.params;

    // Mock initial lessons
    const [lessons, setLessons] = useState([
        { id: 1, title: 'Introduction to UI', type: 'video', duration: '5 min' },
        { id: 2, title: 'Color Theory', type: 'text', duration: '10 min' },
    ]);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleAddLesson = () => {
        const newId = lessons.length + 1;
        setLessons([...lessons, { id: newId, title: `New Lesson ${newId}`, type: 'text', duration: '0 min' }]);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background.base} />

            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{title}</Text>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="ellipsis-horizontal" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.contentContainer}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Lessons List */}
                    <View style={styles.listContainer}>
                        {lessons.map((lesson) => (
                            <TouchableOpacity
                                key={lesson.id}
                                style={styles.lessonCard}
                                onPress={() => logger.debug('TODO: Edit lesson:', lesson.id)}
                            >
                                <View style={styles.lessonLeft}>
                                    <View style={styles.lessonIconContainer}>
                                        <Ionicons
                                            name={lesson.type === 'video' ? 'play-circle-outline' : 'document-text-outline'}
                                            size={20}
                                            color={colors.text.secondary}
                                        />
                                    </View>
                                    <View>
                                        <Text style={styles.lessonTitle}>{lesson.title}</Text>
                                        <Text style={styles.lessonSubtitle}>{lesson.duration}</Text>
                                    </View>
                                </View>
                                <Ionicons name="reorder-two-outline" size={20} color={colors.neutral[300]} />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Add Lesson Button */}
                    <TouchableOpacity style={styles.addLessonButton} onPress={handleAddLesson}>
                        <Ionicons name="add" size={16} color={colors.text.secondary} />
                        <Text style={styles.addLessonText}>Add lesson</Text>
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background.base,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        backgroundColor: colors.background.base,
        zIndex: 10,
    },
    iconButton: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.round,
        backgroundColor: colors.neutral.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'rgba(207, 207, 207, 0.1)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 3,
        elevation: 2,
    },
    headerTitle: {
        ...textStyles.h3,
        color: colors.text.primary,
    },
    contentContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing.huge,
    },
    listContainer: {
        gap: spacing.base,
        marginBottom: spacing.xl,
    },
    lessonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.neutral.white,
        borderRadius: borderRadius.lg,
        padding: spacing.base,
        shadowColor: 'rgba(207, 207, 207, 0.1)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 3,
        elevation: 2,
    },
    lessonLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    lessonIconContainer: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lessonTitle: {
        ...textStyles.bodySemiBold,
        color: colors.text.primary,
        marginBottom: 4,
    },
    lessonSubtitle: {
        ...textStyles.caption,
        color: colors.text.tertiary,
    },
    addLessonButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.neutral.white,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.round,
        borderWidth: 1,
        borderColor: colors.neutral[400],
        gap: spacing.xs,
        alignSelf: 'stretch',
    },
    addLessonText: {
        ...textStyles.h3,
        color: colors.text.secondary,
    },
});
