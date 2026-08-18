import { Tabs, usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { ArchitectTabBar } from '@/components/navigation/ArchitectTabBar';
import { useAppTheme } from '@/context/theme-context';

const TAB_ROUTES = ['learn', 'practice', 'index', 'exams', 'profile'];

export default function TabLayout() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const pathname = usePathname();

  const getCurrentTabIndex = () => {
    const p = pathname || '';
    if (p.includes('learn')) return 0;
    if (p.includes('practice')) return 1;
    if (p.includes('exams')) return 3;
    if (p.includes('profile')) return 4;
    return 2;
  };

  const isSubScreen =
    pathname.includes('notes') ||
    pathname.includes('flashcards') ||
    pathname.includes('quiz') ||
    pathname.includes('details') ||
    pathname.includes('session');

  const navigateToTab = (index: number) => {
    if (index < 0 || index >= TAB_ROUTES.length) return;
    const targetRoute = TAB_ROUTES[index];
    if (targetRoute === 'index') {
      router.navigate('/(tabs)/' as any);
    } else {
      router.navigate(`/(tabs)/${targetRoute}` as any);
    }
  };

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-22, 22])
    .failOffsetY([-15, 15])
    .onEnd((e) => {
      if (isSubScreen) return;
      const currentIndex = getCurrentTabIndex();
      if (e.translationX < -35 && currentIndex < TAB_ROUTES.length - 1) {
        navigateToTab(currentIndex + 1);
      } else if (e.translationX > 35 && currentIndex > 0) {
        navigateToTab(currentIndex - 1);
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        <Tabs
          initialRouteName="index"
          backBehavior="history"
          screenOptions={{
            headerShown: false,
            animation: 'shift',
            lazy: false,
            sceneStyle: { backgroundColor: colors.background },
          }}
          tabBar={(props) => <ArchitectTabBar {...props} />}>
          <Tabs.Screen name="learn" options={{ title: 'Learn' }} />
          <Tabs.Screen name="practice" options={{ title: 'Practice' }} />
          <Tabs.Screen name="index" options={{ title: 'Home' }} />
          <Tabs.Screen name="exams" options={{ title: 'Exams' }} />
          <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
        </Tabs>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});