import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  BookOpen,
  FileEdit,
  Building2,
  Target,
  User,
} from 'lucide-react-native';
import type { Tabs } from 'expo-router';

import { Colors } from '@/constants/theme';

export type ArchitectTabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

type ThemePalette = (typeof Colors)[keyof typeof Colors];

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
  const activeProgress = useSharedValue(isFocused ? 1 : 0);

  React.useEffect(() => {
    activeProgress.value = withTiming(isFocused ? 1 : 0, { duration: 220 });
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    opacity: activeProgress.value,
    transform: [
      {
        scale: withSpring(activeProgress.value ? 1 : 0.4, {
          damping: 15,
          stiffness: 200,
        }),
      },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.88, { damping: 12, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
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
          size={22}
          color={iconColor}
          strokeWidth={isFocused ? 2.3 : 1.8}
        />
        {/* Active Pill Indicator */}
        <Animated.View
          style={[
            styles.activeIndicator,
            { backgroundColor: colors.tabActive },
            animatedIndicatorStyle,
          ]}
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
    scale.value = withSpring(0.92, { damping: 10, stiffness: 350 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 350 });
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
              borderColor: isFocused ? colors.accent : colors.tabBarBorder,
              shadowColor: colors.accent,
            },
            animatedStyle,
          ]}>
          {/* Architectural Drafting Crosshair/Accent background ring */}
          <View
            style={[
              styles.centerRing,
              {
                borderColor: isFocused
                  ? 'rgba(245, 158, 11, 0.4)'
                  : 'rgba(255, 255, 255, 0.1)',
              },
            ]}
          />
          <Building2
            size={26}
            color={colors.tabCenterIcon}
            strokeWidth={2.4}
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
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  const activeRouteName = state.routes[state.index]?.name;

  return (
    <View
      style={[
        styles.outerContainer,
        {
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}>
      <View
        style={[
          styles.barContainer,
          {
            backgroundColor: colors.tabBarBackground,
            borderColor: colors.tabBarBorder,
            shadowColor: scheme === 'dark' ? '#000000' : '#0F172A',
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
    width: '94%',
    maxWidth: 520,
    height: 64,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    height: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 28,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
    letterSpacing: 0.2,
  },
  centerButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
  },
  centerPressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 6px 20px rgba(245, 158, 11, 0.35)',
      },
    }),
  },
  centerRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  centerLabel: {
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 0.2,
  },
});
