// Design system colors - Pixel-perfect match with Figma V2 (Orange #FF5A05)
export const colors = {
  // Primary (Orange)
  primary: {
    main: '#FF5A05',      // New Primary - Figma V2
    dark: '#E04F04',      // Hover/Active
    light: '#FF8B53',     // Secondary/Disabled
  },

  // Brand extended
  brand: {
    50: '#FFF2EB',
    100: '#FFE5D6',
    400: '#FF8B53',
    main: '#FF5A05',
    600: '#E04F04',
  },

  // Neutrals (from Figma Foundation/Colors)
  neutral: {
    white: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',        // Screen background / Section bg
    200: '#E2E2E2',        // Borders, Dividers, Input borders
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',        // Secondary text
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#222222',        // Primary text
    black: '#000000',
  },

  // Semantic colors
  background: {
    default: '#FFFFFF',
    base: '#F8F8F8',       // Main background
    secondary: '#F5F5F5',  // Section background
    tertiary: '#FAFAFA',
    card: '#FFFFFF',
  },

  text: {
    primary: '#222222',    // Neutral 900
    secondary: '#666666',  // Neutral 500-600 range
    tertiary: '#A3A3A3',   // Neutral 400
    disabled: '#D4D4D4',
    inverse: '#FFFFFF',
    placeholder: '#A3A3A3',
    link: '#FF5A05',
  },

  border: {
    light: '#F5F5F5',
    default: '#E2E2E2',    // Input borders, dividers
    dark: '#A3A3A3',
  },

  // Status colors
  success: '#22C55E',    // Green
  error: '#EF4444',      // Red
  warning: '#F59E0B',    // Amber
  info: '#3B82F6',       // Blue

  // Overlay colors
  overlay: {
    dark: 'rgba(0, 0, 0, 0.4)',
    medium: 'rgba(0, 0, 0, 0.5)',
    light: 'rgba(255, 255, 255, 0.5)',
  },
} as const;

export type Colors = typeof colors;
