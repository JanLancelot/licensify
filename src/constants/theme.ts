import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#111827',
    background: '#FBFBFC',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#F3F4F6',
    textSecondary: '#6B7280',
    primary: '#111827',
    accent: '#C85A32', // Terracotta
    accentLight: '#E07A5F',
    accentMuted: 'rgba(200, 90, 50, 0.10)',
    border: '#E5E7EB',
    borderStrong: '#D1D5DB',
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E5E7EB',
    tabActive: '#C85A32', // Terracotta
    tabInactive: '#9CA3AF',
    tabCenterBg: '#C85A32',
    tabCenterIcon: '#FFFFFF',
    tabCenterBorder: '#A9431E',
  },
  dark: {
    text: '#F9FAFB',
    background: '#121316',
    backgroundElement: '#1A1C20',
    backgroundSelected: '#24272E',
    textSecondary: '#9CA3AF',
    primary: '#F9FAFB',
    accent: '#E07A5F', // Warm Terracotta for dark mode
    accentLight: '#F4A261',
    accentMuted: 'rgba(224, 122, 95, 0.15)',
    border: '#272A30',
    borderStrong: '#374151',
    tabBarBackground: '#16181D',
    tabBarBorder: '#272A30',
    tabActive: '#E07A5F', // Terracotta
    tabInactive: '#6B7280',
    tabCenterBg: '#E07A5F',
    tabCenterIcon: '#121316',
    tabCenterBorder: '#C85A32',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type ThemePalette = (typeof Colors)[keyof typeof Colors];

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 10,
  xl: 12,
  full: 9999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
