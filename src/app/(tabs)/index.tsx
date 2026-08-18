import { useRouter } from 'expo-router';
import {
  Award,
  BookOpen,
  ChevronRight,
  Clock,
  FileEdit,
  Flame,
  Layers,
  Play,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react-native';
import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

export default function HomeScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerGreeting, { color: colors.textSecondary }]}>
            Welcome back
          </Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Dashboard
          </Text>
        </View>

        {/* Streak Pill Header Icon */}
        <View
          style={[
            styles.streakBadge,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
            },
          ]}>
          <Flame size={16} color="#F59E0B" fill="#F59E0B" />
          <Text style={[styles.streakBadgeText, { color: colors.text }]}>
            5d
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 90 },
        ]}>
        {/* 1. OVERALL PROGRESS BLOCK (Split left & right) */}
        <View
          style={[
            styles.progressBlock,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
              shadowColor: isDark ? '#000000' : '#111827',
            },
          ]}>
          {/* Left Column: Progress text, percentage, motivational text, progress bar */}
          <View style={styles.progressLeft}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
              YOUR PROGRESS
            </Text>

            <Text style={[styles.progressPercentage, { color: colors.text }]}>
              74%
            </Text>

            <Text style={[styles.progressMotivation, { color: colors.accent }]}>
              You're doing great!
            </Text>

            {/* Progress Bar */}
            <View
              style={[
                styles.progressBarTrack,
                { backgroundColor: colors.backgroundSelected },
              ]}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: '74%', backgroundColor: colors.accent },
                ]}
              />
            </View>
          </View>

          {/* Right Column: Icon */}
          <View style={styles.progressRight}>
            <View
              style={[
                styles.iconBubble,
                {
                  backgroundColor: colors.accentMuted,
                  borderColor: colors.border,
                },
              ]}>
              <Award size={36} color={colors.accent} strokeWidth={2.2} />
            </View>
          </View>
        </View>

        {/* 2. BENTO BOX NAVIGATION (The other 3 navigation tabs: Learn, Practice, Exams) */}
        <View style={styles.bentoSection}>
          {/* Bento Item 1: LEARN (Wide Featured Card) */}
          <Pressable
            onPress={() => router.push('/(tabs)/learn' as any)}
            style={({ pressed }) => [
              styles.bentoCardLarge,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
                opacity: pressed ? 0.88 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
                shadowColor: isDark ? '#000000' : '#111827',
              },
            ]}>
            <View style={styles.bentoCardLargeInner}>
              <View
                style={[
                  styles.bentoIconContainer,
                  { backgroundColor: colors.accentMuted },
                ]}>
                <BookOpen size={24} color={colors.accent} strokeWidth={2.2} />
              </View>

              <View style={styles.bentoTextGroup}>
                <Text style={[styles.bentoTitle, { color: colors.text }]}>
                  Learn
                </Text>
                <Text
                  style={[
                    styles.bentoSubtitle,
                    { color: colors.textSecondary },
                  ]}>
                  Study modules & lessons
                </Text>
              </View>

              <View
                style={[
                  styles.arrowCircle,
                  { backgroundColor: colors.backgroundSelected },
                ]}>
                <ChevronRight size={18} color={colors.textSecondary} />
              </View>
            </View>
          </Pressable>

          {/* Bento Items 2 & 3: PRACTICE and EXAMS (Two Split Cards Side-by-Side) */}
          <View style={styles.bentoRow}>
            {/* PRACTICE */}
            <Pressable
              onPress={() => router.push('/(tabs)/practice' as any)}
              style={({ pressed }) => [
                styles.bentoCardSmall,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                  opacity: pressed ? 0.88 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  shadowColor: isDark ? '#000000' : '#111827',
                },
              ]}>
              <View
                style={[
                  styles.bentoIconContainer,
                  { backgroundColor: colors.accentMuted },
                ]}>
                <FileEdit size={22} color={colors.accent} strokeWidth={2.2} />
              </View>
              <View style={styles.bentoSmallTextGroup}>
                <Text style={[styles.bentoTitle, { color: colors.text }]}>
                  Practice
                </Text>
                <Text
                  style={[
                    styles.bentoSubtitle,
                    { color: colors.textSecondary },
                  ]}>
                  Drills & flashcards
                </Text>
              </View>
            </Pressable>

            {/* EXAMS */}
            <Pressable
              onPress={() => router.push('/(tabs)/exams' as any)}
              style={({ pressed }) => [
                styles.bentoCardSmall,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                  opacity: pressed ? 0.88 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  shadowColor: isDark ? '#000000' : '#111827',
                },
              ]}>
              <View
                style={[
                  styles.bentoIconContainer,
                  { backgroundColor: colors.accentMuted },
                ]}>
                <Target size={22} color={colors.accent} strokeWidth={2.2} />
              </View>
              <View style={styles.bentoSmallTextGroup}>
                <Text style={[styles.bentoTitle, { color: colors.text }]}>
                  Exams
                </Text>
                <Text
                  style={[
                    styles.bentoSubtitle,
                    { color: colors.textSecondary },
                  ]}>
                  Mock simulations
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* 3. KEY STATS CHIPS (Minimal Text, Icon Driven) */}
        <View
          style={[
            styles.statsStrip,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
            },
          ]}>
          <View style={styles.statItem}>
            <Clock size={16} color={colors.accent} />
            <Text style={[styles.statItemValue, { color: colors.text }]}>
              128h
            </Text>
            <Text
              style={[styles.statItemLabel, { color: colors.textSecondary }]}>
              Time
            </Text>
          </View>

          <View
            style={[styles.statItemDivider, { backgroundColor: colors.border }]}
          />

          <View style={styles.statItem}>
            <Zap size={16} color="#EAB308" />
            <Text style={[styles.statItemValue, { color: colors.text }]}>
              1.4k
            </Text>
            <Text
              style={[styles.statItemLabel, { color: colors.textSecondary }]}>
              Solved
            </Text>
          </View>

          <View
            style={[styles.statItemDivider, { backgroundColor: colors.border }]}
          />

          <View style={styles.statItem}>
            <TrendingUp size={16} color="#10B981" />
            <Text style={[styles.statItemValue, { color: colors.text }]}>
              84%
            </Text>
            <Text
              style={[styles.statItemLabel, { color: colors.textSecondary }]}>
              Accuracy
            </Text>
          </View>
        </View>

        {/* 4. QUICK CONTINUE (Minimalist Jump Back In) */}
        <Pressable
          onPress={() => router.push('/(tabs)/learn/practice-law' as any)}
          style={({ pressed }) => [
            styles.continueCompactCard,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}>
          <View
            style={[
              styles.playIconBox,
              { backgroundColor: colors.accent },
            ]}>
            <Play size={14} color="#FFFFFF" fill="#FFFFFF" />
          </View>

          <View style={styles.continueInfo}>
            <Text
              style={[styles.continueTagText, { color: colors.accent }]}>
              CONTINUE RECENT
            </Text>
            <Text
              style={[styles.continueMainTitle, { color: colors.text }]}
              numberOfLines={1}>
              Rule 7 & 8: Classification
            </Text>
          </View>

          <View style={styles.continueRight}>
            <Text
              style={[styles.continueProgressText, { color: colors.textSecondary }]}>
              65%
            </Text>
            <ChevronRight size={16} color={colors.textSecondary} />
          </View>
        </Pressable>

        {/* 5. QUICK ACTIONS (Icon-driven shortcuts) */}
        <View style={styles.quickActionsRow}>
          <Pressable
            onPress={() => router.push('/(tabs)/practice/quiz' as any)}
            style={({ pressed }) => [
              styles.quickActionBtn,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <Sparkles size={16} color={colors.accent} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Daily 5-Min Drill
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(tabs)/practice/flashcards' as any)}
            style={({ pressed }) => [
              styles.quickActionBtn,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <Layers size={16} color={colors.accent} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Flashcards
            </Text>
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
    gap: 16,
  },

  /* Header */
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerGreeting: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  streakBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },

  /* 1. Progress Block (Split into left and right) */
  progressBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: Radius.lg,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      },
    }),
  },
  progressLeft: {
    flex: 1,
    paddingRight: 12,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  progressPercentage: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 2,
    lineHeight: 38,
  },
  progressMotivation: {
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 10,
  },
  progressBarTrack: {
    height: 7,
    borderRadius: Radius.full,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  progressRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBubble: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  /* 2. Bento Box Navigation */
  bentoSection: {
    gap: 12,
  },
  bentoCardLarge: {
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
      },
    }),
  },
  bentoCardLargeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bentoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoTextGroup: {
    flex: 1,
    gap: 2,
  },
  bentoTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  bentoSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bentoCardSmall: {
    flex: 1,
    padding: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
      },
    }),
  },
  bentoSmallTextGroup: {
    gap: 2,
  },

  /* 3. Key Stats Strip */
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  statItemValue: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  statItemLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  statItemDivider: {
    width: 1,
    height: 16,
  },

  /* 4. Quick Continue */
  continueCompactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 12,
  },
  playIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueInfo: {
    flex: 1,
    gap: 2,
  },
  continueTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  continueMainTitle: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  continueRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  continueProgressText: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* 5. Quick Actions Row */
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
