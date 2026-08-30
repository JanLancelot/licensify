import { useFocusEffect, useRouter } from 'expo-router';
import {
  Award,
  BookOpen,
  Calculator,
  Compass,
  Layers,
  Play,
  Plus,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
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

import { CircularProgressIconBadge, SUBJECT_PALETTES } from '@/components/ui/CircularProgressIconBadge';
import { PRESET_ICONS } from '@/components/flashcards/FlashcardPresetBuilderModal';
import { AddQuizFromFlashcardsModal } from '@/components/practice/AddQuizFromFlashcardsModal';
import { PremadeTopicItem } from '@/components/practice/PremadeTopicItem';
import {
  QuizLaunchConfig,
  QuizLauncherModal,
} from '@/components/practice/QuizLauncherModal';
import { RotatingChevron } from '@/components/ui/RotatingChevron';
import { useAppTheme } from '@/context/theme-context';
import { useLocalHierarchy } from '@/hooks/useLocalData';
import { useQuizPresets } from '@/services/quizPresetStore';
import { FlashcardPreset, QuizPreset } from '@/types/curriculum';

/* Custom Deck Gradient Icon Component */
function CustomDeckIcon({
  iconName = 'Layers',
  size = 50,
}: {
  iconName?: string;
  size?: number;
}) {
  const iconConfig = PRESET_ICONS.find((i) => i.id === iconName) || PRESET_ICONS[0];
  const IconComp = iconConfig.icon;
  const [startC, endC] = iconConfig.gradient;
  const gradId = `deck_icon_${iconConfig.id}_${size}`;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={startC} />
            <Stop offset="100%" stopColor={endC} />
          </LinearGradient>
        </Defs>
        <Rect width={size} height={size} rx={size / 2} fill={`url(#${gradId})`} />
      </Svg>
      <IconComp size={22} color="#FFFFFF" strokeWidth={2.4} />
    </View>
  );
}

