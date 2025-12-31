import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { colors, spacing, textStyles, borderRadius, layout } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';

export const EditProfileScreen: React.FC = () => {
    const navigation = useNavigation();
    const { user, profile, updateProfile } = useAuth();

    const [firstName, setFirstName] = useState(profile?.first_name || '');
    const [lastName, setLastName] = useState(profile?.last_name || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateProfile({
                first_name: firstName,
                last_name: lastName
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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator color={colors.primary.main} />
                    ) : (
                        <Text style={styles.saveButton}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                        style={styles.input}
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="Enter first name"
                        placeholderTextColor={colors.text.tertiary}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                        style={styles.input}
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Enter last name"
                        placeholderTextColor={colors.text.tertiary}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={[styles.input, styles.disabledInput]}
                        value={user?.email}
                        editable={false}
                    />
                    <Text style={styles.helperText}>Email cannot be changed.</Text>
                </View>
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
    helperText: {
        ...textStyles.caption,
        color: colors.text.tertiary,
        marginTop: 4,
    },
});
