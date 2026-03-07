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

// Full list of countries with their codes
const COUNTRY_CODES = [
  { code: '+93', country: 'Afghanistan', flag: '🇦🇫', countryCode: 'AF' },
  { code: '+355', country: 'Albania', flag: '🇦🇱', countryCode: 'AL' },
  { code: '+213', country: 'Algeria', flag: '🇩🇿', countryCode: 'DZ' },
  { code: '+376', country: 'Andorra', flag: '🇦🇩', countryCode: 'AD' },
  { code: '+244', country: 'Angola', flag: '🇦🇴', countryCode: 'AO' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷', countryCode: 'AR' },
  { code: '+374', country: 'Armenia', flag: '🇦🇲', countryCode: 'AM' },
  { code: '+61', country: 'Australia', flag: '🇦🇺', countryCode: 'AU' },
  { code: '+43', country: 'Austria', flag: '🇦🇹', countryCode: 'AT' },
  { code: '+994', country: 'Azerbaijan', flag: '🇦🇿', countryCode: 'AZ' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭', countryCode: 'BH' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩', countryCode: 'BD' },
  { code: '+375', country: 'Belarus', flag: '🇧🇾', countryCode: 'BY' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪', countryCode: 'BE' },
  { code: '+501', country: 'Belize', flag: '🇧🇿', countryCode: 'BZ' },
  { code: '+229', country: 'Benin', flag: '🇧🇯', countryCode: 'BJ' },
  { code: '+975', country: 'Bhutan', flag: '🇧🇹', countryCode: 'BT' },
  { code: '+591', country: 'Bolivia', flag: '🇧🇴', countryCode: 'BO' },
  { code: '+387', country: 'Bosnia and Herzegovina', flag: '🇧🇦', countryCode: 'BA' },
  { code: '+267', country: 'Botswana', flag: '🇧🇼', countryCode: 'BW' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷', countryCode: 'BR' },
  { code: '+673', country: 'Brunei', flag: '🇧🇳', countryCode: 'BN' },
  { code: '+359', country: 'Bulgaria', flag: '🇧🇬', countryCode: 'BG' },
  { code: '+855', country: 'Cambodia', flag: '🇰🇭', countryCode: 'KH' },
  { code: '+237', country: 'Cameroon', flag: '🇨🇲', countryCode: 'CM' },
  { code: '+1', country: 'Canada', flag: '🇨🇦', countryCode: 'CA' },
  { code: '+56', country: 'Chile', flag: '🇨🇱', countryCode: 'CL' },
  { code: '+86', country: 'China', flag: '🇨🇳', countryCode: 'CN' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴', countryCode: 'CO' },
  { code: '+506', country: 'Costa Rica', flag: '🇨🇷', countryCode: 'CR' },
  { code: '+385', country: 'Croatia', flag: '🇭🇷', countryCode: 'HR' },
  { code: '+53', country: 'Cuba', flag: '🇨🇺', countryCode: 'CU' },
  { code: '+357', country: 'Cyprus', flag: '🇨🇾', countryCode: 'CY' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿', countryCode: 'CZ' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰', countryCode: 'DK' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨', countryCode: 'EC' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬', countryCode: 'EG' },
  { code: '+372', country: 'Estonia', flag: '🇪🇪', countryCode: 'EE' },
  { code: '+251', country: 'Ethiopia', flag: '🇪🇹', countryCode: 'ET' },
  { code: '+358', country: 'Finland', flag: '🇫🇮', countryCode: 'FI' },
  { code: '+33', country: 'France', flag: '🇫🇷', countryCode: 'FR' },
  { code: '+995', country: 'Georgia', flag: '🇬🇪', countryCode: 'GE' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', countryCode: 'DE' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭', countryCode: 'GH' },
  { code: '+30', country: 'Greece', flag: '🇬🇷', countryCode: 'GR' },
  { code: '+502', country: 'Guatemala', flag: '🇬🇹', countryCode: 'GT' },
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰', countryCode: 'HK' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺', countryCode: 'HU' },
  { code: '+354', country: 'Iceland', flag: '🇮🇸', countryCode: 'IS' },
  { code: '+91', country: 'India', flag: '🇮🇳', countryCode: 'IN' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩', countryCode: 'ID' },
  { code: '+98', country: 'Iran', flag: '🇮🇷', countryCode: 'IR' },
  { code: '+964', country: 'Iraq', flag: '🇮🇶', countryCode: 'IQ' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪', countryCode: 'IE' },
  { code: '+972', country: 'Israel', flag: '🇮🇱', countryCode: 'IL' },
  { code: '+39', country: 'Italy', flag: '🇮🇹', countryCode: 'IT' },
  { code: '+81', country: 'Japan', flag: '🇯🇵', countryCode: 'JP' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴', countryCode: 'JO' },
  { code: '+7', country: 'Kazakhstan', flag: '🇰🇿', countryCode: 'KZ' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪', countryCode: 'KE' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼', countryCode: 'KW' },
  { code: '+996', country: 'Kyrgyzstan', flag: '🇰🇬', countryCode: 'KG' },
  { code: '+856', country: 'Laos', flag: '🇱🇦', countryCode: 'LA' },
  { code: '+371', country: 'Latvia', flag: '🇱🇻', countryCode: 'LV' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧', countryCode: 'LB' },
  { code: '+370', country: 'Lithuania', flag: '🇱🇹', countryCode: 'LT' },
  { code: '+352', country: 'Luxembourg', flag: '🇱🇺', countryCode: 'LU' },
  { code: '+853', country: 'Macau', flag: '🇲🇴', countryCode: 'MO' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾', countryCode: 'MY' },
  { code: '+960', country: 'Maldives', flag: '🇲🇻', countryCode: 'MV' },
  { code: '+356', country: 'Malta', flag: '🇲🇹', countryCode: 'MT' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽', countryCode: 'MX' },
  { code: '+373', country: 'Moldova', flag: '🇲🇩', countryCode: 'MD' },
  { code: '+377', country: 'Monaco', flag: '🇲🇨', countryCode: 'MC' },
  { code: '+976', country: 'Mongolia', flag: '🇲🇳', countryCode: 'MN' },
  { code: '+382', country: 'Montenegro', flag: '🇲🇪', countryCode: 'ME' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦', countryCode: 'MA' },
  { code: '+95', country: 'Myanmar', flag: '🇲🇲', countryCode: 'MM' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵', countryCode: 'NP' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱', countryCode: 'NL' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿', countryCode: 'NZ' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬', countryCode: 'NG' },
  { code: '+850', country: 'North Korea', flag: '🇰🇵', countryCode: 'KP' },
  { code: '+389', country: 'North Macedonia', flag: '🇲🇰', countryCode: 'MK' },
  { code: '+47', country: 'Norway', flag: '🇳🇴', countryCode: 'NO' },
  { code: '+968', country: 'Oman', flag: '🇴🇲', countryCode: 'OM' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰', countryCode: 'PK' },
  { code: '+507', country: 'Panama', flag: '🇵🇦', countryCode: 'PA' },
  { code: '+51', country: 'Peru', flag: '🇵🇪', countryCode: 'PE' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭', countryCode: 'PH' },
  { code: '+48', country: 'Poland', flag: '🇵🇱', countryCode: 'PL' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹', countryCode: 'PT' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', countryCode: 'QA' },
  { code: '+40', country: 'Romania', flag: '🇷🇴', countryCode: 'RO' },
  { code: '+7', country: 'Russia', flag: '🇷🇺', countryCode: 'RU' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', countryCode: 'SA' },
  { code: '+381', country: 'Serbia', flag: '🇷🇸', countryCode: 'RS' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', countryCode: 'SG' },
  { code: '+421', country: 'Slovakia', flag: '🇸🇰', countryCode: 'SK' },
  { code: '+386', country: 'Slovenia', flag: '🇸🇮', countryCode: 'SI' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦', countryCode: 'ZA' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷', countryCode: 'KR' },
  { code: '+34', country: 'Spain', flag: '🇪🇸', countryCode: 'ES' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', countryCode: 'LK' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪', countryCode: 'SE' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭', countryCode: 'CH' },
  { code: '+886', country: 'Taiwan', flag: '🇹🇼', countryCode: 'TW' },
  { code: '+992', country: 'Tajikistan', flag: '🇹🇯', countryCode: 'TJ' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿', countryCode: 'TZ' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭', countryCode: 'TH' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷', countryCode: 'TR' },
  { code: '+993', country: 'Turkmenistan', flag: '🇹🇲', countryCode: 'TM' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬', countryCode: 'UG' },
  { code: '+380', country: 'Ukraine', flag: '🇺🇦', countryCode: 'UA' },
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪', countryCode: 'AE' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', countryCode: 'GB' },
  { code: '+1', country: 'United States', flag: '🇺🇸', countryCode: 'US' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾', countryCode: 'UY' },
  { code: '+998', country: 'Uzbekistan', flag: '🇺🇿', countryCode: 'UZ' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪', countryCode: 'VE' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳', countryCode: 'VN' },
  { code: '+967', country: 'Yemen', flag: '🇾🇪', countryCode: 'YE' },
  { code: '+260', country: 'Zambia', flag: '🇿🇲', countryCode: 'ZM' },
  { code: '+263', country: 'Zimbabwe', flag: '🇿🇼', countryCode: 'ZW' },
].sort((a, b) => a.country.localeCompare(b.country));

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
      (c) => c.country.toLowerCase().includes(search) || c.code.includes(search)
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
      const profileData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        date_of_birth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : null,
        phone_number: phoneNumber.trim()
          ? `${COUNTRY_CODES[selectedCountryIndex].code}${phoneNumber.trim()}`
          : null,
      };
      logger.info('📤 Sending profile data:', JSON.stringify(profileData, null, 2));

      try {
        // Try to fetch existing profile first
        const existingProfile = await profileService.getMyProfile();
        logger.info('Profile already exists, updating instead of creating.');
        await profileService.updateProfile(existingProfile.id, profileData);
      } catch (profileError: any) {
        if (profileError.response?.status === 404) {
          logger.info('Profile not found, creating new profile...');
          await profileService.createProfile(profileData);
        } else {
          throw profileError; // Rethrow if it's not a 404
        }
      }

      await refreshUser();
      // Navigation handled by AuthContext - user becomes authenticated with profile
    } catch (error: any) {
      logger.error('Create profile error:', error);
      logger.error('Error response:', error.response);
      logger.error('Error response data:', error.response?.data);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to complete registration. Please try again.'
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
                Phone number <Text style={styles.optional}>(optional)</Text>
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
                    <TouchableOpacity
                      onPress={() => {
                        setShowCountryPicker(false);
                        setCountrySearch('');
                      }}
                    >
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
                          styles.countryItemSelected,
                        ]}
                        onPress={() => {
                          const originalIndex = COUNTRY_CODES.findIndex(
                            (c) => c.countryCode === item.countryCode
                          );
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

            <View style={styles.consentRow}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setConsentChecked(!consentChecked)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, consentChecked && styles.checkboxChecked]}>
                  {consentChecked && (
                    <Ionicons name="checkmark" size={14} color={colors.text.inverse} />
                  )}
                </View>
              </TouchableOpacity>
              <Text style={styles.consentText}>
                I agree to the{' '}
                <Text
                  style={styles.linkText}
                  onPress={() => navigation.getParent()?.navigate('Terms')}
                >
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text
                  style={styles.linkText}
                  onPress={() => navigation.getParent()?.navigate('Privacy')}
                >
                  Privacy Policy
                </Text>
              </Text>
            </View>
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
  optional: {
    color: colors.text.tertiary,
    fontWeight: '400',
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
  checkboxContainer: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  consentText: {
    flex: 1,
    ...textStyles.caption,
    color: colors.text.secondary,
    lineHeight: 20,
    marginTop: 2,
  },
  linkText: {
    color: colors.primary.main,
    textDecorationLine: 'underline',
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
