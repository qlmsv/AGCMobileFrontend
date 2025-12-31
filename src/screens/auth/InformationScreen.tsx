import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, borderRadius, textStyles, layout } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';

type NavigationProp = StackNavigationProp<AuthStackParamList, 'Information'>;
type RouteProps = RouteProp<AuthStackParamList, 'Information'>;

interface Props {
    navigation: NavigationProp;
    route: RouteProps;
}

export const InformationScreen: React.FC<Props> = ({ navigation, route }) => {
    const { email } = route.params;
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { updateProfile } = useAuth(); // Assuming this exists or we mock it for now

    const handleContinue = async () => {
        if (!firstName.trim() || !lastName.trim()) {
            Alert.alert('Required', 'Please enter your first and last name');
            return;
        }

        setIsLoading(true);
        try {
            // Logic to update user profile
            await updateProfile({ first_name: firstName, last_name: lastName });
        } catch (error: any) {
            logger.error('Update profile error:', error);
            Alert.alert('Error', 'Failed to complete registration. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoid}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Tell us about yourself</Text>
                        <Text style={styles.subtitle}>
                            Please provide your details to complete the registration.
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>First Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="John"
                                placeholderTextColor={colors.text.tertiary}
                                value={firstName}
                                onChangeText={setFirstName}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Last Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Doe"
                                placeholderTextColor={colors.text.tertiary}
                                value={lastName}
                                onChangeText={setLastName}
                            />
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleContinue}
                            disabled={isLoading}
                        >
                            <Text style={styles.buttonText}>Complete Registration</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.base,
    },
    header: {
        marginTop: spacing.xl,
        marginBottom: spacing.xxl,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    title: {
        ...textStyles.h2,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    subtitle: {
        ...textStyles.body,
        color: colors.text.secondary,
    },
    form: {
        gap: spacing.lg,
    },
    inputGroup: {
        gap: spacing.xs,
    },
    label: {
        ...textStyles.label,
        color: colors.text.primary,
    },
    input: {
        height: layout.input.height,
        borderWidth: 1,
        borderColor: colors.border.default,
        borderRadius: layout.input.borderRadius,
        paddingHorizontal: spacing.base,
        fontSize: 16,
        fontFamily: 'Inter',
        color: colors.text.primary,
        backgroundColor: colors.background.default,
    },
    footer: {
        marginTop: spacing.xxl,
    },
    button: {
        height: layout.button.height,
        backgroundColor: colors.primary.main,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.7,
        backgroundColor: colors.primary.light,
    },
    buttonText: {
        ...textStyles.button,
        color: colors.text.inverse,
    },
});
