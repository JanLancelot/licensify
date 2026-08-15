import React, { useEffect } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as ExpoNavThemeProvider,
  Stack,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { enableFreeze, enableScreens } from 'react-native-screens';

import { SyncProvider } from '@/components/SyncProvider';
import {
  ThemeProvider as AppThemeProvider,
  useAppTheme,
} from '@/context/theme-context';

// Keep screens pre-rendered in memory
enableScreens(true);
enableFreeze(false);

SplashScreen.preventAutoHideAsync();

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || 'https://convex.dev';
const convex = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
});

function AppLayoutContent() {
  const { colors, isDark } = useAppTheme();

  useEffect(() => {
    // Hide splash screen on load
    SplashScreen.hideAsync().catch(() => {});
    // Dye system root view with active background
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
  }, [colors.background]);

  const navigationTheme = {
    dark: isDark,
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.backgroundElement,
      text: colors.text,
      border: colors.border,
      primary: colors.accent,
    },
    fonts: isDark ? DarkTheme.fonts : DefaultTheme.fonts,
  };

  return (
    <ExpoNavThemeProvider value={navigationTheme}>
      <View style={[styles.rootContainer, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <SyncProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              animationDuration: 200,
              gestureEnabled: true,
              fullScreenGestureEnabled: true,
              contentStyle: {
                backgroundColor: colors.background,
              },
            }}>
            {/* Main Tabs Navigator (Hosts nested tab stacks) */}
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
              }}
            />

            {/* Global Modals / Study Room */}
            <Stack.Screen
              name="room/[id]"
              options={{
                headerShown: false,
                presentation: 'modal',
                contentStyle: { backgroundColor: colors.background },
              }}
            />
          </Stack>
        </SyncProvider>
      </View>
    </ExpoNavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <AppThemeProvider>
        <AppLayoutContent />
      </AppThemeProvider>
    </ConvexProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
});
