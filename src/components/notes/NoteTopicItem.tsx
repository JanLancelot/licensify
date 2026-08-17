import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';

import { Radius } from '@/constants/theme';
import { RotatingChevron } from '@/components/ui/RotatingChevron';
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
  theme: any;
}

export function NoteTopicItem({
  topic,
  isLastTopic,
  isTopicOpen,
  toggleTopic,
  subjectTitle,
  setSelectedLesson,
  theme,
}: NoteTopicItemProps) {
  const [headerHeight, setHeaderHeight] = useState(56);
  const center = headerHeight / 2;

  return (
    <Animated.View
      layout={LinearTransition.duration(200)}
      style={styles.topicRowWrapper}>
      {/* Tree Branch Node for Topic */}
      <View style={styles.topicBranchNode}>
        {/* Top Vertical Segment */}
        <View
          style={[
            styles.topicBranchTop,
            { height: center, backgroundColor: theme.border },
          ]}
        />
        {/* Bottom Vertical Segment (Only if NOT last topic) */}
        {!isLastTopic && (
          <View
            style={[
              styles.topicBranchBottom,
              { top: center, backgroundColor: theme.border },
            ]}
          />
        )}
        {/* Horizontal Line into Topic Card */}
        <View
          style={[
            styles.topicBranchHoriz,
            { top: center - 1, backgroundColor: theme.border },
          ]}
        />
      </View>

      <View
        style={[
          styles.topicCard,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.border,
          },
        ]}>
        {/* TOPIC HEADER ROW */}
        <Pressable
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h > 0 && Math.abs(h - headerHeight) > 1) {
              setHeaderHeight(h);
            }
          }}
          onPress={() => toggleTopic(topic.id)}
          style={({ pressed }) => [
            styles.topicHeader,
            { opacity: pressed ? 0.75 : 1 },
          ]}>
          <View style={styles.topicHeaderLeft}>
            <View
              style={[
                styles.topicNumberBadge,
                {
                  backgroundColor: theme.accentMuted,
                },
              ]}>
              <Text
                style={[
                  styles.topicNumberText,
                  { color: theme.accent },
                ]}>
                T{topic.topicNumber}
              </Text>
            </View>
            <View style={styles.topicTitleBox}>
              <Text style={[styles.topicTitle, { color: theme.text }]}>
                {topic.title}
              </Text>
              <Text
                style={[
                  styles.topicLessonCount,
                  { color: theme.textSecondary },
                ]}>
                {topic.lessons.length} Lessons Available
              </Text>
            </View>
          </View>

          <View style={styles.topicChevron}>
            <RotatingChevron
              isOpen={isTopicOpen}
              color={theme.accent}
              size={16}
            />
          </View>
        </Pressable>

        {/* LEVEL 3: LESSONS DROPDOWN */}
        {isTopicOpen && (
          <Animated.View
            entering={FadeInDown.duration(200)}
            exiting={FadeOutUp.duration(160)}
            layout={LinearTransition.duration(200)}
            style={styles.lessonsContainer}>
            {topic.lessons.map((lesson, lIdx) => {
              const isLastLesson = lIdx === topic.lessons.length - 1;

              return (
                <View key={lesson.id} style={styles.lessonRowWrapper}>
                  {/* Tree Branch Node for Lesson */}
                  <View style={styles.lessonBranchNode}>
                    <View
                      style={[
                        styles.lessonBranchTop,
                        { backgroundColor: theme.border },
                      ]}
                    />
                    {!isLastLesson && (
                      <View
                        style={[
                          styles.lessonBranchBottom,
                          { backgroundColor: theme.border },
                        ]}
                      />
                    )}
                    <View
                      style={[
                        styles.lessonBranchHoriz,
                        { backgroundColor: theme.border },
                      ]}
                    />
                  </View>

                  <Pressable
                    onPress={() =>
                      setSelectedLesson({
                        subjectTitle,
                        topicTitle: topic.title,
                        lesson,
                      })
                    }
                    style={({ pressed }) => [
                      styles.lessonRow,
                      { opacity: pressed ? 0.65 : 1 },
                    ]}>
                    <View style={styles.lessonRowLeft}>
                      <View
                        style={[
                          styles.lessonNumCircle,
                          { backgroundColor: theme.accentMuted },
                        ]}>
                        <Text
                          style={[
                            styles.lessonNumText,
                            { color: theme.accent },
                          ]}>
                          {lesson.lessonNumber}
                        </Text>
                      </View>
                      <Text
                        style={[styles.lessonTitle, { color: theme.text }]}>
                        {lesson.title}
                      </Text>
                    </View>

                    <ChevronRight
                      size={15}
                      color={theme.accent}
                      strokeWidth={2}
                    />
                  </Pressable>
                </View>
              );
            })}
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  topicRowWrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 10,
  },
  topicBranchNode: {
    width: 16,
    position: 'relative',
  },
  topicBranchTop: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 2,
  },
  topicBranchBottom: {
    position: 'absolute',
    left: 0,
    bottom: -10,
    width: 2,
  },
  topicBranchHoriz: {
    position: 'absolute',
    left: 0,
    width: 16,
    height: 2,
  },
  topicCard: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  topicHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  topicNumberBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.xs,
  },
  topicNumberText: {
    fontSize: 10,
    fontWeight: '800',
  },
  topicTitleBox: {
    flex: 1,
    gap: 2,
  },
  topicTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  topicLessonCount: {
    fontSize: 11,
    fontWeight: '500',
  },
  topicChevron: {
    paddingLeft: 8,
  },
  lessonsContainer: {
    marginLeft: 16,
    marginRight: 10,
    marginBottom: 10,
    paddingTop: 4,
  },
  lessonRowWrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  lessonBranchNode: {
    width: 14,
    position: 'relative',
  },
  lessonBranchTop: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '50%',
    width: 2,
  },
  lessonBranchBottom: {
    position: 'absolute',
    left: 0,
    top: '50%',
    bottom: 0,
    width: 2,
  },
  lessonBranchHoriz: {
    position: 'absolute',
    left: 0,
    top: '50%',
    marginTop: -1,
    width: 14,
    height: 2,
  },
  lessonRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.xs,
    marginBottom: 4,
  },
  lessonRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  lessonNumCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonNumText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  lessonTitle: {
    fontSize: 12.5,
    fontWeight: '500',
    flex: 1,
  },
});
