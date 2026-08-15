import React from 'react';
import {
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
  Building2,
  FileEdit,
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
  const [isPressed, setIsPressed] = React.useState(false);
  const IconComponent = config.Icon;
  const iconColor = isFocused ? colors.tabActive : colors.tabInactive;

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
        animate={{ scale: isPressed ? 0.9 : 1 }}
        transition={{ type: 'spring', damping: 14, stiffness: 350 }}
        style={styles.iconContainer}>
        <IconComponent
          size={20}
          color={iconColor}
          strokeWidth={isFocused ? 2.2 : 1.6}
        />
      </MotiView>

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
          animate={{ scale: isPressed ? 0.92 : 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 350 }}
          style={[
            styles.centerButton,
            {
              backgroundColor: isFocused
                ? colors.accent
                : colors.backgroundElement,
              borderColor: isFocused
                ? colors.accent
                : colors.border,
            },
          ]}>
          <Building2
            size={24}
            color={isFocused ? '#FFFFFF' : colors.tabInactive}
            strokeWidth={isFocused ? 2.2 : 1.7}
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

  const currentRoute = state.routes[state.index] as any;
  const activeRouteName = currentRoute?.name;

  // Check if current tab is in a nested sub-screen (e.g. flashcards, session, details, [id], quiz)
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
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.tabBarBorder,
          paddingBottom: Math.max(insets.bottom, 8),
          shadowColor: isDark ? '#000000' : '#111827',
        },
      ]}>
      <View style={styles.barContainer}>
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
    height: 56,
    paddingHorizontal: 8,
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
    fontSize: 10,
    marginTop: 3,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  centerButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
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
