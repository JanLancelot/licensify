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
import Svg, { Circle } from 'react-native-svg';

import { LessonDetailModal } from '@/components/notes/LessonDetailModal';
import { NoteTopicItem } from '@/components/notes/NoteTopicItem';
import { RotatingChevron } from '@/components/ui/RotatingChevron';
import { useAppTheme } from '@/context/theme-context';
import { SUBJECT_NOTES } from '@/data/curriculum';
import { Lesson } from '@/types/curriculum';

// Curated pastel palettes matching the reference design
export const SUBJECT_PALETTES = [
  {
    bg: '#EDE9FE',
    darkBg: 'rgba(139, 92, 246, 0.22)',
    icon: '#7C3AED',
    darkIcon: '#C4B5FD',
  }, // Lavender / Purple
  {
    bg: '#FCE7F3',
    darkBg: 'rgba(236, 72, 153, 0.22)',
    icon: '#DB2777',
    darkIcon: '#F472B6',
  }, // Soft Pink
  {
    bg: '#E0E7FF',
    darkBg: 'rgba(99, 102, 241, 0.22)',
    icon: '#4F46E5',
    darkIcon: '#A5B4FC',
  }, // Indigo / Violet
  {
    bg: '#FFEDD5',
    darkBg: 'rgba(249, 115, 22, 0.22)',
    icon: '#EA580C',
    darkIcon: '#FDBA74',
  }, // Peach / Orange
  {
    bg: '#E0F2FE',
    darkBg: 'rgba(14, 165, 233, 0.22)',
    icon: '#0284C7',
    darkIcon: '#7DD3FC',
  }, // Sky Blue / Cyan
  {
    bg: '#D1FAE5',
    darkBg: 'rgba(16, 185, 129, 0.22)',
    icon: '#059669',
    darkIcon: '#6EE7B7',
  }, // Mint / Emerald
];

/* Circular Progress Badge with Green Outline */
export function CircularProgressIconBadge({
  size = 48,
  strokeWidth = 2.8,
  progress = 0,
  progressColor = '#10B981', // Vibrant Green
  trackColor,
  bgColor,
  isDark,
  children,
}: {
  size?: number;
  strokeWidth?: number;
  progress?: number;
  progressColor?: string;
  trackColor?: string;
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
    ? 'rgba(255, 255, 255, 0.12)'
    : 'rgba(0, 0, 0, 0.08)';

  const innerSize = size - strokeWidth * 2 - 4;

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
          stroke={trackColor || defaultTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Green Progress Outline Ring */}
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

      {/* Inner Pastel Circle */}
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

export default function NotesScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Track which subjects are expanded (Level 1)
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  // Track which topics are expanded (Level 2)
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  
  // Track completed lessons to calculate live progress
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(
    new Set(['s1-t1-l1', 's1-t1-l2', 's1-t1-l3', 's2-t1-l1', 's3-t1-l1', 's3-t1-l2'])
  );

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

  const markLessonCompleted = (lessonId: string) => {
    setCompletedLessonIds((prev) => new Set([...prev, lessonId]));
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
          {SUBJECT_NOTES.map((subject, sIdx) => {
            const isSubjectOpen = !!expandedSubjects[subject.id];
            const IconComponent = subject.icon;
            const palette = SUBJECT_PALETTES[sIdx % SUBJECT_PALETTES.length];

            // Calculate progress for this subject
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
                        ? 'rgba(0, 0, 0, 0.09)'
                        : 'rgba(0, 0, 0, 0.05)',
                  },
                ]}>
                {/* LEVEL 1: SUBJECT CARD ROW */}
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
                  {/* Circular Icon with Green Progress Outline */}
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

                  {/* Clean Subject Title (No Subtitle Clutter) */}
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
                      color={isDark ? '#9CA3AF' : '#4B5563'}
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
                          markLessonCompleted(data.lesson.id);
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

      {/* LESSON READING MODAL */}
      <LessonDetailModal
        selectedLesson={selectedLesson}
        onClose={() => setSelectedLesson(null)}
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
