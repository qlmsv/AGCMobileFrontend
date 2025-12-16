// Spacing system for consistent layout
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
} as const;

// Border radius values (matching Figma: radius-size-16, radius-size-60, radius-size-1000)
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 60,
  round: 1000,
} as const;

// Common spacing patterns
export const layout = {
  padding: {
    screen: spacing.base,
    card: spacing.base,
    section: spacing.xl,
  },
  gap: {
    xs: spacing.xs,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.base,
  },
  // Component sizes
  input: {
    height: 56,
    heightLarge: 72,
  },
  button: {
    height: 56,
    minWidth: 100,
  },
  iconButton: {
    width: 40,
    height: 40,
  },
  avatar: {
    small: 40,
    default: 56,
    large: 120,
  },
  badge: {
    minWidth: 20,
    height: 20,
    minWidthLarge: 24,
    heightLarge: 24,
  },
  banner: {
    width: 300,
    height: 160,
  },
  thumbnail: {
    width: 100,
    height: 100,
  },
  fab: {
    width: 56,
    height: 56,
  },
} as const;

// Shadow styles
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
} as const;

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
