import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

interface Props {
    navigation: WelcomeScreenNavigationProp;
}

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Logo or Illustration */}
                <View style={styles.illustrationContainer}>
                    <Image
                        source={require('../../../assets/icon.png')} // Fallback to icon for now
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* Text Content */}
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Welcome to AGC</Text>
                    <Text style={styles.subtitle}>
                        Master new skills with our top-rated courses and expert mentors.
                    </Text>
                </View>

                {/* Actions */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate('EmailInput')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.primaryButtonText}>Get Started</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    content: {
        flex: 1,
        padding: spacing.xl,
        justifyContent: 'space-between',
        paddingBottom: spacing.huge,
    },
    illustrationContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 120,
        height: 120,
    },
    textContainer: {
        marginBottom: spacing.xxl,
        alignItems: 'center',
    },
    title: {
        ...textStyles.h1,
        textAlign: 'center',
        marginBottom: spacing.sm,
        color: colors.text.primary,
    },
    subtitle: {
        ...textStyles.bodyLarge,
        textAlign: 'center',
        color: colors.text.secondary,
    },
    actionContainer: {
        gap: spacing.md,
    },
    primaryButton: {
        backgroundColor: colors.primary.main,
        height: 48,
        borderRadius: borderRadius.md, // 12px
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        ...textStyles.button,
        color: colors.text.inverse,
    },
});
