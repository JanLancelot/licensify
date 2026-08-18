import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { ConvexReactClient, useConvexAuth } from 'convex/react';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as ExpoNavThemeProvider,
  Stack,
  useRouter,
  useSegments,
} from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect } from 'react';
import { LogBox, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableFreeze, enableScreens } from 'react-native-screens';

import { SyncProvider } from '@/components/SyncProvider';
import {
  ThemeProvider as AppThemeProvider,
  useAppTheme,
} from '@/context/theme-context';

// Ignore SafeAreaView deprecation warnings triggered by internal/third-party dependencies
LogBox.ignoreLogs([
  'SafeAreaView has been deprecated and will be removed in a future release',
  'SafeAreaView has been deprecated',
]);

// Keep screens pre-rendered in memory
enableScreens(true);
enableFreeze(false);

SplashScreen.preventAutoHideAsync();

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || 'https://convex.dev';
const convex = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
});

const secureStorage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      try { return localStorage.getItem(key); } catch { return null; }
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      try { localStorage.setItem(key, value); } catch {}
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      try { localStorage.removeItem(key); } catch {}
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

function AppLayoutContent() {
  const { colors, isDark } = useAppTheme();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Hide splash screen on load only after auth state is known
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
    // Dye system root view with active background
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
  }, [colors.background, isLoading]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = (segments[0] as string) === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login' as any);
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated, segments, isLoading, router]);

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
            {/* Auth Screens */}
            <Stack.Screen
              name="(auth)"
              options={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
              }}
            />

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
    <GestureHandlerRootView style={styles.rootContainer}>
      <SafeAreaProvider>
        <ConvexAuthProvider client={convex} storage={secureStorage}>
          <AppThemeProvider>
            <AppLayoutContent />
          </AppThemeProvider>
        </ConvexAuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
});
