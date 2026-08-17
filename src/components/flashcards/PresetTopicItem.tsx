import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from 'react-native-reanimated';
import { Check, Plus } from 'lucide-react-native';

import { Radius } from '@/constants/theme';
import { RotatingChevron } from '@/components/ui/RotatingChevron';
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
  theme: any;
}

export function PresetTopicItem({
  topic,
  tIdx,
  isLastTopic,
  selectedLessonIds,
  expandedTopics,
  toggleTopic,
  toggleTopicSelection,
  toggleLessonSelection,
  lastSelectedTopicIndex,
  theme,
}: PresetTopicItemProps) {
  const [headerHeight, setHeaderHeight] = useState(48);
  const center = Math.round(headerHeight / 2);

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

  const isVerticalTopHighlighted =
    lastSelectedTopicIndex >= 0 &&
    tIdx <= lastSelectedTopicIndex;
  const isVerticalBottomHighlighted =
    lastSelectedTopicIndex >= 0 &&
    tIdx < lastSelectedTopicIndex;

  const lastSelectedLessonIndex = topic.lessons.reduce(
    (lastIdx, l, idx) =>
      selectedLessonIds.has(l.id) ? idx : lastIdx,
    -1
  );

  return (
    <View key={topic.id} style={styles.topicItemWrapper}>
      <View style={styles.treeBranchNode}>
        <View
          style={[
            styles.treeBranchTop,
            {
              height: center,
              backgroundColor: isVerticalTopHighlighted
                ? theme.accent
                : theme.border,
            },
          ]}
        />
        {!isLastTopic && (
          <View
            style={[
              styles.treeBranchBottom,
              {
                top: center,
                backgroundColor: isVerticalBottomHighlighted
                  ? theme.accent
                  : theme.border,
              },
            ]}
          />
        )}
        <View
          style={[
            styles.treeBranchHoriz,
            {
              top: center - 1,
              backgroundColor: hasTopicSelected
                ? theme.accent
                : theme.border,
            },
          ]}
        />
      </View>

      <View style={styles.topicMainColumn}>
        {/* Topic Header Row */}
        <View
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h > 0 && Math.abs(h - headerHeight) > 1) {
              setHeaderHeight(h);
            }
          }}
          style={[
            styles.topicHeader,
            {
              backgroundColor: hasTopicSelected
                ? theme.accentMuted
                : theme.backgroundSelected,
              borderColor: hasTopicSelected
                ? theme.accent
                : theme.border,
              borderWidth: hasTopicSelected ? 1.5 : 1,
            },
          ]}>
          <Pressable
            onPress={() => toggleTopic(topic.id)}
            style={styles.topicHeaderLeft}>
            <Text
              style={[
                styles.topicTitle,
                { color: theme.text },
              ]}>
              {topic.title}
            </Text>
            <Text
              style={[
                styles.topicSubtext,
                {
                  color: hasTopicSelected
                    ? theme.accent
                    : theme.textSecondary,
                  fontWeight: hasTopicSelected ? '700' : '400',
                },
              ]}>
              {hasTopicSelected
                ? `${selectedInTopicCount}/${topic.lessons.length} Selected`
                : `${topic.lessons.length} Lessons`}
            </Text>
          </Pressable>

          {/* + Add Topic Button */}
          <Pressable
            onPress={() => toggleTopicSelection(topic)}
            style={({ pressed }) => [
              styles.addSmallBtn,
              {
                backgroundColor: isAllTopicSelected
                  ? theme.accent
                  : isSomeTopicSelected
                  ? theme.accentMuted
                  : theme.backgroundElement,
                borderColor: isAllTopicSelected || isSomeTopicSelected
                  ? theme.accent
                  : theme.border,
                opacity: pressed ? 0.75 : 1,
              },
            ]}>
            {isAllTopicSelected ? (
              <Check size={12} color="#FFFFFF" strokeWidth={3} />
            ) : (
              <Plus
                size={12}
                color={isSomeTopicSelected ? theme.accent : theme.text}
                strokeWidth={2.5}
              />
            )}
          </Pressable>

          <Pressable
            onPress={() => toggleTopic(topic.id)}
            style={styles.chevronPressableSmall}>
            <RotatingChevron
              isOpen={isTopicOpen}
              color={hasTopicSelected ? theme.accent : theme.textSecondary}
              size={15}
            />
          </Pressable>
        </View>

        {/* Lesson Level Accordion */}
        {isTopicOpen && (
          <Animated.View
            entering={FadeInDown.duration(180)}
            exiting={FadeOutUp.duration(150)}
            layout={LinearTransition.duration(180)}
            style={styles.lessonsContainer}>
            {topic.lessons.map((lesson, lIdx) => {
              const isLessonSelected = selectedLessonIds.has(
                lesson.id
              );
              const isLastLesson =
                lIdx === topic.lessons.length - 1;
              const isLessonTopHighlighted =
                lastSelectedLessonIndex >= 0 &&
                lIdx <= lastSelectedLessonIndex;
              const isLessonBottomHighlighted =
                lastSelectedLessonIndex >= 0 &&
                lIdx < lastSelectedLessonIndex;

              return (
                <View
                  key={lesson.id}
                  style={styles.lessonRowWrapper}>
                  {/* Tree Branch Node for Lesson */}
                  <View style={styles.lessonBranchNode}>
                    <View
                      style={[
                        styles.lessonBranchTop,
                        {
                          backgroundColor: isLessonTopHighlighted
                            ? theme.accent
                            : theme.border,
                        },
                      ]}
                    />
                    {!isLastLesson && (
                      <View
                        style={[
                          styles.lessonBranchBottom,
                          {
                            backgroundColor: isLessonBottomHighlighted
                              ? theme.accent
                              : theme.border,
                          },
                        ]}
                      />
                    )}
                    <View
                      style={[
                        styles.lessonBranchHoriz,
                        {
                          backgroundColor: isLessonSelected
                            ? theme.accent
                            : theme.border,
                        },
                      ]}
                    />
                  </View>

                  <Pressable
                    onPress={() =>
                      toggleLessonSelection(lesson.id)
                    }
                    style={({ pressed }) => [
                      styles.lessonRow,
                      {
                        backgroundColor: isLessonSelected
                          ? theme.accentMuted
                          : theme.backgroundElement,
                        borderColor: isLessonSelected
                          ? theme.accent
                          : theme.border,
                        borderWidth: isLessonSelected ? 1.5 : 1,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}>
                    <View style={styles.lessonRowLeft}>
                      <View
                        style={[
                          styles.lessonNumCircle,
                          {
                            backgroundColor: isLessonSelected
                              ? theme.accent
                              : theme.backgroundSelected,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.lessonNumText,
                            {
                              color: isLessonSelected
                                ? '#FFFFFF'
                                : theme.accent,
                            },
                          ]}>
                          {lesson.lessonNumber}
                        </Text>
                      </View>
                      <View style={styles.lessonTextCol}>
                        <Text
                          style={[
                            styles.lessonTitle,
                            { color: theme.text },
                          ]}>
                          {lesson.title}
                        </Text>
                      </View>
                    </View>

                    {/* + Add Lesson Button */}
                    <View
                      style={[
                        styles.addSmallBtn,
                        {
                          backgroundColor: isLessonSelected
                            ? theme.accent
                            : theme.backgroundSelected,
                          borderColor: isLessonSelected
                            ? theme.accent
                            : theme.border,
                        },
                      ]}>
                      {isLessonSelected ? (
                        <Check
                          size={12}
                          color="#FFFFFF"
                          strokeWidth={3}
                        />
                      ) : (
                        <Plus
                          size={12}
                          color={theme.text}
                          strokeWidth={2.5}
                        />
                      )}
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topicItemWrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  treeBranchNode: {
    width: 18,
    alignSelf: 'stretch',
    position: 'relative',
    marginRight: 4,
  },
  treeBranchTop: {
    position: 'absolute',
    left: 8,
    top: 0,
    width: 2,
  },
  treeBranchBottom: {
    position: 'absolute',
    left: 8,
    bottom: 0,
    width: 2,
  },
  treeBranchHoriz: {
    position: 'absolute',
    left: 8,
    width: 10,
    height: 2,
  },
  topicMainColumn: {
    flex: 1,
    gap: 6,
    marginBottom: 10,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: Radius.xs,
    borderWidth: 1,
    gap: 8,
  },
  topicHeaderLeft: {
    flex: 1,
    gap: 1,
  },
  topicTitle: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  topicSubtext: {
    fontSize: 10.5,
  },
  addSmallBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  chevronPressableSmall: {
    padding: 2,
  },
  lessonsContainer: {
    paddingLeft: 4,
    paddingTop: 4,
    gap: 0,
  },
  lessonRowWrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 6,
  },
  lessonBranchNode: {
    width: 16,
    alignSelf: 'stretch',
    position: 'relative',
    marginRight: 6,
  },
  lessonBranchTop: {
    position: 'absolute',
    left: 7,
    top: 0,
    height: '50%',
    width: 2,
  },
  lessonBranchBottom: {
    position: 'absolute',
    left: 7,
    top: '50%',
    bottom: -6,
    width: 2,
  },
  lessonBranchHoriz: {
    position: 'absolute',
    left: 7,
    top: '50%',
    marginTop: -1,
    width: 9,
    height: 2,
  },
  lessonRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: Radius.xs,
    borderWidth: 1,
    gap: 8,
  },
  lessonRowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lessonNumCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonNumText: {
    fontSize: 10,
    fontWeight: '700',
  },
  lessonTextCol: {
    flex: 1,
    gap: 1,
  },
  lessonTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
});
