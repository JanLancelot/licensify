/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A',
    background: '#F8FAFC',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#F1F5F9',
    textSecondary: '#64748B',
    primary: '#1E293B',
    accent: '#D97706',
    border: '#E2E8F0',
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
    tabActive: '#D97706',
    tabInactive: '#94A3B8',
    tabCenterBg: '#0F172A',
    tabCenterIcon: '#F8FAFC',
    tabCenterRing: '#FDE68A',
  },
  dark: {
    text: '#F8FAFC',
    background: '#0B0F19',
    backgroundElement: '#131B2E',
    backgroundSelected: '#1E293B',
    textSecondary: '#94A3B8',
    primary: '#F8FAFC',
    accent: '#F59E0B',
    border: '#1E293B',
    tabBarBackground: '#0F172A',
    tabBarBorder: '#1E293B',
    tabActive: '#F59E0B',
    tabInactive: '#64748B',
    tabCenterBg: '#F59E0B',
    tabCenterIcon: '#0B0F19',
    tabCenterRing: '#78350F',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
