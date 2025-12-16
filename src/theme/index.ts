import { colors } from './colors';
import { typography, textStyles } from './typography';
import { spacing, borderRadius, layout, shadows } from './spacing';

export const theme = {
  colors,
  typography,
  textStyles,
  spacing,
  borderRadius,
  layout,
  shadows,
} as const;

export type Theme = typeof theme;

// Re-export for convenience
export { colors, typography, textStyles, spacing, borderRadius, layout, shadows };
