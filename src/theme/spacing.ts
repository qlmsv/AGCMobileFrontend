// Spacing system - Pixel-perfect match with Figma Foundation/Spacing
// Based on 4px grid system

export const spacing = {
  xs: 4,      // XS
  sm: 8,      // S
  md: 12,     // M
  base: 16,   // L - Standard horizontal padding
  lg: 20,     // XL
  xl: 24,     // 2XL - Section spacing
  xxl: 32,    // 3XL
  xxxl: 40,
  huge: 48,
} as const;

// Border radius values (from Figma)
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,     // Course cards
  lg: 16,
  xl: 20,
  xxl: 22,    // Search bar (44px height / 2)
  huge: 24,   // Buttons capsule (48px height / 2)
  round: 1000,
} as const;

// Common spacing patterns
export const layout = {
  padding: {
    screen: spacing.base,   // 16px
    card: spacing.md,       // 12px
    section: spacing.xl,    // 24px
  },
  gap: {
    xs: spacing.xs,   // 4px
    sm: spacing.sm,   // 8px
    md: spacing.md,   // 12px
    lg: spacing.base, // 16px
  },
  // Component sizes (from Figma)
  input: {
    height: 44,        // Search bar height
    heightLarge: 48,   // Primary button height
  },
  button: {
    height: 48,        // Primary buttons
    minWidth: 100,
    borderRadius: 24,  // Capsule shape (height / 2)
  },
  iconButton: {
    width: 40,
    height: 40,
  },
  avatar: {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  },
  card: {
    borderRadius: 12,
  },
  searchBar: {
    height: 44,
    borderRadius: 22,
  },
} as const;

// Shadow styles (from Figma)
export const shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Layout = typeof layout;
export type Shadows = typeof shadows;
