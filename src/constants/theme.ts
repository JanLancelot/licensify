import '@/global.css';

import { Platform } from 'react-native';

export type AccentThemeKey =
  | 'red'
  | 'terracotta'
  | 'amber'
  | 'green'
  | 'blue'
  | 'indigo'
  | 'violet';

export interface AccentThemeColors {
  accent: string;
  accentLight: string;
  accentMuted: string;
  accentBorder: string;
  accentGradient: [string, string];
  tabActive: string;
  tabCenterBg: string;
  tabCenterBorder: string;
}

export interface AccentThemeOption {
  key: AccentThemeKey;
  name: string;
  swatch: string;
  roygbivLetter: 'R' | 'O' | 'Y' | 'G' | 'B' | 'I' | 'V';
  light: AccentThemeColors;
  dark: AccentThemeColors;
}

export const ACCENT_THEMES: Record<AccentThemeKey, AccentThemeOption> = {
  red: {
    key: 'red',
    name: 'Crimson',
    swatch: '#E11D48',
    roygbivLetter: 'R',
    light: {
      accent: '#E11D48',
      accentLight: '#F43F5E',
      accentMuted: 'rgba(225, 29, 72, 0.12)',
      accentBorder: 'rgba(225, 29, 72, 0.25)',
      accentGradient: ['#F43F5E', '#E11D48'],
      tabActive: '#E11D48',
      tabCenterBg: '#E11D48',
      tabCenterBorder: '#BE123C',
    },
    dark: {
      accent: '#FB7185',
      accentLight: '#FDA4AF',
      accentMuted: 'rgba(251, 113, 133, 0.18)',
      accentBorder: 'rgba(251, 113, 133, 0.30)',
      accentGradient: ['#FDA4AF', '#FB7185'],
      tabActive: '#FB7185',
      tabCenterBg: '#FB7185',
      tabCenterBorder: '#E11D48',
    },
  },
  terracotta: {
    key: 'terracotta',
    name: 'Terracotta',
    swatch: '#C85A32',
    roygbivLetter: 'O',
    light: {
      accent: '#C85A32',
      accentLight: '#E07A5F',
      accentMuted: 'rgba(200, 90, 50, 0.10)',
      accentBorder: 'rgba(200, 90, 50, 0.25)',
      accentGradient: ['#E58368', '#C85A32'],
      tabActive: '#C85A32',
      tabCenterBg: '#C85A32',
      tabCenterBorder: '#A9431E',
    },
    dark: {
      accent: '#E07A5F',
      accentLight: '#F4A261',
      accentMuted: 'rgba(224, 122, 95, 0.15)',
      accentBorder: 'rgba(224, 122, 95, 0.30)',
      accentGradient: ['#F4A261', '#E07A5F'],
      tabActive: '#E07A5F',
      tabCenterBg: '#E07A5F',
      tabCenterBorder: '#C85A32',
    },
  },
  amber: {
    key: 'amber',
    name: 'Amber',
    swatch: '#D97706',
    roygbivLetter: 'Y',
    light: {
      accent: '#D97706',
      accentLight: '#F59E0B',
      accentMuted: 'rgba(217, 119, 6, 0.12)',
      accentBorder: 'rgba(217, 119, 6, 0.25)',
      accentGradient: ['#F59E0B', '#D97706'],
      tabActive: '#D97706',
      tabCenterBg: '#D97706',
      tabCenterBorder: '#B45309',
    },
    dark: {
      accent: '#FBBF24',
      accentLight: '#FCD34D',
      accentMuted: 'rgba(251, 191, 36, 0.18)',
      accentBorder: 'rgba(251, 191, 36, 0.30)',
      accentGradient: ['#FCD34D', '#FBBF24'],
      tabActive: '#FBBF24',
      tabCenterBg: '#FBBF24',
      tabCenterBorder: '#D97706',
    },
  },
  green: {
    key: 'green',
    name: 'Emerald',
    swatch: '#059669',
    roygbivLetter: 'G',
    light: {
      accent: '#059669',
      accentLight: '#10B981',
      accentMuted: 'rgba(5, 150, 105, 0.12)',
      accentBorder: 'rgba(5, 150, 105, 0.25)',
      accentGradient: ['#10B981', '#059669'],
      tabActive: '#059669',
      tabCenterBg: '#059669',
      tabCenterBorder: '#047857',
    },
    dark: {
      accent: '#34D399',
      accentLight: '#6EE7B7',
      accentMuted: 'rgba(52, 211, 153, 0.18)',
      accentBorder: 'rgba(52, 211, 153, 0.30)',
      accentGradient: ['#6EE7B7', '#34D399'],
      tabActive: '#34D399',
      tabCenterBg: '#34D399',
      tabCenterBorder: '#059669',
    },
  },
  blue: {
    key: 'blue',
    name: 'Blueprint',
    swatch: '#2563EB',
    roygbivLetter: 'B',
    light: {
      accent: '#2563EB',
      accentLight: '#3B82F6',
      accentMuted: 'rgba(37, 99, 235, 0.12)',
      accentBorder: 'rgba(37, 99, 235, 0.25)',
      accentGradient: ['#3B82F6', '#2563EB'],
      tabActive: '#2563EB',
      tabCenterBg: '#2563EB',
      tabCenterBorder: '#1D4ED8',
    },
    dark: {
      accent: '#60A5FA',
      accentLight: '#93C5FD',
      accentMuted: 'rgba(96, 165, 250, 0.18)',
      accentBorder: 'rgba(96, 165, 250, 0.30)',
      accentGradient: ['#93C5FD', '#60A5FA'],
      tabActive: '#60A5FA',
      tabCenterBg: '#60A5FA',
      tabCenterBorder: '#2563EB',
    },
  },
  indigo: {
    key: 'indigo',
    name: 'Cobalt',
    swatch: '#4F46E5',
    roygbivLetter: 'I',
    light: {
      accent: '#4F46E5',
      accentLight: '#6366F1',
      accentMuted: 'rgba(79, 70, 229, 0.12)',
      accentBorder: 'rgba(79, 70, 229, 0.25)',
      accentGradient: ['#6366F1', '#4F46E5'],
      tabActive: '#4F46E5',
      tabCenterBg: '#4F46E5',
      tabCenterBorder: '#4338CA',
    },
    dark: {
      accent: '#818CF8',
      accentLight: '#A5B4FC',
      accentMuted: 'rgba(129, 140, 248, 0.18)',
      accentBorder: 'rgba(129, 140, 248, 0.30)',
      accentGradient: ['#A5B4FC', '#818CF8'],
      tabActive: '#818CF8',
      tabCenterBg: '#818CF8',
      tabCenterBorder: '#4F46E5',
    },
  },
  violet: {
    key: 'violet',
    name: 'Amethyst',
    swatch: '#7C3AED',
    roygbivLetter: 'V',
    light: {
      accent: '#7C3AED',
      accentLight: '#8B5CF6',
      accentMuted: 'rgba(124, 58, 237, 0.12)',
      accentBorder: 'rgba(124, 58, 237, 0.25)',
      accentGradient: ['#8B5CF6', '#7C3AED'],
      tabActive: '#7C3AED',
      tabCenterBg: '#7C3AED',
      tabCenterBorder: '#6D28D9',
    },
    dark: {
      accent: '#A78BFA',
      accentLight: '#C4B5FD',
      accentMuted: 'rgba(167, 139, 250, 0.18)',
      accentBorder: 'rgba(167, 139, 250, 0.30)',
      accentGradient: ['#C4B5FD', '#A78BFA'],
      tabActive: '#A78BFA',
      tabCenterBg: '#A78BFA',
      tabCenterBorder: '#7C3AED',
    },
  },
};

