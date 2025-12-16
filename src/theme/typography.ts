// Typography system extracted from Figma design
export const typography = {
  // Font families
  fonts: {
    primary: 'Rubik',
    secondary: 'Montserrat',
    system: 'System',
  },

  // Font sizes
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 17,
    xl: 24,
    xxl: 32,
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
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// Common text styles from Figma
export const textStyles = {
  h1: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    lineHeight: typography.sizes.xl * typography.lineHeights.tight,
  },
  h2: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.sizes.lg * typography.lineHeights.tight,
  },
  h3: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.sizes.md * typography.lineHeights.normal,
  },
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
  caption: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
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
