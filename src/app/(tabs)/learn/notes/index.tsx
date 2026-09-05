import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { NoteTopicItem } from '@/components/notes/NoteTopicItem';
import {
  CircularProgressIconBadge,
  SUBJECT_PALETTES,
} from '@/components/ui/CircularProgressIconBadge';
import { RotatingChevron } from '@/components/ui/RotatingChevron';
import { useAppTheme } from '@/context/theme-context';
import { trackLessonInteraction, useLessonProgress, useLocalHierarchy } from '@/hooks/useLocalData';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export { CircularProgressIconBadge, SUBJECT_PALETTES };

export default function NotesScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    subjectId?: string;
    topicId?: string;
    lessonId?: string;
  }>();

  const { curriculum } = useLocalHierarchy();
  const { completedLessonIds } = useLessonProgress();

  const scrollViewRef = useRef<ScrollView>(null);
  const subjectPositions = useRef<Record<string, number>>({});

  // Track which subjects are expanded (Level 1)
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>(() => {
    return params.subjectId ? { [params.subjectId]: true } : {};
  });
  // Track which topics are expanded (Level 2)
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>(() => {
    return params.topicId ? { [params.topicId]: true } : {};
  });

  // Auto-expand target subject and topic cleanly when opened from Continue Learning
  useEffect(() => {
    if (!params.subjectId) return;

    const timer = setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpandedSubjects((prev) =>
        prev[params.subjectId!] ? prev : { ...prev, [params.subjectId!]: true }
      );
      if (params.topicId) {
        setExpandedTopics((prev) =>
          prev[params.topicId!] ? prev : { ...prev, [params.topicId!]: true }
        );
      }

      const pos = subjectPositions.current[params.subjectId!];
      if (typeof pos === 'number' && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: Math.max(0, pos - 16), animated: true });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [params.subjectId, params.topicId]);

  const toggleSubject = (subjectId: string) => {
    trackLessonInteraction(subjectId);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
    trackLessonInteraction(topicId);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
        ref={scrollViewRef}
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
              <View
                key={subject.id}
                onLayout={(e) => {
                  subjectPositions.current[subject.id] = e.nativeEvent.layout.y;
                }}
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
                  <View
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
                      />
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
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
    borderRadius: 17,
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
