import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { SyncProvider } from '@/components/SyncProvider';

SplashScreen.preventAutoHideAsync();

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || 'https://convex.dev';
const convex = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ConvexProvider client={convex}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SyncProvider>
          <AnimatedSplashOverlay />
          <AppTabs />
        </SyncProvider>
      </ThemeProvider>
    </ConvexProvider>
  );
}
