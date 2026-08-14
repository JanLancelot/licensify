import React from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as ExpoNavThemeProvider,
  Stack,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { SyncProvider } from '@/components/SyncProvider';
import {
  ThemeProvider as AppThemeProvider,
  useAppTheme,
} from '@/context/theme-context';

SplashScreen.preventAutoHideAsync();

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || 'https://convex.dev';
const convex = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
});

function AppLayoutContent() {
  const { isDark } = useAppTheme();

  return (
    <ExpoNavThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SyncProvider>
        <AnimatedSplashOverlay />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}>
          {/* Main 5-Tab Navigator */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Practice Sub-Pages */}
          <Stack.Screen
            name="practice/flashcards"
            options={{ headerShown: false, presentation: 'card' }}
          />

          {/* Learn Detail Sub-Pages */}
          <Stack.Screen
            name="learn/[id]"
            options={{ headerShown: false, presentation: 'card' }}
          />

          {/* Exam Simulator Sub-Pages */}
          <Stack.Screen
            name="exams/[id]"
            options={{ headerShown: false, presentation: 'card' }}
          />

          {/* Study Room */}
          <Stack.Screen
            name="room/[id]"
            options={{ headerShown: false, presentation: 'card' }}
          />
        </Stack>
      </SyncProvider>
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
