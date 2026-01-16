import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, borderRadius, textStyles, layout } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail } from '../../utils/validation';
import { logger } from '../../utils/logger';

type NavigationProp = StackNavigationProp<AuthStackParamList, 'EmailInput'>;
type EmailInputRouteProp = RouteProp<AuthStackParamList, 'EmailInput'>;

interface Props {
  navigation: NavigationProp;
  route: EmailInputRouteProp;
}

export const EmailInputScreen: React.FC<Props> = ({ navigation, route }) => {
  const { mode } = route.params;
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { sendCode } = useAuth();

  const isSignup = mode === 'signup';

  const handleContinue = async () => {
    const { isValid, error } = validateEmail(email);
    if (!isValid) {
      Alert.alert('Invalid Email', error);
      return;
    }

    setIsLoading(true);
    try {
      await sendCode(email, isSignup ? 'signup' : 'login');
      navigation.navigate('Verification', { email, mode });
    } catch (error: any) {
      logger.error('Failed to send verification code:', error);

      if (error.response?.status === 429) {
        Alert.alert(
          'Limit Reached',
          'You have requested too many codes. Please wait 60 seconds before trying again.'
        );
      } else if (error.response?.status === 404 && !isSignup) {
        Alert.alert(
          'Account Not Found',
          'No account found with this email. Would you like to create one?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Create Account',
              onPress: () => navigation.replace('EmailInput', { mode: 'signup' }),
            },
          ]
        );
      } else if (error.response?.status === 400 && isSignup) {
        Alert.alert(
          'Account Exists',
          'An account with this email already exists. Please log in instead.',
          [
            { text: 'OK' },
            { text: 'Log In', onPress: () => navigation.replace('EmailInput', { mode: 'login' }) },
          ]
        );
      } else {
        Alert.alert(
          'Error',
          error.message ||
            'Failed to send verification code. Please check your internet connection.'
        );
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
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.title}>{isSignup ? 'Create your account' : 'Welcome back!'}</Text>
              <Text style={styles.subtitle}>
                {isSignup
                  ? 'Enter your email to get started with AGC.'
                  : 'Enter your email to sign in to your account.'}
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

              <TouchableOpacity
                style={styles.switchButton}
                onPress={() =>
                  navigation.replace('EmailInput', { mode: isSignup ? 'login' : 'signup' })
                }
              >
                <Text style={styles.switchText}>
                  {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                  <Text style={styles.switchLink}>{isSignup ? 'Log In' : 'Sign Up'}</Text>
                </Text>
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
    borderColor: colors.border.default,
    borderRadius: layout.input.borderRadius,
    paddingHorizontal: spacing.base,
    fontSize: 16,
    fontFamily: 'Inter',
    color: colors.text.primary,
    backgroundColor: colors.background.default,
  },
  footer: {
    marginBottom: spacing.xl,
    gap: spacing.md,
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
  switchButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  switchText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  switchLink: {
    color: colors.primary.main,
    fontWeight: '600',
  },
});
