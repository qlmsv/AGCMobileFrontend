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
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { getUserFriendlyError } from '../../utils/errorHandler';

type CompleteRegistrationNavigationProp = StackNavigationProp<RootStackParamList, 'CompleteRegistration'>;
type CompleteRegistrationRouteProp = RouteProp<RootStackParamList, 'CompleteRegistration'>;

interface CompleteRegistrationScreenProps {
    navigation: CompleteRegistrationNavigationProp;
    route: CompleteRegistrationRouteProp;
}

export const CompleteRegistrationScreen: React.FC<CompleteRegistrationScreenProps> = ({ navigation, route }) => {
    const { email } = route.params;
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { updateProfile } = useAuth();

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDateOfBirth(selectedDate);
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const handleComplete = async () => {
        // Validation
        if (!firstName.trim()) {
            Alert.alert('Required Field', 'Please enter your first name');
            return;
        }

        if (!lastName.trim()) {
            Alert.alert('Required Field', 'Please enter your last name');
            return;
        }

        if (!dateOfBirth) {
            Alert.alert('Required Field', 'Please select your date of birth');
            return;
        }

        setIsLoading(true);
        try {
            await updateProfile({
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                date_of_birth: dateOfBirth.toISOString().split('T')[0], // Format: YYYY-MM-DD
            });
            // Navigation will be handled automatically by RootNavigator when profile is updated
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
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color={colors.neutral[700]} />
                        </TouchableOpacity>

                        <View style={styles.contentContainer}>
                            <View style={styles.header}>
                                <Text style={styles.title}>Complete registration</Text>
                                <Text style={styles.subtitle}>
                                    Please fill in your personal information to complete the registration.
                                </Text>
                            </View>

                            <View style={styles.form}>
                                <View style={styles.inputContainer}>
                                    <View style={styles.labelContainer}>
                                        <Text style={styles.label}>Name</Text>
                                        <Text style={styles.required}>*</Text>
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="John"
                                        placeholderTextColor={colors.neutral[400]}
                                        autoCapitalize="words"
                                        autoComplete="name-given"
                                        autoCorrect={false}
                                        value={firstName}
                                        onChangeText={setFirstName}
                                        editable={!isLoading}
                                        returnKeyType="next"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <View style={styles.labelContainer}>
                                        <Text style={styles.label}>Surname</Text>
                                        <Text style={styles.required}>*</Text>
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Doe"
                                        placeholderTextColor={colors.neutral[400]}
                                        autoCapitalize="words"
                                        autoComplete="name-family"
                                        autoCorrect={false}
                                        value={lastName}
                                        onChangeText={setLastName}
                                        editable={!isLoading}
                                        returnKeyType="next"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <View style={styles.labelContainer}>
                                        <Text style={styles.label}>Date of birth</Text>
                                        <Text style={styles.required}>*</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.dateInput}
                                        onPress={() => setShowDatePicker(true)}
                                        disabled={isLoading}
                                    >
                                        <Text
                                            style={[
                                                styles.dateText,
                                                !dateOfBirth && styles.datePlaceholder,
                                            ]}
                                        >
                                            {dateOfBirth ? formatDate(dateOfBirth) : 'DD.MM.YYYY'}
                                        </Text>
                                        <Ionicons name="calendar-outline" size={20} color={colors.neutral[400]} />
                                    </TouchableOpacity>
                                </View>

                                {showDatePicker && (
                                    <DateTimePicker
                                        value={dateOfBirth || new Date()}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={handleDateChange}
                                        maximumDate={new Date()}
                                        minimumDate={new Date(1900, 0, 1)}
                                    />
                                )}

                                <TouchableOpacity
                                    style={[styles.button, isLoading && styles.buttonDisabled]}
                                    onPress={handleComplete}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color={colors.neutral.white} />
                                    ) : (
                                        <Text style={styles.buttonText}>Complete</Text>
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
        backgroundColor: colors.background.base,
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
    form: {
        width: '100%',
        gap: 24,
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
        fontFamily: 'Rubik',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 16,
        color: colors.neutral[900],
    },
    required: {
        fontFamily: 'Rubik',
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 16,
        color: '#DC2626',
    },
    input: {
        height: 48,
        borderRadius: 1000,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        fontWeight: '400',
        color: colors.neutral[900],
        backgroundColor: colors.background.default,
        shadowColor: 'rgba(207, 207, 207, 0.5)',
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    dateInput: {
        height: 48,
        borderRadius: 1000,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.background.default,
        shadowColor: 'rgba(207, 207, 207, 0.5)',
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateText: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.neutral[900],
    },
    datePlaceholder: {
        color: colors.neutral[400],
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
