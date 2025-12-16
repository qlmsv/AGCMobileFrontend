// Design system colors extracted from Figma
export const colors = {
  // Primary/Brand colors
  primary: {
    main: '#FD4F01',
    light: '#FFEDE4',
    lighter: '#FFDCCB',
    dark: '#652000',
  },

  // Brand extended (from Figma)
  brand: {
    50: '#FFEDE4',
    400: '#FE7333',
    main: '#FD4F01',
  },

  // Neutral/Gray scale
  neutral: {
    white: '#FFFFFF',
    50: '#F8F8F8',
    100: '#F5F5F5',
    200: '#EFEFEF',
    300: '#D9D9D9',
    400: '#D4D4D4',
    500: '#A3A3A3',
    600: '#737373',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    black: '#000000',
  },

  // Semantic colors
  background: {
    default: '#FFFFFF',
    base: '#F8F8F8',
    secondary: '#F5F5F5',
    tertiary: '#F8F8F8',
  },

  accent: {
    peach: '#FFB999',
    peachSoft: '#FFE1D2',
    charcoal: '#1F1F1F',
  },

  text: {
    primary: '#171717',
    secondary: '#404040',
    tertiary: '#737373',
    disabled: '#A3A3A3',
    inverse: '#FFFFFF',
    placeholder: '#D4D4D4',
    link: '#FD4F01',
    buttonLink: '#FD4F01',
  },

  border: {
    light: '#EFEFEF',
    default: '#D4D4D4',
    dark: '#A3A3A3',
  },

  // Badge colors (from Figma)
  badge: {
    brand: {
      background: '#FFDCCB',
      text: '#652000',
    },
  },

  // Status colors (can be customized as needed)
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#007AFF',

  // Overlay colors
  overlay: {
    dark: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.5)',
    light: 'rgba(255, 255, 255, 0.3)',
  },

  // Feedback/Alert colors
  feedback: {
    errorLight: '#FEE2E2',
    errorDark: '#991B1B',
    successLight: '#D1FAE5',
    successDark: '#065F46',
    warningLight: '#FEF3C7',
    warningDark: '#92400E',
    infoLight: '#E0F2FE',
    infoDark: '#075985',
  },
} as const;

export type Colors = typeof colors;
