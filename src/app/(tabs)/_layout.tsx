import React from 'react';
import { Tabs } from 'expo-router';
import { ArchitectTabBar } from '@/components/navigation/ArchitectTabBar';
import { useAppTheme } from '@/context/theme-context';

export default function TabLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      initialRouteName="index"
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        lazy: false, // Pre-render all tab screens so returning to them is instant
        sceneStyle: {
          backgroundColor: colors.background,
        },
      }}
      tabBar={(props) => <ArchitectTabBar {...props} />}>
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="exams"
        options={{
          title: 'Exams',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
