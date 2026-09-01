import { useQuery } from 'convex/react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Flame,
  Landmark,
  User,
} from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
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
import { useLessonProgress, useLocalHierarchy, useLocalStats } from '@/hooks/useLocalData';
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
  const { refetch } = useLocalStats();
  const { curriculum } = useLocalHierarchy();
  const { completedLessonIds, refetch: refetchProgress } = useLessonProgress();

  const [showAllLessons, setShowAllLessons] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refetch?.();
      refetchProgress?.();
    }, [refetch, refetchProgress])
  );

  const userName =
    userProfile?.firstName ||
    userProfile?.username ||
    'User';

  // Active Continue Learning subjects/lessons matching real SQLite progress
  const continueItems = useMemo(() => {
    if (curriculum && curriculum.length > 0) {
      return curriculum.slice(0, 2).map((sub, sIdx) => {
        const allLessonIds = sub.topics.flatMap((t) => t.lessons.map((l) => l.id));
        const total = allLessonIds.length;
        const done = allLessonIds.filter((id) => completedLessonIds.has(id)).length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return {
          id: sub.id,
          title: sub.title.toUpperCase(),
          percent: pct,
          icon: sIdx === 0 ? BookOpen : Landmark,
        };
      });
    }
    return [
      {
        id: 'c1',
        title: 'HISTORY OF ARCHITECTURE',
        percent: 0,
        icon: BookOpen,
      },
      {
        id: 'c2',
        title: 'STRUCTURAL DESIGN',
        percent: 0,
        icon: Landmark,
      },
    ];
  }, [curriculum, completedLessonIds]);

  // Up to 10 Recent / Syllabus Lessons for the Confidence Rate Section
  const confidenceLessons: ConfidenceItem[] = useMemo(() => {
    const collected: ConfidenceItem[] = [];

    for (const sub of curriculum) {
      for (const topic of sub.topics) {
        for (const les of topic.lessons) {
          const isDone = completedLessonIds.has(les.id);
          collected.push({
            id: les.id,
            lessonName: les.title,
            topicName: topic.title,
            confidencePercent: isDone ? 100 : 50,
          });
          if (collected.length >= 10) break;
        }
        if (collected.length >= 10) break;
      }
      if (collected.length >= 10) break;
    }




    if (collected.length < 10) {
      return [
        { id: 'l1', lessonName: 'History of Architecture', confidencePercent: 50 },
        { id: 'l2', lessonName: 'Theory of Design', confidencePercent: 70 },
        { id: 'l3', lessonName: 'Building Utilities', confidencePercent: 60 },
        { id: 'l4', lessonName: 'Space Planning', confidencePercent: 93 },
        { id: 'l5', lessonName: 'RA 9266 Architecture Act', confidencePercent: 100 },
        { id: 'l6', lessonName: 'NBCP Rule 7 & 8', confidencePercent: 45 },
        { id: 'l7', lessonName: 'Structural Concepts', confidencePercent: 82 },
        { id: 'l8', lessonName: 'Plumbing & Sanitary', confidencePercent: 68 },
        { id: 'l9', lessonName: 'Electrical Systems', confidencePercent: 77 },
        { id: 'l10', lessonName: 'Site Planning & Ecology', confidencePercent: 88 },
      ];
    }

    return collected.slice(0, 10);
  }, [curriculum, completedLessonIds]);

  const displayedLessons = useMemo(() => {
    return showAllLessons ? confidenceLessons : confidenceLessons.slice(0, 5);
  }, [confidenceLessons, showAllLessons]);

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
        {/* 1. MAIN HERO BLOCK (Circular Avatar on Left, Motivation & Centered Fire on Right) */}
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
          {/* Left: Large User Profile Circular Avatar */}
          <Pressable
            onPress={() => router.push('/(tabs)/profile' as any)}
            style={({ pressed }) => [
              styles.heroAvatarBox,
              {
                backgroundColor: colors.accentMuted,
                borderColor: colors.accentBorder,
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <User size={46} color={colors.accent} strokeWidth={2.3} />
          </Pressable>

          {/* Right Column: Centered Flame, 3 DAYS, and 20% Milestone Progress */}
          <View style={styles.heroRightColumn}>
            {/* Flame & 3 DAYS centered along the progress bar */}
            <View style={styles.heroStreakCenteredBox}>
              <Flame size={50} color="#F59E0B" fill="#F59E0B" />
              <Text
                style={[
                  styles.heroStreakText,
                  { color: isDark ? '#FBBF24' : '#D97706' },
                ]}>
                3 DAYS
              </Text>
            </View>

            {/* Bottom: Progress Bar (20%) & Milestone Voucher Caption */}
            <View style={styles.heroBottomProgressArea}>
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
                      width: '20%',
                      backgroundColor: colors.accent,
                    },
                  ]}
                />
              </View>

              {/* Caption directly under the bar - full text without ellipsis */}
              <Text
                style={[
                  styles.heroMilestoneVoucherText,
                  { color: colors.textSecondary },
                ]}>
                COMPLETE 10 DAYS TO GET DISCOUNT VOUCHER
              </Text>
            </View>
          </View>
        </View>

        {/* ================================================================= */}
        {/* 2. CONFIDENCE RATE SECTION                                        */}
        {/* ================================================================= */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Confidence Rate
            </Text>
          </View>

          <View
            style={[
              styles.confidenceChartCard,
              {
                backgroundColor: isDark ? colors.backgroundElement : '#FFFFFF',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.06)',
              },
            ]}>
            <View style={styles.confidenceChartWrapper}>
              {/* Rows Area with Bounded Vertical Axis Line */}
              <View style={styles.chartContentArea}>
                {/* Continuous Vertical Axis Line strictly bounded to the rows */}
                <View
                  style={[
                    styles.chartVerticalAxis,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.35)'
                        : '#111827',
                    },
                  ]}
                />

                {/* Rows */}
                <View style={styles.chartRowsContainer}>
                  {displayedLessons.map((item) => {
                    // Bar width ratio relative to 68% max container width so % fits on right
                    const barWidthPercent = Math.max(3, Math.min(100, item.confidencePercent)) * 0.68;

                    return (
                      <View key={item.id} style={styles.chartRow}>
                        {/* Left Column: Actual Lesson Name */}
                        <View style={styles.chartLeftLabelBox}>
                          <Text
                            style={[
                              styles.chartLessonText,
                              { color: colors.text },
                            ]}>
                            {item.lessonName}
                          </Text>
                        </View>

                        {/* Right Area: Horizontal Bar sprouting directly from vertical line + % at the tip */}
                        <View style={styles.chartRightBarArea}>
                          <View
                            style={[
                              styles.chartHorizontalBar,
                              {
                                width: `${barWidthPercent}%`,
                                backgroundColor: colors.accent,
                              },
                            ]}
                          />
                          <Text
                            style={[
                              styles.chartPercentLabel,
                              { color: colors.accent },
                            ]}>
                            {item.confidencePercent}%
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Show More / Show Less Toggle Button (Up to 10) - Outside Axis Boundary */}
              {confidenceLessons.length > 5 && (
                <Pressable
                  onPress={() => setShowAllLessons((prev) => !prev)}
                  style={({ pressed }) => [
                    styles.toggleLessonsBtn,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(0, 0, 0, 0.03)',
                      borderColor: isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.06)',
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}>
                  <Text
                    style={[styles.toggleLessonsBtnText, { color: colors.accent }]}>
                    {showAllLessons ? 'Show Top 5' : 'Show Up to 10 Lessons'}
                  </Text>
                  {showAllLessons ? (
                    <ChevronUp size={14} color={colors.accent} strokeWidth={2.4} />
                  ) : (
                    <ChevronDown size={14} color={colors.accent} strokeWidth={2.4} />
                  )}
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* ================================================================= */}
        {/* 3. CONTINUE LEARNING SECTION                                      */}
        {/* ================================================================= */}
        <View style={styles.sectionContainer}>
          {/* Section Header Row with Vertical Accent Bar */}
          <View style={styles.continueSectionHeader}>
            <View
              style={[
                styles.continueHeaderAccentBar,
                { backgroundColor: colors.accent },
              ]}
            />
            <Text style={[styles.continueSectionTitle, { color: colors.text }]}>
              CONTINUE LEARNING
            </Text>
          </View>

          {/* List of Continue Learning Cards */}
          <View style={styles.continueCardsList}>
            {continueItems.map((item) => {
              const IconComp = item.icon;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => router.push('/(tabs)/learn' as any)}
                  style={({ pressed }) => [
                    styles.continueLearningCard,
                    {
                      backgroundColor: isDark
                        ? colors.backgroundElement
                        : '#FFFFFF',
                      borderColor: isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.06)',
                      opacity: pressed ? 0.92 : 1,
                      transform: [{ scale: pressed ? 0.99 : 1 }],
                    },
                  ]}>
                  {/* Left: Soft Tinted Circular Icon Container */}
                  <View
                    style={[
                      styles.circularIconWrap,
                      {
                        backgroundColor: colors.accentMuted,
                        borderColor: colors.accentBorder,
                      },
                    ]}>
                    <IconComp
                      size={22}
                      color={colors.accent}
                      strokeWidth={2.2}
                    />
                  </View>

                  {/* Middle: Title & % on header row, Progress track below */}
                  <View style={styles.continueCardContent}>
                    <View style={styles.continueCardHeaderRow}>
                      <Text
                        style={[
                          styles.continueSubjectTitle,
                          { color: colors.text },
                        ]}>
                        {item.title}
                      </Text>
                      <Text
                        style={[
                          styles.continuePercentBadge,
                          { color: colors.accent },
                        ]}>
                        {item.percent}%
                      </Text>
                    </View>

                    {/* Progress Track */}
                    <View
                      style={[
                        styles.continueProgressTrack,
                        {
                          backgroundColor: isDark
                            ? 'rgba(255, 255, 255, 0.10)'
                            : 'rgba(239, 241, 245, 1)',
                        },
                      ]}>
                      <View
                        style={[
                          styles.continueProgressFill,
                          {
                            width: `${item.percent}%`,
                            backgroundColor: colors.accent,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Right Divider & Circular Chevron Action Button */}
                  <View
                    style={[
                      styles.continueRightDivider,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.06)',
                      },
                    ]}
                  />

                  <View
                    style={[
                      styles.chevronCircleWrap,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.06)'
                          : '#F8FAFC',
                      },
                    ]}>
                    <ChevronRight
                      size={18}
                      color={colors.text}
                      strokeWidth={2.4}
                    />
                  </View>
                </Pressable>
              );
            })}
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
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroAvatarBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRightColumn: {
    flex: 1,
    gap: 10,
    justifyContent: 'center',
  },
  heroStreakCenteredBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    alignSelf: 'center',
  },
  heroStreakText: {
    fontSize: 14.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  heroBottomProgressArea: {
    gap: 5,
    width: '100%',
  },
  heroProgressTrack: {
    height: 6,
    borderRadius: Radius.full,
    overflow: 'hidden',
    width: '100%',
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  heroMilestoneVoucherText: {
    fontSize: 8.8,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
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
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  confidenceChartCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  confidenceChartWrapper: {
    gap: 4,
  },
  chartContentArea: {
    position: 'relative',
  },
  chartVerticalAxis: {
    position: 'absolute',
    left: 130,
    top: 2,
    bottom: 2,
    width: 2,
    borderRadius: 1,
    zIndex: 1,
  },
  chartRowsContainer: {
    gap: 16,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 28,
    paddingVertical: 2,
  },
  chartLeftLabelBox: {
    width: 130,
    paddingRight: 10,
    justifyContent: 'center',
  },
  chartLessonText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.1,
    lineHeight: 15,
  },
  chartRightBarArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartHorizontalBar: {
    height: 4.5,
    borderRadius: 2.5,
  },
  chartPercentLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  toggleLessonsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'center',
    gap: 5,
  },
  toggleLessonsBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* ======================================================================= */
  /* 3. Continue Learning Section                                            */
  /* ======================================================================= */
  continueSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  continueHeaderAccentBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
  continueSectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  continueCardsList: {
    gap: 12,
  },
  continueLearningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 22,
    borderWidth: 1,
    gap: 14,
  },
  circularIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueCardContent: {
    flex: 1,
    gap: 8,
  },
  continueCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  continueSubjectTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 0.3,
    flex: 1,
  },
  continuePercentBadge: {
    fontSize: 14,
    fontWeight: '900',
  },
  continueProgressTrack: {
    height: 7,
    borderRadius: 3.5,
    overflow: 'hidden',
    width: '100%',
  },
  continueProgressFill: {
    height: '100%',
    borderRadius: 3.5,
  },
  continueRightDivider: {
    width: 1,
    height: 32,
    marginHorizontal: 2,
  },
  chevronCircleWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
