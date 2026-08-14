import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { DarkTheme, DefaultTheme, ThemeProvider as ExpoNavThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { SyncProvider } from '@/components/SyncProvider';
import { ThemeProvider as AppThemeProvider, useAppTheme } from '@/context/theme-context';

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
        <AppTabs />
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
