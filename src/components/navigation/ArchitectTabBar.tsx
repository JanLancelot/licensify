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
              backgroundColor: colors.tabCenterBg,
              borderColor: isFocused ? colors.text : colors.tabCenterBorder,
            },
            animatedStyle,
          ]}>
          <Building2
            size={24}
            color={colors.tabCenterIcon}
            strokeWidth={2.2}
          />
        </Animated.View>

        <Text
          style={[
            styles.centerLabel,
            {
              color: isFocused ? colors.accent : colors.tabInactive,
              fontWeight: isFocused ? '700' : '600',
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

  const activeRouteName = state.routes[state.index]?.name;

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
    borderRadius: Radius.lg, // Sharper professional corners
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
    borderRadius: Radius.md, // Sharp professional architectural square
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 14px rgba(200, 90, 50, 0.35)',
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
