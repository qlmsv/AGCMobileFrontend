// Design system colors - Pixel-perfect match with Figma
export const colors = {
  // Primary (Orange)
  primary: {
    main: '#FF7A00',      // Primary 500 - Main accent
    dark: '#EB3A00',      // Primary 600 - Hover/Active
    light: '#FF983D',     // Primary 400 - Disabled/Secondary
  },

  // Brand extended
  brand: {
    50: '#FFF5EB',
    400: '#FF983D',
    main: '#FF7A00',
    600: '#EB3A00',
  },

  // Neutrals (from Figma Foundation/Colors)
  neutral: {
    white: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F2F2F7',        // Search bar background, secondary bg
    200: '#E2E2E9',        // Borders, dividers
    300: '#D4D4D4',
    400: '#A8A8A8',
    500: '#6C6C89',        // Placeholders, inactive icons
    600: '#5C5C5C',
    700: '#3F3F50',        // Secondary text
    800: '#2A2A2A',
    900: '#121217',        // Primary text, headings
    black: '#000000',
  },

  // Semantic colors
  background: {
    default: '#FFFFFF',
    base: '#F8F8F8',       // Surface - screen backgrounds
    secondary: '#F2F2F7',  // Neutral 100
    tertiary: '#FAFAFA',
    card: '#FFFFFF',
  },

  accent: {
    peach: '#FFB999',
    peachSoft: '#FFE1D2',
    charcoal: '#1F1F1F',
  },

  text: {
    primary: '#121217',    // Neutral 900
    secondary: '#3F3F50',  // Neutral 700
    tertiary: '#6C6C89',   // Neutral 500
    disabled: '#A8A8A8',
    inverse: '#FFFFFF',
    placeholder: '#6C6C89',
    link: '#FF7A00',
    buttonLink: '#FF7A00',
  },

  border: {
    light: '#F2F2F7',
    default: '#E2E2E9',    // Neutral 200
    dark: '#A8A8A8',
  },

  // Badge colors
  badge: {
    brand: {
      background: '#FFF5EB',
      text: '#EB3A00',
    },
  },

  // Status colors (from Figma)
  success: '#2DCA72',
  error: '#F3164E',
  warning: '#FFC233',
  info: '#007AFF',

  // Overlay colors
  overlay: {
    dark: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.5)',
    light: 'rgba(255, 255, 255, 0.3)',
  },

  // Feedback/Alert colors
  feedback: {
    errorLight: '#FFEEF2',
    errorDark: '#F3164E',
    successLight: '#E6F9EF',
    successDark: '#2DCA72',
    warningLight: '#FFF8E6',
    warningDark: '#FFC233',
    infoLight: '#E6F2FF',
    infoDark: '#007AFF',
  },
} as const;

export type Colors = typeof colors;
