import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Switch,
    Platform,
    KeyboardAvoidingView,
    SafeAreaView,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { colors, typography, spacing, borderRadius } from '../../theme';
import * as ImagePicker from 'expo-image-picker';

type CreateCourseScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateCourse'>;

export const CreateCourseScreen: React.FC = () => {
    const navigation = useNavigation<CreateCourseScreenNavigationProp>();

    // Form State
    const [coverUri, setCoverUri] = useState<string | null>(null);
    const [category, setCategory] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState('');
    const [startDate, setStartDate] = useState('');
    const [price, setPrice] = useState('');
    const [paymentLink, setPaymentLink] = useState('');
    const [isFree, setIsFree] = useState(false);
    const [hasCertificate, setHasCertificate] = useState(false);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setCoverUri(result.assets[0].uri);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create course</Text>
            <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="ellipsis-horizontal" size={24} color={colors.text.primary} />
            </TouchableOpacity>
        </View>
    );

    const renderInputLabel = (label: string, required: boolean = true, showEdit: boolean = false) => (
        <View style={styles.labelContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.labelText}>{label}</Text>
                {required && <Text style={styles.requiredStar}>*</Text>}
            </View>
            {showEdit && (
                <TouchableOpacity onPress={handlePickImage}>
                    <Text style={{
                        color: colors.primary.main,
                        fontSize: 14,
                        fontFamily: 'Rubik',
                        fontWeight: '500'
                    }}>edit</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            {renderHeader()}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Cover Image Upload */}
                    <View style={styles.formGroup}>
                        {renderInputLabel('Cover', true, !!coverUri)}
                        <TouchableOpacity
                            style={[styles.uploadContainer, coverUri ? styles.uploadContainerFilled : null]}
                            onPress={handlePickImage}
                        >
                            {coverUri ? (
                                <Image source={{ uri: coverUri }} style={styles.coverImage} resizeMode="cover" />
                            ) : (
                                <>
                                    <View style={styles.uploadIconContainer}>
                                        <Ionicons name="image-outline" size={32} color={colors.neutral[400]} />
                                    </View>
                                    <View style={styles.uploadTextContainer}>
                                        <Text style={styles.uploadTitle}>Click to upload</Text>
                                        <Text style={styles.uploadSubtitle}>PNG, JPG, GIF up to 5MB</Text>
                                    </View>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Category */}
                    <View style={styles.formGroup}>
                        {renderInputLabel('Choose category')}
                        <TouchableOpacity style={styles.dropdownInput}>
                            <Text style={category ? styles.inputText : styles.placeholderText}>
                                {category || 'business'}
                            </Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.text.placeholder} />
                        </TouchableOpacity>
                    </View>

                    {/* Course Name */}
                    <View style={styles.formGroup}>
                        {renderInputLabel('Name of the course')}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.inputText}
                                placeholder="Importance of soft skills"
                                placeholderTextColor={colors.text.placeholder}
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.formGroup}>
                        {renderInputLabel('Description')}
                        <View style={[styles.inputContainer, styles.textAreaContainer]}>
                            <TextInput
                                style={[styles.inputText, styles.textArea]}
                                placeholder="description of a course"
                                placeholderTextColor={colors.text.placeholder}
                                multiline
                                textAlignVertical="top"
                                value={description}
                                onChangeText={setDescription}
                                maxLength={360}
                            />
                            <Text style={styles.charCount}>{description.length}/360</Text>
                        </View>
                    </View>

                    {/* Duration */}
                    <View style={styles.formGroup}>
                        {renderInputLabel('Duration')}
                        <TouchableOpacity style={styles.dropdownInput}>
                            <Text style={duration ? styles.inputText : styles.placeholderText}>
                                {duration || '3 month'}
                            </Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.text.placeholder} />
                        </TouchableOpacity>
                    </View>

                    {/* Starting Date */}
                    <View style={styles.formGroup}>
                        {renderInputLabel('Starting date')}
                        <TouchableOpacity style={styles.dropdownInput}>
                            <Text style={startDate ? styles.inputText : styles.placeholderText}>
                                {startDate || '30 / 08 / 2001'}
                            </Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.text.placeholder} />
                        </TouchableOpacity>
                    </View>

                    {/* Price */}
                    <View style={styles.formGroup}>
                        {renderInputLabel('Price')}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.inputText}
                                placeholder="Enter amount"
                                placeholderTextColor={colors.text.placeholder}
                                keyboardType="numeric"
                                value={price}
                                onChangeText={setPrice}
                            />
                            <View style={styles.currencyContainer}>
                                <Text style={styles.currencyText}>USD</Text>
                                <Ionicons name="chevron-down" size={16} color={colors.text.placeholder} />
                            </View>
                        </View>
                    </View>

                    {/* Payment Link */}
                    <View style={styles.formGroup}>
                        {renderInputLabel('Payment link')}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.inputText}
                                placeholder="Insert link here"
                                placeholderTextColor={colors.text.placeholder}
                                autoCapitalize="none"
                                value={paymentLink}
                                onChangeText={setPaymentLink}
                            />
                        </View>
                    </View>

                    {/* Toggles Section */}
                    <View style={styles.togglesContainer}>
                        {/* Free Course Toggle */}
                        <View style={styles.toggleRow}>
                            <View style={styles.toggleLabelContainer}>
                                <View style={[styles.toggleIconWrapper]}>
                                    <Ionicons name="pricetag-outline" size={16} color={colors.text.primary} />
                                </View>
                                <Text style={styles.toggleText}>Free course</Text>
                            </View>
                            <Switch
                                trackColor={{ false: colors.neutral[200], true: colors.primary.light }}
                                thumbColor={isFree ? colors.primary.main : colors.neutral.white}
                                onValueChange={setIsFree}
                                value={isFree}
                            />
                        </View>

                        <View style={styles.divider} />

                        {/* Certificate Toggle */}
                        <View style={styles.toggleRow}>
                            <View style={styles.toggleLabelContainer}>
                                <View style={[styles.toggleIconWrapper]}>
                                    <Ionicons name="ribbon-outline" size={16} color={colors.text.primary} />
                                </View>
                                <Text style={styles.toggleText}>Certificate of completion</Text>
                            </View>
                            <Switch
                                trackColor={{ false: colors.neutral[200], true: colors.primary.light }}
                                thumbColor={hasCertificate ? colors.primary.main : colors.neutral.white}
                                onValueChange={setHasCertificate}
                                value={hasCertificate}
                            />
                        </View>
                    </View>

                    {/* Continue Button */}
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={() => navigation.navigate('CreateCourseModules')}
                    >
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background.base,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: colors.background.base,
    },
    iconButton: {
        width: 48,
        height: 48,
        borderRadius: 360,
        backgroundColor: colors.neutral.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#CFCFCF',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Rubik',
        color: colors.text.primary,
        lineHeight: 24,
    },
    formGroup: {
        marginBottom: 24,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    labelText: {
        fontSize: 14,
        fontWeight: '500',
        fontFamily: 'Rubik',
        color: colors.text.primary,
        lineHeight: 16,
    },
    requiredStar: {
        color: '#DC2626',
        marginLeft: 4,
        fontSize: 14,
        fontFamily: 'Rubik',
        lineHeight: 16,
    },
    uploadContainer: {
        padding: 20,
        backgroundColor: colors.neutral.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 140,
        shadowColor: '#CFCFCF',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
    },
    uploadContainerFilled: {
        padding: 0,
        overflow: 'hidden',
    },
    coverImage: {
        width: '100%',
        height: 200,
        borderRadius: 16,
    },
    uploadIconContainer: {
        marginBottom: 12,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadTextContainer: {
        alignItems: 'center',
        gap: 4,
    },
    uploadTitle: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Rubik',
        color: colors.text.placeholder,
        lineHeight: 20,
        textAlign: 'center',
    },
    uploadSubtitle: {
        fontSize: 12,
        fontWeight: '500',
        fontFamily: 'Rubik',
        color: colors.text.placeholder,
        lineHeight: 16,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral.white,
        borderRadius: 1000,
        paddingHorizontal: 12,
        paddingVertical: 12,
        shadowColor: '#CFCFCF',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
    },
    dropdownInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.neutral.white,
        borderRadius: 1000,
        paddingHorizontal: 12,
        paddingVertical: 12,
        shadowColor: '#CFCFCF',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
    },
    inputText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Rubik',
        fontWeight: '400',
        color: colors.text.primary,
        lineHeight: 16,
    },
    placeholderText: {
        fontSize: 14,
        fontFamily: 'Rubik',
        fontWeight: '400',
        color: colors.text.placeholder,
        lineHeight: 16,
    },
    textAreaContainer: {
        borderRadius: 16,
        alignItems: 'flex-start',
        height: 140,
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    textArea: {
        height: '100%',
        textAlignVertical: 'top',
    },
    charCount: {
        position: 'absolute',
        bottom: 12,
        right: 16,
        fontSize: 14,
        fontWeight: '400',
        color: colors.text.placeholder,
        fontFamily: 'Rubik',
        lineHeight: 16,
    },
    currencyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    currencyText: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.neutral[500],
        fontFamily: 'Rubik',
        lineHeight: 16,
    },
    togglesContainer: {
        backgroundColor: colors.neutral.white,
        borderRadius: 16,
        shadowColor: '#CFCFCF',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
        marginBottom: 24,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    toggleLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    toggleIconWrapper: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Rubik',
        color: colors.text.primary,
        lineHeight: 20,
    },
    divider: {
        height: 1,
        backgroundColor: colors.background.base,
        marginHorizontal: 0,
    },
    continueButton: {
        backgroundColor: colors.neutral[500],
        borderRadius: 1000,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    continueButtonText: {
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'Rubik',
        color: colors.background.base,
        lineHeight: 24,
        textAlign: 'center',
    },
});
