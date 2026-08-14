import React from 'react';
import { Tabs } from 'expo-router';
import { ArchitectTabBar } from './navigation/ArchitectTabBar';

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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
      {/* Hide explore from tab list if still in directory */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
