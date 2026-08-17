import { useTheme } from '@/hooks/use-theme';
import { Stack } from 'expo-router';

export default function PracticeLayout() {
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
      <Stack.Screen name="quiz" options={{ headerShown: false }} />
    </Stack>
  );
}
