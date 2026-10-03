import React, { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useQuery } from 'convex/react';
import { BookOpen, Landmark } from 'lucide-react-native';

import { useAppTheme } from '@/context/theme-context';
import {
  useLessonProgress,
  useLocalAttempts,
  useLocalHierarchy,
  useLocalStats,
} from '@/hooks/useLocalData';
import {
  ConfidenceItem,
  ConfidenceRateSection,
  ContinueItem,
  ContinueLearningSection,
  HomeHeroCard,
  WhatsNewCard,
} from '@/components/home';
import { api } from '../../../convex/_generated/api';

export default function HomeScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const userProfile = useQuery(api.users.getCurrentUserProfile);
  const { stats, refetch } = useLocalStats();
  const { curriculum } = useLocalHierarchy();
  const { completedLessonIds, lessonTimestamps, refetch: refetchProgress } =
    useLessonProgress();
  const { attempts, refetch: refetchAttempts } = useLocalAttempts();

  useFocusEffect(
    useCallback(() => {
      refetch?.();
      refetchProgress?.();
      refetchAttempts?.();
    }, [refetch, refetchProgress, refetchAttempts])
  );

  const userName =
    userProfile?.firstName || userProfile?.username || 'User';
  const displayAvatarUri = (userProfile as any)?.profileImageUrl || null;

  const streakDays = stats?.streakDays ?? 0;
  const milestoneTarget =
    streakDays >= 10 ? (Math.floor(streakDays / 10) + 1) * 10 : 10;
  const streakProgressPercent = Math.min(
    100,
    Math.max(0, Math.round((streakDays / milestoneTarget) * 100))
  );

  // Active Continue Learning subjects/lessons matching real SQLite progress
  const continueItems: ContinueItem[] = useMemo(() => {
    if (!curriculum || curriculum.length === 0) return [];

    const subjectsWithProgress = curriculum.map((sub, sIdx) => {
      const allLessonsWithTopic = sub.topics.flatMap((t) =>
        t.lessons.map((l) => ({
          id: l.id,
          topicId: t.id,
        }))
      );
      const allLessonIds = allLessonsWithTopic.map((l) => l.id);
      const allTopicIds = sub.topics.map((t) => t.id);
      const total = allLessonIds.length;
      const done = allLessonIds.filter((id) =>
        completedLessonIds.has(id)
      ).length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;

      // Find next incomplete lesson to focus when continuing
      const nextLesson =
        allLessonsWithTopic.find((l) => !completedLessonIds.has(l.id)) ||
        allLessonsWithTopic[0];

      let lastActiveTimestamp = 0;
      for (const lid of allLessonIds) {
        const ts = lessonTimestamps?.get(lid) || 0;
        if (ts > lastActiveTimestamp) {
          lastActiveTimestamp = ts;
        }
      }
      for (const tid of allTopicIds) {
        const ts = lessonTimestamps?.get(tid) || 0;
        if (ts > lastActiveTimestamp) {
          lastActiveTimestamp = ts;
        }
      }
      const subDirectTs = lessonTimestamps?.get(sub.id) || 0;
      if (subDirectTs > lastActiveTimestamp) {
        lastActiveTimestamp = subDirectTs;
      }

      return {
        id: sub.id,
        title: sub.title.toUpperCase(),
        percent: pct,
        done,
        total,
        icon: sIdx === 0 ? BookOpen : Landmark,
        lastActiveTimestamp,
        nextLessonId: nextLesson?.id,
        nextTopicId: nextLesson?.topicId,
      };
    });

    // Only include subjects with progress (> 0) that are not yet 100% completed (done < total)
    const inProgress = subjectsWithProgress.filter(
      (s) => s.done > 0 && s.done < s.total
    );

    // Sort by latest clicked/completed at the top (highest timestamp first)
    inProgress.sort((a, b) => b.lastActiveTimestamp - a.lastActiveTimestamp);

    // Display up to 5 items
    return inProgress.slice(0, 5);
  }, [curriculum, completedLessonIds, lessonTimestamps]);

  // Up to 10 Recent / Syllabus Lessons for the Confidence Rate Section
  const confidenceLessons: ConfidenceItem[] = useMemo(() => {
    if (!curriculum || curriculum.length === 0) return [];

    const collected: (ConfidenceItem & { lastActiveTimestamp: number })[] = [];

    // Map quiz attempts by subject/quiz to derive subject mastery scores
    const subjectScores = new Map<string, number[]>();
    const generalPracticeScores: number[] = [];

    for (const att of attempts) {
      if (typeof att.score === 'number') {
        if (att.quizId === 'all-modular' || !att.quizId) {
          generalPracticeScores.push(att.score);
        } else {
          const scores = subjectScores.get(att.quizId) || [];
          scores.push(att.score);
          subjectScores.set(att.quizId, scores);
        }
      }
    }

    const generalAvgScore =
      generalPracticeScores.length > 0
        ? Math.round(
            generalPracticeScores.reduce((a, b) => a + b, 0) /
              generalPracticeScores.length
          )
        : stats?.averageScore && stats.averageScore > 0
          ? stats.averageScore
          : null;

    for (const sub of curriculum) {
      let subScores = subjectScores.get(sub.id) || [];
      if (subScores.length === 0) {
        for (const [key, scores] of subjectScores.entries()) {
          if (
            sub.title.toLowerCase().includes(key.toLowerCase()) ||
            key.toLowerCase().includes(sub.title.toLowerCase())
          ) {
            subScores = scores;
            break;
          }
        }
      }

      const directAvgScore =
        subScores.length > 0
          ? Math.round(subScores.reduce((a, b) => a + b, 0) / subScores.length)
          : null;

      const effectiveScore =
        directAvgScore !== null ? directAvgScore : generalAvgScore;

      for (const topic of sub.topics) {
        const topicLessonIds = topic.lessons.map((l) => l.id);
        const total = topicLessonIds.length;
        const done = topicLessonIds.filter((id) =>
          completedLessonIds.has(id)
        ).length;

        let confidencePercent = 0;
        let lastActiveTimestamp = 0;

        if (total > 0 && done > 0) {
          const completionPct = Math.round((done / total) * 100);
          if (effectiveScore !== null && effectiveScore > 0) {
            confidencePercent = Math.min(
              100,
              Math.round(completionPct * 0.5 + effectiveScore * 0.5)
            );
          } else {
            confidencePercent = completionPct;
          }

          for (const lid of topicLessonIds) {
            const ts = lessonTimestamps?.get(lid) || 0;
            if (ts > lastActiveTimestamp) {
              lastActiveTimestamp = ts;
            }
          }

          const topicDirectTs = lessonTimestamps?.get(topic.id) || 0;
          if (topicDirectTs > lastActiveTimestamp) {
            lastActiveTimestamp = topicDirectTs;
          }
        }

        if (confidencePercent > 0) {
          collected.push({
            id: topic.id,
            lessonName: topic.title,
            topicName: sub.title,
            confidencePercent,
            lastActiveTimestamp,
          });
        }
      }
    }

    collected.sort((a, b) => b.lastActiveTimestamp - a.lastActiveTimestamp);

    return collected
      .slice(0, 10)
      .map(({ lastActiveTimestamp, ...item }) => item);
  }, [curriculum, completedLessonIds, lessonTimestamps, attempts, stats]);

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
        {/* 1. Main Hero Block */}
        <HomeHeroCard
          displayAvatarUri={displayAvatarUri}
          streakDays={streakDays}
          milestoneTarget={milestoneTarget}
          streakProgressPercent={streakProgressPercent}
        />

        {/* 2. What's New / Announcement Card */}
        <WhatsNewCard />

        {/* 3. Confidence Rate Section */}
        <ConfidenceRateSection confidenceLessons={confidenceLessons} />

        {/* 4. Continue Learning Section */}
        <ContinueLearningSection continueItems={continueItems} />
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
});
