// Spacing system - Pixel-perfect match with Figma V2
// Base grid: 4px

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,   // Standard padding
  lg: 20,
  xl: 24,
  xxl: 32,
  huge: 48,
} as const;

// Border radius values (updated from Figma V2)
export const borderRadius = {
  xs: 4,
  sm: 8,      // Inputs, small cards
  md: 12,     // Buttons, Cards, Modals
  lg: 16,     // Larger cards
  xl: 20,
  xxl: 24,
  round: 9999,
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
  // Component sizes
  input: {
    height: 48,
    borderRadius: 8,
  },
  button: {
    height: 48,
    borderRadius: 12,  // Rounded rect, not capsule
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
} as const;

// Shadow styles (Figma V2 style - soft shadows)
export const shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Layout = typeof layout;
export type Shadows = typeof shadows;
