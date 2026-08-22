import { Check, ChevronRight, FileText } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { RotatingChevron } from '@/components/ui/RotatingChevron';
import { useAppTheme } from '@/context/theme-context';
import { Lesson, Topic } from '@/types/curriculum';

export interface NoteTopicItemProps {
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
  completedLessonIds?: Set<string>;
  setSelectedLesson: (lessonData: {
    subjectTitle: string;
    topicTitle: string;
    lesson: Lesson;
  }) => void;
  theme?: any;
}

/* Reusable Topic Circular Progress Ring */
function TopicProgressBadge({
  size = 36,
  strokeWidth = 2.4,
  progress = 0,
  progressColor = '#10B981',
  bgColor,
  isDark,
  children,
}: {
  size?: number;
  strokeWidth?: number;
  progress?: number;
  progressColor?: string;
  bgColor?: string;
  isDark: boolean;
  children: React.ReactNode;
}) {
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference * (1 - clampedProgress);

  const defaultTrack = isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.06)';

  const innerSize = size - strokeWidth * 2 - 3;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Background Track Ring */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={defaultTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Green Progress Outline */}
        {clampedProgress > 0 && (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${center} ${center})`}
          />
        )}
      </Svg>

      {/* Inner Container */}
      <View
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          backgroundColor: bgColor,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {children}
      </View>
    </View>
  );
}

export function NoteTopicItem({
  topic,
  isTopicOpen,
  toggleTopic,
  subjectTitle,
  parentPalette,
  completedLessonIds = new Set(),
  setSelectedLesson,
}: NoteTopicItemProps) {
  const { colors, isDark } = useAppTheme();

  // Calculate topic progress
  const topicLessonIds = topic.lessons.map((l) => l.id);
  const completedInTopicCount = topicLessonIds.filter((id) =>
    completedLessonIds.has(id)
  ).length;
  const topicProgress =
    topicLessonIds.length > 0
      ? completedInTopicCount / topicLessonIds.length
      : 0;

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
      {/* LEVEL 2: CLEAN TOPIC HEADER ROW */}
      <Pressable
        onPress={() => toggleTopic(topic.id)}
        style={({ pressed }) => [
          styles.topicHeader,
          {
            backgroundColor: pressed
              ? isDark
                ? 'rgba(255, 255, 255, 0.04)'
                : 'rgba(0, 0, 0, 0.02)'
              : 'transparent',
          },
        ]}>
        {/* Topic Badge with Green Progress Ring Outline */}
        <TopicProgressBadge
          size={36}
          strokeWidth={2.4}
          progress={topicProgress}
          progressColor="#10B981"
          bgColor={badgeBg}
          isDark={isDark}>
          <Text
            style={[
              styles.topicBadgeNumber,
              { color: badgeIconColor },
            ]}>
            {topic.topicNumber}
          </Text>
        </TopicProgressBadge>

        {/* Clean Topic Title (No Clutter) */}
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

      {/* LEVEL 3: CLEAN LESSONS LIST */}
      {isTopicOpen && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          exiting={FadeOutUp.duration(160)}
          layout={LinearTransition.duration(200)}
          style={[
            styles.lessonsWrapper,
            {
              borderTopColor: isDark
                ? 'rgba(255, 255, 255, 0.06)'
                : 'rgba(0, 0, 0, 0.05)',
            },
          ]}>
          {topic.lessons.map((lesson, lIdx) => {
            const isCompleted = completedLessonIds.has(lesson.id);
            const isLast = lIdx === topic.lessons.length - 1;

            return (
              <Pressable
                key={lesson.id}
                onPress={() =>
                  setSelectedLesson({
                    subjectTitle,
                    topicTitle: topic.title,
                    lesson,
                  })
                }
                style={({ pressed }) => [
                  styles.lessonRow,
                  {
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.04)',
                    backgroundColor: pressed
                      ? isDark
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(0, 0, 0, 0.03)'
                      : 'transparent',
                  },
                ]}>
                {/* Lesson Circular Icon Badge */}
                <View
                  style={[
                    styles.lessonIconBadge,
                    {
                      backgroundColor: isCompleted
                        ? isDark
                          ? 'rgba(16, 185, 129, 0.2)'
                          : '#D1FAE5'
                        : badgeBg,
                    },
                  ]}>
                  {isCompleted ? (
                    <Check size={13} color="#10B981" strokeWidth={2.8} />
                  ) : (
                    <FileText
                      size={13}
                      color={badgeIconColor}
                      strokeWidth={2.2}
                    />
                  )}
                </View>

                {/* Clean Lesson Title */}
                <Text
                  numberOfLines={2}
                  style={[
                    styles.lessonTitleText,
                    { color: isDark ? '#E5E7EB' : '#1F2937' },
                  ]}>
                  {lesson.title}
                </Text>

                {/* Sleek Right Arrow */}
                <ChevronRight
                  size={16}
                  color={isDark ? '#9CA3AF' : '#6B7280'}
                  strokeWidth={2.2}
                />
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
    marginBottom: 4,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  topicBadgeNumber: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  topicTitleText: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  chevronWrapper: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonsWrapper: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderTopWidth: 1,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 12,
  },
  lessonIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonTitleText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    letterSpacing: -0.1,
    lineHeight: 19,
  },
});
