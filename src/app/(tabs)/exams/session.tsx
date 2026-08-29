import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Flag,
  RotateCcw,
  Timer,
  Trophy,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import * as crypto from 'expo-crypto';

import { useAppTheme } from '@/context/theme-context';
import { useLocalQuizWithQuestions, useSubmitLocalAttempt } from '@/hooks/useLocalData';

export interface ExamSessionQuestion {
  id: string;
  topic: string;
  question: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; id: string; text: string }[];
  correctKey: 'A' | 'B' | 'C' | 'D';
  correctChoiceHash?: string;
  explanation: string;
}

export default function ExamSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const examId = id || 'area-1';
  const { quiz, questions: dbQuestions, loading } = useLocalQuizWithQuestions(examId);
  const submitLocalAttempt = useSubmitLocalAttempt();

  const [questions, setQuestions] = useState<ExamSessionQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // questionId -> choiceId
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(1800); // 30 mins default
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [computedScore, setComputedScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Format DB questions
  useEffect(() => {
    if (dbQuestions && dbQuestions.length > 0) {
      const formatAsync = async () => {
        const formatted: ExamSessionQuestion[] = [];
        const keys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

        for (const q of dbQuestions) {
          let choices: { id: string; text: string }[] = [];
          try {
            choices = typeof q.choices === 'string' ? JSON.parse(q.choices) : q.choices;
          } catch {
            choices = [];
          }

          let correctK: 'A' | 'B' | 'C' | 'D' = 'A';
          if (q.correctChoiceHash) {
            for (let i = 0; i < choices.length; i++) {
              const hash = await crypto.digestStringAsync(
                crypto.CryptoDigestAlgorithm.SHA256,
                `${q.id}:${choices[i].id}`
              );
              if (hash === q.correctChoiceHash) {
                correctK = keys[i] || 'A';
                break;
              }
            }
          }

          formatted.push({
            id: q.id,
            topic: q.subjectId === 'sub-area-1'
              ? 'History & Theory'
              : q.subjectId === 'sub-area-2'
                ? 'Technology & Utilities'
                : 'Design & Laws',
            question: q.question,
            options: choices.map((c, idx) => ({
              key: keys[idx] || 'A',
              id: c.id,
              text: c.text,
            })),
            correctKey: correctK,
            correctChoiceHash: q.correctChoiceHash || undefined,
            explanation: q.explanation || 'Essential board examination rule and architectural specification.',
          });
        }

        setQuestions(formatted);
        if (quiz?.timeLimitSeconds) {
          setSecondsRemaining(quiz.timeLimitSeconds);
        }
      };
      formatAsync();
    }
  }, [dbQuestions, quiz]);

  const handleSubmitExam = useCallback(async () => {
    if (isSubmitted) return;

    let correct = 0;
    const recorded: { questionId: string; selectedChoiceId: string; correctChoiceHash?: string }[] = [];

    for (const q of questions) {
      const userChoiceId = selectedAnswers[q.id];
      if (userChoiceId && q.correctChoiceHash) {
        const hash = await crypto.digestStringAsync(
          crypto.CryptoDigestAlgorithm.SHA256,
          `${q.id}:${userChoiceId}`
        );
        if (hash === q.correctChoiceHash) {
          correct++;
        }
      }
      if (userChoiceId) {
        recorded.push({
          questionId: q.id,
          selectedChoiceId: userChoiceId,
          correctChoiceHash: q.correctChoiceHash,
        });
      }
    }

    const total = questions.length > 0 ? questions.length : 1;
    const score = Math.round((correct / total) * 100);

    setCorrectCount(correct);
    setComputedScore(score);
    setIsSubmitted(true);

    try {
      await submitLocalAttempt('local-student-1', examId, recorded);
    } catch (err) {
      console.warn('Failed to submit exam attempt locally:', err);
    }
  }, [isSubmitted, questions, selectedAnswers, examId, submitLocalAttempt]);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, handleSubmitExam]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];
  const userChoiceId = currentQ ? selectedAnswers[currentQ.id] : undefined;
  const isFlagged = currentQ ? Boolean(flaggedQuestions[currentQ.id]) : false;

  const handleSelectOption = (choiceId: string) => {
    if (isSubmitted || !currentQ) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: choiceId,
    }));
  };

  const handleToggleFlag = () => {
    if (!currentQ) return;
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const isPassed = computedScore >= (quiz?.passingScore || 70);

  const handleRetake = () => {
    setSelectedAnswers({});
    setFlaggedQuestions({});
    setSecondsRemaining(quiz?.timeLimitSeconds || 1800);
    setCurrentIndex(0);
    setIsSubmitted(false);
  };

  if (loading && questions.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ color: colors.textSecondary, marginTop: 12, fontWeight: '600' }}>
          Loading Examination Data...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* 1. Top Header Bar */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: isDark ? '#23262F' : '#F6F0ED',
              opacity: pressed ? 0.7 : 1,
            },
          ]}>
          <ArrowLeft size={20} color={colors.text} strokeWidth={2.4} />
        </Pressable>

        <View style={styles.headerTitles}>
          <Text style={[styles.headerSubtitle, { color: colors.accent }]}>
            {quiz?.title || (id ? String(id).replace('-', ' ').toUpperCase() : 'BOARD EXAM')}
          </Text>
          <Text style={[styles.headerTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
            {isSubmitted ? 'Exam Results' : `Question ${currentIndex + 1} of ${questions.length}`}
          </Text>
        </View>

        {/* Timer Badge */}
        {!isSubmitted ? (
          <View
            style={[
              styles.timerBadge,
              {
                backgroundColor: isDark
                  ? 'rgba(224, 122, 95, 0.18)'
                  : '#F8EAE4',
              },
            ]}>
            <Timer size={14} color={colors.accent} strokeWidth={2.2} />
            <Text style={[styles.timerText, { color: colors.accent }]}>
              {formatTimer(secondsRemaining)}
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.timerBadge,
              {
                backgroundColor: isPassed
                  ? isDark
                    ? 'rgba(16, 185, 129, 0.2)'
                    : '#E8F8F0'
                  : isDark
                    ? 'rgba(239, 68, 68, 0.2)'
                    : '#FEECEB',
              },
            ]}>
            <Text
              style={[
                styles.timerText,
                { color: isPassed ? '#10B981' : '#EF4444' },
              ]}>
              {computedScore}%
            </Text>
          </View>
        )}
      </View>

      {/* Progress Track */}
      <View
        style={[
          styles.track,
          { backgroundColor: isDark ? '#23262F' : '#F0EBE8' },
        ]}>
        <View
          style={[
            styles.trackFill,
            {
              width: `${((currentIndex + 1) / (questions.length || 1)) * 100}%`,
              backgroundColor: colors.accent,
            },
          ]}
        />
      </View>

      {!isSubmitted ? (
        /* Active Question Layout */
        <View style={styles.sessionLayout}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 110 },
            ]}
            showsVerticalScrollIndicator={false}>
            {/* Topic & Flag Row */}
            <View style={styles.metaRow}>
              <View
                style={[
                  styles.topicBadge,
                  { backgroundColor: isDark ? '#23262F' : '#F6F0ED' },
                ]}>
                <BookOpen size={13} color={colors.accent} strokeWidth={2.2} />
                <Text style={[styles.topicBadgeText, { color: colors.textSecondary }]}>
                  {currentQ?.topic}
                </Text>
              </View>

              <Pressable
                onPress={handleToggleFlag}
                style={({ pressed }) => [
                  styles.flagBtn,
                  {
                    backgroundColor: isFlagged
                      ? isDark
                        ? 'rgba(234, 179, 8, 0.2)'
                        : '#FEF9C3'
                      : isDark
                        ? '#23262F'
                        : '#F6F0ED',
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}>
                <Flag
                  size={14}
                  color={isFlagged ? '#EAB308' : colors.textSecondary}
                  strokeWidth={2.2}
                />
                <Text
                  style={[
                    styles.flagText,
                    { color: isFlagged ? '#CA8A04' : colors.textSecondary },
                  ]}>
                  {isFlagged ? 'Flagged' : 'Flag'}
                </Text>
              </Pressable>
            </View>

            {/* Question Text Box */}
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
            <View style={styles.optionsList}>
              {currentQ?.options.map((opt) => {
                const isSelected = userChoiceId === opt.id;

                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => handleSelectOption(opt.id)}
                    style={({ pressed }) => [
                      styles.optionCard,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? 'rgba(224, 122, 95, 0.22)'
                            : '#F8EAE4'
                          : isDark
                            ? '#23262F'
                            : '#FFFFFF',
                        borderColor: isSelected ? colors.accent : 'transparent',
                        borderWidth: isSelected ? 1.5 : 0,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}>
                    <View
                      style={[
                        styles.optionKeyCircle,
                        {
                          backgroundColor: isSelected
                            ? colors.accent
                            : isDark
                              ? '#1C1F26'
                              : '#F0EBE8',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.optionKeyText,
                          {
                            color: isSelected
                              ? '#FFFFFF'
                              : isDark
                                ? '#F9FAFB'
                                : '#1F2937',
                          },
                        ]}>
                        {opt.key}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: isDark ? '#F9FAFB' : '#111827',
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}>
                      {opt.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Sticky Bottom Navigation Bar */}
          <View
            style={[
              styles.bottomNavContainer,
              {
                paddingBottom: insets.bottom + 12,
                backgroundColor: colors.background,
                borderTopColor: isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.06)',
              },
            ]}>
            <Pressable
              disabled={currentIndex === 0}
              onPress={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              style={({ pressed }) => [
                styles.navBtn,
                {
                  backgroundColor: isDark ? '#23262F' : '#FFFFFF',
                  opacity: currentIndex === 0 ? 0.4 : pressed ? 0.8 : 1,
                },
              ]}>
              <ChevronLeft size={18} color={colors.text} strokeWidth={2.4} />
              <Text style={[styles.navBtnText, { color: colors.text }]}>Prev</Text>
            </Pressable>

            {currentIndex < questions.length - 1 ? (
              <Pressable
                onPress={() => setCurrentIndex((prev) => prev + 1)}
                style={({ pressed }) => [
                  styles.navBtnPrimary,
                  {
                    backgroundColor: colors.accent,
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.985 : 1 }],
                  },
                ]}>
                <Text style={styles.navBtnPrimaryText}>Next</Text>
                <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.4} />
              </Pressable>
            ) : (
              <Pressable
                onPress={handleSubmitExam}
                style={({ pressed }) => [
                  styles.navBtnPrimary,
                  {
                    backgroundColor: '#10B981',
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.985 : 1 }],
                  },
                ]}>
                <Text style={styles.navBtnPrimaryText}>Submit Exam</Text>
              </Pressable>
            )}
          </View>
        </View>
      ) : (
        /* Results & Review Screen */
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.resultsContainer,
            { paddingBottom: insets.bottom + 40 },
          ]}>
          {/* Result Summary Card */}
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
              },
            ]}>
            <View
              style={{
                width: 68,
                height: 68,
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}>
              <Svg width={68} height={68} style={StyleSheet.absoluteFill}>
                <Defs>
                  <LinearGradient id="exam_score_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={isPassed ? '#34D399' : '#FB7185'} />
                    <Stop offset="100%" stopColor={isPassed ? '#059669' : '#E11D48'} />
                  </LinearGradient>
                </Defs>
                <Rect width={68} height={68} rx={24} fill="url(#exam_score_grad)" />
              </Svg>
              <Trophy size={32} color="#FFFFFF" strokeWidth={2.2} />
            </View>

            <Text style={[styles.summaryTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
              {isPassed ? 'Exam Passed!' : 'Needs Review'}
            </Text>

            <Text
              style={[
                styles.summaryScore,
                { color: isPassed ? '#10B981' : '#EF4444' },
              ]}>
              {computedScore}%
            </Text>

            <Text style={[styles.summaryDescription, { color: colors.textSecondary }]}>
              You achieved {correctCount} out of {questions.length} correct answers.
            </Text>

            {/* Retake and Hub buttons */}
            <View style={styles.actionButtonsRow}>
              <Pressable
                onPress={handleRetake}
                style={({ pressed }) => [
                  styles.retakeBtn,
                  {
                    backgroundColor: colors.accent,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}>
                <RotateCcw size={16} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.retakeBtnText}>Retake Exam</Text>
              </Pressable>

              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.returnBtn,
                  {
                    backgroundColor: isDark ? '#23262F' : '#FFFFFF',
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}>
                <Text style={[styles.returnBtnText, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
                  Back to Hub
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Question Breakdown Section */}
          <Text style={[styles.breakdownHeader, { color: colors.text }]}>
            Detailed Answer Breakdown
          </Text>

          <View style={styles.breakdownList}>
            {questions.map((q, idx) => {
              const uChoiceId = selectedAnswers[q.id];
              const selectedOptionObj = q.options.find((o) => o.id === uChoiceId);
              const isCorrectQ = selectedOptionObj?.key === q.correctKey;

              return (
                <View
                  key={q.id}
                  style={[
                    styles.reviewCard,
                    {
                      backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                      borderColor: isDark
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.06)',
                    },
                  ]}>
                  <View style={styles.reviewCardHeader}>
                    <Text style={[styles.reviewNumber, { color: colors.accent }]}>
                      Question {idx + 1}
                    </Text>
                    <View
                      style={[
                        styles.reviewResultBadge,
                        {
                          backgroundColor: isCorrectQ
                            ? isDark
                              ? 'rgba(16, 185, 129, 0.2)'
                              : '#E8F8F0'
                            : isDark
                              ? 'rgba(239, 68, 68, 0.2)'
                              : '#FEECEB',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.reviewResultText,
                          { color: isCorrectQ ? '#10B981' : '#EF4444' },
                        ]}>
                        {isCorrectQ ? 'Correct' : 'Incorrect'}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.reviewQuestionText, { color: isDark ? '#F9FAFB' : '#111827' }]}>
                    {q.question}
                  </Text>

                  <View style={styles.reviewAnswersRow}>
                    <Text style={[styles.reviewAnswerLabel, { color: colors.textSecondary }]}>
                      Your Choice:{' '}
                      <Text
                        style={{
                          fontWeight: '800',
                          color: isCorrectQ ? '#10B981' : '#EF4444',
                        }}>
                        {selectedOptionObj ? `${selectedOptionObj.key}: ${selectedOptionObj.text}` : 'None Selected'}
                      </Text>
                    </Text>
                  </View>

                  <Text style={[styles.reviewExplanation, { color: isDark ? '#9CA3AF' : '#4B5563' }]}>
                    {q.explanation}
                  </Text>
                </View>
              );
            })}
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 1,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 4,
    width: '100%',
  },
  trackFill: {
    height: '100%',
  },
  sessionLayout: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  topicBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  flagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  flagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  questionBox: {
    padding: 22,
    borderRadius: 22,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    gap: 14,
  },
  optionKeyCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionKeyText: {
    fontSize: 14,
    fontWeight: '800',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  bottomNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 14,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    gap: 6,
  },
  navBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  navBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    gap: 6,
  },
  navBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  summaryCard: {
    padding: 24,
    borderRadius: 26,
    alignItems: 'center',
    gap: 10,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  summaryScore: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
  },
  summaryDescription: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
  retakeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    gap: 8,
  },
  retakeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  returnBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 18,
  },
  returnBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  breakdownHeader: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },
  breakdownList: {
    gap: 12,
  },
  reviewCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewNumber: {
    fontSize: 13,
    fontWeight: '800',
  },
  reviewResultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  reviewResultText: {
    fontSize: 12,
    fontWeight: '800',
  },
  reviewQuestionText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  reviewAnswersRow: {
    paddingVertical: 4,
  },
  reviewAnswerLabel: {
    fontSize: 13,
    lineHeight: 18,
  },
  reviewExplanation: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
});
