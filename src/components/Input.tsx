import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, textStyles } from '../theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  containerStyle,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const inputStyle = [
    styles.input,
    isFocused && styles.inputFocused,
    error && styles.inputError,
    style,
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TextInput
        style={inputStyle}
        placeholderTextColor={colors.neutral[500]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />

      {error && <Text style={styles.error}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  label: {
    ...textStyles.bodySemiBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    ...textStyles.body,
    color: colors.text.primary,
    backgroundColor: colors.background.default,
  },
  inputFocused: {
    borderColor: colors.primary.main,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    ...textStyles.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helperText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});
