import { Play } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from 'react-native-reanimated';

import { RotatingChevron } from '@/components/ui/RotatingChevron';
import { useAppTheme } from '@/context/theme-context';
import { Lesson, Topic } from '@/types/curriculum';

export interface PremadeTopicItemProps {
  topic: Topic;
  tIdx?: number;
  isLastTopic: boolean;
  isTopicOpen: boolean;
  toggleTopic: (id: string) => void;
  subjectTitle: string;
  parentPalette?: {
    bg: string;
    darkBg: string;
    icon: string;
    darkIcon: string;
  };
  onLaunchQuiz: (params: {
    quizTitle: string;
    quizSubtitle: string;
    subjectId?: string;
    topicId?: string;
    lessonId?: string;
  }) => void;
}

export function PremadeTopicItem({
  topic,
  isTopicOpen,
  toggleTopic,
  subjectTitle,
  parentPalette,
  onLaunchQuiz,
}: PremadeTopicItemProps) {
  const { colors, isDark } = useAppTheme();

  const badgeBg = parentPalette
    ? isDark
      ? parentPalette.darkBg
      : parentPalette.bg
    : isDark
      ? 'rgba(224, 122, 95, 0.22)'
      : '#FCE7F3';

  const badgeIconColor = parentPalette
    ? isDark
      ? parentPalette.darkIcon
      : parentPalette.icon
    : colors.accent;

  const handleTopicQuizLaunch = () => {
    onLaunchQuiz({
      quizTitle: `${topic.title} Drill`,
      quizSubtitle: `${subjectTitle} • Topic ${topic.topicNumber}`,
      subjectId: topic.subjectId,
      topicId: topic.id,
    });
  };

  const handleLessonQuizLaunch = (lesson: Lesson) => {
    onLaunchQuiz({
      quizTitle: `${lesson.title} Quiz`,
      quizSubtitle: `${subjectTitle} • ${topic.title}`,
      subjectId: topic.subjectId,
      topicId: topic.id,
      lessonId: lesson.id,
    });
  };

  return (
    <Animated.View
      layout={LinearTransition.duration(200)}
      style={[
        styles.topicCardBox,
        {
          backgroundColor: isDark ? '#232731' : '#F9FAFB',
          borderColor: isDark
            ? isTopicOpen
              ? 'rgba(255, 255, 255, 0.12)'
              : 'rgba(255, 255, 255, 0.05)'
            : isTopicOpen
              ? 'rgba(0, 0, 0, 0.08)'
              : 'rgba(0, 0, 0, 0.04)',
        },
      ]}>
      {/* LEVEL 2: TOPIC HEADER ROW */}
      <View style={styles.topicHeaderRow}>
        {/* Toggle Dropdown Clickable Area */}
        <Pressable
          onPress={() => toggleTopic(topic.id)}
          style={styles.topicHeaderClickable}>
          {/* Topic Number Circular Badge */}
          <View
            style={[
              styles.topicBadge,
              {
                backgroundColor: badgeBg,
              },
            ]}>
            <Text
              style={[
                styles.topicBadgeNumber,
                { color: badgeIconColor },
              ]}>
              {topic.topicNumber}
            </Text>
          </View>

          {/* Topic Title */}
          <Text
            numberOfLines={2}
            style={[
              styles.topicTitleText,
              { color: isDark ? '#F3F4F6' : '#1F2937' },
            ]}>
            {topic.title}
          </Text>

          {/* Rotating Chevron */}
          <View style={styles.chevronWrapper}>
            <RotatingChevron
              isOpen={isTopicOpen}
              color={isDark ? '#9CA3AF' : '#6B7280'}
              size={18}
            />
          </View>
        </Pressable>

        {/* Minimal Play Icon Button on Topic */}
        <Pressable
          onPress={handleTopicQuizLaunch}
          hitSlop={8}
          style={({ pressed }) => [
            styles.topicPlayBtn,
            {
              backgroundColor: isDark ? 'rgba(224, 122, 95, 0.18)' : '#F8EAE4',
              opacity: pressed ? 0.7 : 1,
            },
          ]}>
          <Play size={11} color={colors.accent} fill={colors.accent} />
        </Pressable>
      </View>

      {/* LEVEL 3: LESSONS LIST INSIDE TOPIC */}
      {isTopicOpen && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          exiting={FadeOutUp.duration(160)}
          layout={LinearTransition.duration(200)}
          style={[
            styles.lessonsWrapper,
            {
              borderTopColor: isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.04)',
            },
          ]}>
          {topic.lessons.map((lesson, lIdx) => {
            return (
              <Pressable
                key={lesson.id}
                onPress={() => handleLessonQuizLaunch(lesson)}
                style={({ pressed }) => [
                  styles.lessonItemRow,
                  {
                    backgroundColor: pressed
                      ? isDark
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(0, 0, 0, 0.02)'
                      : 'transparent',
                    borderBottomColor:
                      lIdx < topic.lessons.length - 1
                        ? isDark
                          ? 'rgba(255, 255, 255, 0.04)'
                          : 'rgba(0, 0, 0, 0.03)'
                        : 'transparent',
                  },
                ]}>
                {/* Lesson Mini Number Badge */}
                <View
                  style={[
                    styles.lessonNumberBadge,
                    {
                      backgroundColor: isDark ? '#1C1F26' : '#ECE8E5',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.lessonNumberText,
                      { color: colors.textSecondary },
                    ]}>
                    {lesson.lessonNumber || lIdx + 1}
                  </Text>
                </View>

                {/* Lesson Title */}
                <Text
                  numberOfLines={1}
                  style={[
                    styles.lessonTitleText,
                    { color: isDark ? '#E5E7EB' : '#374151' },
                  ]}>
                  {lesson.title}
                </Text>

                {/* Mini Quiz Action Indicator */}
                <View style={styles.lessonActionBox}>
                  <Play size={11} color={colors.accent} fill={colors.accent} />
                </View>
              </Pressable>
            );
          })}
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  topicCardBox: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 8,
  },
  topicHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 10,
    gap: 8,
  },
  topicHeaderClickable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topicBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicBadgeNumber: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  topicTitleText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  chevronWrapper: {
    paddingHorizontal: 2,
  },
  topicPlayBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonsWrapper: {
    borderTopWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lessonItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderBottomWidth: 1,
    gap: 10,
  },
  lessonNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonNumberText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  lessonTitleText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
  },
  lessonActionBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
