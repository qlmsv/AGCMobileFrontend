// Typography system - Pixel-perfect match with Figma Foundation/Typography
// Font: Inter (or system San Francisco on iOS)

export const typography = {
  // Font families
  fonts: {
    primary: 'Inter',
    secondary: 'Inter',
    system: 'System',
  },

  // Font sizes (from Figma)
  sizes: {
    xs: 10,
    sm: 12,     // Caption
    base: 14,   // Body Medium
    md: 16,     // Body Large
    lg: 20,     // H3
    xl: 24,     // H2
    xxl: 32,    // H1/Title
  },

  // Font weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },

  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

// Common text styles from Figma
export const textStyles = {
  // Title/H1: 32px, SemiBold
  h1: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.sizes.xxl * typography.lineHeights.tight,
  },
  // H2: 24px, SemiBold
  h2: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.sizes.xl * typography.lineHeights.tight,
  },
  // H3: 20px, Medium
  h3: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    lineHeight: typography.sizes.lg * typography.lineHeights.normal,
  },
  // H4: 16px, SemiBold
  h4: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.sizes.md * typography.lineHeights.tight,
  },
  // Body Large: 16px, Regular
  bodyLarge: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    lineHeight: typography.sizes.md * typography.lineHeights.normal,
  },
  // Body Medium: 14px, Regular (default text)
  body: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.regular,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
  },
  bodyMedium: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
  },
  bodySemiBold: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
  },
  // Caption: 12px, Regular
  caption: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  // Button text: 16px, SemiBold
  button: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.sizes.md * typography.lineHeights.tight,
  },
  label: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.sizes.xs * typography.lineHeights.normal,
  },
} as const;

export type Typography = typeof typography;
export type TextStyles = typeof textStyles;
