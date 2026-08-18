import { useRouter } from 'expo-router';
import { ArrowLeft, BookOpen, Layers, Sparkles } from 'lucide-react-native';
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
import Svg, {
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { LessonDetailModal } from '@/components/notes/LessonDetailModal';
import { NoteTopicItem } from '@/components/notes/NoteTopicItem';
import { RotatingChevron } from '@/components/ui/RotatingChevron';
import { useAppTheme } from '@/context/theme-context';
import { SUBJECT_NOTES } from '@/data/curriculum';
import { Lesson } from '@/types/curriculum';

/* Subject Gradient Squircle */
function SubjectGradientIcon({
  icon: IconComponent,
  colors: [startColor, endColor],
  size = 46,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  colors: [string, string];
  size?: number;
}) {
  const gradId = `subj_grad_${startColor.replace(/[^a-zA-Z0-9]/g, '')}_${endColor.replace(/[^a-zA-Z0-9]/g, '')}_${size}`;

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
        <Defs>
          <LinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={startColor} />
            <Stop offset="100%" stopColor={endColor} />
          </LinearGradient>
        </Defs>
        <Rect
          width={size}
          height={size}
          rx={15}
          fill={`url(#${gradId})`}
        />
      </Svg>
      <IconComponent size={22} color="#FFFFFF" strokeWidth={2.2} />
    </View>
  );
}

// Preset harmonious gradients for subjects
const SUBJECT_GRADIENTS: [string, string][] = [
  ['#E58368', '#C85A32'], // Terracotta
  ['#FBBF24', '#D97706'], // Amber
  ['#38BDF8', '#0284C7'], // Sky Blue
  ['#34D399', '#059669'], // Emerald
  ['#A78BFA', '#7C3AED'], // Violet
  ['#FB7185', '#E11D48'], // Rose
];

export default function NotesScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [
            styles.backBtn,
            {
              backgroundColor: isDark ? '#23262F' : '#F6F0ED',
              opacity: pressed ? 0.7 : 1,
            },
          ]}>
          <ArrowLeft size={20} color={colors.text} strokeWidth={2.4} />
        </Pressable>

        <View style={styles.topBarTitles}>
          <Text style={[styles.topBarHeading, { color: colors.text }]}>
            Comprehensive Notes
          </Text>
          <Text style={[styles.topBarSubHeading, { color: colors.textSecondary }]}>
            Structured syllabus notes for ALE review
          </Text>
        </View>
      </View>

      {/* Subject List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 80 },
        ]}>
        <View style={styles.listContainer}>
          {SUBJECT_NOTES.map((subject, sIdx) => {
            const isSubjectOpen = !!expandedSubjects[subject.id];
            const IconComponent = subject.icon;
            const gradColors = SUBJECT_GRADIENTS[sIdx % SUBJECT_GRADIENTS.length];
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
                    backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
                  },
                ]}>
                {/* LEVEL 1: SUBJECT HEADER */}
                <Pressable
                  onPress={() => toggleSubject(subject.id)}
                  style={({ pressed }) => [
                    styles.subjectHeader,
                    {
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}>
                  {/* Subject Gradient Icon Box */}
                  <SubjectGradientIcon
                    icon={IconComponent}
                    colors={gradColors}
                    size={48}
                  />

                  {/* Subject Metadata */}
                  <View style={styles.subjectInfo}>
                    <Text style={[styles.subjectTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
                      {subject.title}
                    </Text>

                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.countPill,
                          {
                            backgroundColor: isDark
                              ? 'rgba(224, 122, 95, 0.18)'
                              : '#F8EAE4',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.countPillText,
                            { color: colors.accent },
                          ]}>
                          {subject.topics.length} Topics
                        </Text>
                      </View>
                      <Text style={[styles.bulletDot, { color: colors.textSecondary }]}>•</Text>
                      <Text style={[styles.lessonsCountText, { color: colors.textSecondary }]}>
                        {totalLessons} Lessons
                      </Text>
                    </View>
                  </View>

                  {/* Rotating Dropdown Chevron */}
                  <View style={styles.chevronWrapper}>
                    <RotatingChevron
                      isOpen={isSubjectOpen}
                      color={colors.accent}
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
                        theme={colors}
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
        theme={colors}
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
    gap: 2,
  },
  topBarHeading: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  topBarSubHeading: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  listContainer: {
    gap: 14,
  },
  subjectCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  subjectInfo: {
    flex: 1,
    gap: 5,
  },
  subjectTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countPill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  countPillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  bulletDot: {
    fontSize: 12,
  },
  lessonsCountText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chevronWrapper: {
    padding: 4,
  },
  topicsWrapper: {
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 2,
  },
});
