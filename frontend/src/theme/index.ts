import { DefaultTheme, type Theme } from '@react-navigation/native';

/**
 * Centralized theme for the entire ConnectX frontend.
 * Every color used in the app comes from the official ConnectX palette.
 * Always import from here instead of hard-coding hex values.
 */
export const Colors = {
  // Primary
  primary: '#4F46E5',
  primaryDark: '#3730A3',

  // Accent
  accent: '#38BDF8',

  // Background
  background: '#F8FAFC',
  card: '#FFFFFF',

  // Message bubbles
  userBubble: '#4F46E5',
  userBubbleText: '#FFFFFF',
  otherBubble: '#E2E8F0',

  // Text
  textMain: '#0F172A',
  textSecondary: '#64748B',
  textOnPrimary: '#FFFFFF',

  // Border
  border: '#E2E8F0',

  // Status
  online: '#22C55E',
  error: '#EF4444',
} as const;

export const Typography = {
  fontSizeXL: 28,
  fontSizeLG: 20,
  fontSizeMD: 16,
  fontSizeSM: 14,
  fontSizeXS: 12,
  fontWeightBold: '700' as const,
  fontWeightSemiBold: '600' as const,
  fontWeightRegular: '400' as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

/**
 * Theme object used by <NavigationContainer> so headers, backgrounds,
 * cards and borders all follow the ConnectX palette.
 */
export const NavigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.card,
    text: Colors.textMain,
    border: Colors.border,
    notification: Colors.error,
  },
};
