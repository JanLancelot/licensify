import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User,
  Award,
  BookMarked,
  Flame,
  Shield,
  ChevronRight,
  Sun,
  Moon,
  Smartphone,
  Palette,
} from 'lucide-react-native';

import { useAppTheme, ThemeMode } from '@/context/theme-context';
import { Radius } from '@/constants/theme';

export default function ProfileScreen() {
  const { colors, themeMode, setThemeMode, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const themeOptions: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
    { mode: 'system', label: 'System', icon: Smartphone },
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
  ];

  const handleToggleDarkMode = (value: boolean) => {
    setThemeMode(value ? 'dark' : 'light');
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 90 },
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.kicker, { color: colors.accent }]}>
            EXAMINEE PROFILE
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            Account & Settings
          </Text>
        </View>

        {/* Profile Card with Sharp Corners */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
            },
          ]}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.accentMuted, borderColor: colors.border },
            ]}>
            <User size={28} color={colors.accent} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: colors.text }]}>
              Architect Aspirant
            </Text>
            <Text style={[styles.role, { color: colors.textSecondary }]}>
              ALE 2026 Board Examinee
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}>
            <Flame size={18} color={colors.accent} />
            <Text style={[styles.statNumber, { color: colors.text }]}>14</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Day Streak
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}>
            <Award size={18} color={colors.accent} />
            <Text style={[styles.statNumber, { color: colors.text }]}>84%</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Avg Score
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}>
            <BookMarked size={18} color={colors.accent} />
            <Text style={[styles.statNumber, { color: colors.text }]}>142</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Saved Items
            </Text>
          </View>
        </View>

        {/* Appearance & Theme Setting Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Palette size={16} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              APPEARANCE & THEME
            </Text>
          </View>

          {/* Quick Dark Mode Toggle Card */}
          <View
            style={[
              styles.switchRow,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}>
            <View style={styles.switchLabelGroup}>
              {isDark ? (
                <Moon size={18} color={colors.accent} />
              ) : (
                <Sun size={18} color={colors.accent} />
              )}
              <Text style={[styles.switchLabel, { color: colors.text }]}>
                Dark Mode
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleToggleDarkMode}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          {/* 3-Way Mode Segmented Selector */}
          <View
            style={[
              styles.themeSelectorContainer,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
                marginTop: 8,
              },
            ]}>
            {themeOptions.map((opt) => {
              const isSelected = themeMode === opt.mode;
              const Icon = opt.icon;
              return (
                <Pressable
                  key={opt.mode}
                  onPress={() => setThemeMode(opt.mode)}
                  style={[
                    styles.themeOptionButton,
                    isSelected && {
                      backgroundColor: colors.accent,
                      borderColor: colors.accent,
                    },
                  ]}>
                  <Icon
                    size={15}
                    color={isSelected ? '#FFFFFF' : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.themeOptionText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.textSecondary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* General Links */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={16} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              REVIEWER PREFERENCES
            </Text>
          </View>

          <View style={styles.menuContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <Text style={[styles.menuText, { color: colors.text }]}>
                Syllabus Coverage Breakdown
              </Text>
              <ChevronRight size={18} color={colors.textSecondary} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <Text style={[styles.menuText, { color: colors.text }]}>
                Timer & Exam Mock Configurations
              </Text>
              <ChevronRight size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    marginBottom: 16,
  },
  kicker: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 14,
    marginBottom: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  profileInfo: {
    gap: 2,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
  },
  role: {
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2,
  },
  statNumber: {
    fontSize: 17,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10.5,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  switchLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  themeSelectorContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 4,
  },
  themeOptionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: Radius.sm,
  },
  themeOptionText: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
  menuContainer: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  menuText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
});
