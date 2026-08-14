import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User,
  Award,
  BookMarked,
  Settings,
  Flame,
  Shield,
  ChevronRight,
} from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';

export default function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 90 },
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.kicker, { color: theme.accent }]}>
            EXAMINEE PROFILE
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>
            Study Statistics
          </Text>
        </View>

        {/* Profile Card */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
            },
          ]}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: 'rgba(217, 119, 6, 0.15)' },
            ]}>
            <User size={32} color={theme.accent} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: theme.text }]}>
              Architect Aspirant
            </Text>
            <Text style={[styles.role, { color: theme.textSecondary }]}>
              ALE 2026 Examinee
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}>
            <Flame size={20} color={theme.accent} />
            <Text style={[styles.statNumber, { color: theme.text }]}>14</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Day Streak
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}>
            <Award size={20} color={theme.accent} />
            <Text style={[styles.statNumber, { color: theme.text }]}>84%</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Avg Score
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}>
            <BookMarked size={20} color={theme.accent} />
            <Text style={[styles.statNumber, { color: theme.text }]}>142</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Saved Items
            </Text>
          </View>
        </View>

        {/* Settings Links */}
        <View style={styles.menuContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <Shield size={20} color={theme.textSecondary} />
            <Text style={[styles.menuText, { color: theme.text }]}>
              Syllabus Coverage Breakdown
            </Text>
            <ChevronRight size={18} color={theme.textSecondary} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <Settings size={20} color={theme.textSecondary} />
            <Text style={[styles.menuText, { color: theme.text }]}>
              Reviewer Preferences & Timers
            </Text>
            <ChevronRight size={18} color={theme.textSecondary} />
          </Pressable>
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
    marginBottom: 20,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    gap: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
  },
  role: {
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
  },
  menuContainer: {
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
