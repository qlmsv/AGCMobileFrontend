import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, layout, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { RootStackParamList } from '../../navigation/types';
import { getUserFriendlyError } from '../../utils/errorHandler';
import { validateEmail } from '../../utils/validation';

type EmailInputScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EmailInput'>;

interface EmailInputScreenProps {
  navigation: EmailInputScreenNavigationProp;
}

export const EmailInputScreen: React.FC<EmailInputScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { sendCode } = useAuth();

  const handleSendCode = async () => {
    // Validate email address
    const validation = validateEmail(email);
    if (!validation.isValid) {
      Alert.alert('Invalid Email', validation.error || 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await sendCode(email);
      navigation.navigate('VerifyCode', { email });
    } catch (error) {
      const errorMessage = getUserFriendlyError(error);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert(
      'Google Login',
      'Google authentication is not configured yet.',
      [{ text: 'OK' }]
    );
  };

  const handleAppleLogin = () => {
    Alert.alert(
      'Apple Login',
      'Apple authentication is not configured yet.',
      [{ text: 'OK' }]
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.inner}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.neutral[700]} />
            </TouchableOpacity>

            <View style={styles.contentContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>Welcome!</Text>
                <Text style={styles.subtitle}>
                  Start using the app — it's simple and convenient.
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.socialButtons}>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={handleAppleLogin}
                    disabled={isLoading}
                  >
                    <Ionicons name="logo-apple" size={20} color={colors.neutral.white} />
                    <Text style={styles.socialText}>Sign in with Apple</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <Ionicons name="logo-google" size={20} color={colors.neutral.white} />
                    <Text style={styles.socialText}>Sign in with Google</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.divider}>or</Text>

                <View style={styles.inputContainer}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.required}>*</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="example@gmail.com"
                    placeholderTextColor={colors.neutral[400]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                    editable={!isLoading}
                    returnKeyType="done"
                    onSubmitEditing={handleSendCode}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleSendCode}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.neutral.white} />
                  ) : (
                    <Text style={styles.buttonText}>Continue</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.base, // #F8F8F8
  },
  safeArea: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 20, // Match design "actions" left: 20px
    paddingTop: 10,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 360,
    backgroundColor: colors.background.default,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow matching design roughly
    shadowColor: 'rgba(207, 207, 207, 0.5)',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    marginBottom: 20,
  },
  contentContainer: {
    marginTop: 20, // Adjust to match visual spacing
  },
  header: {
    alignItems: 'center',
    marginBottom: 32, // gap: 32px in "actions" between header and sign in + input? No, gap: 32px is between header and next section.
  },
  title: {
    fontFamily: 'Rubik',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    color: colors.neutral[900], // #171717
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Rubik',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: colors.neutral[700], // #404040
    textAlign: 'center',
  },
  form: {
    width: '100%',
    gap: 24,
  },
  socialButtons: {
    gap: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral[900],
    gap: 8,
  },
  socialText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
  },
  divider: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: colors.neutral[700],
    textAlign: 'center',
  },
  inputContainer: {
    gap: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  required: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: colors.error,
  },
  input: {
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '400',
    color: colors.text.primary,
    backgroundColor: colors.neutral.white,
    ...shadows.sm,
  },
  button: {
    height: 48,
    backgroundColor: colors.primary.main,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.primary.light,
  },
  buttonText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
  },
});
