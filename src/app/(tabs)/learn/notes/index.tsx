import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { LessonDetailModal } from '@/components/notes/LessonDetailModal';
import { NoteTopicItem } from '@/components/notes/NoteTopicItem';
import {
  CircularProgressIconBadge,
  SUBJECT_PALETTES,
} from '@/components/ui/CircularProgressIconBadge';
import { RotatingChevron } from '@/components/ui/RotatingChevron';
import { useAppTheme } from '@/context/theme-context';
import { useLessonProgress, useLocalHierarchy } from '@/hooks/useLocalData';
import { Lesson } from '@/types/curriculum';

export { CircularProgressIconBadge, SUBJECT_PALETTES };

export default function NotesScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { curriculum } = useLocalHierarchy();
  const { completedLessonIds, toggleLessonCompleted, isCompleted } = useLessonProgress();

  // Track which subjects are expanded (Level 1)
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  // Track which topics are expanded (Level 2)
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  // Modal for reading lesson notes
  const [selectedLesson, setSelectedLesson] = useState<{
    subjectTitle: string;
    topicTitle: string;
    lesson: Lesson;
  } | null>(null);

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects((prev) => {
      const isCurrentlyOpen = !!prev[subjectId];
      if (isCurrentlyOpen) {
        const subject = curriculum.find((s) => s.id === subjectId);
        if (subject) {
          setExpandedTopics((topicPrev) => {
            const next = { ...topicPrev };
            subject.topics.forEach((t) => {
              delete next[t.id];
            });
            return next;
          });
        }
      }
      return {
        ...prev,
        [subjectId]: !isCurrentlyOpen,
      };
    });
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [
            styles.backBtn,
            {
              backgroundColor: isDark ? '#23262F' : '#F4EFEB',
              opacity: pressed ? 0.7 : 1,
            },
          ]}>
          <ArrowLeft size={20} color={colors.text} strokeWidth={2.4} />
        </Pressable>

        <View style={styles.topBarTitles}>
          <Text style={[styles.topBarHeading, { color: colors.text }]}>
            Comprehensive Notes
          </Text>
        </View>
      </View>

      {/* Clean Uncluttered Subject List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 80 },
        ]}>
        <View style={styles.listContainer}>
          {curriculum.map((subject, sIdx) => {
            const isSubjectOpen = !!expandedSubjects[subject.id];
            const IconComponent = subject.icon;
            const palette = SUBJECT_PALETTES[sIdx % SUBJECT_PALETTES.length];

            // Calculate progress for this subject dynamically from SQLite persistent state
            const allLessonIds = subject.topics.flatMap((t) =>
              t.lessons.map((l) => l.id)
            );
            const totalLessons = allLessonIds.length;
            const completedCount = allLessonIds.filter((id) =>
              completedLessonIds.has(id)
            ).length;
            const progress = totalLessons > 0 ? completedCount / totalLessons : 0;

            return (
              <Animated.View
                key={subject.id}
                layout={LinearTransition.duration(240)}
                style={[
                  styles.subjectCardBox,
                  {
                    backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                    borderColor: isDark
                      ? isSubjectOpen
                        ? 'rgba(255, 255, 255, 0.15)'
                        : 'rgba(255, 255, 255, 0.07)'
                      : isSubjectOpen
                        ? 'rgba(0, 0, 0, 0.12)'
                        : 'rgba(0, 0, 0, 0.05)',
                  },
                ]}>
                {/* LEVEL 1: SUBJECT HEADER ROW */}
                <Pressable
                  onPress={() => toggleSubject(subject.id)}
                  style={({ pressed }) => [
                    styles.subjectHeader,
                    {
                      backgroundColor: pressed
                        ? isDark
                          ? 'rgba(255, 255, 255, 0.04)'
                          : 'rgba(0, 0, 0, 0.02)'
                        : 'transparent',
                    },
                  ]}>
                  {/* Clean Circular Icon Badge with Green Progress Ring */}
                  <CircularProgressIconBadge
                    size={46}
                    strokeWidth={2.8}
                    progress={progress}
                    progressColor="#10B981"
                    bgColor={isDark ? palette.darkBg : palette.bg}
                    isDark={isDark}>
                    <IconComponent
                      size={20}
                      color={isDark ? palette.darkIcon : palette.icon}
                      strokeWidth={2.2}
                    />
                  </CircularProgressIconBadge>

                  {/* Clean Subject Title */}
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.subjectTitle,
                      { color: isDark ? '#F9FAFB' : '#111827' },
                    ]}>
                    {subject.title}
                  </Text>

                  {/* Rotating Chevron */}
                  <View style={styles.chevronWrapper}>
                    <RotatingChevron
                      isOpen={isSubjectOpen}
                      color={isDark ? '#9CA3AF' : '#6B7280'}
                      size={20}
                    />
                  </View>
                </Pressable>

                {/* LEVEL 2: TOPICS LIST INSIDE CARD */}
                {isSubjectOpen && (
                  <Animated.View
                    entering={FadeInDown.duration(220)}
                    exiting={FadeOutUp.duration(180)}
                    layout={LinearTransition.duration(240)}
                    style={[
                      styles.topicsContainer,
                      {
                        borderTopColor: isDark
                          ? 'rgba(255, 255, 255, 0.06)'
                          : 'rgba(0, 0, 0, 0.05)',
                      },
                    ]}>
                    {subject.topics.map((topic, tIdx) => (
                      <NoteTopicItem
                        key={topic.id}
                        topic={topic}
                        tIdx={tIdx}
                        isLastTopic={tIdx === subject.topics.length - 1}
                        isTopicOpen={!!expandedTopics[topic.id]}
                        toggleTopic={toggleTopic}
                        subjectTitle={subject.title}
                        parentPalette={palette}
                        completedLessonIds={completedLessonIds}
                        setSelectedLesson={(data) => {
                          setSelectedLesson(data);
                        }}
                      />
                    ))}
                  </Animated.View>
                )}
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      {/* LESSON READING & COMPLETION MODAL */}
      <LessonDetailModal
        selectedLesson={selectedLesson}
        onClose={() => setSelectedLesson(null)}
        isCompleted={selectedLesson ? isCompleted(selectedLesson.lesson.id) : false}
        onToggleComplete={toggleLessonCompleted}
      />
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
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitles: {
    flex: 1,
  },
  topBarHeading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  listContainer: {
    gap: 12,
  },
  subjectCardBox: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      },
    }),
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  subjectTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  chevronWrapper: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicsContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    borderTopWidth: 1,
    gap: 6,
  },
});
