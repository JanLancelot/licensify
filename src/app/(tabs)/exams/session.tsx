import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Flag,
  HelpCircle,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Timer,
  X,
  XCircle,
} from 'lucide-react-native';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  LayoutChangeEvent,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as crypto from 'expo-crypto';

import { useAppTheme } from '@/context/theme-context';
import { useLocalHierarchy, useLocalQuizWithQuestions, useSubmitLocalAttempt } from '@/hooks/useLocalData';

export interface ExamSessionQuestion {
  id: string;
  topic: string;
  question: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; id: string; text: string }[];
  correctKey: 'A' | 'B' | 'C' | 'D';
  correctChoiceHash?: string;
  explanation: string;
}

/* ========================================================================= */
/* 1. ISOLATED TIMER BADGE (Prevents full-exam re-renders every second)      */
/* ========================================================================= */
const ExamTimerBadge = memo(function ExamTimerBadge({
  initialSeconds,
  isSubmitted,
  computedScore,
  isPassed,
  onTimeUp,
  accentColor,
  isDark,
}: {
  initialSeconds: number;
  isSubmitted: boolean;
  computedScore: number;
  isPassed: boolean;
  onTimeUp: () => void;
  accentColor: string;
  isDark: boolean;
}) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    setSecondsRemaining(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted]);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (isSubmitted) {
    return (
      <View
        style={[
          styles.timerBadge,
          {
            backgroundColor: isPassed
              ? isDark
                ? 'rgba(16, 185, 129, 0.2)'
                : '#D1FAE5'
              : isDark
                ? 'rgba(239, 68, 68, 0.2)'
                : '#FEE2E2',
          },
        ]}>
        <Text
          style={[
            styles.timerText,
            { color: isPassed ? '#10B981' : '#EF4444' },
          ]}>
          {computedScore}% GWA
        </Text>
      </View>
    );
  }

  const isUrgent = secondsRemaining <= 300;

  return (
    <View
      style={[
        styles.timerBadge,
        {
          backgroundColor: isUrgent
            ? isDark
              ? 'rgba(239, 68, 68, 0.22)'
              : '#FEE2E2'
            : isDark
              ? 'rgba(224, 122, 95, 0.18)'
              : '#F8EAE4',
        },
      ]}>
      <Timer
        size={13}
        color={isUrgent ? '#EF4444' : accentColor}
        strokeWidth={2.4}
      />
      <Text
        style={[
          styles.timerText,
          {
            color: isUrgent ? '#EF4444' : accentColor,
          },
        ]}>
        {formatTimer(secondsRemaining)}
      </Text>
    </View>
  );
});

/* ========================================================================= */
/* 2. MEMOIZED SIMPLE QUESTION CARD (Clean, only circle shaded, no box)      */
/* ========================================================================= */
interface ExamQuestionCardProps {
  q: ExamSessionQuestion;
  index: number;
  selectedChoiceId?: string;
  isFlagged: boolean;
  onSelectOption: (questionId: string, choiceId: string) => void;
  onToggleFlag: (questionId: string) => void;
  onLayout: (e: LayoutChangeEvent) => void;
  isDark: boolean;
  accentColor: string;
  textSecondaryColor: string;
}

