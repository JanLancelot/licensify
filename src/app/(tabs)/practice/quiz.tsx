import * as crypto from 'expo-crypto';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Timer,
  Trophy,
  XCircle,
} from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { useLocalQuestions, useSubmitLocalAttempt } from '@/hooks/useLocalData';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

interface FormattedQuestion {
  id: string;
  areaLabel: string;
  question: string;
  questionType?: 'multiple_choice' | 'identification' | 'essay';
  options: string[];
  choiceIds: string[];
  correctIndex: number;
  correctChoiceHash?: string;
  acceptedAnswers?: string[];
  numericTolerance?: number;
  rubricCriteria?: string[];
  idealAnswer?: string;
  diagramUrl?: string;
  explanation: string;
  difficulty: string;
}

export default function PracticeQuizScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    area?: string;
    topicId?: string;
    difficulty?: string;
    count?: string;
    timer?: string;
    title?: string;
    specializedType?: string;
  }>();

  const selectedArea = params.area || 'all';
  const count = parseInt(params.count || '10', 10);
  const timerLimit = parseInt(params.timer || '0', 10); // 0 = untimed
  const customTitle = params.title;
  const userProfile = useQuery(api.users.getCurrentUserProfile);
  const currentUserId = userProfile?._id || 'local-student-1';

  const { questions: dbQuestions, loading, refetch } = useLocalQuestions({
    subjectId: selectedArea === 'all' ? undefined : selectedArea,
    topicId: params.topicId,
    difficulty: params.difficulty,
    specializedType: params.specializedType,
    count,
  });

  const submitLocalAttempt = useSubmitLocalAttempt();

  const [questions, setQuestions] = useState<FormattedQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [isInputCorrect, setIsInputCorrect] = useState<boolean>(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [recordedAnswers, setRecordedAnswers] = useState<{ questionId: string; selectedChoiceId: string; correctChoiceHash?: string }[]>([]);

  // Timer State
  const [timeLeft, setTimeLeft] = useState<number>(timerLimit);

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
          const anyQ = q as any;
          if (anyQ.correctChoiceId) {
            const idx = choices.findIndex((c) => c.id === anyQ.correctChoiceId);
            if (idx !== -1) {
              correctIdx = idx;
            }
          } else if (anyQ.correctChoiceHash) {
            for (let i = 0; i < choices.length; i++) {
              const hash = await crypto.digestStringAsync(
                crypto.CryptoDigestAlgorithm.SHA256,
                `${q.id}:${choices[i].id}`
              );
              if (hash === anyQ.correctChoiceHash) {
                correctIdx = i;
                break;
              }
            }
          }

          const areaLabel = customTitle
            ? customTitle
            : q.subjectId === 'sub-area-1'
              ? 'Area 1: History & Theory'
              : q.subjectId === 'sub-area-2'
                ? 'Area 2: Tech & Utilities'
                : 'Area 3: Design & Laws';

          let parsedAccepted: string[] | undefined = undefined;
          if (Array.isArray(anyQ.acceptedAnswers)) {
            parsedAccepted = anyQ.acceptedAnswers;
          } else if (typeof anyQ.acceptedAnswers === 'string') {
            try {
              parsedAccepted = JSON.parse(anyQ.acceptedAnswers);
            } catch {
              parsedAccepted = [anyQ.acceptedAnswers];
            }
          }

          let parsedRubric: string[] | undefined = undefined;
          if (Array.isArray(anyQ.rubricCriteria)) {
            parsedRubric = anyQ.rubricCriteria;
          } else if (typeof anyQ.rubricCriteria === 'string') {
            try {
              parsedRubric = JSON.parse(anyQ.rubricCriteria);
            } catch {
              parsedRubric = [anyQ.rubricCriteria];
            }
          }

          formatted.push({
            id: q.id,
            areaLabel,
            question: q.question,
            questionType: (anyQ.questionType as any) || 'multiple_choice',
            options: choices.map((c) => c.text),
            choiceIds: choices.map((c) => c.id),
            correctIndex: correctIdx,
            correctChoiceHash: anyQ.correctChoiceHash || anyQ.correctChoiceId || undefined,
            acceptedAnswers: parsedAccepted,
            numericTolerance: anyQ.numericTolerance !== undefined ? Number(anyQ.numericTolerance) : undefined,
            rubricCriteria: parsedRubric,
            idealAnswer: anyQ.idealAnswer,
            diagramUrl: anyQ.diagramUrl || anyQ.imageUrl,
            explanation: q.explanation || 'Essential architectural standard and code specification.',
            difficulty: q.difficulty,
          });
        }
        setQuestions(formatted);
      };
      formatAsync();
    }
  }, [dbQuestions, customTitle]);

  // Reset timer on question change
  const [prevCurrentIdx, setPrevCurrentIdx] = useState(currentIdx);
  const [prevTimerLimit, setPrevTimerLimit] = useState(timerLimit);

  if (currentIdx !== prevCurrentIdx || timerLimit !== prevTimerLimit) {
    setPrevCurrentIdx(currentIdx);
    setPrevTimerLimit(timerLimit);
    if (timerLimit > 0) {
      setTimeLeft(timerLimit);
    }
  }

  const handleTimeOut = useCallback(async () => {
    if (isAnswerSubmitted || !questions[currentIdx]) return;

    const currQ = questions[currentIdx];

    if (currQ.questionType === 'identification' || currQ.questionType === 'essay') {
      setIsAnswerSubmitted(true);
      setRecordedAnswers((prev) => [
        ...prev,
        {
          questionId: currQ.id,
          selectedChoiceId: textAnswer.trim() || 'unanswered',
        },
      ]);
      return;
    }

    const userSelected = selectedOption !== null ? selectedOption : -1;
    const selectedChoiceId = userSelected >= 0 && currQ.choiceIds[userSelected]
      ? currQ.choiceIds[userSelected]
      : 'unanswered';

    let isCorrect = userSelected === currQ.correctIndex;
    if (userSelected >= 0 && currQ.correctChoiceHash) {
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
  }, [isAnswerSubmitted, questions, currentIdx, selectedOption, textAnswer]);

  const handleTimeOutRef = useRef(handleTimeOut);
  useEffect(() => {
    handleTimeOutRef.current = handleTimeOut;
  }, [handleTimeOut]);

  // Live Timer Countdown Interval
  useEffect(() => {
    if (timerLimit <= 0 || isAnswerSubmitted || isQuizFinished || questions.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeOutRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerLimit, isAnswerSubmitted, isQuizFinished, questions.length]);

  const restartQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setTextAnswer('');
    setIsInputCorrect(false);
    setIsAnswerSubmitted(false);
    setCorrectAnswersCount(0);
    setIsQuizFinished(false);
    setRecordedAnswers([]);
    setTimeLeft(timerLimit);
    refetch();
  };

  const handleSelectOption = (idx: number) => {
    if (!isAnswerSubmitted) {
      setSelectedOption(idx);
    }
  };

  const handleSubmitAnswer = async () => {
    const currQ = questions[currentIdx];
    if (!currQ) return;

    if (currQ.questionType === 'identification') {
      if (!textAnswer.trim()) return;
      const normalizedInput = textAnswer.trim().toLowerCase();
      let isCorrect = false;
      const numInput = parseFloat(normalizedInput);
      const tolerance = currQ.numericTolerance ?? 0;

      if (!isNaN(numInput) && currQ.acceptedAnswers && currQ.acceptedAnswers.length > 0) {
        for (const ans of currQ.acceptedAnswers) {
          const numAns = parseFloat(ans);
          if (!isNaN(numAns) && Math.abs(numInput - numAns) <= tolerance) {
            isCorrect = true;
            break;
          }
        }
      }

      if (!isCorrect && currQ.acceptedAnswers) {
        isCorrect = currQ.acceptedAnswers.some(
          (ans) => ans.trim().toLowerCase() === normalizedInput
        );
      }

      setIsInputCorrect(isCorrect);
      setIsAnswerSubmitted(true);
      if (isCorrect) setCorrectAnswersCount((prev) => prev + 1);
      setRecordedAnswers((prev) => [
        ...prev,
        {
          questionId: currQ.id,
          selectedChoiceId: textAnswer.trim(),
        },
      ]);
      return;
    }

    if (currQ.questionType === 'essay') {
      if (!textAnswer.trim()) return;
      setIsInputCorrect(true);
      setIsAnswerSubmitted(true);
      setCorrectAnswersCount((prev) => prev + 1);
      setRecordedAnswers((prev) => [
        ...prev,
        {
          questionId: currQ.id,
          selectedChoiceId: textAnswer.trim(),
        },
      ]);
      return;
    }

    if (selectedOption === null) return;

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
      setTextAnswer('');
      setIsInputCorrect(false);
      setIsAnswerSubmitted(false);
      setTimeLeft(timerLimit);
    } else {
      setIsQuizFinished(true);
      // Persist attempt to SQLite and trigger sync
      try {
        const quizId = (!selectedArea || selectedArea === 'all') ? 'all-modular' : selectedArea;
        await submitLocalAttempt(currentUserId, quizId, recordedAnswers);
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
              backgroundColor: isDark ? '#23262F' : '#F3F4F6',
              opacity: pressed ? 0.7 : 1,
            },
          ]}>
          <ArrowLeft size={20} color={colors.text} strokeWidth={2.4} />
        </Pressable>

        <View style={styles.topCenter}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.areaLabel, { color: colors.accent }]}>
            {currentQ?.areaLabel || 'Practice Drill'}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.counterText, { color: colors.textSecondary }]}>
            Question {currentIdx + 1} of {questions.length}
          </Text>
        </View>

        {timerLimit > 0 ? (
          <View
            style={[
              styles.timerBadge,
              {
                backgroundColor:
                  timeLeft <= 5
                    ? isDark
                      ? 'rgba(239, 68, 68, 0.2)'
                      : '#FEE2E2'
                    : colors.accentMuted,
              },
            ]}>
            <Timer
              size={13}
              color={timeLeft <= 5 ? '#EF4444' : colors.accent}
              strokeWidth={2.4}
            />
            <Text
              style={[
                styles.timerBadgeText,
                { color: timeLeft <= 5 ? '#EF4444' : colors.accent },
              ]}>
              {timeLeft}s
            </Text>
          </View>
        ) : (
          <View style={styles.dummySpace} />
        )}
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
                backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
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
                    <Stop offset="0%" stopColor={colors.accentLight} />
                    <Stop offset="100%" stopColor={colors.accent} />
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
                  backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                },
              ]}>
              <Text style={[styles.questionText, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
                {currentQ?.question}
              </Text>
            </View>

            {/* Diagram Image if available */}
            {currentQ?.diagramUrl ? (
              <View
                style={[
                  styles.diagramWrapper,
                  {
                    backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                  },
                ]}>
                <Image
                  source={{ uri: currentQ.diagramUrl }}
                  style={styles.diagramImage}
                  resizeMode="contain"
                />
                <Text style={[styles.diagramCaption, { color: colors.textSecondary }]}>
                  Architectural Diagram / Site Specification
                </Text>
              </View>
            ) : null}

            {/* Question Format Badge */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, paddingHorizontal: 4 }}>
              <View style={[styles.typeBadge, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#EEF2FF' }]}>
                <Text style={[styles.typeBadgeText, { color: colors.accent }]}>
                  {currentQ?.questionType === 'identification'
                    ? 'IDENTIFICATION / SPECIFICATION'
                    : currentQ?.questionType === 'essay'
                      ? 'ESSAY / DESIGN RATIONALE'
                      : 'MULTIPLE CHOICE'}
                </Text>
              </View>
            </View>

            {/* MULTI-FORMAT RENDERER */}
            {currentQ?.questionType === 'identification' ? (
              <View style={styles.identificationContainer}>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
                    },
                  ]}>
                  <TextInput
                    value={textAnswer}
                    onChangeText={setTextAnswer}
                    editable={!isAnswerSubmitted}
                    placeholder="Type the exact term or numeric computation..."
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.answerTextInput, { color: isDark ? '#F9FAFB' : '#0F172A' }]}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {isAnswerSubmitted ? (
                  <View
                    style={[
                      styles.answerResultBadge,
                      {
                        backgroundColor: isInputCorrect
                          ? isDark
                            ? 'rgba(16, 185, 129, 0.15)'
                            : '#E8F8F0'
                          : isDark
                            ? 'rgba(239, 68, 68, 0.15)'
                            : '#FEECEB',
                        borderColor: isInputCorrect ? '#10B981' : '#EF4444',
                      },
                    ]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      {isInputCorrect ? (
                        <CheckCircle2 size={18} color="#10B981" />
                      ) : (
                        <XCircle size={18} color="#EF4444" />
                      )}
                      <Text
                        style={{
                          fontWeight: '700',
                          fontSize: 13.5,
                          color: isInputCorrect ? '#10B981' : '#EF4444',
                        }}>
                        {isInputCorrect ? 'Exact Match / Within Tolerance!' : 'Incorrect Answer'}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 13,
                        color: isDark ? '#D1D5DB' : '#374151',
                        marginTop: 4,
                      }}>
                      Your Answer: <Text style={{ fontWeight: '600' }}>{textAnswer || '(Blank)'}</Text>
                    </Text>
                    {currentQ.acceptedAnswers && currentQ.acceptedAnswers.length > 0 ? (
                      <Text style={{ fontSize: 12.5, color: colors.textSecondary, marginTop: 4 }}>
                        Accepted Keys: {currentQ.acceptedAnswers.join(' / ')}{' '}
                        {currentQ.numericTolerance !== undefined
                          ? `(±${currentQ.numericTolerance} tolerance)`
                          : ''}
                      </Text>
                    ) : null}
                  </View>
                ) : null}
              </View>
            ) : currentQ?.questionType === 'essay' ? (
              <View style={styles.essayContainer}>
                <View
                  style={[
                    styles.essayInputWrapper,
                    {
                      backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
                    },
                  ]}>
                  <TextInput
                    value={textAnswer}
                    onChangeText={setTextAnswer}
                    editable={!isAnswerSubmitted}
                    multiline
                    numberOfLines={5}
                    placeholder="Compose your architectural explanation, statutory citations, or design rationale..."
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.essayTextInput, { color: isDark ? '#F9FAFB' : '#0F172A' }]}
                    textAlignVertical="top"
                  />
                  <Text
                    style={{
                      alignSelf: 'flex-end',
                      fontSize: 11,
                      color: colors.textSecondary,
                      marginTop: 4,
                    }}>
                    {textAnswer.trim().split(/\s+/).filter(Boolean).length} words
                  </Text>
                </View>

                {isAnswerSubmitted ? (
                  <View style={{ gap: 12, marginTop: 10 }}>
                    {currentQ.rubricCriteria && currentQ.rubricCriteria.length > 0 ? (
                      <View
                        style={[
                          styles.rubricBox,
                          {
                            backgroundColor: isDark ? '#23262F' : '#F8FAFC',
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                          },
                        ]}>
                        <Text style={[styles.rubricTitle, { color: colors.accent }]}>
                          GRADING RUBRIC & KEY PROVISIONS
                        </Text>
                        {currentQ.rubricCriteria.map((c, i) => (
                          <View
                            key={i}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'flex-start',
                              gap: 6,
                              marginTop: 4,
                            }}>
                            <CheckCircle2 size={14} color="#10B981" style={{ marginTop: 2 }} />
                            <Text
                              style={{
                                fontSize: 12.5,
                                color: isDark ? '#D1D5DB' : '#374151',
                                flex: 1,
                              }}>
                              {c}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : null}

                    {currentQ.idealAnswer ? (
                      <View
                        style={[
                          styles.rubricBox,
                          {
                            backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
                            borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE',
                          },
                        ]}>
                        <Text style={[styles.rubricTitle, { color: '#3B82F6' }]}>
                          IDEAL BENCHMARK ANSWER
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            color: isDark ? '#E2E8F0' : '#1E3A8A',
                            marginTop: 4,
                            lineHeight: 18,
                          }}>
                          {currentQ.idealAnswer}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </View>
            ) : (
              /* Options List */
              <View style={styles.optionsContainer}>
                {currentQ?.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctIndex;

                  let optBg: string = isDark ? '#23262F' : '#FFFFFF';
                  let optBorder: string = 'transparent';
                  let pillBg: string = isDark ? '#1C1F26' : '#F3F4F6';
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
                    optBg = colors.accentMuted;
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
            )}

            {/* Explanation Rationale Box */}
            {isAnswerSubmitted && currentQ?.explanation && (
              <View
                style={[
                  styles.explanationBox,
                  {
                    backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
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
                disabled={
                  currentQ?.questionType === 'identification' || currentQ?.questionType === 'essay'
                    ? !textAnswer.trim()
                    : selectedOption === null
                }
                onPress={handleSubmitAnswer}
                style={({ pressed }) => {
                  const canSubmit =
                    currentQ?.questionType === 'identification' || currentQ?.questionType === 'essay'
                      ? Boolean(textAnswer.trim())
                      : selectedOption !== null;
                  return [
                    styles.submitBtn,
                    {
                      backgroundColor: canSubmit
                        ? colors.accent
                        : isDark
                          ? '#23262F'
                          : '#E2E8F0',
                      opacity: pressed ? 0.9 : 1,
                      transform: [{ scale: pressed ? 0.985 : 1 }],
                    },
                  ];
                }}>
                <Text
                  style={[
                    styles.submitBtnText,
                    {
                      color:
                        (currentQ?.questionType === 'identification' || currentQ?.questionType === 'essay'
                          ? Boolean(textAnswer.trim())
                          : selectedOption !== null)
                          ? '#FFFFFF'
                          : isDark
                            ? '#6B7280'
                            : '#94A3B8',
                    },
                  ]}>
                  {currentQ?.questionType === 'essay' ? 'Submit Essay for Rubric' : 'Check Answer'}
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  topCenter: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  areaLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    textAlign: 'center',
    maxWidth: '100%',
  },
  counterText: {
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  dummySpace: {
    width: 40,
    flexShrink: 0,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    flexShrink: 0,
    minWidth: 48,
  },
  timerBadgeText: {
    fontSize: 12,
    fontWeight: '800',
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
  diagramWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
    padding: 8,
    alignItems: 'center',
  },
  diagramImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },
  diagramCaption: {
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  identificationContainer: {
    gap: 12,
    marginBottom: 16,
  },
  inputWrapper: {
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  answerTextInput: {
    fontSize: 15,
    fontWeight: '600',
  },
  answerResultBadge: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  essayContainer: {
    gap: 12,
    marginBottom: 16,
  },
  essayInputWrapper: {
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  essayTextInput: {
    fontSize: 14.5,
    minHeight: 120,
    lineHeight: 20,
  },
  rubricBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  rubricTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
});
