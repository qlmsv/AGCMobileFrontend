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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

export const CreateCourseModulesScreen = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    // Mock initial data
    const [modules, setModules] = useState([
        { id: 1, title: 'Module 1', lessons: 4 },
        { id: 2, title: 'Module 2', lessons: 4 },
        { id: 3, title: 'Module 3', lessons: 4 },
    ]);
    const [numModules, setNumModules] = useState<string>("from 1 to 20");

    const handleBack = () => {
        navigation.goBack();
    };

    const handleAddModule = () => {
        const newId = modules.length + 1;
        setModules([...modules, { id: newId, title: `Module ${newId}`, lessons: 0 }]);
    };

    const handleContinue = () => {
        // Navigate to completion or next step
        Alert.alert('Success', 'Course structure saved!');
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
                    <Text style={styles.headerTitle}>Create course</Text>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="ellipsis-horizontal" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.contentContainer}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Choose number of modules Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Choose number of modules</Text>
                        <TouchableOpacity style={styles.dropdownInput}>
                            <Text style={styles.inputText}>{numModules}</Text>
                            <View style={styles.dropdownIcon}>
                                <Ionicons name="chevron-down" size={12} color={colors.text.placeholder} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Modules List */}
                    <View style={styles.modulesContainer}>
                        {modules.map((module) => (
                            <TouchableOpacity
                                key={module.id}
                                style={styles.moduleCard}
                                onPress={() => navigation.navigate('CreateModuleDetail', {
                                    moduleId: module.id,
                                    title: module.title
                                })}
                            >
                                <View style={styles.moduleLeft}>
                                    <View style={styles.moduleIconContainer}>
                                        <Ionicons name="folder-open-outline" size={20} color={colors.text.secondary} />
                                    </View>
                                    <View>
                                        <Text style={styles.moduleTitle}>{module.title}</Text>
                                        <Text style={styles.moduleSubtitle}>{module.lessons} lessons</Text>
                                    </View>
                                </View>
                                <View>
                                    <Ionicons name="ellipsis-vertical" size={20} color={colors.neutral[400]} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Add Module Button */}
                    <TouchableOpacity style={styles.addModuleButton} onPress={handleAddModule}>
                        <Ionicons name="add" size={16} color={colors.text.secondary} />
                        <Text style={styles.addModuleText}>Add module</Text>
                    </TouchableOpacity>

                </ScrollView>

                {/* Continue Button (Fixed at bottom) */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>
                </View>
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
        paddingBottom: 100,
    },
    inputGroup: {
        marginBottom: spacing.xl,
        marginTop: spacing.sm,
    },
    label: {
        ...textStyles.bodyMedium,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    dropdownInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.neutral.white,
        borderRadius: borderRadius.round,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        shadowColor: 'rgba(207, 207, 207, 0.1)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 3,
        elevation: 2,
    },
    inputText: {
        ...textStyles.body,
        color: colors.text.placeholder,
    },
    dropdownIcon: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modulesContainer: {
        gap: spacing.base,
        marginBottom: spacing.xl,
    },
    moduleCard: {
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
    moduleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    moduleIconContainer: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    moduleTitle: {
        ...textStyles.bodySemiBold,
        color: colors.text.primary,
        marginBottom: 4,
    },
    moduleSubtitle: {
        ...textStyles.caption,
        color: colors.text.tertiary,
    },
    addModuleButton: {
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
    addModuleText: {
        ...textStyles.h3,
        color: colors.text.secondary,
    },
    footer: {
        padding: spacing.xl,
        backgroundColor: colors.neutral.white,
    },
    continueButton: {
        backgroundColor: colors.text.primary,
        borderRadius: borderRadius.round,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    continueButtonText: {
        ...textStyles.h3,
        color: colors.neutral.white,
    },
});
