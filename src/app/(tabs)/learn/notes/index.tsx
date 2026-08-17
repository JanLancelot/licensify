import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import {
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

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SUBJECT_NOTES } from '@/data/curriculum';
import { Lesson } from '@/types/curriculum';
import { RotatingChevron } from '@/components/ui/RotatingChevron';
import { NoteTopicItem } from '@/components/notes/NoteTopicItem';
import { LessonDetailModal } from '@/components/notes/LessonDetailModal';

export default function NotesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Track which subjects are expanded (Level 1) - all closed initially
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  // Track which topics are expanded (Level 2) - all closed initially
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
        // Closing this subject: reset all inner topic dropdowns
        const subject = SUBJECT_NOTES.find((s) => s.id === subjectId);
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
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Top Header Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [
            styles.backBtn,
            {
              opacity: pressed ? 0.5 : 1,
            },
          ]}>
          <ArrowLeft size={22} color={theme.text} strokeWidth={2.2} />
        </Pressable>

        <View style={styles.topBarTitles}>
          <Text style={[styles.topBarHeading, { color: theme.text }]}>
            Comprehensive Notes
          </Text>
        </View>
      </View>

      {/* Subject List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 60 },
        ]}>
        <View style={styles.listContainer}>
          {SUBJECT_NOTES.map((subject) => {
            const isSubjectOpen = !!expandedSubjects[subject.id];
            const IconComponent = subject.icon;
            const totalLessons = subject.topics.reduce(
              (acc, t) => acc + t.lessons.length,
              0
            );

            return (
              <Animated.View
                key={subject.id}
                layout={LinearTransition.duration(240)}
                style={[
                  styles.subjectCard,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.border,
                  },
                ]}>
                {/* LEVEL 1: SUBJECT HEADER */}
                <Pressable
                  onPress={() => toggleSubject(subject.id)}
                  style={({ pressed }) => [
                    styles.subjectHeader,
                    {
                      borderBottomColor: theme.border,
                      borderBottomWidth: isSubjectOpen ? 1 : 0,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}>
                  {/* Subject Icon Box */}
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: theme.accentMuted },
                    ]}>
                    <IconComponent
                      size={20}
                      color={theme.accent}
                      strokeWidth={2.2}
                    />
                  </View>

                  {/* Subject Metadata */}
                  <View style={styles.subjectInfo}>
                    <Text style={[styles.subjectTitle, { color: theme.text }]}>
                      {subject.title}
                    </Text>

                    <Text
                      style={[
                        styles.subjectSubtitle,
                        { color: theme.textSecondary },
                      ]}>
                      {subject.topics.length} Topics • {totalLessons} Lessons
                    </Text>
                  </View>

                  {/* Rotating Dropdown Chevron */}
                  <View style={styles.chevronWrapper}>
                    <RotatingChevron
                      isOpen={isSubjectOpen}
                      color={theme.accent}
                      size={18}
                    />
                  </View>
                </Pressable>

                {/* LEVEL 2: TOPICS DROPDOWN */}
                {isSubjectOpen && (
                  <Animated.View
                    entering={FadeInDown.duration(220)}
                    exiting={FadeOutUp.duration(180)}
                    layout={LinearTransition.duration(240)}
                    style={styles.topicsWrapper}>
                    {subject.topics.map((topic, tIdx) => (
                      <NoteTopicItem
                        key={topic.id}
                        topic={topic}
                        isLastTopic={tIdx === subject.topics.length - 1}
                        isTopicOpen={!!expandedTopics[topic.id]}
                        toggleTopic={toggleTopic}
                        subjectTitle={subject.title}
                        setSelectedLesson={setSelectedLesson}
                        theme={theme}
                      />
                    ))}
                  </Animated.View>
                )}
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      {/* LESSON READING MODAL */}
      <LessonDetailModal
        selectedLesson={selectedLesson}
        onClose={() => setSelectedLesson(null)}
        theme={theme}
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
    paddingTop: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    padding: 6,
    marginLeft: -4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitles: {
    flex: 1,
  },
  topBarHeading: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  listContainer: {
    gap: 12,
  },
  subjectCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectInfo: {
    flex: 1,
    gap: 3,
  },
  subjectTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subjectSubtitle: {
    fontSize: 11.5,
  },
  chevronWrapper: {
    padding: 4,
  },
  topicsWrapper: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 0,
  },
});
