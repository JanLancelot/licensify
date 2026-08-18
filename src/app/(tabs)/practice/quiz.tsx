import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
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

import { useAppTheme } from '@/context/theme-context';
import { QUESTION_BANK } from '@/data/quiz-questions';
import { QuizQuestion } from '@/types/curriculum';

export default function PracticeQuizScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    area?: string;
    difficulty?: string;
    count?: string;
  }>();

  const selectedArea = params.area || 'all';
  const count = parseInt(params.count || '10', 10);

  const getFilteredQuestions = () => {
    let pool = QUESTION_BANK;
    if (selectedArea !== 'all') {
      pool = pool.filter((q) => q.area === selectedArea);
    }
    const questionsToUse = pool.length > 0 ? pool : QUESTION_BANK;
    return [...questionsToUse].slice(0, count);
  };

  const [questions, setQuestions] = useState<QuizQuestion[]>(getFilteredQuestions);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  const restartQuiz = () => {
    setQuestions(getFilteredQuestions());
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setCorrectAnswersCount(0);
    setIsQuizFinished(false);
  };

  const handleSelectOption = (idx: number) => {
    if (!isAnswerSubmitted) {
      setSelectedOption(idx);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    if (selectedOption === questions[currentIdx].correctIndex) {
      setCorrectAnswersCount((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizFinished(true);
    }
  };

  const currentQ = questions[currentIdx];
  const progressPercent = Math.min(100, Math.round(((currentIdx + (isAnswerSubmitted ? 1 : 0)) / (questions.length || 1)) * 100));

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. Top Bar */}
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

        <View style={styles.topCenter}>
          <Text style={[styles.areaLabel, { color: colors.accent }]}>
            {currentQ?.areaLabel || 'Practice Drill'}
          </Text>
          <Text style={[styles.counterText, { color: colors.textSecondary }]}>
            Question {currentIdx + 1} of {questions.length}
          </Text>
        </View>

        <View style={styles.dummySpace} />
      </View>

      {/* 2. Smooth Progress Track */}
      <View
        style={[
          styles.track,
          { backgroundColor: isDark ? '#23262F' : '#F0EBE8' },
        ]}>
        <View
          style={[
            styles.trackFill,
            {
              width: `${((currentIdx + 1) / (questions.length || 1)) * 100}%`,
              backgroundColor: colors.accent,
            },
          ]}
        />
      </View>

      {/* 3. Results Screen or Active Question Content */}
      {isQuizFinished ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.resultsScrollContent,
            { paddingBottom: insets.bottom + 40 },
          ]}>
          <View
            style={[
              styles.resultCard,
              {
                backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
              },
            ]}>
            {/* Award Gradient Icon */}
            <View
              style={{
                width: 64,
                height: 64,
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}>
              <Svg width={64} height={64} style={StyleSheet.absoluteFill}>
                <Defs>
                  <LinearGradient id="award_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#E58368" />
                    <Stop offset="100%" stopColor="#C85A32" />
                  </LinearGradient>
                </Defs>
                <Rect width={64} height={64} rx={22} fill="url(#award_grad)" />
              </Svg>
              <Trophy size={30} color="#FFFFFF" strokeWidth={2.2} />
            </View>

            <Text style={[styles.resultHeading, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
              Drill Completed!
            </Text>

            <Text style={[styles.resultScoreText, { color: colors.accent }]}>
              {Math.round((correctAnswersCount / (questions.length || 1)) * 100)}%
            </Text>

            <Text style={[styles.resultSubtext, { color: colors.textSecondary }]}>
              You answered {correctAnswersCount} out of {questions.length} questions correctly.
            </Text>

            {/* Score Stats Summary Grid */}
            <View style={styles.statsRow}>
              <View
                style={[
                  styles.statBox,
                  { backgroundColor: isDark ? '#23262F' : '#FFFFFF' },
                ]}>
                <Text style={[styles.statValue, { color: '#10B981' }]}>
                  {correctAnswersCount}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Correct
                </Text>
              </View>

              <View
                style={[
                  styles.statBox,
                  { backgroundColor: isDark ? '#23262F' : '#FFFFFF' },
                ]}>
                <Text style={[styles.statValue, { color: '#EF4444' }]}>
                  {questions.length - correctAnswersCount}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Incorrect
                </Text>
              </View>

              <View
                style={[
                  styles.statBox,
                  { backgroundColor: isDark ? '#23262F' : '#FFFFFF' },
                ]}>
                <Text style={[styles.statValue, { color: colors.accent }]}>
                  {questions.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Total Qs
                </Text>
              </View>
            </View>

            <Pressable
              onPress={restartQuiz}
              style={({ pressed }) => [
                styles.actionBtn,
                {
                  backgroundColor: colors.accent,
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                },
              ]}>
              <RotateCcw size={16} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.actionBtnText}>Retake Drill</Text>
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.secondaryBtn,
                {
                  backgroundColor: isDark ? '#23262F' : '#FFFFFF',
                  opacity: pressed ? 0.75 : 1,
                },
              ]}>
              <Text style={[styles.secondaryBtnText, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
                Return to Practice Hub
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        /* Active Question & Options Layout */
        <View style={styles.quizLayoutWrapper}>
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 100 },
            ]}
            showsVerticalScrollIndicator={false}>
            {/* Question Box */}
            <View
              style={[
                styles.questionBox,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
                },
              ]}>
              <Text style={[styles.questionText, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
                {currentQ?.question}
              </Text>
            </View>

            {/* Options List */}
            <View style={styles.optionsContainer}>
              {currentQ?.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let optBg: string = isDark ? '#23262F' : '#FFFFFF';
                let optBorder: string = 'transparent';
                let pillBg: string = isDark ? '#1C1F26' : '#F0EBE8';
                let pillTextColor: string = colors.textSecondary;

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    optBg = isDark ? 'rgba(16, 185, 129, 0.16)' : '#E8F8F0';
                    optBorder = '#10B981';
                    pillBg = '#10B981';
                    pillTextColor = '#FFFFFF';
                  } else if (isSelected && !isCorrect) {
                    optBg = isDark ? 'rgba(239, 68, 68, 0.16)' : '#FEECEB';
                    optBorder = '#EF4444';
                    pillBg = '#EF4444';
                    pillTextColor = '#FFFFFF';
                  }
                } else if (isSelected) {
                  optBg = isDark ? 'rgba(224, 122, 95, 0.22)' : '#F8EAE4';
                  optBorder = colors.accent;
                  pillBg = colors.accent;
                  pillTextColor = '#FFFFFF';
                }

                return (
                  <Pressable
                    key={idx}
                    disabled={isAnswerSubmitted}
                    onPress={() => handleSelectOption(idx)}
                    style={({ pressed }) => [
                      styles.optionItem,
                      {
                        backgroundColor: optBg,
                        borderColor: optBorder,
                        borderWidth: optBorder !== 'transparent' ? 1.4 : 0,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}>
                    <View
                      style={[
                        styles.optionPill,
                        {
                          backgroundColor: pillBg,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.optionPillText,
                          {
                            color: pillTextColor,
                          },
                        ]}>
                        {String.fromCharCode(65 + idx)}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: isDark ? '#F9FAFB' : '#0F172A',
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}>
                      {opt}
                    </Text>

                    {isAnswerSubmitted && isCorrect && (
                      <CheckCircle2 size={18} color="#10B981" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <XCircle size={18} color="#EF4444" />
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Instant Explanation Card */}
            {isAnswerSubmitted && (
              <View
                style={[
                  styles.explanationContainer,
                  {
                    backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
                  },
                ]}>
                <View style={styles.explanationTitleRow}>
                  <HelpCircle size={16} color={colors.accent} strokeWidth={2.4} />
                  <Text
                    style={[
                      styles.explanationKickerText,
                      { color: colors.accent },
                    ]}>
                    ARCHITECTURAL EXPLANATION & CITATION
                  </Text>
                </View>

                <Text style={[styles.explanationBody, { color: isDark ? '#E2E8F0' : '#1E293B' }]}>
                  {currentQ?.explanation}
                </Text>

                {currentQ?.reference && (
                  <View
                    style={[
                      styles.referenceBox,
                      { backgroundColor: isDark ? '#23262F' : '#FFFFFF' },
                    ]}>
                    <Text style={[styles.referenceLabel, { color: colors.accent }]}>
                      SOURCE / CODE SPEC:
                    </Text>
                    <Text style={[styles.referenceText, { color: colors.textSecondary }]}>
                      {currentQ.reference}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Sticky Bottom Action Bar */}
          <View
            style={[
              styles.bottomActionBar,
              {
                paddingBottom: Math.max(insets.bottom + 12, 16),
              },
            ]}>
            {!isAnswerSubmitted ? (
              <Pressable
                disabled={selectedOption === null}
                onPress={handleSubmitAnswer}
                style={({ pressed }) => [
                  styles.bottomCtaBtn,
                  {
                    backgroundColor: selectedOption !== null ? colors.accent : isDark ? '#23262F' : '#E2E8F0',
                    opacity: selectedOption === null ? 0.6 : pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.985 : 1 }],
                  },
                ]}>
                <Text
                  style={[
                    styles.bottomCtaBtnText,
                    { color: selectedOption !== null ? '#FFFFFF' : colors.textSecondary },
                  ]}>
                  Submit Answer
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleNextQuestion}
                style={({ pressed }) => [
                  styles.bottomCtaBtn,
                  {
                    backgroundColor: colors.accent,
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.985 : 1 }],
                  },
                ]}>
                <Text style={styles.bottomCtaBtnText}>
                  {currentIdx < questions.length - 1 ? 'Next Question' : 'View Results'}
                </Text>
                <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.4} />
              </Pressable>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCenter: {
    alignItems: 'center',
    gap: 2,
  },
  areaLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  counterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dummySpace: {
    width: 40,
  },
  track: {
    height: 4,
    width: '100%',
    position: 'relative',
  },
  trackFill: {
    height: '100%',
    borderRadius: 2,
  },
  quizLayoutWrapper: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 14,
  },
  questionBox: {
    borderRadius: 22,
    padding: 20,
  },
  questionText: {
    fontSize: 16.5,
    fontWeight: '700',
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  optionsContainer: {
    gap: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 12,
  },
  optionPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionPillText: {
    fontSize: 13,
    fontWeight: '800',
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  explanationContainer: {
    borderRadius: 20,
    padding: 18,
    gap: 10,
    marginTop: 4,
  },
  explanationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  explanationKickerText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  explanationBody: {
    fontSize: 13.5,
    lineHeight: 21,
  },
  referenceBox: {
    padding: 12,
    borderRadius: 12,
    gap: 4,
    marginTop: 4,
  },
  referenceLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  referenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  bottomCtaBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bottomCtaBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  resultsScrollContent: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCard: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 14,
  },
  resultHeading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  resultScoreText: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1,
  },
  resultSubtext: {
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginVertical: 6,
  },
  statBox: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionBtn: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
