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
    ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, borderRadius, textStyles, layout } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { profileService } from '../../services/profileService';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';
import DateTimePicker from '@react-native-community/datetimepicker';

type NavigationProp = StackNavigationProp<AuthStackParamList, 'Information'>;
type RouteProps = RouteProp<AuthStackParamList, 'Information'>;

interface Props {
    navigation: NavigationProp;
    route: RouteProps;
}

export const InformationScreen: React.FC<Props> = ({ navigation, route }) => {
    const { email } = route.params;
    const { refreshUser } = useAuth();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [consentChecked, setConsentChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

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
            await profileService.createProfile({
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                date_of_birth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : null,
                phone_number: phoneNumber.trim() || null,
            });
            await refreshUser();
            // Navigation handled by AuthContext - user becomes authenticated with profile
        } catch (error: any) {
            logger.error('Create profile error:', error);
            Alert.alert('Error', error.response?.data?.detail || 'Failed to complete registration. Please try again.');
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
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoid}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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
                            <Text style={styles.label}>First name <Text style={styles.required}>*</Text></Text>
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
                            <Text style={styles.label}>Last name <Text style={styles.required}>*</Text></Text>
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
                            <Text style={styles.label}>Date of birth <Text style={styles.required}>*</Text></Text>
                            <TouchableOpacity
                                style={styles.input}
                                onPress={() => setShowDatePicker(true)}
                            >
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
                            <Text style={styles.label}>Phone number <Text style={styles.required}>*</Text></Text>
                            <View style={styles.phoneInputContainer}>
                                <View style={styles.countryCode}>
                                    <Text style={styles.flag}>🇸🇬</Text>
                                    <Text style={styles.codeText}>+65</Text>
                                </View>
                                <TextInput
                                    style={styles.phoneInput}
                                    placeholder="Phone number"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.consentRow}
                            onPress={() => setConsentChecked(!consentChecked)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.checkbox, consentChecked && styles.checkboxChecked]}>
                                {consentChecked && <Ionicons name="checkmark" size={14} color={colors.text.inverse} />}
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
});
