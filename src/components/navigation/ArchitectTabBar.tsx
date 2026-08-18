import React, { useState } from 'react';
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import {
  BookOpen,
  FileEdit,
  Home,
  Target,
  User,
} from 'lucide-react-native';
import type { Tabs } from 'expo-router';

import { ThemePalette } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

export type ArchitectTabBarProps = Parameters<
  NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>
>[0];

interface TabItemConfig {
  name: string;
  label: string;
  Icon: React.ComponentType<{
    size: number;
    color: string;
    strokeWidth?: number;
  }>;
  isCenter?: boolean;
}

const TAB_CONFIGS: TabItemConfig[] = [
  { name: 'learn', label: 'Learn', Icon: BookOpen },
  { name: 'practice', label: 'Practice', Icon: FileEdit },
  { name: 'index', label: 'Home', Icon: Home, isCenter: true },
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
  const [isPressed, setIsPressed] = React.useState(false);
  const IconComponent = config.Icon;
  const activeColor = colors.accent;
  const inactiveColor = colors.tabInactive;
  const iconColor = isFocused ? activeColor : inactiveColor;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={config.label}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={styles.tabButton}>
      <MotiView
        animate={{ scale: isPressed ? 0.88 : 1 }}
        transition={{ type: 'spring', damping: 14, stiffness: 350 }}
        style={styles.iconContainer}>
        <IconComponent
          size={20}
          color={iconColor}
          strokeWidth={isFocused ? 2.3 : 1.8}
        />
      </MotiView>

      <Text
        style={[
          styles.tabLabel,
          {
            color: isFocused ? activeColor : inactiveColor,
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
  isDark,
}: {
  isFocused: boolean;
  onPress: () => void;
  colors: ThemePalette;
  isDark: boolean;
}) {
  const [isPressed, setIsPressed] = React.useState(false);

  return (
    <View style={styles.centerButtonWrapper}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel="Dashboard Home"
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={styles.centerPressable}>
        <MotiView
          animate={{
            scale: isPressed ? 0.92 : isFocused ? 1.04 : 1,
          }}
          transition={{ type: 'spring', damping: 14, stiffness: 350 }}
          style={[
            styles.centerButton,
            {
              backgroundColor: isFocused
                ? colors.accent
                : isDark
                  ? '#23262F'
                  : '#F6F0ED',
              borderColor: isFocused
                ? colors.accent
                : isDark
                  ? '#303440'
                  : '#EBE3DE',
              shadowColor: isFocused ? colors.accent : '#000000',
            },
          ]}>
          <Home
            size={24}
            color={isFocused ? '#FFFFFF' : colors.tabInactive}
            strokeWidth={isFocused ? 2.3 : 1.8}
          />
        </MotiView>

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
  const [barWidth, setBarWidth] = useState(0);

  const currentRoute = state.routes[state.index] as any;
  const activeRouteName = currentRoute?.name;

  // Find index of current route in TAB_CONFIGS
  const activeTabIndex = TAB_CONFIGS.findIndex((c) =>
    c.name === 'index' ? activeRouteName === 'index' : activeRouteName === c.name
  );

  // Check if current tab is in a nested sub-screen
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

  const PILL_WIDTH = 48;
  const PILL_HEIGHT = 28;
  const tabWidth = barWidth > 0 ? (barWidth - 16) / 5 : 0;
  const pillTranslateX =
    activeTabIndex >= 0
      ? 8 + activeTabIndex * tabWidth + (tabWidth - PILL_WIDTH) / 2
      : 0;

  // Don't show sliding pill on center button (it has its own circular highlight)
  const isCenterTab = activeTabIndex === 2;

  const handleBarLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    if (width > 0) {
      setBarWidth(width);
    }
  };

  return (
    <View
      style={[
        styles.outerContainer,
        {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.tabBarBorder,
          paddingBottom: Math.max(insets.bottom, 8),
          shadowColor: isDark ? '#000000' : '#111827',
        },
      ]}>
      <View onLayout={handleBarLayout} style={styles.barContainer}>
        {/* Sliding Highlight Pill */}
        {barWidth > 0 && (
          <MotiView
            animate={{
              translateX: pillTranslateX,
              opacity: isCenterTab ? 0 : 1,
              scale: isCenterTab ? 0.6 : 1,
            }}
            transition={{
              type: 'spring',
              damping: 18,
              stiffness: 220,
              mass: 0.8,
            }}
            style={[
              styles.slidingPill,
              {
                width: PILL_WIDTH,
                height: PILL_HEIGHT,
                backgroundColor: isDark
                  ? 'rgba(224, 122, 95, 0.22)'
                  : '#F8EAE4',
              },
            ]}
          />
        )}

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
                isDark={isDark}
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
    width: '100%',
    borderTopWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 -2px 16px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    height: 58,
    paddingHorizontal: 8,
    position: 'relative',
  },
  slidingPill: {
    position: 'absolute',
    top: 5,
    left: 0,
    borderRadius: 14,
    zIndex: 0,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    height: '100%',
    zIndex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  centerButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    zIndex: 2,
  },
  centerPressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.16,
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
    fontSize: 10,
    marginTop: 3,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
