import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  BookOpen,
  Check,
  Clock,
  FileText,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MarkdownContentView } from '@/components/notes/MarkdownContentView';
import { SUBJECT_PALETTES } from '@/components/ui/CircularProgressIconBadge';
import { useAppTheme } from '@/context/theme-context';
import { trackLessonInteraction, useLessonProgress, useLocalHierarchy } from '@/hooks/useLocalData';

export default function LessonDetailScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { lessonId, topicTitle: paramTopicTitle } =
    useLocalSearchParams<{
      lessonId: string;
      subjectTitle?: string;
      topicTitle?: string;
    }>();

  const { curriculum, loading } = useLocalHierarchy();
  const { isCompleted, toggleLessonCompleted } = useLessonProgress();
  const [isToggling, setIsToggling] = useState(false);

  // Locate the target lesson, its topic, and subject in the curriculum hierarchy
  let lessonData: {
    lesson: (typeof curriculum)[0]['topics'][0]['lessons'][0];
    topic: (typeof curriculum)[0]['topics'][0];
    subject: (typeof curriculum)[0];
    palette: (typeof SUBJECT_PALETTES)[0];
  } | null = null;

  if (curriculum && lessonId) {
    for (let sIdx = 0; sIdx < curriculum.length; sIdx++) {
      const subject = curriculum[sIdx];
      for (const topic of subject.topics) {
        const foundLesson = topic.lessons.find(
          (l) => l.id === lessonId || l.lessonId === lessonId
        );
        if (foundLesson) {
          lessonData = {
            lesson: foundLesson,
            topic,
            subject,
            palette: SUBJECT_PALETTES[sIdx % SUBJECT_PALETTES.length],
          };
          break;
        }
      }
      if (lessonData) break;
    }
  }

  const targetLessonId = lessonData?.lesson.id || lessonId;
  const completed = targetLessonId ? isCompleted(targetLessonId) : false;

  // Track user click/open interaction on this lesson
  useEffect(() => {
    if (targetLessonId) {
      trackLessonInteraction(targetLessonId);
      if (lessonData?.topic?.id) {
        trackLessonInteraction(lessonData.topic.id);
      }
      if (lessonData?.subject?.id) {
        trackLessonInteraction(lessonData.subject.id);
      }
    }
  }, [targetLessonId, lessonData?.topic?.id, lessonData?.subject?.id]);

  const topicTitle = lessonData?.topic.title || paramTopicTitle || 'Notes';
  const lesson = lessonData?.lesson;

  // Check if a real description was entered (filtering out legacy system placeholders)
  const hasDescription = Boolean(
    lesson?.description &&
      lesson.description.trim().length > 0 &&
      !lesson.description.toLowerCase().includes('core syllabus competencies')
  );

  // Check if real markdown content is available
  const hasMarkdownContent = Boolean(
    lesson?.content && lesson.content.trim().length > 0
  );

  // Filter out any legacy or placeholder bullet points
  const rawKeyPoints = lesson?.keyPoints;
  const keyPoints =
    rawKeyPoints && rawKeyPoints.length > 0
      ? rawKeyPoints.filter(
          (point) =>
            point &&
            typeof point === 'string' &&
            point.trim().length > 0 &&
            !point.toLowerCase().startsWith('practice application: professional architectural practice') &&
            !point.toLowerCase().startsWith('regulatory standard: applicable architectural')
        )
      : [];

  const hasContent = hasDescription || hasMarkdownContent || keyPoints.length > 0;

  const handleToggle = async () => {
    if (!targetLessonId || isToggling) return;
    setIsToggling(true);
    try {
      await toggleLessonCompleted(targetLessonId);
    } catch (err) {
      console.error('[LessonDetailScreen] Error toggling lesson completion:', err);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* 1. TOP BAR */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/learn/notes' as any);
            }
          }}
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

        <View style={styles.topBarTitleBox}>
          <Text
            numberOfLines={1}
            style={[styles.topBarTitle, { color: isDark ? '#F3F4F6' : '#1F2937' }]}>
            {topicTitle}
          </Text>
        </View>

        <View style={styles.topBarRightSpacer} />
      </View>

      {/* 2. LOADING STATE */}
      {loading && !lesson && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text
            style={[
              styles.stateText,
              { color: isDark ? '#9CA3AF' : '#6B7280' },
            ]}>
            Loading lesson...
          </Text>
        </View>
      )}

      {/* 3. NOT FOUND / NO LESSON YET */}
      {!loading && !lesson && (
        <View style={styles.centerContainer}>
          <Text
            style={[
              styles.stateHeading,
              { color: isDark ? '#F9FAFB' : '#111827' },
            ]}>
            No lesson found
          </Text>
          <Text
            style={[
              styles.stateText,
              { color: isDark ? '#9CA3AF' : '#6B7280' },
            ]}>
            This lesson is not available yet.
          </Text>
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)/learn/notes' as any);
              }
            }}
            style={[
              styles.returnBtn,
              { backgroundColor: colors.accent },
            ]}>
            <Text style={styles.returnBtnText}>Go Back</Text>
          </Pressable>
        </View>
      )}

      {/* 4. MAIN LESSON CONTENT */}
      {lesson && (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 40 },
          ]}>
          {/* HEADER: Title & Lesson Number */}
          <View style={styles.headerSection}>
            <View style={styles.headerMetaRow}>
              <View
                style={[
                  styles.lessonPill,
                  {
                    backgroundColor: isDark
                      ? 'rgba(200, 90, 50, 0.16)'
                      : 'rgba(200, 90, 50, 0.1)',
                  },
                ]}>
                <Text style={[styles.lessonPillText, { color: colors.accent }]}>
                  LESSON {lesson.lessonNumber || 1}
                </Text>
              </View>

              {lesson.duration ? (
                <View style={styles.durationRow}>
                  <Clock size={12} color={isDark ? '#9CA3AF' : '#6B7280'} strokeWidth={2.2} />
                  <Text
                    style={[
                      styles.durationText,
                      { color: isDark ? '#9CA3AF' : '#6B7280' },
                    ]}>
                    {lesson.duration}
                  </Text>
                </View>
              ) : null}
            </View>

            <Text
              style={[
                styles.lessonTitle,
                { color: isDark ? '#F9FAFB' : '#0F172A' },
              ]}>
              {lesson.title}
            </Text>
          </View>

          {/* EMPTY CONTENT CHECK */}
          {!hasContent && (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.06)',
                },
              ]}>
              <Text
                style={[
                  styles.emptyStateTitle,
                  { color: isDark ? '#E5E7EB' : '#1F2937' },
                ]}>
                No content yet
              </Text>
              <Text
                style={[
                  styles.emptyStateText,
                  { color: isDark ? '#9CA3AF' : '#6B7280' },
                ]}>
                Notes for this lesson will be added soon.
              </Text>
            </View>
          )}

          {/* SECTION: DESCRIPTION (Only shown if a custom description was entered) */}
          {hasDescription && lesson.description ? (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.06)',
                },
              ]}>
              <View style={styles.cardHeaderRow}>
                <View
                  style={[
                    styles.cardHeaderIcon,
                    {
                      backgroundColor: isDark
                        ? 'rgba(200, 90, 50, 0.18)'
                        : 'rgba(200, 90, 50, 0.1)',
                    },
                  ]}>
                  <FileText size={13} color={colors.accent} strokeWidth={2.4} />
                </View>
                <Text
                  style={[
                    styles.cardHeading,
                    { color: isDark ? '#9CA3AF' : '#6B7280' },
                  ]}>
                  Description
                </Text>
              </View>
              <Text
                style={[
                  styles.bodyText,
                  { color: isDark ? '#E2E8F0' : '#1E293B' },
                ]}>
                {lesson.description}
              </Text>
            </View>
          ) : null}

          {/* SECTION: STUDY NOTES (Full Markdown content from admin panel) */}
          {hasMarkdownContent && lesson.content ? (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.06)',
                },
              ]}>
              <View style={styles.cardHeaderRow}>
                <View
                  style={[
                    styles.cardHeaderIcon,
                    {
                      backgroundColor: isDark
                        ? 'rgba(200, 90, 50, 0.18)'
                        : 'rgba(200, 90, 50, 0.1)',
                    },
                  ]}>
                  <BookOpen size={13} color={colors.accent} strokeWidth={2.4} />
                </View>
                <Text
                  style={[
                    styles.cardHeading,
                    { color: isDark ? '#9CA3AF' : '#6B7280' },
                  ]}>
                  Study Notes
                </Text>
              </View>

              <MarkdownContentView
                content={lesson.content}
                isDark={isDark}
                colors={colors}
              />
            </View>
          ) : keyPoints.length > 0 ? (
            /* Fallback to bullet list if no full markdown document is available */
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.06)',
                },
              ]}>
              <View style={styles.cardHeaderRow}>
                <View
                  style={[
                    styles.cardHeaderIcon,
                    {
                      backgroundColor: isDark
                        ? 'rgba(200, 90, 50, 0.18)'
                        : 'rgba(200, 90, 50, 0.1)',
                    },
                  ]}>
                  <BookOpen size={13} color={colors.accent} strokeWidth={2.4} />
                </View>
                <Text
                  style={[
                    styles.cardHeading,
                    { color: isDark ? '#9CA3AF' : '#6B7280' },
                  ]}>
                  Study Notes
                </Text>
              </View>
              <View style={styles.pointsList}>
                {keyPoints.map((point, index) => (
                  <View key={index} style={styles.pointItem}>
                    <Text
                      style={[
                        styles.bulletDot,
                        { color: colors.accent },
                      ]}>
                      •
                    </Text>
                    <Text
                      style={[
                        styles.pointText,
                        { color: isDark ? '#CBD5E1' : '#334155' },
                      ]}>
                      {point}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* BOTTOM ACTION: MARK AS COMPLETE */}
          <View style={styles.bottomSection}>
            <Pressable
              onPress={handleToggle}
              disabled={isToggling}
              style={({ pressed }) => [
                styles.completeBtn,
                {
                  backgroundColor: completed
                    ? isDark
                      ? 'rgba(16, 185, 129, 0.16)'
                      : '#ECFDF5'
                    : colors.accent,
                  borderColor: completed
                    ? '#10B981'
                    : colors.accent,
                  opacity: pressed || isToggling ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.99 : 1 }],
                },
              ]}>
              <Check
                size={18}
                color={completed ? '#10B981' : '#FFFFFF'}
                strokeWidth={2.6}
              />
              <Text
                style={[
                  styles.completeBtnText,
                  {
                    color: completed ? '#10B981' : '#FFFFFF',
                  },
                ]}>
                {completed ? 'Completed' : 'Mark as Complete'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitleBox: {
    flex: 1,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  topBarRightSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 8,
    gap: 14,
  },
  headerSection: {
    paddingVertical: 6,
    gap: 8,
  },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lessonPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lessonPillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  lessonTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 1.5,
      },
      web: {
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      },
    }),
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardHeaderIcon: {
    width: 24,
    height: 24,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeading: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  bodyText: {
    fontSize: 14.5,
    lineHeight: 22.5,
    fontWeight: '400',
  },
  pointsList: {
    gap: 8,
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '700',
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21.5,
    fontWeight: '400',
  },
  bottomSection: {
    marginTop: 8,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  completeBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyStateText: {
    fontSize: 13,
    lineHeight: 18,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  stateHeading: {
    fontSize: 17,
    fontWeight: '700',
  },
  stateText: {
    fontSize: 13,
  },
  returnBtn: {
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  returnBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
  },
});
