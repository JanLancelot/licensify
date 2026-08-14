import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  BookOpen,
  FileEdit,
  Building2,
  Target,
  User,
} from 'lucide-react-native';
import type { Tabs } from 'expo-router';

import { Radius, ThemePalette } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

export type ArchitectTabBarProps = Parameters<
  NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>
>[0];

interface TabItemConfig {
  name: string;
  label: string;
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  isCenter?: boolean;
}

const TAB_CONFIGS: TabItemConfig[] = [
  { name: 'learn', label: 'Learn', Icon: BookOpen },
  { name: 'practice', label: 'Practice', Icon: FileEdit },
  { name: 'index', label: 'Home', Icon: Building2, isCenter: true },
  { name: 'exams', label: 'Exams', Icon: Target },
  { name: 'profile', label: 'Profile', Icon: User },
];

function TabItem({
  config,
  isFocused,
  onPress,
  colors,
}: {
  config: TabItemConfig;
  isFocused: boolean;
  onPress: () => void;
  colors: ThemePalette;
}) {
  const scale = useSharedValue(1);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 14, stiffness: 350 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 350 });
  };

  const IconComponent = config.Icon;
  const iconColor = isFocused ? colors.tabActive : colors.tabInactive;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={config.label}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}>
      <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
        <IconComponent
          size={21}
          color={iconColor}
          strokeWidth={isFocused ? 2.2 : 1.6}
        />
      </Animated.View>

      <Text
        style={[
          styles.tabLabel,
          {
            color: isFocused ? colors.tabActive : colors.tabInactive,
            fontWeight: isFocused ? '700' : '500',
          },
        ]}>
        {config.label}
      </Text>
    </Pressable>
  );
}

function CenterHomeButton({
  isFocused,
  onPress,
  colors,
}: {
  isFocused: boolean;
  onPress: () => void;
  colors: ThemePalette;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 12, stiffness: 350 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 350 });
  };

  return (
    <View style={styles.centerButtonWrapper}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel="Dashboard Home"
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.centerPressable}>
        <Animated.View
          style={[
            styles.centerButton,
            {
              // Neutral background when not selected, Terracotta when selected
              backgroundColor: isFocused
                ? colors.accent
                : colors.backgroundElement,
              borderColor: isFocused
                ? colors.accent
                : colors.border,
            },
            animatedStyle,
          ]}>
          <Building2
            size={23}
            color={isFocused ? '#FFFFFF' : colors.tabInactive}
            strokeWidth={isFocused ? 2.2 : 1.7}
          />
        </Animated.View>

        <Text
          style={[
            styles.centerLabel,
            {
              color: isFocused ? colors.accent : colors.tabInactive,
              fontWeight: isFocused ? '700' : '500',
            },
          ]}>
          Home
        </Text>
      </Pressable>
    </View>
  );
}

export function ArchitectTabBar({ state, descriptors, navigation }: ArchitectTabBarProps) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const currentRoute = state.routes[state.index] as any;
  const activeRouteName = currentRoute?.name;

  // Check if current tab is in a nested sub-screen (e.g. flashcards, session, details, [id])
  const nestedState = currentRoute?.state;
  const isNestedSubScreen =
    nestedState &&
    typeof nestedState.index === 'number' &&
    nestedState.index > 0;

  const focusedDescriptor = descriptors[currentRoute?.key];
  const isTabHiddenByOptions =
    (focusedDescriptor?.options?.tabBarStyle as any)?.display === 'none';

  if (isNestedSubScreen || isTabHiddenByOptions) {
    return null;
  }

  return (
    <View
      style={[
        styles.outerContainer,
        {
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}>
      <View
        style={[
          styles.barContainer,
          {
            backgroundColor: colors.tabBarBackground,
            borderColor: colors.tabBarBorder,
            shadowColor: isDark ? '#000000' : '#111827',
          },
        ]}>
        {TAB_CONFIGS.map((config) => {
          const isFocused =
            config.name === 'index'
              ? activeRouteName === 'index'
              : activeRouteName === config.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: config.name,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(config.name);
            }
          };

          if (config.isCenter) {
            return (
              <CenterHomeButton
                key={config.name}
                isFocused={isFocused}
                onPress={onPress}
                colors={colors}
              />
            );
          }

          return (
            <TabItem
              key={config.name}
              config={config}
              isFocused={isFocused}
              onPress={onPress}
              colors={colors}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '95%',
    maxWidth: 500,
    height: 60,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: 6,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    height: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
  },
  tabLabel: {
    fontSize: 10.5,
    marginTop: 4,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  centerButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  centerPressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    width: 48,
    height: 48,
    borderRadius: 24, // Retained circular shape
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 3px 12px rgba(0, 0, 0, 0.12)',
      },
    }),
  },
  centerLabel: {
    fontSize: 10.5,
    marginTop: 4,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
