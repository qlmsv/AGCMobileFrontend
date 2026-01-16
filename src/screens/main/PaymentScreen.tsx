import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing, textStyles } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { logger } from '../../utils/logger';

export const PaymentScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { url } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [hasHandledResult, setHasHandledResult] = useState(false);

  const handleNavigationStateChange = (navState: any) => {
    // Prevent handling the same result multiple times
    if (hasHandledResult) return;

    const currentUrl = navState.url?.toLowerCase() || '';

    // Detect Stripe success redirect
    if (
      currentUrl.includes('success') ||
      currentUrl.includes('payment_success') ||
      currentUrl.includes('checkout/success')
    ) {
      setHasHandledResult(true);
      logger.info('Payment successful, URL:', currentUrl);
      Alert.alert(
        'Payment Successful!',
        'Your enrollment has been completed. You can now access the course.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }

    // Detect Stripe cancel redirect
    if (
      currentUrl.includes('cancel') ||
      currentUrl.includes('payment_cancel') ||
      currentUrl.includes('checkout/cancel')
    ) {
      setHasHandledResult(true);
      logger.info('Payment cancelled, URL:', currentUrl);
      Alert.alert('Payment Cancelled', 'Your payment was not completed. You can try again later.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Payment</Text>
      </View>

      <View style={styles.webviewContainer}>
        <WebView
          source={{ uri: url }}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onNavigationStateChange={handleNavigationStateChange}
          style={styles.webview}
        />
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary.main} />
          </View>
        )}
      </View>
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
  closeButton: {
    marginRight: spacing.md,
  },
  title: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  webviewContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.card,
  },
});
