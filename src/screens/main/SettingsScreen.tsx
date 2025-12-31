import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, textStyles, borderRadius, layout } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const SettingsScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { logout } = useAuth();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('EditProfile')}>
                        <Text style={styles.itemText}>Edit Profile</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.item}>
                        <Text style={styles.itemText}>Change Password</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notifications</Text>
                    <View style={styles.item}>
                        <Text style={styles.itemText}>Push Notifications</Text>
                        <Ionicons name="toggle" size={24} color={colors.primary.main} />
                    </View>
                    <View style={styles.item}>
                        <Text style={styles.itemText}>Email Updates</Text>
                        <Ionicons name="toggle" size={24} color={colors.primary.main} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>More</Text>
                    <TouchableOpacity style={styles.item}>
                        <Text style={styles.itemText}>Privacy Policy</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.item}>
                        <Text style={styles.itemText}>Terms of Service</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.base,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    backButton: {
        marginRight: spacing.md,
    },
    headerTitle: {
        ...textStyles.h3,
        color: colors.text.primary,
    },
    content: {
        padding: spacing.base,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        ...textStyles.h4,
        color: colors.text.secondary,
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        backgroundColor: colors.background.default,
        marginBottom: 1,
        borderRadius: borderRadius.sm,
    },
    itemText: {
        ...textStyles.bodyLarge,
        color: colors.text.primary,
    },
});
