import React, { useEffect, useState } from 'react';
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
import { RouteProp } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, borderRadius, textStyles, layout, typography } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { getUserFriendlyError } from '../../utils/errorHandler';
import { validateVerificationCode } from '../../utils/validation';

type VerifyCodeNavigationProp = StackNavigationProp<RootStackParamList, 'VerifyCode'>;
type VerifyCodeRouteProp = RouteProp<RootStackParamList, 'VerifyCode'>;

interface VerifyCodeScreenProps {
  navigation: VerifyCodeNavigationProp;
  route: VerifyCodeRouteProp;
}

const RESEND_INTERVAL_SECONDS = 60;

export const VerifyCodeScreen: React.FC<VerifyCodeScreenProps> = ({ navigation, route }) => {
  const { email } = route.params;
  const [code1, setCode1] = useState('');
  const [code2, setCode2] = useState('');
  const [code3, setCode3] = useState('');
  const [code4, setCode4] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [hasError, setHasError] = useState(false);
  const { verifyCode, sendCode } = useAuth();

  const input1Ref = React.useRef<TextInput>(null);
  const input2Ref = React.useRef<TextInput>(null);
  const input3Ref = React.useRef<TextInput>(null);
  const input4Ref = React.useRef<TextInput>(null);

  useEffect(() => {
    if (resendTimer === 0) {
      return;
    }

    const intervalId = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [resendTimer]);

  const handleCodeChange = (value: string, position: number) => {
    // Clear error state when user starts typing
    if (hasError) {
      setHasError(false);
    }

    if (value.length > 1) {
      value = value[value.length - 1];
    }

    switch (position) {
      case 1:
        setCode1(value);
        if (value) input2Ref.current?.focus();
        break;
      case 2:
        setCode2(value);
        if (value) input3Ref.current?.focus();
        break;
      case 3:
        setCode3(value);
        if (value) input4Ref.current?.focus();
        break;
      case 4:
        setCode4(value);
        if (value) Keyboard.dismiss();
        break;
    }
  };

  const handleKeyPress = (key: string, position: number) => {
    if (key === 'Backspace') {
      switch (position) {
        case 2:
          if (!code2) input1Ref.current?.focus();
          break;
        case 3:
          if (!code3) input2Ref.current?.focus();
          break;
        case 4:
          if (!code4) input3Ref.current?.focus();
          break;
      }
    }
  };

  const isCodeComplete = code1 && code2 && code3 && code4;

  const handleVerifyCode = async () => {
    const fullCode = `${code1}${code2}${code3}${code4}`;

    // Validate verification code
    const validation = validateVerificationCode(fullCode);
    if (!validation.isValid) {
      Alert.alert('Invalid Code', validation.error || 'Please enter a valid 4-digit code');
      setHasError(true);
      return;
    }

    setIsLoading(true);
    try {
      await verifyCode(email, fullCode);
      // Navigate to CompleteRegistration screen to collect user info
      navigation.navigate('CompleteRegistration', { email });
    } catch (error) {
      const errorMessage = getUserFriendlyError(error);
      Alert.alert('Error', errorMessage);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) {
      return;
    }

    setIsLoading(true);
    try {
      await sendCode(email);
      Alert.alert('Success', 'Code has been resent');
      setResendTimer(RESEND_INTERVAL_SECONDS);
    } catch (error) {
      const errorMessage = getUserFriendlyError(error);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.inner}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              disabled={isLoading}
            >
              <Ionicons name="arrow-back" size={24} color={colors.neutral[700]} />
            </TouchableOpacity>

            <View style={styles.contentContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>Confirmation code</Text>
                <Text style={styles.subtitle}>
                  Please enter the confirmation code we sent to{' '}
                  <Text style={styles.emailHighlight}>{email}</Text>
                </Text>
              </View>

              <View style={styles.codeInputsContainer}>
                <TextInput
                  ref={input1Ref}
                  style={[styles.codeInput, hasError && styles.codeInputError]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={code1}
                  onChangeText={(value) => handleCodeChange(value, 1)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, 1)}
                  editable={!isLoading}
                  selectTextOnFocus
                />
                <TextInput
                  ref={input2Ref}
                  style={[styles.codeInput, hasError && styles.codeInputError]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={code2}
                  onChangeText={(value) => handleCodeChange(value, 2)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, 2)}
                  editable={!isLoading}
                  selectTextOnFocus
                />
                <TextInput
                  ref={input3Ref}
                  style={[styles.codeInput, hasError && styles.codeInputError]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={code3}
                  onChangeText={(value) => handleCodeChange(value, 3)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, 3)}
                  editable={!isLoading}
                  selectTextOnFocus
                />
                <TextInput
                  ref={input4Ref}
                  style={[styles.codeInput, hasError && styles.codeInputError]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={code4}
                  onChangeText={(value) => handleCodeChange(value, 4)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, 4)}
                  editable={!isLoading}
                  selectTextOnFocus
                />
              </View>

              <View style={styles.resendContainer}>
                <Text style={styles.resendQuestion}>Didn't receive the confirmation code? </Text>
                <TouchableOpacity onPress={handleResendCode} disabled={isLoading || resendTimer > 0}>
                  <Text
                    style={[
                      styles.resendText,
                      (isLoading || resendTimer > 0) && styles.resendTextDisabled,
                    ]}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend it'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  !isCodeComplete && styles.buttonInactive,
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleVerifyCode}
                disabled={isLoading || !isCodeComplete}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.neutral.white} />
                ) : (
                  <Text style={styles.buttonText}>Continue</Text>
                )}
              </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 360,
    backgroundColor: colors.background.default,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(207, 207, 207, 0.5)',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    marginBottom: 20,
  },
  contentContainer: {
    marginTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  content: {
    width: '100%',
  },
  title: {
    fontFamily: 'Rubik',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Rubik',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: colors.neutral[700],
    textAlign: 'center',
  },
  emailHighlight: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  codeInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  codeInput: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 80,
    backgroundColor: colors.background.default,
    borderRadius: 16,
    fontSize: 40,
    fontWeight: '600',
    color: colors.neutral[900],
    textAlign: 'center',
    shadowColor: 'rgba(207, 207, 207, 0.5)',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  codeInputError: {
    borderWidth: 2,
    borderColor: colors.error,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 24,
    marginBottom: 24,
  },
  resendQuestion: {
    fontFamily: 'Rubik',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: colors.neutral[900],
  },
  resendText: {
    fontFamily: 'Rubik',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: colors.primary.main,
  },
  resendTextDisabled: {
    color: colors.neutral[500],
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.accent.peach,
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonInactive: {
    opacity: 0.4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    color: colors.neutral.white,
  },
});