export const ACCENT_THEME_LIST: AccentThemeOption[] = [
  ACCENT_THEMES.red,
  ACCENT_THEMES.terracotta,
  ACCENT_THEMES.amber,
  ACCENT_THEMES.green,
  ACCENT_THEMES.blue,
  ACCENT_THEMES.indigo,
  ACCENT_THEMES.violet,
];

export interface BaseThemeColors {
  text: string;
  background: string;
  backgroundElement: string;
  backgroundSelected: string;
  textSecondary: string;
  primary: string;
  border: string;
  borderStrong: string;
  tabBarBackground: string;
  tabBarBorder: string;
  tabInactive: string;
  tabCenterIcon: string;
}

export type ThemePalette = BaseThemeColors & AccentThemeColors;
export type ThemeColor = {
  [K in keyof ThemePalette]: ThemePalette[K] extends string ? K : never;
}[keyof ThemePalette];

export const BaseColors: { light: BaseThemeColors; dark: BaseThemeColors } = {
  light: {
    text: '#111827',
    background: '#FBFBFC',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#F3F4F6',
    textSecondary: '#6B7280',
    primary: '#111827',
    border: '#E5E7EB',
    borderStrong: '#D1D5DB',
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E5E7EB',
    tabInactive: '#9CA3AF',
    tabCenterIcon: '#FFFFFF',
  },
  dark: {
    text: '#F9FAFB',
    background: '#121316',
    backgroundElement: '#1A1C20',
    backgroundSelected: '#24272E',
    textSecondary: '#9CA3AF',
    primary: '#F9FAFB',
    border: '#272A30',
    borderStrong: '#374151',
    tabBarBackground: '#16181D',
    tabBarBorder: '#272A30',
    tabInactive: '#6B7280',
    tabCenterIcon: '#121316',
  },
};

export function getThemePalette(mode: 'light' | 'dark', accentKey: AccentThemeKey = 'terracotta'): ThemePalette {
  const base = BaseColors[mode];
  const accentDef = ACCENT_THEMES[accentKey] || ACCENT_THEMES.terracotta;
  const accentColors = accentDef[mode];

  return {
    ...base,
    ...accentColors,
  };
}

export const Colors = {
  light: getThemePalette('light', 'terracotta'),
  dark: getThemePalette('dark', 'terracotta'),
};

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
