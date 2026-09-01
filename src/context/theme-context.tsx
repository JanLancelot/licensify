import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform, useColorScheme as useDeviceColorScheme } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import {
  AccentThemeKey,
  ACCENT_THEMES,
  getThemePalette,
  ThemePalette,
} from '@/constants/theme';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  accentTheme: AccentThemeKey;
  setAccentTheme: (theme: AccentThemeKey) => void;
  isDark: boolean;
  theme: ThemePalette;
  colors: ThemePalette;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'system',
  setThemeMode: () => {},
  accentTheme: 'terracotta',
  setAccentTheme: () => {},
  isDark: false,
  theme: getThemePalette('light', 'terracotta'),
  colors: getThemePalette('light', 'terracotta'),
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceColorScheme = useDeviceColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [accentTheme, setAccentThemeState] = useState<AccentThemeKey>('terracotta');

  // Convex Cloud integration
  const userProfile = useQuery(api.users.getCurrentUserProfile);
  const updateThemeMutation = useMutation(api.users.updateThemeSettings);

  // Apply remote cloud theme preferences when user logs in or profile syncs
  useEffect(() => {
    if (!userProfile) return;
    const mode = userProfile.themeMode;
    const accent = userProfile.accentTheme;

    if (mode && (mode === 'system' || mode === 'light' || mode === 'dark')) {
      setThemeModeState((prev) => (prev !== mode ? (mode as ThemeMode) : prev));
    }
    if (accent && ACCENT_THEMES[accent as AccentThemeKey]) {
      setAccentThemeState((prev) => (prev !== accent ? (accent as AccentThemeKey) : prev));
    }
  }, [userProfile]);

  // Load persisted theme and accent preferences on start
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined' && window.localStorage) {
            const savedMode = window.localStorage.getItem('@app_theme_mode') as ThemeMode | null;
            const savedAccent = window.localStorage.getItem('@app_accent_theme') as AccentThemeKey | null;
            if (savedMode && (savedMode === 'system' || savedMode === 'light' || savedMode === 'dark')) {
              setThemeModeState(savedMode);
            }
            if (savedAccent && ACCENT_THEMES[savedAccent]) {
              setAccentThemeState(savedAccent);
            }
          }
          return;
        }

        const [savedMode, savedAccent] = await Promise.all([
          SecureStore.getItemAsync('app_theme_mode'),
          SecureStore.getItemAsync('app_accent_theme'),
        ]);

        if (savedMode && (savedMode === 'system' || savedMode === 'light' || savedMode === 'dark')) {
          setThemeModeState(savedMode as ThemeMode);
        }
        if (savedAccent && ACCENT_THEMES[savedAccent as AccentThemeKey]) {
          setAccentThemeState(savedAccent as AccentThemeKey);
        }
      } catch (err) {
        console.warn('Failed to load theme preferences:', err);
      }
    };

    loadPreferences();
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('@app_theme_mode', mode);
        }
      } else {
        SecureStore.setItemAsync('app_theme_mode', mode);
      }
    } catch {}

    // Async sync to Convex Cloud (safe check)
    try {
      updateThemeMutation({ themeMode: mode }).catch(() => {});
    } catch {}
  };

  const setAccentTheme = (themeKey: AccentThemeKey) => {
    setAccentThemeState(themeKey);
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('@app_accent_theme', themeKey);
        }
      } else {
        SecureStore.setItemAsync('app_accent_theme', themeKey);
      }
    } catch {}

    // Async sync to Convex Cloud (safe check)
    try {
      updateThemeMutation({ accentTheme: themeKey }).catch(() => {});
    } catch {}
  };

  const activeScheme =
    themeMode === 'system'
      ? deviceColorScheme === 'dark'
        ? 'dark'
        : 'light'
      : themeMode;

  const isDark = activeScheme === 'dark';
  const theme = getThemePalette(activeScheme, accentTheme);

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        accentTheme,
        setAccentTheme,
        isDark,
        theme,
        colors: theme,
      }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
