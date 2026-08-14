import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';

export default function ExamsLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: theme.background,
        },
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="details" options={{ headerShown: false }} />
      <Stack.Screen name="session" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
