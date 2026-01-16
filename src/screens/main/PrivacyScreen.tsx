import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, textStyles } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const PrivacyScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last updated: January 2026</Text>

        <Text style={styles.paragraph}>
          This Privacy Policy describes how THE APEX SERIES PTE. LTD (UEN: 202230230W) ("Company",
          "we", "us", or "our") collects, uses, and protects personal information when you use our
          mobile application and related services (the "App").
        </Text>
        <Text style={styles.paragraph}>
          By using the App, you agree to the collection and use of information in accordance with
          this Privacy Policy.
        </Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>

        <Text style={styles.subTitle}>1.1 Personal Information</Text>
        <Text style={styles.paragraph}>
          We may collect the following information when you register or use the App:
        </Text>
        <Text style={styles.bulletPoint}>• Full name</Text>
        <Text style={styles.bulletPoint}>• Email address</Text>
        <Text style={styles.bulletPoint}>• Phone number</Text>
        <Text style={styles.bulletPoint}>
          • Payment-related identifiers (processed by third-party payment providers)
        </Text>
        <Text style={styles.bulletPoint}>• Account login credentials</Text>

        <Text style={styles.subTitle}>1.2 Usage Data</Text>
        <Text style={styles.paragraph}>We may automatically collect:</Text>
        <Text style={styles.bulletPoint}>
          • Device information (model, operating system, app version)
        </Text>
        <Text style={styles.bulletPoint}>• IP address</Text>
        <Text style={styles.bulletPoint}>• App usage data (pages visited, features used)</Text>

        <Text style={styles.subTitle}>1.3 Payment Information</Text>
        <Text style={styles.paragraph}>
          All payments are processed by third-party payment providers (such as Stripe, Apple In-App
          Purchase, or other supported providers). We do not store or process full payment card
          details on our servers.
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>We use the collected information to:</Text>
        <Text style={styles.bulletPoint}>• Provide access to educational services</Text>
        <Text style={styles.bulletPoint}>• Process payments and subscriptions</Text>
        <Text style={styles.bulletPoint}>• Schedule and manage online classes</Text>
        <Text style={styles.bulletPoint}>
          • Communicate updates, reminders, and support messages
        </Text>
        <Text style={styles.bulletPoint}>• Improve app functionality and user experience</Text>
        <Text style={styles.bulletPoint}>• Comply with legal and regulatory obligations</Text>

        <Text style={styles.sectionTitle}>3. Sharing of Information</Text>
        <Text style={styles.paragraph}>We may share information only with:</Text>
        <Text style={styles.bulletPoint}>• Payment processors for transaction processing</Text>
        <Text style={styles.bulletPoint}>• Service providers that help operate the App</Text>
        <Text style={styles.bulletPoint}>• Legal authorities if required by law</Text>
        <Text style={styles.paragraph}>
          We do not sell or rent your personal data to third parties.
        </Text>

        <Text style={styles.sectionTitle}>4. Data Retention</Text>
        <Text style={styles.paragraph}>
          We retain personal data only for as long as necessary to provide our services and comply
          with legal obligations.
        </Text>

        <Text style={styles.sectionTitle}>5. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement reasonable administrative, technical, and physical safeguards to protect your
          data. However, no method of electronic transmission is 100% secure.
        </Text>

        <Text style={styles.sectionTitle}>6. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Our services are not intended for children under the age of 13. We do not knowingly
          collect personal information from children.
        </Text>

        <Text style={styles.sectionTitle}>7. Your Rights</Text>
        <Text style={styles.paragraph}>
          Depending on your jurisdiction, you may have the right to:
        </Text>
        <Text style={styles.bulletPoint}>• Access your personal data</Text>
        <Text style={styles.bulletPoint}>• Request correction or deletion</Text>
        <Text style={styles.bulletPoint}>• Withdraw consent</Text>
        <Text style={styles.paragraph}>Requests can be sent to our support contact.</Text>

        <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. Changes will be posted within the
          App.
        </Text>

        <Text style={styles.sectionTitle}>9. Contact Information</Text>
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
  subTitle: {
    ...textStyles.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
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
