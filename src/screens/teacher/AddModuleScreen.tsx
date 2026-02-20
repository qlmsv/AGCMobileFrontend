import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { courseService } from '../../services/courseService';
import { logger } from '../../utils/logger';

type NavigationProp = StackNavigationProp<RootStackParamList>;

// Tier-based pricing configuration
const TIER_PRICES = [
  { value: '10', label: '$10', tier: 'tier1', userPays: '$12.99' },
  { value: '25', label: '$25', tier: 'tier2', userPays: '$32.99' },
  { value: '100', label: '$100', tier: 'tier3', userPays: '$129.99' },
  { value: '200', label: '$200', tier: 'tier4', userPays: '$259.99' },
  { value: '300', label: '$300', tier: 'tier5', userPays: '$389.99' },
];

export const AddModuleScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const courseId = route.params?.courseId;
  const existingModulesCount = route.params?.modulesCount || 0;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState('10'); // Default to first tier
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateModule = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a module title');
      return;
    }

    setIsLoading(true);
    try {
      const moduleData: any = {
        course: courseId,
        title: title.trim(),
        description: description.trim(),
        position: existingModulesCount + 1,
        is_free: isFree,
      };

      if (!isFree && price) {
        moduleData.price = price;
      }

      logger.info('Creating module with data:', JSON.stringify(moduleData));

      await courseService.createModule(moduleData);

      Alert.alert('Success!', 'Module created successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      logger.error('Failed to create module', error);
      const errorMessage =
        error.response?.data?.detail || error.response?.data?.message || 'Failed to create module';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Module</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Module Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter module title"
            placeholderTextColor={colors.text.tertiary}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe this module"
            placeholderTextColor={colors.text.tertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Pricing</Text>
          <View style={styles.priceRow}>
            <TouchableOpacity
              style={[styles.priceToggle, isFree && styles.priceToggleActive]}
              onPress={() => setIsFree(true)}
            >
              <Text style={[styles.priceToggleText, isFree && styles.priceToggleTextActive]}>
                Free
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.priceToggle, !isFree && styles.priceToggleActive]}
              onPress={() => setIsFree(false)}
            >
              <Text style={[styles.priceToggleText, !isFree && styles.priceToggleTextActive]}>
                Paid
              </Text>
            </TouchableOpacity>
          </View>
          {!isFree && (
            <View style={styles.tierSelector}>
              <Text style={styles.label}>Select Price</Text>
              {TIER_PRICES.map((tier) => (
                <TouchableOpacity
                  key={tier.value}
                  style={[styles.tierOption, price === tier.value && styles.tierOptionSelected]}
                  onPress={() => setPrice(tier.value)}
                >
                  <View style={styles.tierOptionContent}>
                    <View style={styles.radioButton}>
                      {price === tier.value && <View style={styles.radioButtonInner} />}
                    </View>
                    <View style={styles.tierInfo}>
                      <Text style={styles.tierLabel}>{tier.label}</Text>
                      <Text style={styles.tierHint}>Users pay: {tier.userPays}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.hint}>
            After creating the module, you can add lessons to it from the course detail page.
          </Text>
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={handleCreateModule}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.text.inverse} />
            ) : (
              <Text style={styles.primaryButtonText}>Create Module</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  label: {
    ...textStyles.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...textStyles.body,
    color: colors.text.primary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  priceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  priceToggle: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
  },
  priceToggleActive: {
    backgroundColor: colors.primary.main,
  },
  priceToggleText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  priceToggleTextActive: {
    color: colors.text.inverse,
  },
  hint: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  bottomButtons: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  button: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary.main,
  },
  primaryButtonText: {
    ...textStyles.body,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  // Tier selector styles
  tierSelector: {
    gap: spacing.sm,
  },
  tierOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card,
  },
  tierOptionSelected: {
    borderColor: colors.primary.main,
    borderWidth: 2,
    backgroundColor: colors.primary.light + '10',
  },
  tierOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary.main,
  },
  tierInfo: {
    flex: 1,
  },
  tierLabel: {
    ...textStyles.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  tierHint: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: 2,
  },
});
