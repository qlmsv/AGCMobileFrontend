import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, borderRadius, textStyles, layout } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail } from '../../utils/validation';
import { logger } from '../../utils/logger';

type NavigationProp = StackNavigationProp<AuthStackParamList, 'EmailInput'>;

interface Props {
    navigation: NavigationProp;
}

export const EmailInputScreen: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { sendCode } = useAuth();

    const handleContinue = async () => {
        const { isValid, error } = validateEmail(email);
        if (!isValid) {
            Alert.alert('Invalid Email', error);
            return;
        }

        setIsLoading(true);
        try {
            await sendCode(email);
            navigation.navigate('Verification', { email });
        } catch (error: any) {
            logger.error('Failed to send verification code:', error);

            if (error.response?.status === 429) {
                Alert.alert(
                    'Limit Reached',
                    'You have requested too many codes. Please wait 60 seconds before trying again.'
                );
            } else {
                Alert.alert('Error', error.message || 'Failed to send verification code. Please check your internet connection.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoid}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.content}>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={styles.backButton}
                            >
                                <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                            </TouchableOpacity>
                            <Text style={styles.title}>What's your email?</Text>
                            <Text style={styles.subtitle}>
                                We'll check if you have an account or help you create one.
                            </Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="example@email.com"
                                placeholderTextColor={colors.text.tertiary}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[styles.button, isLoading && styles.buttonDisabled]}
                                onPress={handleContinue}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color={colors.text.inverse} />
                                ) : (
                                    <Text style={styles.buttonText}>Continue</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
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
    content: {
        flex: 1,
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
        flex: 1,
    },
    label: {
        ...textStyles.label,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    input: {
        height: layout.input.height,
        borderWidth: 1,
        borderColor: colors.border.default, // #E2E2E2
        borderRadius: layout.input.borderRadius, // 8px
        paddingHorizontal: spacing.base,
        fontSize: 16,
        fontFamily: 'Inter',
        color: colors.text.primary,
        backgroundColor: colors.background.default,
    },
    footer: {
        marginBottom: spacing.xl,
    },
    button: {
        height: layout.button.height,
        backgroundColor: colors.primary.main, // #FF5A05
        borderRadius: borderRadius.md, // 12px
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
