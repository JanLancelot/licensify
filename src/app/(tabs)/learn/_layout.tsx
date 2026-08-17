import { useTheme } from '@/hooks/use-theme';
import { Stack } from 'expo-router';

export default function LearnLayout() {
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
      <Stack.Screen name="notes/index" options={{ headerShown: false }} />
      <Stack.Screen name="flashcards/index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
