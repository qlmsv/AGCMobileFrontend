import React, { useState, useEffect } from 'react';
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
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, borderRadius, textStyles, layout } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';

type NavigationProp = StackNavigationProp<AuthStackParamList, 'Verification'>;
type RouteProps = RouteProp<AuthStackParamList, 'Verification'>;

interface Props {
    navigation: NavigationProp;
    route: RouteProps;
}

export const VerificationScreen: React.FC<Props> = ({ navigation, route }) => {
    const { email, mode } = route.params;
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { verifyCode } = useAuth();

    const handleVerify = async () => {
        if (code.length < 4) {
            Alert.alert('Invalid Code', 'Please enter the full code');
            return;
        }

        setIsLoading(true);
        try {
            await verifyCode(email, code, mode);
            // Navigation is handled by AuthContext state change (user becomes authenticated)
            // For signup, user may need to go to Information screen
        } catch (error: any) {
            logger.error('Verification error:', error);
            Alert.alert('Error', error.message || 'Invalid code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoid}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                            </TouchableOpacity>
                            <Text style={styles.title}>Confirm your email</Text>
                            <Text style={styles.subtitle}>
                                We sent a code to <Text style={styles.emailHighlight}>{email}</Text>
                            </Text>
                        </View>

                        <View style={styles.form}>
                            <Text style={styles.label}>Verification Code</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0000"
                                placeholderTextColor={colors.text.tertiary}
                                value={code}
                                onChangeText={setCode}
                                keyboardType="number-pad"
                                maxLength={6}
                                autoFocus
                            />
                        </View>

                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[styles.button, isLoading && styles.buttonDisabled]}
                                onPress={handleVerify}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color={colors.text.inverse} />
                                ) : (
                                    <Text style={styles.buttonText}>Verify</Text>
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
    emailHighlight: {
        ...textStyles.body,
        fontWeight: '600',
        color: colors.text.primary,
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
        borderColor: colors.border.default,
        borderRadius: layout.input.borderRadius,
        paddingHorizontal: spacing.base,
        fontSize: 24,
        fontFamily: 'Inter',
        letterSpacing: 4,
        color: colors.text.primary,
        backgroundColor: colors.background.default,
        textAlign: 'center',
    },
    footer: {
        marginBottom: spacing.xl,
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
