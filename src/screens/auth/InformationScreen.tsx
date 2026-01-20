import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, borderRadius, textStyles, layout } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { profileService } from '../../services/profileService';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';
import DateTimePicker from '@react-native-community/datetimepicker';
import { customList } from 'country-codes-list';

// Get all countries with their codes
const countryData = customList('countryCode', '{countryNameEn}|{countryCallingCode}|{flag}');
const COUNTRY_CODES = Object.entries(countryData)
  .map(([countryCode, data]) => {
    const [country, callingCode, flag] = (data as string).split('|');
    return {
      code: `+${callingCode}`,
      country,
      flag: flag || '🏳️',
      countryCode
    };
  })
  .filter(c => c.code && c.code !== '+undefined' && c.country)
  .sort((a, b) => a.country.localeCompare(b.country));

type NavigationProp = StackNavigationProp<AuthStackParamList, 'Information'>;
type RouteProps = RouteProp<AuthStackParamList, 'Information'>;

interface Props {
  navigation: NavigationProp;
  route: RouteProps;
}

export const InformationScreen: React.FC<Props> = ({ navigation, route }) => {
  // const { email } = route.params;
  const { refreshUser } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCountryIndex, setSelectedCountryIndex] = useState(0); // Default to first country alphabetically
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRY_CODES;
    const search = countrySearch.toLowerCase();
    return COUNTRY_CODES.filter(
      c => c.country.toLowerCase().includes(search) || c.code.includes(search)
    );
  }, [countrySearch]);

  const handleContinue = async () => {
    if (!firstName.trim()) {
      Alert.alert('Required', 'Please enter your first name');
      return;
    }
    if (!lastName.trim()) {
      Alert.alert('Required', 'Please enter your last name');
      return;
    }
    if (!consentChecked) {
      Alert.alert('Required', 'Please agree to the processing of your personal data');
      return;
    }

    setIsLoading(true);
    try {
      // Debug: Check if we have a token
      const apiService = await import('../services/api');
      const token = await apiService.default.getAccessToken();
      logger.info('🔑 Current access token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

      const profileData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        date_of_birth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : null,
        phone_number: phoneNumber.trim()
          ? `${COUNTRY_CODES[selectedCountryIndex].code}${phoneNumber.trim()}`
          : null,
      };
      logger.info('📤 Sending profile data:', JSON.stringify(profileData, null, 2));
      await profileService.createProfile(profileData);
      await refreshUser();
      // Navigation handled by AuthContext - user becomes authenticated with profile
    } catch (error: any) {
      logger.error('Create profile error:', error);
      logger.error('Error response:', error.response);
      logger.error('Error response data:', error.response?.data);
      const errorDetails = JSON.stringify(error.response?.data || error.message || error, null, 2);
      Alert.alert(
        'Error',
        `${error.response?.data?.detail || 'Failed to complete registration. Please try again.'}\n\nDetails: ${errorDetails}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>Complete registration</Text>
            <Text style={styles.subtitle}>
              Almost there! Just one more step to start using all the features.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                First name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Kit"
                placeholderTextColor={colors.text.tertiary}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Last name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Connor"
                placeholderTextColor={colors.text.tertiary}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Date of birth <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                <Text style={dateOfBirth ? styles.inputText : styles.placeholderText}>
                  {dateOfBirth ? formatDate(dateOfBirth) : '08.03.2004'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dateOfBirth || new Date(2000, 0, 1)}
                  mode="date"
                  display="spinner"
                  maximumDate={new Date()}
                  onChange={(event, date) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (date) setDateOfBirth(date);
                  }}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Phone number <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.phoneInputContainer}>
                <TouchableOpacity
                  style={styles.countryCode}
                  onPress={() => setShowCountryPicker(true)}
                >
                  <Text style={styles.flag}>{COUNTRY_CODES[selectedCountryIndex].flag}</Text>
                  <Text style={styles.codeText}>{COUNTRY_CODES[selectedCountryIndex].code}</Text>
                  <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
                </TouchableOpacity>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Phone number"
                  placeholderTextColor={colors.text.tertiary}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>
              <Modal
                visible={showCountryPicker}
                animationType="slide"
                onRequestClose={() => setShowCountryPicker(false)}
              >
                <SafeAreaView style={styles.countryModalContainer}>
                  <View style={styles.countryModalHeader}>
                    <Text style={styles.countryModalTitle}>Select Country</Text>
                    <TouchableOpacity onPress={() => {
                      setShowCountryPicker(false);
                      setCountrySearch('');
                    }}>
                      <Ionicons name="close" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.countrySearchContainer}>
                    <Ionicons name="search" size={20} color={colors.text.tertiary} />
                    <TextInput
                      style={styles.countrySearchInput}
                      placeholder="Search country or code..."
                      placeholderTextColor={colors.text.tertiary}
                      value={countrySearch}
                      onChangeText={setCountrySearch}
                      autoFocus
                    />
                    {countrySearch.length > 0 && (
                      <TouchableOpacity onPress={() => setCountrySearch('')}>
                        <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <FlatList
                    data={filteredCountries}
                    keyExtractor={(item) => `${item.countryCode}-${item.country}`}
                    renderItem={({ item, index }) => (
                      <TouchableOpacity
                        style={[
                          styles.countryItem,
                          COUNTRY_CODES[selectedCountryIndex]?.countryCode === item.countryCode &&
                          styles.countryItemSelected
                        ]}
                        onPress={() => {
                          const originalIndex = COUNTRY_CODES.findIndex(c => c.countryCode === item.countryCode);
                          setSelectedCountryIndex(originalIndex);
                          setShowCountryPicker(false);
                          setCountrySearch('');
                        }}
                      >
                        <Text style={styles.countryItemFlag}>{item.flag}</Text>
                        <Text style={styles.countryItemName}>{item.country}</Text>
                        <Text style={styles.countryItemCode}>{item.code}</Text>
                      </TouchableOpacity>
                    )}
                    ItemSeparatorComponent={() => <View style={styles.countryItemSeparator} />}
                  />
                </SafeAreaView>
              </Modal>
            </View>

            <TouchableOpacity
              style={styles.consentRow}
              onPress={() => setConsentChecked(!consentChecked)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, consentChecked && styles.checkboxChecked]}>
                {consentChecked && (
                  <Ionicons name="checkmark" size={14} color={colors.text.inverse} />
                )}
              </View>
              <Text style={styles.consentText}>
                By clicking "Continue", you consent to the processing of your personal data.
              </Text>
            </TouchableOpacity>
          </View>

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
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
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
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  required: {
    color: colors.primary.main,
  },
  input: {
    height: layout.input.height,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    backgroundColor: colors.background.default,
  },
  inputText: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  placeholderText: {
    ...textStyles.body,
    color: colors.text.tertiary,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    height: layout.input.height,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  flag: {
    fontSize: 20,
  },
  codeText: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  phoneInput: {
    flex: 1,
    height: layout.input.height,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    ...textStyles.body,
    color: colors.text.primary,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  consentText: {
    flex: 1,
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  footer: {
    marginTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  button: {
    height: layout.button.height,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    ...textStyles.button,
    color: colors.text.inverse,
  },
  // Country Picker Modal Styles
  countryModalContainer: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  countryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  countryModalTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  countrySearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.base,
    paddingHorizontal: spacing.md,
    height: layout.input.height,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.default,
    gap: spacing.sm,
  },
  countrySearchInput: {
    flex: 1,
    ...textStyles.body,
    color: colors.text.primary,
    padding: 0,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  countryItemSelected: {
    backgroundColor: colors.primary.light + '20',
  },
  countryItemFlag: {
    fontSize: 24,
  },
  countryItemName: {
    flex: 1,
    ...textStyles.body,
    color: colors.text.primary,
  },
  countryItemCode: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  countryItemSeparator: {
    height: 1,
    backgroundColor: colors.border.default,
    marginHorizontal: spacing.base,
  },
});
