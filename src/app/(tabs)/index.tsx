import { useQuery } from 'convex/react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  BookOpen,
  ChevronRight,
  Flame,
  TrendingUp,
  User,
} from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';
import { useLocalHierarchy, useLocalStats } from '@/hooks/useLocalData';
import { api } from '../../../convex/_generated/api';

interface ConfidenceItem {
  id: string;
  lessonName: string;
  topicName?: string;
  confidencePercent: number;
}

export default function HomeScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const userProfile = useQuery(api.users.getCurrentUserProfile);
  const { stats, refetch } = useLocalStats();
  const { curriculum } = useLocalHierarchy();

  useFocusEffect(
    useCallback(() => {
      refetch?.();
    }, [refetch])
  );

  const userName =
    userProfile?.firstName ||
    userProfile?.username ||
    'Kouji';

  const progressPercent = stats?.progressPercentage || 75;
  const streakDays = stats?.streakDays || 3;

  const continueSubject = curriculum[0] || {
    title: 'Architectural Design & Planning',
    topics: [{ title: 'Space Planning & Ergonomics' }],
  };

  // 5 Lessons for the Confidence Rate Section
  const confidenceLessons: ConfidenceItem[] = useMemo(() => {
    const collected: ConfidenceItem[] = [];
    const defaultPercents = [85, 30, 65, 90, 95];
    let lCount = 1;

    for (const sub of curriculum) {
      for (const topic of sub.topics) {
        for (const les of topic.lessons) {
          collected.push({
            id: les.id,
            lessonName: `Lesson ${lCount}`,
            topicName: les.title,
            confidencePercent: defaultPercents[(lCount - 1) % defaultPercents.length],
          });
          lCount++;
          if (collected.length >= 5) break;
        }
        if (collected.length >= 5) break;
      }
      if (collected.length >= 5) break;
    }

    if (collected.length < 5) {
      return [
        { id: 'l1', lessonName: 'Lesson 1', topicName: 'History of Architecture', confidencePercent: 85 },
        { id: 'l2', lessonName: 'Lesson 2', topicName: 'Theory of Design & Planning', confidencePercent: 30 },
        { id: 'l3', lessonName: 'Lesson 3', topicName: 'Building Utilities & Systems', confidencePercent: 65 },
        { id: 'l4', lessonName: 'Lesson 4', topicName: 'Space Planning & Ergonomics', confidencePercent: 90 },
        { id: 'l5', lessonName: 'Lesson 5', topicName: 'RA 9266 & Practice Laws', confidencePercent: 95 },
      ];
    }

    return collected.slice(0, 5);
  }, [curriculum]);

  const greetingTime = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <Text
          style={[
            styles.topHeaderGreeting,
            { color: isDark ? '#F9FAFB' : '#0F172A' },
          ]}>
          {greetingTime}, {userName}!
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 100 },
        ]}>
        {/* ================================================================= */}
        {/* 1. MAIN HERO BLOCK (Profile on Left, Motivation & Streak on Right)*/}
        {/* ================================================================= */}
        <View
          style={[
            styles.mainHeroCard,
            {
              backgroundColor: isDark ? colors.backgroundElement : '#FFFFFF',
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.06)',
            },
          ]}>
          {/* Top Row: Left Avatar & Name | Right Motivation & Fire Streak */}
          <View style={styles.heroTopRow}>
            {/* Left: User Profile Avatar & Name */}
            <Pressable
              onPress={() => router.push('/(tabs)/profile' as any)}
              style={({ pressed }) => [
                styles.profileAvatarBox,
                { opacity: pressed ? 0.85 : 1 },
              ]}>
              <View
                style={[
                  styles.avatarCircle,
                  {
                    backgroundColor: colors.accentMuted,
                    borderColor: colors.accentBorder,
                  },
                ]}>
                <User size={28} color={colors.accent} strokeWidth={2.4} />
              </View>
              <View style={styles.profileNameWrap}>
                <Text
                  style={[
                    styles.greetingLabel,
                    { color: colors.textSecondary },
                  ]}>
                  Hello,
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.userNameText, { color: colors.text }]}>
                  {userName}
                </Text>
              </View>
            </Pressable>

            {/* Right: Keep Up the Good Work & Fire Streak Badge */}
            <View style={styles.heroRightWrap}>
              <Text
                numberOfLines={1}
                style={[styles.heroMotivationTitle, { color: colors.text }]}>
                Keep up the good work!
              </Text>
              <View
                style={[
                  styles.streakBadge,
                  {
                    backgroundColor: isDark
                      ? 'rgba(245, 158, 11, 0.16)'
                      : '#FEF3C7',
                    borderColor: isDark
                      ? 'rgba(245, 158, 11, 0.3)'
                      : '#FDE68A',
                  },
                ]}>
                <Flame size={14} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.streakBadgeText}>{streakDays} days</Text>
              </View>
            </View>
          </View>

          {/* Bottom Row: Milestone Target Caption & Progress Bar */}
          <View style={styles.heroProgressSection}>
            <View style={styles.heroProgressInfoRow}>
              <Text
                numberOfLines={1}
                style={[
                  styles.milestoneCaption,
                  { color: colors.textSecondary },
                ]}>
                Complete{' '}
                <Text style={{ color: colors.accent, fontWeight: '700' }}>
                  2 lessons
                </Text>{' '}
                to get Weekly Badge
              </Text>
              <Text
                style={[styles.heroProgressPercent, { color: colors.accent }]}>
                {progressPercent}%
              </Text>
            </View>

            {/* Progress Bar Track */}
            <View
              style={[
                styles.heroProgressTrack,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.10)'
                    : 'rgba(0, 0, 0, 0.06)',
                },
              ]}>
              <View
                style={[
                  styles.heroProgressFill,
                  {
                    width: `${progressPercent}%`,
                    backgroundColor: colors.accent,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* ================================================================= */}
        {/* 2. CONFIDENCE RATE SECTION (2 Columns: Lessons & Horizontal Bars) */}
        {/* ================================================================= */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <TrendingUp size={18} color={colors.accent} strokeWidth={2.4} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Confidence Rate
              </Text>
            </View>
            <Text
              style={[
                styles.sectionSubtitleBadge,
                { color: colors.textSecondary },
              ]}>
              Topic Mastery
            </Text>
          </View>

          <View
            style={[
              styles.confidenceCard,
              {
                backgroundColor: isDark ? colors.backgroundElement : '#FFFFFF',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.06)',
              },
            ]}>
            {confidenceLessons.map((item, idx) => {
              const isLast = idx === confidenceLessons.length - 1;

              return (
                <View key={item.id}>
                  <View style={styles.confidenceRow}>
                    {/* Left Column: Lesson Name & Subtitle */}
                    <View style={styles.confidenceLeftCol}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.confidenceLessonLabel,
                          { color: colors.text },
                        ]}>
                        {item.lessonName}
                      </Text>
                      {item.topicName && (
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.confidenceTopicLabel,
                            { color: colors.textSecondary },
                          ]}>
                          {item.topicName}
                        </Text>
                      )}
                    </View>

                    {/* Vertical Divider Indicator */}
                    <View
                      style={[
                        styles.confidenceDividerLine,
                        {
                          backgroundColor: isDark
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(0, 0, 0, 0.06)',
                        },
                      ]}
                    />

                    {/* Right Column: Horizontal Bar & Percentage Text */}
                    <View style={styles.confidenceRightCol}>
                      <View
                        style={[
                          styles.confidenceBarTrack,
                          {
                            backgroundColor: isDark
                              ? 'rgba(255, 255, 255, 0.10)'
                              : 'rgba(0, 0, 0, 0.06)',
                          },
                        ]}>
                        <View
                          style={[
                            styles.confidenceBarFill,
                            {
                              width: `${item.confidencePercent}%`,
                              backgroundColor: colors.accent,
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.confidencePercentText,
                          { color: colors.accent },
                        ]}>
                        {item.confidencePercent}%
                      </Text>
                    </View>
                  </View>

                  {!isLast && (
                    <View
                      style={[
                        styles.itemRowSeparator,
                        {
                          backgroundColor: isDark
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.04)',
                        },
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* ================================================================= */}
        {/* 3. CONTINUE LEARNING SECTION (Circular Icon on Left)              */}
        {/* ================================================================= */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Continue Learning
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/learn' as any)}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <Text style={[styles.seeAllText, { color: colors.accent }]}>
                See all
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.push('/(tabs)/learn' as any)}
            style={({ pressed }) => [
              styles.continueLearningCard,
              {
                backgroundColor: isDark ? colors.backgroundElement : '#FFFFFF',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.06)',
                opacity: pressed ? 0.92 : 1,
                transform: [{ scale: pressed ? 0.99 : 1 }],
              },
            ]}>
            {/* Left: Perfectly Circular Icon with Active Theme */}
            <View
              style={[
                styles.circularIconWrap,
                {
                  backgroundColor: colors.accentMuted,
                  borderColor: colors.accentBorder,
                },
              ]}>
              <BookOpen size={24} color={colors.accent} strokeWidth={2.3} />
            </View>

            {/* Middle: Course Title, Subtitle, & Progress Bar */}
            <View style={styles.continueCardContent}>
              <View style={styles.continueCardHeaderRow}>
                <Text
                  style={[styles.continueSubjectTitle, { color: colors.text }]}
                  numberOfLines={1}>
                  {continueSubject.title}
                </Text>
                <Text
                  style={[
                    styles.continuePercentBadge,
                    { color: colors.accent },
                  ]}>
                  {progressPercent}%
                </Text>
              </View>

              <Text
                style={[
                  styles.continueTopicSubtitle,
                  { color: colors.textSecondary },
                ]}
                numberOfLines={1}>
                {continueSubject.topics[0]?.title || 'Core Syllabus Modules'}
              </Text>

              {/* Progress Track */}
              <View
                style={[
                  styles.continueProgressTrack,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.10)'
                      : 'rgba(0, 0, 0, 0.06)',
                  },
                ]}>
                <View
                  style={[
                    styles.continueProgressFill,
                    {
                      width: `${progressPercent}%`,
                      backgroundColor: colors.accent,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Right: Quick Action Arrow */}
            <View style={styles.chevronWrapper}>
              <ChevronRight
                size={18}
                color={colors.textSecondary}
                strokeWidth={2.4}
              />
            </View>
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
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  topHeaderGreeting: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 20,
  },

  /* ======================================================================= */
  /* 1. Main Hero Block                                                      */
  /* ======================================================================= */
  mainHeroCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  profileAvatarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileNameWrap: {
    flex: 1,
    gap: 1,
  },
  greetingLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  userNameText: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  heroRightWrap: {
    alignItems: 'flex-end',
    gap: 6,
  },
  heroMotivationTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  streakBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
  },
  heroProgressSection: {
    gap: 8,
    paddingTop: 4,
  },
  heroProgressInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  milestoneCaption: {
    fontSize: 12.5,
    fontWeight: '500',
    flex: 1,
  },
  heroProgressPercent: {
    fontSize: 13,
    fontWeight: '800',
  },
  heroProgressTrack: {
    height: 7,
    borderRadius: Radius.full,
    overflow: 'hidden',
    width: '100%',
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },

  /* ======================================================================= */
  /* 2. Confidence Rate Section                                              */
  /* ======================================================================= */
  sectionContainer: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionSubtitleBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  confidenceCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  confidenceLeftCol: {
    width: 105,
    gap: 2,
  },
  confidenceLessonLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  confidenceTopicLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  confidenceDividerLine: {
    width: 1,
    height: 24,
  },
  confidenceRightCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  confidenceBarTrack: {
    flex: 1,
    height: 7,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  confidencePercentText: {
    fontSize: 12.5,
    fontWeight: '800',
    width: 38,
    textAlign: 'right',
  },
  itemRowSeparator: {
    height: 1,
    width: '100%',
  },

  /* ======================================================================= */
  /* 3. Continue Learning Section                                            */
  /* ======================================================================= */
  continueLearningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    gap: 14,
  },
  circularIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueCardContent: {
    flex: 1,
    gap: 4,
  },
  continueCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  continueSubjectTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
    flex: 1,
  },
  continuePercentBadge: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  continueTopicSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  continueProgressTrack: {
    height: 5,
    borderRadius: Radius.full,
    overflow: 'hidden',
    width: '100%',
  },
  continueProgressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  chevronWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
  },
});
