import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from 'react-native-reanimated';
import { Check, FileText, Plus } from 'lucide-react-native';

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
  lastSelectedTopicIndex?: number;
  parentPalette?: {
    bg: string;
    darkBg: string;
    icon: string;
    darkIcon: string;
  };
  theme?: any;
}

export function PresetTopicItem({
  topic,
  selectedLessonIds,
  expandedTopics,
  toggleTopic,
  toggleTopicSelection,
  toggleLessonSelection,
  parentPalette,
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
          backgroundColor: hasTopicSelected
            ? isDark
              ? 'rgba(224, 122, 95, 0.12)'
              : '#FAF0EB'
            : isDark
              ? '#232731'
              : '#F9FAFB',
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
                    : '#FFFFFF',
              borderColor: isAllTopicSelected || isSomeTopicSelected
                ? colors.accent
                : isDark
                  ? 'rgba(255, 255, 255, 0.1)'
                  : '#E5E7EB',
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

      {/* LEVEL 3: LESSONS LIST DROPDOWN */}
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
                      backgroundColor: isLessonSelected
                        ? isDark
                          ? 'rgba(224, 122, 95, 0.25)'
                          : '#FCECE6'
                        : badgeBg,
                    },
                  ]}>
                  {isLessonSelected ? (
                    <Check size={13} color={colors.accent} strokeWidth={2.8} />
                  ) : (
                    <FileText
                      size={13}
                      color={badgeIconColor}
                      strokeWidth={2.2}
                    />
                  )}
                </View>

                {/* Lesson Title */}
                <Text
                  numberOfLines={2}
                  style={[
                    styles.lessonTitleText,
                    {
                      color: isLessonSelected
                        ? colors.accent
                        : isDark
                          ? '#E5E7EB'
                          : '#1F2937',
                      fontWeight: isLessonSelected ? '700' : '500',
                    },
                  ]}>
                  {lesson.title}
                </Text>

                {/* Lesson Checkbox */}
                <View
                  style={[
                    styles.lessonCheckbox,
                    {
                      backgroundColor: isLessonSelected
                        ? colors.accent
                        : isDark
                          ? '#1C1F26'
                          : '#FFFFFF',
                      borderColor: isLessonSelected
                        ? colors.accent
                        : isDark
                          ? 'rgba(255, 255, 255, 0.12)'
                          : '#D1D5DB',
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
  topicCardBox: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 4,
  },
  topicHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  topicHeaderClickable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topicBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicBadgeNumber: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  topicTitleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 19,
  },
  chevronWrapper: {
    padding: 2,
  },
  topicSelectionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
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
    letterSpacing: -0.1,
    lineHeight: 19,
  },
  lessonCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
