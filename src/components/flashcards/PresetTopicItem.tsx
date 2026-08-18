import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from 'react-native-reanimated';
import { Check, Plus } from 'lucide-react-native';

import { RotatingChevron } from '@/components/ui/RotatingChevron';
import { useAppTheme } from '@/context/theme-context';
import { Topic } from '@/types/curriculum';

export interface PresetTopicItemProps {
  topic: Topic;
  tIdx: number;
  isLastTopic: boolean;
  selectedLessonIds: Set<string>;
  expandedTopics: Record<string, boolean>;
  toggleTopic: (id: string) => void;
  toggleTopicSelection: (topic: Topic) => void;
  toggleLessonSelection: (lessonId: string) => void;
  lastSelectedTopicIndex: number;
  theme?: any;
}

export function PresetTopicItem({
  topic,
  selectedLessonIds,
  expandedTopics,
  toggleTopic,
  toggleTopicSelection,
  toggleLessonSelection,
}: PresetTopicItemProps) {
  const { colors, isDark } = useAppTheme();
  const isTopicOpen = !!expandedTopics[topic.id];
  const topicLessonIds = topic.lessons.map((l) => l.id);
  const selectedInTopicCount = topicLessonIds.filter((id) =>
    selectedLessonIds.has(id)
  ).length;
  const isAllTopicSelected =
    topicLessonIds.length > 0 &&
    selectedInTopicCount === topicLessonIds.length;
  const isSomeTopicSelected =
    selectedInTopicCount > 0 && !isAllTopicSelected;
  const hasTopicSelected = selectedInTopicCount > 0;

  return (
    <Animated.View
      layout={LinearTransition.duration(200)}
      style={styles.topicContainer}>
      {/* Topic Pill Row */}
      <View
        style={[
          styles.topicPill,
          {
            backgroundColor: hasTopicSelected
              ? isDark
                ? 'rgba(224, 122, 95, 0.18)'
                : '#F8EAE4'
              : isDark
                ? '#23262F'
                : '#FFFFFF',
            borderBottomLeftRadius: isTopicOpen ? 0 : 16,
            borderBottomRightRadius: isTopicOpen ? 0 : 16,
          },
        ]}>
        {/* Toggle Dropdown Area */}
        <Pressable
          onPress={() => toggleTopic(topic.id)}
          style={styles.topicHeaderLeft}>
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

          <RotatingChevron
            isOpen={isTopicOpen}
            color={colors.accent}
            size={16}
          />
        </Pressable>

        {/* Selection Check/Plus Toggle */}
        <Pressable
          onPress={() => toggleTopicSelection(topic)}
          hitSlop={8}
          style={({ pressed }) => [
            styles.topicSelectionBtn,
            {
              backgroundColor: isAllTopicSelected
                ? colors.accent
                : isSomeTopicSelected
                  ? colors.accent
                  : isDark
                    ? '#1C1F26'
                    : '#F0EBE8',
              opacity: pressed ? 0.75 : 1,
            },
          ]}>
          {isAllTopicSelected ? (
            <Check size={13} color="#FFFFFF" strokeWidth={3} />
          ) : isSomeTopicSelected ? (
            <Text style={styles.someSelectedText}>-</Text>
          ) : (
            <Plus size={13} color={colors.textSecondary} strokeWidth={2.4} />
          )}
        </Pressable>
      </View>

      {/* Expanded Lessons Container */}
      {isTopicOpen && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          exiting={FadeOutUp.duration(160)}
          layout={LinearTransition.duration(200)}
          style={[
            styles.lessonsWrapper,
            {
              backgroundColor: isDark ? '#1C1F26' : '#FAF8F6',
            },
          ]}>
          {topic.lessons.map((lesson, lIdx) => {
            const isLessonSelected = selectedLessonIds.has(lesson.id);
            const isLast = lIdx === topic.lessons.length - 1;

            return (
              <Pressable
                key={lesson.id}
                onPress={() => toggleLessonSelection(lesson.id)}
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
                  <Text
                    style={[
                      styles.lessonNumberLabel,
                      { color: isLessonSelected ? colors.accent : colors.textSecondary },
                    ]}>
                    Lesson {lesson.lessonNumber}:
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={[
                      styles.lessonTitleText,
                      {
                        color: isLessonSelected
                          ? isDark
                            ? '#FFFFFF'
                            : '#0F172A'
                          : colors.textSecondary,
                        fontWeight: isLessonSelected ? '600' : '400',
                      },
                    ]}>
                    {lesson.title}
                  </Text>
                </View>

                {/* Lesson Checkbox */}
                <View
                  style={[
                    styles.lessonCheckbox,
                    {
                      backgroundColor: isLessonSelected
                        ? colors.accent
                        : isDark
                          ? '#23262F'
                          : '#EFEAE6',
                    },
                  ]}>
                  {isLessonSelected && (
                    <Check size={11} color="#FFFFFF" strokeWidth={3} />
                  )}
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
  topicContainer: {
    marginBottom: 8,
  },
  topicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  topicHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
    paddingRight: 10,
  },
  topicNumberLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  topicTitleText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  topicSelectionBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  someSelectedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 14,
  },
  lessonsWrapper: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    overflow: 'hidden',
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 2,
    gap: 10,
  },
  lessonLeftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    paddingRight: 6,
  },
  lessonNumberLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  lessonTitleText: {
    fontSize: 12,
    flex: 1,
  },
  lessonCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
