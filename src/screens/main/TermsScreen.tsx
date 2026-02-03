import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, textStyles } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const TermsScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last updated: January 2026</Text>

        <Text style={styles.paragraph}>
          These Terms of Service ("Terms") govern your use of the THE APEX SERIES PTE. LTD (UEN:
          202230230W) mobile application and related services. By accessing or using the App, you
          agree to be bound by these Terms.
        </Text>

        <Text style={styles.sectionTitle}>1. Services</Text>
        <Text style={styles.paragraph}>
          The App provides access to online educational services, including class scheduling,
          payments, and participation in virtual sessions.
        </Text>

        <Text style={styles.sectionTitle}>2. User Accounts</Text>
        <Text style={styles.paragraph}>
          You are responsible for maintaining the confidentiality of your account credentials and
          all activities conducted under your account.
        </Text>

        <Text style={styles.sectionTitle}>3. Payments and Fees</Text>
        <Text style={styles.bulletPoint}>
          • Payments are required to access paid educational services.
        </Text>
        <Text style={styles.bulletPoint}>
          • All payments are processed via third-party payment providers.
        </Text>
        <Text style={styles.bulletPoint}>
          • Prices, billing cycles, and refund policies are displayed before purchase.
        </Text>

        <Text style={styles.sectionTitle}>4. Refund Policy</Text>
        <Text style={styles.paragraph}>
          Refund eligibility depends on the specific service purchased and is disclosed at the time
          of payment. The Company reserves the right to deny refunds where services have already
          been provided.
        </Text>

        <Text style={styles.sectionTitle}>5. Acceptable Use</Text>
        <Text style={styles.paragraph}>You agree not to:</Text>
        <Text style={styles.bulletPoint}>• Use the App for unlawful purposes</Text>
        <Text style={styles.bulletPoint}>• Share access credentials with others</Text>
        <Text style={styles.bulletPoint}>• Interfere with or disrupt the App or servers</Text>

        <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          All content, trademarks, and materials within the App are owned by or licensed to THE APEX
          SERIES PTE. LTD and may not be copied or redistributed without permission.
        </Text>

        <Text style={styles.sectionTitle}>7. Termination</Text>
        <Text style={styles.paragraph}>
          We may suspend or terminate access to the App at our discretion for violations of these
          Terms.
        </Text>

        <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          To the maximum extent permitted by law, THE APEX SERIES PTE. LTD shall not be liable for
          indirect or consequential damages arising from use of the App.
        </Text>

        <Text style={styles.sectionTitle}>9. Governing Law</Text>
        <Text style={styles.paragraph}>
          These Terms are governed by and construed in accordance with the laws applicable to the
          Company's jurisdiction of registration.
        </Text>

        <Text style={styles.sectionTitle}>10. Contact</Text>
        <Text style={styles.paragraph}>Company Name: THE APEX SERIES PTE. LTD</Text>
        <Text style={styles.paragraph}>UEN: 202230230W</Text>
        <Text style={styles.paragraph}>Email: keith@apexglobal.app</Text>

        <View style={styles.bottomPadding} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: spacing.base,
  },
  updated: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  paragraph: {
    ...textStyles.body,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  bulletPoint: {
    ...textStyles.body,
    color: colors.text.secondary,
    lineHeight: 22,
    marginLeft: spacing.md,
    marginBottom: spacing.xs,
  },
  bottomPadding: {
    height: 40,
  },
});
