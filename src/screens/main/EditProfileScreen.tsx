import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { colors, spacing, textStyles, borderRadius, layout } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';
import apiService from '../../services/api';

export const EditProfileScreen: React.FC = () => {
    const navigation = useNavigation();
    const { user, profile, updateProfile, logout } = useAuth();

    const [firstName, setFirstName] = useState(profile?.first_name || '');
    const [lastName, setLastName] = useState(profile?.last_name || '');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateProfile({
                first_name: firstName,
                last_name: lastName,
                phone: phone,
            });
            Alert.alert('Success', 'Profile updated successfully!');
            navigation.goBack();
        } catch (error) {
            logger.error('Failed to update profile:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setIsDeleting(true);
                        try {
                            await apiService.delete('/users/my-user/');
                            Alert.alert('Account Deleted', 'Your account has been deleted.');
                            logout();
                        } catch (error: any) {
                            logger.error('Failed to delete account:', error);
                            Alert.alert('Error', error.response?.data?.detail || 'Failed to delete account.');
                        } finally {
                            setIsDeleting(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator color={colors.primary.main} />
                    ) : (
                        <Text style={styles.saveButton}>Edit</Text>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Avatar placeholder */}
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Ionicons name="person-outline" size={40} color={colors.text.tertiary} />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={[styles.input, styles.disabledInput]}
                        value={user?.email}
                        editable={false}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="+1234567890"
                        placeholderTextColor={colors.text.tertiary}
                        keyboardType="phone-pad"
                    />
                </View>

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDeleteAccount}
                    disabled={isDeleting}
                >
                    {isDeleting ? (
                        <ActivityIndicator color={colors.primary.main} />
                    ) : (
                        <Text style={styles.deleteButtonText}>Delete account</Text>
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
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        ...textStyles.h3,
        color: colors.text.primary,
    },
    saveButton: {
        ...textStyles.button,
        color: colors.primary.main,
    },
    content: {
        padding: spacing.base,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.neutral[100],
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.neutral[300],
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        ...textStyles.caption,
        color: colors.text.secondary,
        marginBottom: spacing.xs,
    },
    input: {
        height: layout.input.height,
        borderWidth: 1,
        borderColor: colors.border.default,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        ...textStyles.body,
        color: colors.text.primary,
        backgroundColor: colors.background.default,
    },
    disabledInput: {
        backgroundColor: colors.neutral[100],
        color: colors.text.tertiary,
    },
    deleteButton: {
        marginTop: spacing.xl,
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    deleteButtonText: {
        ...textStyles.body,
        color: colors.primary.main,
    },
});
