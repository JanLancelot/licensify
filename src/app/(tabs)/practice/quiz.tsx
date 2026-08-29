import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Trophy,
  XCircle,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
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
import { useLocalQuestions, useSubmitLocalAttempt } from '@/hooks/useLocalData';

interface FormattedQuestion {
  id: string;
  areaLabel: string;
  question: string;
  options: string[];
  choiceIds: string[];
  correctIndex: number;
  correctChoiceHash?: string;
  explanation: string;
  difficulty: string;
}

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

  const { questions: dbQuestions, loading, refetch } = useLocalQuestions({
    subjectId: selectedArea === 'all' ? undefined : selectedArea,
    difficulty: params.difficulty,
    count,
  });

  const submitLocalAttempt = useSubmitLocalAttempt();

  const [questions, setQuestions] = useState<FormattedQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [recordedAnswers, setRecordedAnswers] = useState<{ questionId: string; selectedChoiceId: string; correctChoiceHash?: string }[]>([]);

  // Format DB questions into component format
  useEffect(() => {
    if (dbQuestions && dbQuestions.length > 0) {
      const formatAsync = async () => {
        const formatted: FormattedQuestion[] = [];
        for (const q of dbQuestions) {
          let choices: { id: string; text: string }[] = [];
          try {
            choices = typeof q.choices === 'string' ? JSON.parse(q.choices) : q.choices;
          } catch {
            choices = [];
          }

          let correctIdx = 0;
          if (q.correctChoiceHash) {
            for (let i = 0; i < choices.length; i++) {
              const hash = await crypto.digestStringAsync(
                crypto.CryptoDigestAlgorithm.SHA256,
                `${q.id}:${choices[i].id}`
              );
              if (hash === q.correctChoiceHash) {
                correctIdx = i;
                break;
              }
            }
          }

          const areaLabel = q.subjectId === 'sub-area-1'
            ? 'Area 1: History & Theory'
            : q.subjectId === 'sub-area-2'
              ? 'Area 2: Tech & Utilities'
              : 'Area 3: Design & Laws';

          formatted.push({
            id: q.id,
            areaLabel,
            question: q.question,
            options: choices.map((c) => c.text),
            choiceIds: choices.map((c) => c.id),
            correctIndex: correctIdx,
            correctChoiceHash: q.correctChoiceHash || undefined,
            explanation: q.explanation || 'Essential architectural standard and code specification.',
            difficulty: q.difficulty,
          });
        }
        setQuestions(formatted);
      };
      formatAsync();
    }
  }, [dbQuestions]);

  const restartQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setIsCurrentAnswerCorrect(false);
    setCorrectAnswersCount(0);
    setIsQuizFinished(false);
    setRecordedAnswers([]);
    refetch();
  };

  const handleSelectOption = (idx: number) => {
    if (!isAnswerSubmitted) {
      setSelectedOption(idx);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || !questions[currentIdx]) return;
    
    const currQ = questions[currentIdx];
    const selectedChoiceId = currQ.choiceIds[selectedOption] || `c${selectedOption + 1}`;
    
    let isCorrect = selectedOption === currQ.correctIndex;
    if (currQ.correctChoiceHash) {
      const userHash = await crypto.digestStringAsync(
        crypto.CryptoDigestAlgorithm.SHA256,
        `${currQ.id}:${selectedChoiceId}`
      );
      isCorrect = userHash === currQ.correctChoiceHash;
    }

    setIsAnswerSubmitted(true);

    if (isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
    }

    setRecordedAnswers((prev) => [
      ...prev,
      {
        questionId: currQ.id,
        selectedChoiceId,
        correctChoiceHash: currQ.correctChoiceHash,
      },
    ]);
  };

  const handleNextQuestion = async () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizFinished(true);
      // Persist attempt to SQLite and trigger sync
      try {
        const quizId = (!selectedArea || selectedArea === 'all') ? 'all-modular' : selectedArea;
        await submitLocalAttempt('local-student-1', quizId, recordedAnswers);
      } catch (err) {
        console.warn('Failed to record attempt:', err);
      }
    }
  };

  const currentQ = questions[currentIdx];

  if (loading && questions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ color: colors.textSecondary, marginTop: 12, fontWeight: '600' }}>
          Loading Questions from Database...
        </Text>
      </SafeAreaView>
    );
  }

  if (!loading && questions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <HelpCircle size={48} color={colors.accent} strokeWidth={1.8} />
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 16, textAlign: 'center' }}>
          No Questions Found
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
          There are no questions recorded for this filter in the local database. Try selecting &quot;All Subjects&quot; or sync your database from the Profile screen.
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={{
            marginTop: 24,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 12,
            backgroundColor: colors.accent,
          }}>
          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
            Go Back
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

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
                          color: isDark ? '#F9FAFB' : '#111827',
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}>
                      {opt}
                    </Text>

                    {/* Checkmark or Cross Icon if Submitted */}
                    {isAnswerSubmitted && isCorrect && (
                      <CheckCircle2 size={20} color="#10B981" strokeWidth={2.4} />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <XCircle size={20} color="#EF4444" strokeWidth={2.4} />
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Explanation Rationale Box */}
            {isAnswerSubmitted && currentQ?.explanation && (
              <View
                style={[
                  styles.explanationBox,
                  {
                    backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                  },
                ]}>
                <View style={styles.explanationHeader}>
                  <HelpCircle size={17} color={colors.accent} strokeWidth={2.4} />
                  <Text style={[styles.explanationTitle, { color: colors.accent }]}>
                    EXPLANATION & RATIONALE
                  </Text>
                </View>
                <Text
                  style={[
                    styles.explanationBody,
                    { color: isDark ? '#D1D5DB' : '#374151' },
                  ]}>
                  {currentQ.explanation}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Sticky Bottom Action Button */}
          <View
            style={[
              styles.bottomActionContainer,
              {
                paddingBottom: insets.bottom + 12,
                backgroundColor: colors.background,
                borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}>
            {!isAnswerSubmitted ? (
              <Pressable
                disabled={selectedOption === null}
                onPress={handleSubmitAnswer}
                style={({ pressed }) => [
                  styles.submitBtn,
                  {
                    backgroundColor:
                      selectedOption !== null
                        ? colors.accent
                        : isDark
                          ? '#23262F'
                          : '#E2E8F0',
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.985 : 1 }],
                  },
                ]}>
                <Text
                  style={[
                    styles.submitBtnText,
                    {
                      color:
                        selectedOption !== null
                          ? '#FFFFFF'
                          : isDark
                            ? '#6B7280'
                            : '#94A3B8',
                    },
                  ]}>
                  Check Answer
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleNextQuestion}
                style={({ pressed }) => [
                  styles.submitBtn,
                  {
                    backgroundColor: colors.accent,
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.985 : 1 }],
                  },
                ]}>
                <Text style={[styles.submitBtnText, { color: '#FFFFFF' }]}>
                  {currentIdx < questions.length - 1 ? 'Next Question' : 'Finish Drill'}
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
    paddingBottom: 12,
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
  },
  areaLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  counterText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  dummySpace: {
    width: 40,
  },
  track: {
    height: 4,
    width: '100%',
  },
  trackFill: {
    height: '100%',
  },
  quizLayoutWrapper: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  questionBox: {
    padding: 22,
    borderRadius: 22,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  optionsContainer: {
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    gap: 14,
  },
  optionPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionPillText: {
    fontSize: 14,
    fontWeight: '800',
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  explanationBox: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    marginTop: 4,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  explanationTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  explanationBody: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  bottomActionContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 18,
    gap: 8,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  resultsScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  resultCard: {
    padding: 26,
    borderRadius: 26,
    alignItems: 'center',
    gap: 14,
  },
  resultHeading: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 6,
  },
  resultScoreText: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
  },
  resultSubtext: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  statBox: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 18,
    gap: 8,
    marginTop: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 18,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