export default function PracticeScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { curriculum, refetch: refetchCurriculum } = useLocalHierarchy();
  const { presets: quizPresets, addFromFlashcard } = useQuizPresets();

  // Refresh curriculum when tab is focused
  useFocusEffect(
    useCallback(() => {
      refetchCurriculum?.();
    }, [refetchCurriculum])
  );

  // Expanded state for Premade Quiz Sets (Subjects & Topics)
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  // Flashcards Selection Modal State
  const [isAddFromFlashcardsModalVisible, setIsAddFromFlashcardsModalVisible] = useState(false);

  // Existing Quiz Titles Set for Duplicate Detection
  const existingQuizTitles = useMemo(
    () => new Set(quizPresets.map((p) => p.title)),
    [quizPresets]
  );

  // Active Quiz Target for Launcher Modal
  const [activeQuizTarget, setActiveQuizTarget] = useState<{
    quizTitle: string;
    quizSubtitle?: string;
    subjectId?: string;
    topicId?: string;
    lessonId?: string;
    specializedType?: string;
    initialTimerSeconds?: number;
    initialQuestionCount?: number;
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

  // Launch modal for a user quiz preset
  const handleSelectQuizPreset = (preset: QuizPreset) => {
    setActiveQuizTarget({
      quizTitle: preset.title,
      quizSubtitle: `${preset.questionCount || 10} Questions • ${preset.subjectNames?.join(' • ') || 'Custom Drill'}`,
      subjectId: preset.subjectId,
      topicId: preset.topicId,
      specializedType: preset.specializedType,
      initialTimerSeconds: preset.defaultTimerSeconds || 15,
      initialQuestionCount: preset.questionCount || 10,
    });
  };

  // Launch modal for specialized computation set
  const handleSelectSpecializedSet = () => {
    setActiveQuizTarget({
      quizTitle: 'Developmental control computation set',
      quizSubtitle: 'NBCP Rule 7 & 8 • Floor Area, Height Limit & Setbacks',
      specializedType: 'developmental_control',
      initialTimerSeconds: 30,
      initialQuestionCount: 10,
    });
  };

  // Start the quiz once configured in the modal
  const handleStartQuizFromModal = (config: QuizLaunchConfig) => {
    if (!activeQuizTarget) return;

    const { quizTitle, subjectId, topicId, specializedType } = activeQuizTarget;
    setActiveQuizTarget(null);

    router.push({
      pathname: '/(tabs)/practice/quiz' as any,
      params: {
        area: subjectId || 'all',
        topicId: topicId || undefined,
        title: quizTitle,
        count: String(config.questionCount),
        timer: String(config.timerSeconds),
        difficulty: 'medium',
        specializedType: specializedType || undefined,
      },
    });
  };

  const handleAddFlashcardPreset = (preset: FlashcardPreset) => {
    addFromFlashcard(preset);
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* 1. Standard Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Practice</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 90 },
        ]}>
        {/* =================================================================== */}
        {/* PART 1: YOUR QUIZ SETS                                              */}
        {/* =================================================================== */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeadingRow}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
              YOUR QUIZ SETS
            </Text>
            <Pressable
              onPress={() => setIsAddFromFlashcardsModalVisible(true)}
              hitSlop={8}
              style={({ pressed }) => [
                styles.addCircleBtn,
                {
                  backgroundColor: isDark ? '#23262F' : '#F6F0ED',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <Plus size={16} color={colors.accent} strokeWidth={2.5} />
            </Pressable>
          </View>

          {/* 2-Column Bento Grid of Custom Decks + Bento Dashed Add Card */}
          <View style={styles.gridContainer}>
            {quizPresets.map((preset) => (
              <Pressable
                key={preset.id}
                onPress={() => handleSelectQuizPreset(preset)}
                style={({ pressed }) => [
                  styles.customDeckCard,
                  {
                    backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}>
                {/* Circular Icon */}
                <CustomDeckIcon iconName={preset.iconName} size={48} />

                {/* Deck Title */}
                <Text
                  numberOfLines={1}
                  style={[
                    styles.customDeckTitle,
                    { color: isDark ? '#F9FAFB' : '#0F172A' },
                  ]}>
                  {preset.title}
                </Text>

                {/* Question Count */}
                <Text style={[styles.customDeckSub, { color: colors.textSecondary }]}>
                  {preset.questionCount || 10} Questions
                </Text>
              </Pressable>
            ))}

            {/* Bento Dashed Add Card */}
            <Pressable
              onPress={() => setIsAddFromFlashcardsModalVisible(true)}
              style={({ pressed }) => [
                styles.dashedAddCard,
                {
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.18)',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <View
                style={[
                  styles.dashedIconCircle,
                  {
                    backgroundColor: isDark ? '#23262F' : '#F0EBE8',
                  },
                ]}>
                <Plus size={22} color={colors.accent} strokeWidth={2.4} />
              </View>
              <Text style={[styles.dashedAddText, { color: colors.textSecondary }]}>
                Add from Flashcards
              </Text>
            </Pressable>
          </View>
        </View>

        {/* =================================================================== */}
        {/* PART 2: PREMADE QUIZ SETS                                           */}
        {/* =================================================================== */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeadingRow}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
              PREMADE QUIZ SETS
            </Text>
          </View>

          {/* Curriculum Subjects Hierarchy */}
          <View style={styles.listContainer}>
            {curriculum.map((subject, sIdx) => {
              const isSubjectOpen = !!expandedSubjects[subject.id];
              const IconComponent = subject.icon;
              const palette = SUBJECT_PALETTES[sIdx % SUBJECT_PALETTES.length];

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
                    {/* Circular Icon Badge */}
                    <CircularProgressIconBadge
                      size={44}
                      strokeWidth={2.6}
                      progress={1}
                      progressColor={colors.accent}
                      bgColor={isDark ? palette.darkBg : palette.bg}
                      isDark={isDark}>
                      <IconComponent
                        size={20}
                        color={isDark ? palette.darkIcon : palette.icon}
                        strokeWidth={2.2}
                      />
                    </CircularProgressIconBadge>

                    {/* Subject Title */}
                    <Text
                      numberOfLines={2}
                      style={[
                        styles.subjectTitle,
                        { color: isDark ? '#F9FAFB' : '#111827' },
                      ]}>
                      {subject.title}
                    </Text>

                    {/* Quick Subject Quiz Launch Button */}
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        setActiveQuizTarget({
                          quizTitle: `${subject.title} Comprehensive Drill`,
                          quizSubtitle: `Full Area Assessment • ${subject.topics.length} Topics`,
                          subjectId: subject.id,
                        });
                      }}
                      hitSlop={8}
                      style={({ pressed }) => [
                        styles.quickSubjectQuizBtn,
                        {
                          backgroundColor: isDark ? 'rgba(224, 122, 95, 0.18)' : '#F8EAE4',
                          opacity: pressed ? 0.75 : 1,
                        },
                      ]}>
                      <Play size={11} color={colors.accent} fill={colors.accent} />
                      <Text style={[styles.quickSubjectQuizText, { color: colors.accent }]}>
                        Quiz
                      </Text>
                    </Pressable>

                    {/* Rotating Chevron */}
                    <View style={styles.chevronWrapper}>
                      <RotatingChevron
                        isOpen={isSubjectOpen}
                        color={isDark ? '#9CA3AF' : '#4B5563'}
                        size={20}
                      />
                    </View>
                  </Pressable>

                  {/* LEVEL 2: TOPICS LIST INSIDE SUBJECT */}
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
                        <PremadeTopicItem
                          key={topic.id}
                          topic={topic}
                          tIdx={tIdx}
                          isLastTopic={tIdx === subject.topics.length - 1}
                          isTopicOpen={!!expandedTopics[topic.id]}
                          toggleTopic={toggleTopic}
                          subjectTitle={subject.title}
                          parentPalette={palette}
                          onLaunchQuiz={(params) => setActiveQuizTarget(params)}
                        />
                      ))}
                    </Animated.View>
                  )}
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* =================================================================== */}
        {/* PART 3: SPECIALIZED QUIZ SETS                                       */}
        {/* =================================================================== */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeadingRow}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
              SPECIALIZED QUIZ SETS
            </Text>
          </View>

          {/* Template Block: Developmental control computation set */}
          <Pressable
            onPress={handleSelectSpecializedSet}
            style={({ pressed }) => [
              styles.specializedCardBox,
              {
                backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                opacity: pressed ? 0.92 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              },
            ]}>
            {/* Top Row: Icon + Badges */}
            <View style={styles.specializedTopRow}>
              {/* Gradient Calculation Icon Badge */}
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}>
                <Svg width={48} height={48} style={StyleSheet.absoluteFill}>
                  <Defs>
                    <LinearGradient id="specialized_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor="#38BDF8" />
                      <Stop offset="100%" stopColor="#0284C7" />
                    </LinearGradient>
                  </Defs>
                  <Rect width={48} height={48} rx={16} fill="url(#specialized_grad)" />
                </Svg>
                <Calculator size={24} color="#FFFFFF" strokeWidth={2.4} />
              </View>

              <View style={styles.specializedBadgesRow}>
                <View
                  style={[
                    styles.specializedPill,
                    {
                      backgroundColor: isDark ? 'rgba(14, 165, 233, 0.18)' : '#E0F2FE',
                    },
                  ]}>
                  <Zap size={11} color="#0284C7" strokeWidth={2.4} />
                  <Text style={[styles.specializedPillText, { color: '#0284C7' }]}>
                    Calculations
                  </Text>
                </View>
                <View
                  style={[
                    styles.specializedPill,
                    {
                      backgroundColor: isDark ? '#23262F' : '#F6F0ED',
                    },
                  ]}>
                  <Text style={[styles.specializedPillText, { color: colors.textSecondary }]}>
                    NBCP Rule 7 & 8
                  </Text>
                </View>
              </View>
            </View>

            {/* Content Body */}
            <View style={styles.specializedBody}>
              <Text
                style={[
                  styles.specializedTitle,
                  { color: isDark ? '#F9FAFB' : '#111827' },
                ]}>
                Developmental control computation set
              </Text>
              <Text
                style={[
                  styles.specializedDesc,
                  { color: colors.textSecondary },
                ]}>
                NBCP Rule 7 & 8 formulas: AMBF, TOSL, BHL, and FLAR.
              </Text>
            </View>

            {/* Bottom Footer Launch Button */}
            <View style={styles.specializedFooter}>
              <View style={styles.formulaTagsRow}>
                <Text style={[styles.formulaTag, { color: colors.textSecondary }]}>
                  BHL • AMBF • TOSL • FLAR
                </Text>
              </View>

              <View
                style={[
                  styles.specializedPlayBtn,
                  { backgroundColor: colors.accent },
                ]}>
                <Play size={14} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.specializedPlayBtnText}>Start Set</Text>
              </View>
            </View>
          </Pressable>
        </View>
      </ScrollView>

      {/* Quiz Launcher Modal (Question Timer & Question Count) */}
      <QuizLauncherModal
        visible={activeQuizTarget !== null}
        quizTitle={activeQuizTarget?.quizTitle || 'Practice Drill'}
        quizSubtitle={activeQuizTarget?.quizSubtitle}
        initialTimerSeconds={activeQuizTarget?.initialTimerSeconds || 15}
        initialQuestionCount={activeQuizTarget?.initialQuestionCount || 10}
        onClose={() => setActiveQuizTarget(null)}
        onStartQuiz={handleStartQuizFromModal}
        bottomInset={insets.bottom}
      />

      {/* Add From Flashcards Modal */}
      <AddQuizFromFlashcardsModal
        visible={isAddFromFlashcardsModalVisible}
        onClose={() => setIsAddFromFlashcardsModalVisible(false)}
        onAddFlashcardToQuiz={handleAddFlashcardPreset}
        existingQuizTitles={existingQuizTitles}
        bottomInset={insets.bottom}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 22,
  },
  sectionWrapper: {
    gap: 12,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  addCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyQuizSetDashedCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  emptyDashedTextGroup: {
    flex: 1,
    gap: 3,
  },
  emptyDashedTitle: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  emptyDashedSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  customDeckCard: {
    width: '48.2%',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
  customDeckTitle: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.2,
    marginTop: 2,
  },
  customDeckSub: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  dashedAddCard: {
    width: '48.2%',
    height: 138,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 8,
  },
  dashedIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedAddText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  listContainer: {
    gap: 12,
  },
  subjectCardBox: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      },
    }),
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  subjectTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  quickSubjectQuizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  quickSubjectQuizText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  chevronWrapper: {
    paddingLeft: 2,
  },
  topicsContainer: {
    borderTopWidth: 1,
    padding: 12,
    gap: 4,
  },
  specializedCardBox: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 3px 12px rgba(0,0,0,0.04)',
      },
    }),
  },
  specializedTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  specializedBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specializedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 9,
  },
  specializedPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  specializedBody: {
    gap: 6,
  },
  specializedTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  specializedDesc: {
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '500',
  },
  specializedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  formulaTagsRow: {
    flex: 1,
  },
  formulaTag: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  specializedPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  specializedPlayBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
});
