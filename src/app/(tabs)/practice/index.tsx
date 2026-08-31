import { useFocusEffect, useRouter } from 'expo-router';
import { Calculator, Play, Plus, X } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { SUBJECT_PALETTES } from '@/components/ui/CircularProgressIconBadge';
import { PRESET_ICONS } from '@/components/flashcards/FlashcardPresetBuilderModal';
import { AddQuizFromFlashcardsModal } from '@/components/practice/AddQuizFromFlashcardsModal';
import {
  QuizLaunchConfig,
  QuizLauncherModal,
} from '@/components/practice/QuizLauncherModal';
import { useAppTheme } from '@/context/theme-context';
import { useLocalHierarchy } from '@/hooks/useLocalData';
import { useQuizPresets } from '@/services/quizPresetStore';
import { FlashcardPreset, QuizPreset } from '@/types/curriculum';

/* Custom Deck Gradient Icon Component */
function CustomDeckIcon({
  iconName = 'Layers',
  size = 48,
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
  const {
    presets: quizPresets,
    deletePreset,
    addFromFlashcard,
    removeFromFlashcard,
  } = useQuizPresets();

  // Refresh curriculum when tab is focused
  useFocusEffect(
    useCallback(() => {
      refetchCurriculum?.();
    }, [refetchCurriculum])
  );

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

  // Remove / delete a quiz preset
  const handleDeleteQuizPreset = (preset: QuizPreset) => {
    Alert.alert(
      'Remove Quiz Set',
      `Remove "${preset.title}" from your quiz sets?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deletePreset(preset.id),
        },
      ]
    );
  };

  // Launch modal for a premade subject note quiz
  const handleSelectPremadeSubject = (subject: any) => {
    setActiveQuizTarget({
      quizTitle: subject.title,
      quizSubtitle: `${subject.topics?.length || 0} Topics • Comprehensive Drill`,
      subjectId: subject.id,
      initialTimerSeconds: 15,
      initialQuestionCount: 15,
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

  const handleRemoveFlashcardPreset = (preset: FlashcardPreset) => {
    removeFromFlashcard(preset.id);
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

          {/* 2-Column Bento Grid of Custom Decks + Bento Dashed Add Button */}
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
                {/* Top-Right Remove Button */}
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteQuizPreset(preset);
                  }}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.cardDeleteBtn,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                      opacity: pressed ? 0.6 : 1,
                    },
                  ]}>
                  <X size={12} color={isDark ? '#9CA3AF' : '#6B7280'} strokeWidth={2.4} />
                </Pressable>

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

            {/* Minimal Bento Dashed Add Button */}
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
                <Plus size={24} color={colors.accent} strokeWidth={2.6} />
              </View>
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

          {/* Curriculum Subjects (Clean One-Line Cards) */}
          <View style={styles.listContainer}>
            {curriculum.map((subject, sIdx) => {
              const IconComponent = subject.icon;
              const palette = SUBJECT_PALETTES[sIdx % SUBJECT_PALETTES.length];

              return (
                <View
                  key={subject.id}
                  style={[
                    styles.subjectCardBox,
                    {
                      backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                      borderColor: isDark
                        ? 'rgba(255, 255, 255, 0.07)'
                        : 'rgba(0, 0, 0, 0.05)',
                    },
                  ]}>
                  {/* Single Line Subject Card */}
                  <Pressable
                    onPress={() => handleSelectPremadeSubject(subject)}
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
                    {/* Clean Solid Pastel Circle Icon */}
                    <View
                      style={[
                        styles.subjectIconBox,
                        {
                          backgroundColor: isDark ? palette.darkBg : palette.bg,
                        },
                      ]}>
                      <IconComponent
                        size={20}
                        color={isDark ? palette.darkIcon : palette.icon}
                        strokeWidth={2.2}
                      />
                    </View>

                    {/* Subject Title */}
                    <Text
                      numberOfLines={2}
                      style={[
                        styles.subjectTitle,
                        { color: isDark ? '#F9FAFB' : '#111827' },
                      ]}>
                      {subject.title}
                    </Text>

                    {/* Quick Subject Play Button */}
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        handleSelectPremadeSubject(subject);
                      }}
                      hitSlop={8}
                      style={({ pressed }) => [
                        styles.quickSubjectPlayBtn,
                        {
                          backgroundColor: colors.accentMuted,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}>
                      <Play size={12} color={colors.accent} fill={colors.accent} />
                    </Pressable>
                  </Pressable>
                </View>
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

          {/* Single-Line Block Matching Premade Quiz Sets Design */}
          <View
            style={[
              styles.subjectCardBox,
              {
                backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.07)'
                  : 'rgba(0, 0, 0, 0.05)',
              },
            ]}>
            <Pressable
              onPress={handleSelectSpecializedSet}
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
              {/* Circular Pastel Icon Box */}
              <View
                style={[
                  styles.subjectIconBox,
                  {
                    backgroundColor: isDark
                      ? 'rgba(14, 165, 233, 0.22)'
                      : '#E0F2FE',
                  },
                ]}>
                <Calculator
                  size={20}
                  color={isDark ? '#7DD3FC' : '#0284C7'}
                  strokeWidth={2.2}
                />
              </View>

              {/* Title */}
              <Text
                numberOfLines={2}
                style={[
                  styles.subjectTitle,
                  { color: isDark ? '#F9FAFB' : '#111827' },
                ]}>
                Developmental control computation set
              </Text>

              {/* Quick Play Button */}
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  handleSelectSpecializedSet();
                }}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.quickSubjectPlayBtn,
                  {
                    backgroundColor: colors.accentMuted,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}>
                <Play size={12} color={colors.accent} fill={colors.accent} />
              </Pressable>
            </Pressable>
          </View>
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
        onRemoveFlashcardFromQuiz={handleRemoveFlashcardPreset}
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  customDeckCard: {
    width: '48.2%',
    minHeight: 132,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    position: 'relative',
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
  cardDeleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
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
    minHeight: 132,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  dashedIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
  subjectIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  quickSubjectPlayBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
