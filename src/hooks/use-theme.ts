import { useAppTheme } from '@/context/theme-context';

export function useTheme() {
  const { theme } = useAppTheme();
  return theme;
}
