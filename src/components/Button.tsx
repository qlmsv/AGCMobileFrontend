import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, borderRadius, textStyles } from '../theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.neutral.white : colors.primary.main}
        />
      ) : (
        <Text style={textStyleCombined}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },

  // Variants
  primary: {
    backgroundColor: colors.primary.main,
  },
  secondary: {
    backgroundColor: colors.background.default,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  text: {
    backgroundColor: 'transparent',
  },

  // Sizes
  small: {
    height: 40,
    paddingHorizontal: spacing.base,
  },
  medium: {
    height: 56,
    paddingHorizontal: spacing.xl,
  },
  large: {
    height: 64,
    paddingHorizontal: spacing.xxl,
  },

  // Text styles
  primaryText: {
    ...textStyles.bodySemiBold,
    color: colors.neutral.white,
  },
  secondaryText: {
    ...textStyles.bodySemiBold,
    color: colors.text.primary,
  },
  textText: {
    ...textStyles.bodySemiBold,
    color: colors.primary.main,
  },

  smallText: {
    ...textStyles.bodyMedium,
  },
  mediumText: {
    ...textStyles.bodySemiBold,
  },
  largeText: {
    ...textStyles.h3,
  },

  // State
  disabled: {
    opacity: 0.6,
  },
});
