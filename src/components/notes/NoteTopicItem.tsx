import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from 'react-native-reanimated';
import { ChevronRight, FileText } from 'lucide-react-native';

import { RotatingChevron } from '@/components/ui/RotatingChevron';
import { useAppTheme } from '@/context/theme-context';
import { Lesson, Topic } from '@/types/curriculum';

export interface NoteTopicItemProps {
  topic: Topic;
  isLastTopic: boolean;
  isTopicOpen: boolean;
  toggleTopic: (id: string) => void;
  subjectTitle: string;
  setSelectedLesson: (lessonData: {
    subjectTitle: string;
    topicTitle: string;
    lesson: Lesson;
  }) => void;
  theme?: any;
}

export function NoteTopicItem({
  topic,
  isTopicOpen,
  toggleTopic,
  subjectTitle,
  setSelectedLesson,
}: NoteTopicItemProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <Animated.View
      layout={LinearTransition.duration(200)}
      style={styles.topicContainer}>
      {/* TOPIC PILL HEADER */}
      <Pressable
        onPress={() => toggleTopic(topic.id)}
        style={({ pressed }) => [
          styles.topicPill,
          {
            backgroundColor: isDark ? '#23262F' : '#FFFFFF',
            borderColor: isTopicOpen
              ? isDark
                ? 'rgba(224, 122, 95, 0.4)'
                : 'rgba(200, 90, 50, 0.25)'
              : 'transparent',
            borderWidth: isTopicOpen ? 1.2 : 0,
            borderBottomLeftRadius: isTopicOpen ? 0 : 16,
            borderBottomRightRadius: isTopicOpen ? 0 : 16,
            opacity: pressed ? 0.8 : 1,
          },
        ]}>
        <View style={styles.topicTitleRow}>
          <Text
            style={[
              styles.topicNumberLabel,
              { color: colors.accent },
            ]}>
            Topic {topic.topicNumber}:
          </Text>
          <Text
            numberOfLines={1}
            style={[
              styles.topicTitleText,
              { color: isDark ? '#F9FAFB' : '#0F172A' },
            ]}>
            {topic.title}
          </Text>
        </View>

        <RotatingChevron
          isOpen={isTopicOpen}
          color={colors.accent}
          size={16}
        />
      </Pressable>

      {/* EXPANDED LESSONS CONTAINER */}
      {isTopicOpen && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          exiting={FadeOutUp.duration(160)}
          layout={LinearTransition.duration(200)}
          style={[
            styles.lessonsWrapper,
            {
              backgroundColor: isDark ? '#1C1F26' : '#FAF8F6',
              borderColor: isDark
                ? 'rgba(224, 122, 95, 0.4)'
                : 'rgba(200, 90, 50, 0.25)',
            },
          ]}>
          {topic.lessons.map((lesson, lIdx) => {
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
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'rgba(0, 0, 0, 0.05)',
                    opacity: pressed ? 0.6 : 1,
                  },
                ]}>
                <View style={styles.lessonLeftInfo}>
                  <View
                    style={[
                      styles.lessonIconBadge,
                      {
                        backgroundColor: isDark
                          ? 'rgba(224, 122, 95, 0.18)'
                          : '#F8EAE4',
                      },
                    ]}>
                    <FileText size={13} color={colors.accent} strokeWidth={2.4} />
                  </View>

                  <Text
                    style={[
                      styles.lessonNumberLabel,
                      { color: colors.accent },
                    ]}>
                    Lesson {lesson.lessonNumber}:
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={[
                      styles.lessonTitleText,
                      { color: isDark ? '#E2E8F0' : '#1E293B' },
                    ]}>
                    {lesson.title}
                  </Text>
                </View>

                <ChevronRight
                  size={15}
                  color={colors.accent}
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
  topicContainer: {
    marginBottom: 8,
  },
  topicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  topicTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
    paddingRight: 10,
  },
  topicNumberLabel: {
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  topicTitleText: {
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: -0.2,
    flex: 1,
  },
  lessonsWrapper: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderWidth: 1.2,
    borderTopWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 6,
    overflow: 'hidden',
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 10,
  },
  lessonLeftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 6,
  },
  lessonIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonNumberLabel: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  lessonTitleText: {
    fontSize: 12.5,
    fontWeight: '500',
    flex: 1,
  },
});