const ExamQuestionCard = memo(function ExamQuestionCard({
  q,
  index,
  selectedChoiceId,
  isFlagged,
  onSelectOption,
  onToggleFlag,
  onLayout,
  isDark,
  accentColor,
  textSecondaryColor,
}: ExamQuestionCardProps) {
  return (
    <View
      onLayout={onLayout}
      style={[
        styles.simpleQuestionCard,
        {
          backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
          borderColor: isFlagged
            ? accentColor
            : isDark
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.06)',
        },
      ]}>
      {/* Question Header: Number + Topic + Flag */}
      <View style={styles.questionCardHeader}>
        <Text style={[styles.questionNumberText, { color: accentColor }]}>
          {index + 1}.)
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.questionTopicTag, { color: textSecondaryColor }]}>
          {q.topic}
        </Text>

        {/* Flag Button */}
        <Pressable
          onPress={() => onToggleFlag(q.id)}
          hitSlop={8}
          style={[
            styles.flagButton,
            {
              backgroundColor: isFlagged
                ? isDark
                  ? 'rgba(224, 122, 95, 0.22)'
                  : '#F8EAE4'
                : 'transparent',
            },
          ]}>
          <Flag
            size={14}
            color={isFlagged ? accentColor : textSecondaryColor}
            fill={isFlagged ? accentColor : 'transparent'}
            strokeWidth={2.2}
          />
        </Pressable>
      </View>

      {/* Question Statement */}
      <Text style={[styles.questionBodyText, { color: isDark ? '#F9FAFB' : '#111827' }]}>
        {q.question}
      </Text>

      {/* Options List (A, B, C, D) - Clean rows, only the circle is shaded */}
      <View style={styles.simpleOptionsList}>
        {q.options.map((opt) => {
          const isSelected = selectedChoiceId === opt.id;

          return (
            <Pressable
              key={opt.id}
              onPress={() => onSelectOption(q.id, opt.id)}
              style={({ pressed }) => [
                styles.simpleOptionRow,
                { opacity: pressed ? 0.7 : 1 },
              ]}>
              {/* Only the circle is shaded */}
              <View
                style={[
                  styles.simpleRadioCircle,
                  {
                    backgroundColor: isSelected
                      ? accentColor
                      : isDark
                        ? '#23262F'
                        : '#EDE8E4',
                  },
                ]}>
                <Text
                  style={[
                    styles.simpleRadioKeyText,
                    {
                      color: isSelected
                        ? '#FFFFFF'
                        : isDark
                          ? '#9CA3AF'
                          : '#4B5563',
                      fontWeight: isSelected ? '800' : '600',
                    },
                  ]}>
                  {opt.key}
                </Text>
              </View>

              {/* Option Text - simple text, no box border */}
              <Text
                style={[
                  styles.simpleOptionText,
                  {
                    color: isSelected
                      ? isDark
                        ? '#F9FAFB'
                        : '#111827'
                      : isDark
                        ? '#D1D5DB'
                        : '#374151',
                    fontWeight: isSelected ? '700' : '400',
                  },
                ]}>
                {opt.text}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

/* ========================================================================= */
/* 3. MEMOIZED SCANTRON BUBBLE ROW                                           */
/* ========================================================================= */
interface ScantronBubbleRowProps {
  q: ExamSessionQuestion;
  index: number;
  selectedChoiceId?: string;
  isFlagged: boolean;
  onSelectOption: (questionId: string, choiceId: string) => void;
  onScrollToQuestion: (index: number) => void;
  isDark: boolean;
  textColor: string;
  accentColor: string;
}

const ScantronBubbleRow = memo(function ScantronBubbleRow({
  q,
  index,
  selectedChoiceId,
  isFlagged,
  onSelectOption,
  onScrollToQuestion,
  isDark,
  textColor,
  accentColor,
}: ScantronBubbleRowProps) {
  return (
    <View
      style={[
        styles.bubbleRow,
        {
          borderBottomColor: isDark
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(0, 0, 0, 0.04)',
        },
      ]}>
      {/* Question Number (Click to Scroll directly to it) */}
      <Pressable
        onPress={() => onScrollToQuestion(index)}
        style={styles.bubbleQNumberBox}>
        <Text style={[styles.bubbleQNumber, { color: textColor }]}>
          {index + 1}.)
        </Text>
        {isFlagged && (
          <Flag
            size={11}
            color={accentColor}
            fill={accentColor}
            style={{ marginLeft: 2 }}
          />
        )}
      </Pressable>

      {/* Circular Bubbles (A) (B) (C) (D) - Only shaded when selected */}
      <View style={styles.bubbleRowGroup}>
        {q.options.map((opt) => {
          const isShaded = selectedChoiceId === opt.id;

          return (
            <Pressable
              key={opt.id}
              onPress={() => onSelectOption(q.id, opt.id)}
              style={({ pressed }) => [
                styles.simpleScantronBubble,
                {
                  backgroundColor: isShaded
                    ? accentColor
                    : isDark
                      ? '#23262F'
                      : '#EDE8E4',
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: isShaded ? 1.06 : 1 }],
                },
              ]}>
              <Text
                style={[
                  styles.simpleScantronBubbleText,
                  {
                    color: isShaded
                      ? '#FFFFFF'
                      : isDark
                        ? '#9CA3AF'
                        : '#4B5563',
                    fontWeight: isShaded ? '800' : '600',
                  },
                ]}>
                {opt.key}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

/* ========================================================================= */
/* 4. MAIN EXAM SCREEN                                                       */
/* ========================================================================= */
export default function ExamSessionScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    timer?: string;
    count?: string;
  }>();
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const questionLayoutsRef = useRef<Record<number, number>>({});

  const examId = params.id || 'comprehensive-set-1';
  const examTitle = params.title || 'Comprehensive Examination';
  const customTimerSeconds = params.timer ? parseInt(params.timer, 10) : 10800; // 3 hrs default
  const targetQuestionCount = params.count ? parseInt(params.count, 10) : 100;

  const { quiz, questions: dbQuestions, loading: dbLoading } = useLocalQuizWithQuestions(examId);
  const submitLocalAttempt = useSubmitLocalAttempt();

  const [questions, setQuestions] = useState<ExamSessionQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // questionId -> choiceId
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({}); // questionId -> boolean
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [computedScore, setComputedScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Answer Sheet Drawer Modal State
  const [isAnswerSheetVisible, setIsAnswerSheetVisible] = useState(false);
  const [isSubmitConfirmVisible, setIsSubmitConfirmVisible] = useState(false);

  // Generate / format examination questions
  useEffect(() => {
    const buildQuestions = async () => {
      const keys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
      const formatted: ExamSessionQuestion[] = [];

      // 1. If DB has questions, format them
      if (dbQuestions && dbQuestions.length > 0) {
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
            explanation: q.explanation || 'Refer to the standard ALE board exam syllabus guidelines.',
          });
        }
      }

      // 2. If questions are fewer than target count, generate realistic questions from curriculum
      if (formatted.length < targetQuestionCount) {
        const needed = targetQuestionCount - formatted.length;
        const fallbackPool: {
          topic: string;
          q: string;
          choices: string[];
          correctIdx: number;
          exp: string;
        }[] = [
          {
            topic: 'History of Architecture',
            q: 'Which architectural order is characterized by acanthus leaf carvings on a bell-shaped capital?',
            choices: ['Doric Order', 'Ionic Order', 'Corinthian Order', 'Tuscan Order'],
            correctIdx: 2,
            exp: 'The Corinthian order is identified by its ornate capital decorated with stylized acanthus leaves and volutes.',
          },
          {
            topic: 'Theory of Architecture',
            q: 'According to Vitruvian principles, what are the three fundamental qualities of good architecture?',
            choices: [
              'Firmitas, Utilitas, Venustas (Strength, Utility, Beauty)',
              'Form, Proportion, Materiality',
              'Symmetry, Rhythm, Hierarchy',
              'Context, Function, Aesthetic',
            ],
            correctIdx: 0,
            exp: 'Marcus Vitruvius Pollio asserted in De Architectura that a structure must exhibit Firmitas, Utilitas, and Venustas.',
          },
          {
            topic: 'Tropical Design',
            q: 'In Philippine tropical climatic design, what is the primary orientation recommended for long building facades?',
            choices: ['North-South Axis', 'East-West Axis', 'Northeast-Southwest', 'Northwest-Southeast'],
            correctIdx: 0,
            exp: 'Orienting long building facades along the North-South axis minimizes direct solar heat gain on large window exposures.',
          },
          {
            topic: 'Building Utilities',
            q: 'In plumbing sanitary drainage systems, what is the minimum slope required for 3-inch and smaller soil horizontal drainage pipes?',
            choices: ['1% (1/8 in/ft)', '2% (1/4 in/ft)', '3% (3/8 in/ft)', '4% (1/2 in/ft)'],
            correctIdx: 1,
            exp: 'The Revised National Plumbing Code specifies a minimum 2% (1/4 inch per foot) slope for 3-inch or smaller horizontal drainage lines.',
          },
          {
            topic: 'Building Technology',
            q: 'What is the standard diameter of a #10 (metric 32mm) deformed steel reinforcing bar?',
            choices: ['25 mm', '28 mm', '32 mm', '36 mm'],
            correctIdx: 2,
            exp: 'Under ASTM/PNS standards, a #10 bar corresponds to a nominal diameter of 32 mm.',
          },
          {
            topic: 'NBCP Rule 7 & 8',
            q: 'Under NBCP Rule 7 & 8, what does AMBF stand for in development control calculations?',
            choices: [
              'Allowable Maximum Building Footprint',
              'Average Maximum Built Floor',
              'Approved Minimum Base Foundation',
              'Actual Median Boundary Form',
            ],
            correctIdx: 0,
            exp: 'AMBF is the Allowable Maximum Building Footprint, which defines the maximum lot area a structure can occupy at ground level.',
          },
          {
            topic: 'Professional Practice',
            q: 'Under RA 9266 (The Architecture Act of 2004), what is the penalty for illegal practice of architecture by unregistered individuals?',
            choices: [
              'Fine of ₱100,000 to ₱5,000,000 and/or imprisonment of 6 months to 6 years',
              'Fine of ₱20,000 and warning letter',
              'Fine of ₱50,000 with 1 month community service',
              'Administrative probation for 1 year',
            ],
            correctIdx: 0,
            exp: 'Section 34 of RA 9266 penalizes illegal practice with a fine of not less than ₱100,000 nor more than ₱5,000,000, or imprisonment from 6 months to 6 years.',
          },
          {
            topic: 'Site Planning',
            q: 'Which contour line interval rule states that closer contour lines on a topographical site survey indicate what condition?',
            choices: ['Flat terrain', 'Steeper slope or grade', 'Depression basin', 'Ridgeline summit'],
            correctIdx: 1,
            exp: 'Closely spaced contour lines indicate a steep slope, while widely spaced contours represent gentle or flat topography.',
          },
          {
            topic: 'Building Laws',
            q: 'Under BP 344 (Accessibility Law), what is the maximum allowable gradient slope for an accessible wheelchair ramp?',
            choices: ['1:10 (10%)', '1:12 (8.33%)', '1:16 (6.25%)', '1:20 (5%)'],
            correctIdx: 1,
            exp: 'BP 344 mandates a maximum ramp slope of 1:12 (1 unit vertical rise per 12 units horizontal run) for wheelchair accessibility.',
          },
          {
            topic: 'Architectural Design',
            q: 'In architectural programming and egress design, what is the standard minimum clear width for an exit doorway?',
            choices: ['700 mm', '800 mm', '900 mm', '1000 mm'],
            correctIdx: 2,
            exp: 'The Fire Code of the Philippines and NBCP specify a standard minimum clear opening width of 900 mm for accessible exit doors.',
          },
        ];

        for (let i = 0; i < needed; i++) {
          const template = fallbackPool[i % fallbackPool.length];
          const qId = `gen-q-${examId}-${formatted.length + i + 1}`;
          const choiceIds = ['c-1', 'c-2', 'c-3', 'c-4'];

          formatted.push({
            id: qId,
            topic: template.topic,
            question: `[Item ${formatted.length + 1}] ${template.q}`,
            options: template.choices.map((text, cIdx) => ({
              key: keys[cIdx] || 'A',
              id: `${qId}-${choiceIds[cIdx]}`,
              text,
            })),
            correctKey: keys[template.correctIdx] || 'A',
            explanation: template.exp,
          });
        }
      }

      setQuestions(formatted);
    };

    buildQuestions();
  }, [examId, dbQuestions, targetQuestionCount]);

  const handleSelectOption = useCallback((questionId: string, choiceId: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: choiceId,
    }));
  }, [isSubmitted]);

  const handleToggleFlag = useCallback((questionId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  }, []);

  const handleScrollToQuestion = useCallback((index: number) => {
    setIsAnswerSheetVisible(false);
    const yPos = questionLayoutsRef.current[index];
    if (yPos !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: Math.max(yPos - 20, 0), animated: true });
    }
  }, []);

  const answeredCount = useMemo(() => {
    return Object.keys(selectedAnswers).filter((k) => selectedAnswers[k]).length;
  }, [selectedAnswers]);

  const flaggedCount = useMemo(() => {
    return Object.keys(flaggedQuestions).filter((k) => flaggedQuestions[k]).length;
  }, [flaggedQuestions]);

  const handleFinalSubmit = useCallback(async () => {
    setIsSubmitConfirmVisible(false);
    if (isSubmitted) return;

    let correct = 0;
    const recorded: { questionId: string; selectedChoiceId: string; correctChoiceHash?: string }[] = [];

    for (const q of questions) {
      const userChoiceId = selectedAnswers[q.id];
      const selectedOption = q.options.find((o) => o.id === userChoiceId);

      if (selectedOption && selectedOption.key === q.correctKey) {
        correct++;
      } else if (userChoiceId && q.correctChoiceHash) {
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

  const handleConfirmExit = () => {
    if (isSubmitted) {
      router.back();
      return;
    }
    Alert.alert(
      'Leave Examination?',
      'Your examination progress will be discarded. Are you sure you want to leave?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave Exam',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const isPassed = computedScore >= 70;

  if (dbLoading && questions.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ color: colors.textSecondary, marginTop: 12, fontWeight: '700' }}>
          Preparing Examination Paper...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* =================================================================== */}
      {/* 1. FIXED TOP HEADER BAR (Title & Timer)                             */}
      {/* =================================================================== */}
      <View style={styles.topBar}>
        {/* Back Button */}
        <Pressable
          onPress={handleConfirmExit}
          hitSlop={10}
          style={({ pressed }) => [
            styles.headerBtn,
            {
              backgroundColor: isDark ? '#23262F' : '#F6F0ED',
              opacity: pressed ? 0.7 : 1,
            },
          ]}>
          <ArrowLeft size={18} color={colors.text} strokeWidth={2.4} />
        </Pressable>

        {/* Center Exam Title in Header */}
        <View style={styles.headerTitleCenterBox}>
          <Text
            numberOfLines={1}
            style={[styles.headerExamTitle, { color: colors.text }]}>
            {isSubmitted ? 'Exam Score Report' : examTitle}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.headerExamSubtitle, { color: colors.textSecondary }]}>
            {isSubmitted
              ? `${questions.length} Items Evaluated`
              : `${questions.length} Questions • Continuous Test`}
          </Text>
        </View>

        {/* Isolated Timer Badge */}
        <ExamTimerBadge
          initialSeconds={customTimerSeconds}
          isSubmitted={isSubmitted}
          computedScore={computedScore}
          isPassed={isPassed}
          onTimeUp={handleFinalSubmit}
          accentColor={colors.accent}
          isDark={isDark}
        />
      </View>

      {/* =================================================================== */}
      {/* 2. FLOATING ROTATED "ANSWER SHEET" TAB ON LEFT                      */}
      {/* =================================================================== */}
      {!isSubmitted && (
        <Pressable
          onPress={() => setIsAnswerSheetVisible(true)}
          style={({ pressed }) => [
            styles.floatingLeftTab,
            {
              backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.12)',
              opacity: pressed ? 0.8 : 1,
            },
          ]}>
          <FileSpreadsheet size={13} color={colors.accent} strokeWidth={2.2} />
          <Text style={[styles.floatingTabText, { color: colors.text }]}>
            ANSWER SHEET
          </Text>
          <View
            style={[
              styles.floatingCountBadge,
              { backgroundColor: colors.accent },
            ]}>
            <Text style={styles.floatingCountText}>
              {answeredCount}/{questions.length}
            </Text>
          </View>
        </Pressable>
      )}

      {/* =================================================================== */}
      {/* 3. RESULTS VIEW (IF SUBMITTED)                                      */}
      {/* =================================================================== */}
      {isSubmitted ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.resultsContainer,
            { paddingBottom: insets.bottom + 40 },
          ]}>
          {/* Result Banner Card */}
          <View
            style={[
              styles.resultBannerCard,
              {
                backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                borderColor: isPassed
                  ? isDark
                    ? 'rgba(16, 185, 129, 0.4)'
                    : '#A7F3D0'
                  : isDark
                    ? 'rgba(239, 68, 68, 0.4)'
                    : '#FECACA',
              },
            ]}>
            <View
              style={[
                styles.resultIconCircle,
                {
                  backgroundColor: isPassed
                    ? isDark
                      ? 'rgba(16, 185, 129, 0.2)'
                      : '#D1FAE5'
                    : isDark
                      ? 'rgba(239, 68, 68, 0.2)'
                      : '#FEE2E2',
                },
              ]}>
              {isPassed ? (
                <ShieldCheck size={36} color="#10B981" strokeWidth={2.4} />
              ) : (
                <ShieldAlert size={36} color="#EF4444" strokeWidth={2.4} />
              )}
            </View>

            <Text
              style={[
                styles.resultStatusTitle,
                { color: isPassed ? '#10B981' : '#EF4444' },
              ]}>
              {isPassed ? 'EXAMINATION PASSED' : 'NEEDS REVIEW'}
            </Text>

            <Text style={[styles.resultScoreBig, { color: colors.text }]}>
              {computedScore}%
            </Text>

            <Text style={[styles.resultScoreSub, { color: colors.textSecondary }]}>
              {correctCount} correct out of {questions.length} total questions (70% passing threshold)
            </Text>
          </View>

          {/* Solution & Question Review Header */}
          <View style={styles.reviewSectionHeader}>
            <Text style={[styles.reviewHeading, { color: colors.text }]}>
              Questions & Solution Rationales
            </Text>
          </View>

          {/* Question List Review */}
          {questions.map((q, idx) => {
            const userChoiceId = selectedAnswers[q.id];
            const userChoice = q.options.find((o) => o.id === userChoiceId);
            const isUserCorrect = userChoice && userChoice.key === q.correctKey;

            return (
              <View
                key={q.id}
                style={[
                  styles.reviewQuestionCard,
                  {
                    backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                    borderColor: isUserCorrect
                      ? isDark
                        ? 'rgba(16, 185, 129, 0.3)'
                        : '#A7F3D0'
                      : isDark
                        ? 'rgba(239, 68, 68, 0.3)'
                        : '#FECACA',
                  },
                ]}>
                <View style={styles.questionCardHeader}>
                  <Text style={[styles.questionNumberText, { color: colors.accent }]}>
                    {idx + 1}.)
                  </Text>
                  <Text style={[styles.questionTopicTag, { color: colors.textSecondary }]}>
                    {q.topic}
                  </Text>
                  <View style={{ marginLeft: 'auto' }}>
                    {isUserCorrect ? (
                      <CheckCircle2 size={16} color="#10B981" />
                    ) : (
                      <XCircle size={16} color="#EF4444" />
                    )}
                  </View>
                </View>

                <Text style={[styles.questionBodyText, { color: isDark ? '#F9FAFB' : '#111827' }]}>
                  {q.question}
                </Text>

                {/* Simple Option Review Rows */}
                <View style={styles.simpleOptionsList}>
                  {q.options.map((opt) => {
                    const isCorrectAnswer = opt.key === q.correctKey;
                    const isSelectedByUser = opt.id === userChoiceId;

                    return (
                      <View key={opt.id} style={styles.simpleOptionRow}>
                        <View
                          style={[
                            styles.simpleRadioCircle,
                            {
                              backgroundColor: isCorrectAnswer
                                ? '#10B981'
                                : isSelectedByUser
                                  ? '#EF4444'
                                  : isDark
                                    ? '#23262F'
                                    : '#EDE8E4',
                            },
                          ]}>
                          <Text
                            style={[
                              styles.simpleRadioKeyText,
                              {
                                color: isCorrectAnswer || isSelectedByUser ? '#FFFFFF' : colors.textSecondary,
                                fontWeight: isCorrectAnswer || isSelectedByUser ? '800' : '600',
                              },
                            ]}>
                            {opt.key}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.simpleOptionText,
                            {
                              color: isCorrectAnswer
                                ? '#10B981'
                                : isSelectedByUser
                                  ? '#EF4444'
                                  : isDark
                                    ? '#D1D5DB'
                                    : '#374151',
                              fontWeight: isCorrectAnswer || isSelectedByUser ? '700' : '400',
                            },
                          ]}>
                          {opt.text}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* Explanation */}
                <View
                  style={[
                    styles.explanationBox,
                    {
                      backgroundColor: isDark ? '#23262F' : '#F8FAFC',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                    },
                  ]}>
                  <Text style={[styles.explanationLabel, { color: colors.accent }]}>
                    RATIONALE & SPECS:
                  </Text>
                  <Text style={[styles.explanationText, { color: isDark ? '#9CA3AF' : '#4B5563' }]}>
                    {q.explanation}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Finish Button */}
          <Pressable
            onPress={() => router.back()}
            style={[styles.finishExamBtn, { backgroundColor: colors.accent }]}>
            <Text style={styles.finishExamBtnText}>Finish & Return to Exams</Text>
          </Pressable>
        </ScrollView>
      ) : (
        /* =================================================================== */
        /* 4. LIVE EXAMINATION CONTINUOUS DOCUMENT (GOOGLE FORM STYLE)         */
        /* =================================================================== */
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.examFormContainer,
            { paddingBottom: insets.bottom + 60 },
          ]}>
          {/* Memoized Questions Rendered Sequentially (1, 2, 3...) */}
          {questions.map((q, idx) => (
            <ExamQuestionCard
              key={q.id}
              q={q}
              index={idx}
              selectedChoiceId={selectedAnswers[q.id]}
              isFlagged={Boolean(flaggedQuestions[q.id])}
              onSelectOption={handleSelectOption}
              onToggleFlag={handleToggleFlag}
              onLayout={(e) => {
                questionLayoutsRef.current[idx] = e.nativeEvent.layout.y;
              }}
              isDark={isDark}
              accentColor={colors.accent}
              textSecondaryColor={colors.textSecondary}
            />
          ))}

          {/* ================================================================= */}
          {/* 5. END OF EXAMINATION: REVIEW & SUBMIT ACTIONS                    */}
          {/* ================================================================= */}
          <View
            style={[
              styles.endExamBox,
              {
                backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}>
            <Text style={[styles.endExamTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
              End of Examination Paper
            </Text>
            <Text style={[styles.endExamStats, { color: colors.textSecondary }]}>
              {answeredCount} Answered • {questions.length - answeredCount} Unanswered • {flaggedCount} Flagged
            </Text>

            <View style={styles.endActionsRow}>
              {/* Review on Answer Sheet */}
              <Pressable
                onPress={() => setIsAnswerSheetVisible(true)}
                style={({ pressed }) => [
                  styles.reviewSheetBtn,
                  {
                    backgroundColor: isDark ? '#23262F' : '#F6F0ED',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}>
                <FileSpreadsheet size={16} color={colors.accent} strokeWidth={2.2} />
                <Text style={[styles.reviewSheetBtnText, { color: colors.text }]}>
                  Review Answer Sheet
                </Text>
              </Pressable>

              {/* Submit Exam Button */}
              <Pressable
                onPress={() => setIsSubmitConfirmVisible(true)}
                style={({ pressed }) => [
                  styles.submitExamBtn,
                  {
                    backgroundColor: colors.accent,
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.985 : 1 }],
                  },
                ]}>
                <Text style={styles.submitExamBtnText}>Submit Examination</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}

      {/* =================================================================== */}
      {/* 6. SLIDE-OUT LEFT MODAL: "ANSWER SHEET" (OMR BUBBLE SHEET)          */}
      {/* =================================================================== */}
      <Modal
        visible={isAnswerSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAnswerSheetVisible(false)}>
        <View style={styles.sheetModalOverlay}>
          {/* Left Sliding Sheet Container */}
          <View
            style={[
              styles.sheetModalDrawer,
              {
                backgroundColor: colors.background,
                paddingTop: insets.top + 10,
                paddingBottom: insets.bottom + 16,
              },
            ]}>
            {/* Answer Sheet Drawer Header */}
            <View style={styles.sheetHeader}>
              <View>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>
                  Answer Sheet
                </Text>
                <Text style={[styles.sheetSub, { color: colors.textSecondary }]}>
                  {answeredCount} of {questions.length} Answered
                </Text>
              </View>

              <Pressable
                onPress={() => setIsAnswerSheetVisible(false)}
                hitSlop={8}
                style={[
                  styles.sheetCloseBtn,
                  { backgroundColor: isDark ? '#23262F' : '#F3F4F6' },
                ]}>
                <X size={16} color={colors.text} strokeWidth={2.4} />
              </Pressable>
            </View>

            {/* Bubble Rows List */}
            <ScrollView
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.bubbleListContainer}>
              {questions.map((q, idx) => (
                <ScantronBubbleRow
                  key={q.id}
                  q={q}
                  index={idx}
                  selectedChoiceId={selectedAnswers[q.id]}
                  isFlagged={Boolean(flaggedQuestions[q.id])}
                  onSelectOption={handleSelectOption}
                  onScrollToQuestion={handleScrollToQuestion}
                  isDark={isDark}
                  textColor={colors.text}
                  accentColor={colors.accent}
                />
              ))}
            </ScrollView>

            {/* Bottom Drawer CTA */}
            <View style={styles.sheetFooter}>
              <Pressable
                onPress={() => {
                  setIsAnswerSheetVisible(false);
                  setIsSubmitConfirmVisible(true);
                }}
                style={[styles.sheetSubmitBtn, { backgroundColor: colors.accent }]}>
                <Text style={styles.sheetSubmitBtnText}>
                  Submit Exam ({answeredCount}/{questions.length})
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Click outside to dismiss */}
          <Pressable
            style={styles.sheetModalDismiss}
            onPress={() => setIsAnswerSheetVisible(false)}
          />
        </View>
      </Modal>

      {/* =================================================================== */}
      {/* 7. SUBMISSION CONFIRMATION MODAL                                    */}
      {/* =================================================================== */}
      <Modal
        visible={isSubmitConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSubmitConfirmVisible(false)}>
        <View style={styles.confirmOverlay}>
          <Pressable
            style={styles.modalDismissArea}
            onPress={() => setIsSubmitConfirmVisible(false)}
          />
          <View
            style={[
              styles.confirmCard,
              {
                backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
              },
            ]}>
            <View style={styles.confirmHeader}>
              <Text style={[styles.confirmTitle, { color: colors.text }]}>
                Submit Examination?
              </Text>
              <Pressable
                onPress={() => setIsSubmitConfirmVisible(false)}
                style={[
                  styles.sheetCloseBtn,
                  { backgroundColor: isDark ? '#23262F' : '#F3F4F6' },
                ]}>
                <X size={16} color={colors.text} strokeWidth={2.4} />
              </Pressable>
            </View>

            <Text style={[styles.confirmDesc, { color: colors.textSecondary }]}>
              You have answered {answeredCount} out of {questions.length} questions.
              {questions.length - answeredCount > 0
                ? ` You still have ${questions.length - answeredCount} unanswered items.`
                : ' All items have been answered.'}
            </Text>

            <View style={styles.confirmActions}>
              <Pressable
                onPress={() => setIsSubmitConfirmVisible(false)}
                style={[
                  styles.cancelBtn,
                  { backgroundColor: isDark ? '#23262F' : '#F6F0ED' },
                ]}>
                <Text style={[styles.cancelBtnText, { color: colors.text }]}>
                  Keep Reviewing
                </Text>
              </Pressable>

              <Pressable
                onPress={handleFinalSubmit}
                style={[styles.confirmBtn, { backgroundColor: colors.accent }]}>
                <Text style={styles.confirmBtnText}>Submit Now</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTitleCenterBox: {
    flex: 1,
    paddingHorizontal: 4,
  },
  headerExamTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerExamSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
    flexShrink: 0,
  },
  timerText: {
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  /* Floating Left Rotated Tab */
  floatingLeftTab: {
    position: 'absolute',
    left: -48,
    top: '46%',
    zIndex: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1,
    transform: [{ rotate: '-90deg' }],
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
      },
    }),
  },
  floatingTabText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  floatingCountBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  floatingCountText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
  },

  /* Form Container */
  examFormContainer: {
    paddingHorizontal: 16,
    paddingTop: 6,
    gap: 14,
  },
  simpleQuestionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 6px rgba(0,0,0,0.02)',
      },
    }),
  },
  questionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  questionNumberText: {
    fontSize: 14.5,
    fontWeight: '900',
  },
  questionTopicTag: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  flagButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionBodyText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  simpleOptionsList: {
    gap: 10,
    marginTop: 2,
  },
  simpleOptionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 3,
  },
  simpleRadioCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  simpleRadioKeyText: {
    fontSize: 12,
  },
  simpleOptionText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 19,
  },
  endExamBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  endExamTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  endExamStats: {
    fontSize: 12,
    fontWeight: '600',
  },
  endActionsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  reviewSheetBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  reviewSheetBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  submitExamBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitExamBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },

  /* Results View Styles */
  resultsContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 16,
  },
  resultBannerCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 22,
    alignItems: 'center',
    gap: 8,
  },
  resultIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  resultStatusTitle: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  resultScoreBig: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1,
  },
  resultScoreSub: {
    fontSize: 12.5,
    fontWeight: '600',
    textAlign: 'center',
  },
  reviewSectionHeader: {
    paddingHorizontal: 4,
    paddingTop: 8,
  },
  reviewHeading: {
    fontSize: 15,
    fontWeight: '800',
  },
  reviewQuestionCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    gap: 12,
  },
  explanationBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 4,
    marginTop: 4,
  },
  explanationLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  explanationText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  finishExamBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  finishExamBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  /* Left Slide-out Answer Sheet Drawer */
  sheetModalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  sheetModalDrawer: {
    width: '84%',
    maxWidth: 360,
    height: '100%',
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
      },
    }),
  },
  sheetModalDismiss: {
    flex: 1,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sheetSub: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  sheetCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleListContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  bubbleQNumberBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 44,
  },
  bubbleQNumber: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  bubbleRowGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  simpleScantronBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simpleScantronBubbleText: {
    fontSize: 12,
  },
  sheetFooter: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
  },
  sheetSubmitBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },

  /* Confirm Modal Styles */
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalDismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  confirmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confirmTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  confirmDesc: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
