import * as crypto from 'expo-crypto';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Eye,
  FileSpreadsheet,
  Flag,
  HelpCircle,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Timer,
  X,
  XCircle
} from 'lucide-react-native';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
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
  temporaryChoiceId?: string;
  isFlagged: boolean;
  onSelectOption: (questionId: string, choiceId: string) => void;
  onToggleTemporaryOption: (questionId: string, choiceId: string) => void;
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
  temporaryChoiceId,
  isFlagged,
  onSelectOption,
  onToggleTemporaryOption,
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
      {/* Question Header: 1.) [space] Question Text + Flag */}
      <View style={styles.questionCardHeader}>
        <View style={styles.questionTextRow}>
          <Text style={[styles.questionNumberText, { color: accentColor }]}>
            {index + 1}.)
          </Text>
          <Text style={[styles.questionBodyText, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            {q.question.replace(/^\[Item \d+\]\s*/, '')}
          </Text>
        </View>

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

      {/* Options List (A, B, C, D) - Tap: Final, Hold: Tentative */}
      <View style={styles.simpleOptionsList}>
        {q.options.map((opt) => {
          const isSelected = selectedChoiceId === opt.id;
          const isTemporary = temporaryChoiceId === opt.id;

          const circleBg = isSelected
            ? accentColor
            : isTemporary
              ? '#D97706'
              : isDark
                ? '#23262F'
                : '#EDE8E4';

          const textColor = (isSelected || isTemporary)
            ? '#FFFFFF'
            : isDark
              ? '#9CA3AF'
              : '#4B5563';

          return (
            <Pressable
              key={opt.id}
              onPress={() => onSelectOption(q.id, opt.id)}
              onLongPress={() => onToggleTemporaryOption(q.id, opt.id)}
              delayLongPress={220}
              style={({ pressed }) => [
                styles.simpleOptionRow,
                { opacity: pressed ? 0.7 : 1 },
              ]}>
              {/* Only the circle is shaded */}
              <View
                style={[
                  styles.simpleRadioCircle,
                  {
                    backgroundColor: circleBg,
                    borderWidth: isTemporary ? 1.5 : 0,
                    borderColor: isTemporary ? '#F59E0B' : 'transparent',
                  },
                ]}>
                <Text
                  style={[
                    styles.simpleRadioKeyText,
                    {
                      color: textColor,
                      fontWeight: (isSelected || isTemporary) ? '800' : '600',
                    },
                  ]}>
                  {opt.key}
                </Text>
              </View>

              {/* Option Text */}
              <Text
                style={[
                  styles.simpleOptionText,
                  {
                    color: isSelected
                      ? isDark
                        ? '#F9FAFB'
                        : '#111827'
                      : isTemporary
                        ? isDark
                          ? '#FBBF24'
                          : '#B45309'
                        : isDark
                          ? '#D1D5DB'
                          : '#374151',
                    fontWeight: (isSelected || isTemporary) ? '700' : '400',
                  },
                ]}>
                {opt.text}
                {isTemporary && (
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#D97706' }}>
                    {' '}(Tentative)
                  </Text>
                )}
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
  temporaryChoiceId?: string;
  isFlagged: boolean;
  onSelectOption: (questionId: string, choiceId: string) => void;
  onToggleTemporaryOption: (questionId: string, choiceId: string) => void;
  onScrollToQuestion: (index: number) => void;
  isDark: boolean;
  textColor: string;
  accentColor: string;
}

const ScantronBubbleRow = memo(function ScantronBubbleRow({
  q,
  index,
  selectedChoiceId,
  temporaryChoiceId,
  isFlagged,
  onSelectOption,
  onToggleTemporaryOption,
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
      {/* Question Number (Click to Scroll directly in background paper) */}
      <Pressable
        onPress={() => onScrollToQuestion(index)}
        hitSlop={{ top: 10, bottom: 10, left: 12, right: 12 }}
        style={({ pressed }) => [
          styles.bubbleQNumberBox,
          { opacity: pressed ? 0.6 : 1 },
        ]}>
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

      {/* Circular Bubbles (A) (B) (C) (D) - Tap: Final, Hold: Tentative */}
      <View style={styles.bubbleRowGroup}>
        {q.options.map((opt) => {
          const isSelected = selectedChoiceId === opt.id;
          const isTemporary = temporaryChoiceId === opt.id;

          const bubbleBg = isSelected
            ? accentColor
            : isTemporary
              ? '#D97706'
              : isDark
                ? '#23262F'
                : '#EDE8E4';

          const bubbleTextColor = (isSelected || isTemporary)
            ? '#FFFFFF'
            : isDark
              ? '#9CA3AF'
              : '#4B5563';

          return (
            <Pressable
              key={opt.id}
              onPress={() => {
                onSelectOption(q.id, opt.id);
                onScrollToQuestion(index);
              }}
              onLongPress={() => {
                onToggleTemporaryOption(q.id, opt.id);
                onScrollToQuestion(index);
              }}
              delayLongPress={220}
              style={({ pressed }) => [
                styles.simpleScantronBubble,
                {
                  backgroundColor: bubbleBg,
                  borderWidth: isTemporary ? 1.5 : 0,
                  borderColor: isTemporary ? '#F59E0B' : 'transparent',
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: (isSelected || isTemporary) ? 1.06 : 1 }],
                },
              ]}>
              <Text
                style={[
                  styles.simpleScantronBubbleText,
                  {
                    color: bubbleTextColor,
                    fontWeight: (isSelected || isTemporary) ? '800' : '600',
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
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // questionId -> choiceId (Final)
  const [temporaryAnswers, setTemporaryAnswers] = useState<Record<string, string>>({}); // questionId -> choiceId (Tentative/Temporary)
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({}); // questionId -> boolean
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [computedScore, setComputedScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Answer Sheet Drawer State & Slide Animation
  const [isAnswerSheetVisible, setIsAnswerSheetVisible] = useState(false);
  const [isSubmitConfirmVisible, setIsSubmitConfirmVisible] = useState(false);
  const [isReviewQuestionsVisible, setIsReviewQuestionsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-260)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Subject Performance Breakdown for Bar Chart (Filtered strictly by Exam Set syllabus)
  const subjectBreakdown = useMemo(() => {
    let expectedSubjects: { label: string; matchers: string[] }[] = [];

    if (examId === 'comprehensive-set-1' || examTitle.includes('Set 1')) {
      expectedSubjects = [
        { label: 'HOA', matchers: ['history', 'hoa'] },
        { label: 'TOA', matchers: ['theory', 'toa'] },
        { label: 'PROFPAC', matchers: ['practice', 'prof', 'law', '9266'] },
        { label: 'TROPICAL', matchers: ['tropical', 'climate', 'sun', 'wind'] },
      ];
    } else if (examId === 'comprehensive-set-2' || examTitle.includes('Set 2')) {
      expectedSubjects = [
        { label: 'UTILITIES', matchers: ['utilit', 'plumb', 'electr', 'sanit', 'hvac'] },
        { label: 'BLDG TECH', matchers: ['techno', 'struct', 'concr', 'steel', 'timber', 'materi'] },
      ];
    } else if (examId === 'comprehensive-set-3' || examTitle.includes('Set 3')) {
      expectedSubjects = [
        { label: 'PLANNING', matchers: ['plan', 'urban', 'site', 'subdiv', 'zoning'] },
        { label: 'DESIGN', matchers: ['design', 'nbcp', 'rule 7', 'bp 344', 'fire code', 'law'] },
      ];
    } else {
      // For modular exams, extract unique subjects directly from the questions
      const uniqueTopics = Array.from(new Set(questions.map((q) => q.topic)));
      expectedSubjects = uniqueTopics.map((topic) => {
        const lower = topic.toLowerCase();
        let label = topic.slice(0, 8).toUpperCase();
        if (lower.includes('history')) label = 'HOA';
        else if (lower.includes('theory')) label = 'TOA';
        else if (lower.includes('practice') || lower.includes('prof')) label = 'PROFPAC';
        else if (lower.includes('tropical')) label = 'TROPICAL';
        else if (lower.includes('utilities') || lower.includes('utility')) label = 'UTILITIES';
        else if (lower.includes('techno') || lower.includes('material')) label = 'BLDG TECH';
        else if (lower.includes('planning') || lower.includes('urban')) label = 'PLANNING';
        else if (lower.includes('design') || lower.includes('arch')) label = 'DESIGN';
        return { label, matchers: [lower] };
      });
    }

    return expectedSubjects.map((subj) => {
      let total = 0;
      let correct = 0;

      questions.forEach((q) => {
        const qTopic = q.topic.toLowerCase();
        const matches = subj.matchers.some((m) => qTopic.includes(m));
        if (matches) {
          total += 1;
          const userChoiceId = selectedAnswers[q.id];
          const userChoice = q.options.find((o) => o.id === userChoiceId);
          if (userChoice && userChoice.key === q.correctKey) {
            correct += 1;
          }
        }
      });

      if (total === 0 && questions.length > 0) {
        total = Math.floor(questions.length / expectedSubjects.length);
        correct = Math.floor((correctCount * total) / questions.length);
      }

      const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

      return {
        label: subj.label,
        total,
        correct,
        percentage,
      };
    });
  }, [examId, examTitle, questions, selectedAnswers, correctCount]);

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
        const masterPool: {
          topic: string;
          setId: string;
          q: string;
          choices: string[];
          correctIdx: number;
          exp: string;
        }[] = [
          {
            topic: 'History of Architecture',
            setId: 'comprehensive-set-1',
            q: 'Which architectural order is characterized by acanthus leaf carvings on a bell-shaped capital?',
            choices: ['Doric Order', 'Ionic Order', 'Corinthian Order', 'Tuscan Order'],
            correctIdx: 2,
            exp: 'The Corinthian order is identified by its ornate capital decorated with stylized acanthus leaves and volutes.',
          },
          {
            topic: 'Theory of Architecture',
            setId: 'comprehensive-set-1',
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
            setId: 'comprehensive-set-1',
            q: 'In Philippine tropical climatic design, what is the primary orientation recommended for long building facades?',
            choices: ['North-South Axis', 'East-West Axis', 'Northeast-Southwest', 'Northwest-Southeast'],
            correctIdx: 0,
            exp: 'Orienting long building facades along the North-South axis minimizes direct solar heat gain on large window exposures.',
          },
          {
            topic: 'Professional Practice',
            setId: 'comprehensive-set-1',
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
            topic: 'Building Utilities',
            setId: 'comprehensive-set-2',
            q: 'In plumbing sanitary drainage systems, what is the minimum slope required for 3-inch and smaller soil horizontal drainage pipes?',
            choices: ['1% (1/8 in/ft)', '2% (1/4 in/ft)', '3% (3/8 in/ft)', '4% (1/2 in/ft)'],
            correctIdx: 1,
            exp: 'The Revised National Plumbing Code specifies a minimum 2% (1/4 inch per foot) slope for 3-inch or smaller horizontal drainage lines.',
          },
          {
            topic: 'Building Technology',
            setId: 'comprehensive-set-2',
            q: 'What is the standard diameter of a #10 (metric 32mm) deformed steel reinforcing bar?',
            choices: ['25 mm', '28 mm', '32 mm', '36 mm'],
            correctIdx: 2,
            exp: 'Under ASTM/PNS standards, a #10 bar corresponds to a nominal diameter of 32 mm.',
          },
          {
            topic: 'Site Planning & Urban Design',
            setId: 'comprehensive-set-3',
            q: 'Which contour line interval rule states that closer contour lines on a topographical site survey indicate what condition?',
            choices: ['Flat terrain', 'Steeper slope or grade', 'Depression basin', 'Ridgeline summit'],
            correctIdx: 1,
            exp: 'Closely spaced contour lines indicate a steep slope, while widely spaced contours represent gentle or flat topography.',
          },
          {
            topic: 'Architectural Design',
            setId: 'comprehensive-set-3',
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
        ];

        let fallbackPool = masterPool.filter((p) => p.setId === examId);
        if (fallbackPool.length === 0) {
          fallbackPool = masterPool;
        }

        for (let i = 0; i < needed; i++) {
          const template = fallbackPool[i % fallbackPool.length];
          const qId = `gen-q-${examId}-${formatted.length + i + 1}`;
          const choiceIds = ['c-1', 'c-2', 'c-3', 'c-4'];

          formatted.push({
            id: qId,
            topic: template.topic,
            question: template.q,
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
    setTemporaryAnswers((prev) => {
      if (!prev[questionId]) return prev;
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  }, [isSubmitted]);

  const handleToggleTemporaryOption = useCallback((questionId: string, choiceId: string) => {
    if (isSubmitted) return;
    setTemporaryAnswers((prev) => {
      if (prev[questionId] === choiceId) {
        const copy = { ...prev };
        delete copy[questionId];
        return copy;
      }
      return {
        ...prev,
        [questionId]: choiceId,
      };
    });
    setSelectedAnswers((prev) => {
      if (!prev[questionId]) return prev;
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  }, [isSubmitted]);

  const handleToggleFlag = useCallback((questionId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  }, []);

  const openAnswerSheet = useCallback(() => {
    setIsAnswerSheetVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  const closeAnswerSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -260,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsAnswerSheetVisible(false);
    });
  }, [slideAnim, fadeAnim]);

  const handleScrollToQuestion = useCallback((index: number) => {
    // Scrolls the exam paper in the background without closing the Answer Sheet drawer
    const yPos = questionLayoutsRef.current[index];
    if (yPos !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: Math.max(yPos - 16, 0), animated: true });
    }
  }, []);

  const answeredCount = useMemo(() => {
    return Object.keys(selectedAnswers).filter((k) => selectedAnswers[k]).length;
  }, [selectedAnswers]);

  const tentativeCount = useMemo(() => {
    return Object.keys(temporaryAnswers).filter((k) => temporaryAnswers[k]).length;
  }, [temporaryAnswers]);

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
      {/* 2. FLOATING ROTATED "ANSWER SHEET" TAB ON FAR LEFT                  */}
      {/* =================================================================== */}
      {!isSubmitted && (
        <Pressable
          onPress={openAnswerSheet}
          style={({ pressed }) => [
            styles.floatingLeftTab,
            {
              backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.12)',
              opacity: pressed ? 0.8 : 1,
            },
          ]}>
          <Text style={[styles.floatingTabText, { color: colors.text }]}>
            ANSWER SHEET
          </Text>
          <ChevronDown
            size={15}
            color={colors.accent}
            strokeWidth={2.8}
          />
        </Pressable>
      )}

      {/* =================================================================== */}
      {/* 3. RESULTS VIEW (MATCHING DRAWING LAYOUT & BAR CHART)               */}
      {/* =================================================================== */}
      {isSubmitted ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.resultsContainer,
            { paddingBottom: insets.bottom + 40 },
          ]}>
          {/* Top Score Section (Drawing Layout: Left Square Box + Right Score Info) */}
          <View style={styles.drawingScoreHeaderRow}>
            {/* Left Box: Percentage */}
            <View
              style={[
                styles.drawingPercentageBox,
                {
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#111827',
                  backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                },
              ]}>
              <Text
                style={[
                  styles.drawingPercentageText,
                  { color: isDark ? '#FFFFFF' : '#111827' },
                ]}>
                {computedScore}%
              </Text>
            </View>

            {/* Right Column: YOUR SCORE. and Fraction */}
            <View style={styles.drawingScoreInfoCol}>
              <Text
                style={[
                  styles.drawingYourScoreLabel,
                  { color: isDark ? '#F3F4F6' : '#111827' },
                ]}>
                YOUR SCORE.
              </Text>
              <Text
                style={[
                  styles.drawingScoreFraction,
                  { color: isDark ? '#FFFFFF' : '#111827' },
                ]}>
                {correctCount}
                <Text
                  style={[
                    styles.drawingScoreDenominator,
                    { color: colors.textSecondary },
                  ]}>
                  /{questions.length}
                </Text>
              </Text>
              <Text
                style={[
                  styles.drawingBenchmarkText,
                  { color: isPassed ? '#10B981' : '#EF4444' },
                ]}>
                {isPassed ? 'Passed Benchmark (≥70%)' : 'Needs Review (<70%)'}
              </Text>
            </View>
          </View>

          {/* Subject Performance Bar Chart (Matching Drawing) */}
          <View
            style={[
              styles.chartCard,
              {
                backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}>
            <Text style={[styles.chartSectionTitle, { color: colors.text }]}>
              Subject Performance Breakdown
            </Text>

            {/* Chart Area */}
            <View style={styles.barChartContainer}>
              {/* Y-Axis Line */}
              <View
                style={[
                  styles.chartYAxis,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.25)' : '#111827' },
                ]}
              />

              {/* Main Bars Grid (Standing on X-Axis) */}
              <View style={styles.chartGraphArea}>
                <View style={styles.chartBarsRow}>
                  {subjectBreakdown.map((item) => {
                    const barHeight = Math.max(14, (item.percentage / 100) * 125);
                    const isSubjectPassed = item.percentage >= 70;

                    return (
                      <View key={item.label} style={styles.barColumn}>
                        {/* % Above the line */}
                        <Text
                          style={[
                            styles.barPercentText,
                            { color: isDark ? '#F9FAFB' : '#111827' },
                          ]}>
                          {item.percentage}%
                        </Text>

                        {/* Vertical Bar Fill */}
                        <View
                          style={[
                            styles.barFill,
                            {
                              height: barHeight,
                              backgroundColor: isSubjectPassed
                                ? '#10B981'
                                : isDark
                                  ? '#E07A5F'
                                  : colors.accent,
                              borderColor: isDark ? 'rgba(255, 255, 255, 0.8)' : '#111827',
                            },
                          ]}
                        />
                      </View>
                    );
                  })}
                </View>

                {/* X-Axis Baseline dividing graph from labels */}
                <View
                  style={[
                    styles.chartXAxis,
                    { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.25)' : '#111827' },
                  ]}
                />

                {/* Subject Labels Under the Graph */}
                <View style={styles.chartLabelsRow}>
                  {subjectBreakdown.map((item) => (
                    <View key={item.label} style={styles.barLabelWrapper}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.barUnderLabelText,
                          { color: isDark ? '#D1D5DB' : '#374151' },
                        ]}>
                        {item.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Action Row: View Questions & Answers Button */}
          <View style={styles.resultActionsContainer}>
            <Pressable
              onPress={() => setIsReviewQuestionsVisible((prev) => !prev)}
              style={({ pressed }) => [
                styles.viewQuestionsBtn,
                {
                  backgroundColor: isDark ? '#23262F' : '#F6F0ED',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              <Eye size={17} color={colors.accent} strokeWidth={2.4} />
              <Text style={[styles.viewQuestionsBtnText, { color: colors.text }]}>
                {isReviewQuestionsVisible
                  ? 'Hide Questions & Solutions'
                  : `View Questions & Correct Answers (${questions.length})`}
              </Text>
              <ChevronDown
                size={17}
                color={colors.accent}
                strokeWidth={2.4}
                style={{
                  transform: [{ rotate: isReviewQuestionsVisible ? '180deg' : '0deg' }],
                }}
              />
            </Pressable>

            {/* Bottom Actions: Retake & Exit to Hub */}
            <View style={styles.reviewFooterButtonsRow}>
              <Pressable
                onPress={() => {
                  setSelectedAnswers({});
                  setTemporaryAnswers({});
                  setFlaggedQuestions({});
                  setIsSubmitted(false);
                  setIsReviewQuestionsVisible(false);
                }}
                style={({ pressed }) => [
                  styles.retakeExamBtn,
                  {
                    backgroundColor: isDark ? '#23262F' : '#F3F4F6',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}>
                <RotateCcw size={15} color={colors.text} strokeWidth={2.4} />
                <Text style={[styles.retakeExamBtnText, { color: colors.text }]}>
                  Retake Test
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.finishExamBtn,
                  {
                    backgroundColor: colors.accent,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}>
                <Text style={styles.finishExamBtnText}>
                  Exams Hub
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Solution & Question Review Section (Toggled) */}
          {isReviewQuestionsVisible && (
            <View style={styles.reviewQuestionsListContainer}>
              <View style={styles.reviewSectionHeader}>
                <Text style={[styles.reviewHeading, { color: colors.text }]}>
                  Questions & Solutions
                </Text>
                <Text style={[styles.reviewSubheading, { color: colors.textSecondary }]}>
                  Review your answers alongside official board exam rationales
                </Text>
              </View>

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
                            ? 'rgba(16, 185, 129, 0.35)'
                            : '#A7F3D0'
                          : isDark
                            ? 'rgba(239, 68, 68, 0.35)'
                            : '#FECACA',
                      },
                    ]}>
                    <View style={styles.questionCardHeader}>
                      <View style={styles.questionTextRow}>
                        <Text style={[styles.questionNumberText, { color: colors.accent }]}>
                          {idx + 1}.)
                        </Text>
                        <Text style={[styles.questionBodyText, { color: isDark ? '#F9FAFB' : '#111827' }]}>
                          {q.question.replace(/^\[Item \d+\]\s*/, '')}
                        </Text>
                      </View>
                      <View style={{ marginLeft: 8, flexShrink: 0 }}>
                        {isUserCorrect ? (
                          <CheckCircle2 size={18} color="#10B981" strokeWidth={2.4} />
                        ) : (
                          <XCircle size={18} color="#EF4444" strokeWidth={2.4} />
                        )}
                      </View>
                    </View>

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
                          backgroundColor: isDark ? '#14171F' : '#F8FAFC',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB',
                        },
                      ]}>
                      <Text style={[styles.explanationLabel, { color: colors.accent }]}>
                        RATIONALE & ARCHITECTURAL REFERENCE:
                      </Text>
                      <Text style={[styles.explanationText, { color: isDark ? '#9CA3AF' : '#4B5563' }]}>
                        {q.explanation}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
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
              temporaryChoiceId={temporaryAnswers[q.id]}
              isFlagged={Boolean(flaggedQuestions[q.id])}
              onSelectOption={handleSelectOption}
              onToggleTemporaryOption={handleToggleTemporaryOption}
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
              {answeredCount} Final • {tentativeCount} Tentative • {flaggedCount} Flagged
            </Text>

            {/* Review Answer Sheet CTA (Only way to submit is through reviewing answer sheet) */}
            <Pressable
              onPress={openAnswerSheet}
              style={({ pressed }) => [
                styles.fullReviewSheetBtn,
                {
                  backgroundColor: colors.accent,
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                },
              ]}>
              <FileSpreadsheet size={18} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.fullReviewSheetBtnText}>
                Review Answer Sheet to Submit
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}

      {/* =================================================================== */}
      {/* 6. SMOOTH SLIDE-OUT LEFT DRAWER: "ANSWER SHEET" (Slide to Right)    */}
      {/* =================================================================== */}
      {!isSubmitted && (
        <Animated.View
          pointerEvents={isAnswerSheetVisible ? 'auto' : 'none'}
          style={[
            styles.sheetModalOverlay,
            { opacity: fadeAnim },
          ]}>
          {/* Left Sliding Sheet Container */}
          <Animated.View
            style={[
              styles.sheetModalDrawer,
              {
                backgroundColor: colors.background,
                paddingTop: insets.top + 10,
                paddingBottom: insets.bottom + 16,
                transform: [{ translateX: slideAnim }],
              },
            ]}>
            {/* Answer Sheet Drawer Header */}
            <View style={styles.sheetHeader}>
              <View>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>
                  Answer Sheet
                </Text>
                <Text style={[styles.sheetSub, { color: colors.textSecondary }]}>
                  {answeredCount} Final • {tentativeCount} Tentative
                </Text>
              </View>

              <Pressable
                onPress={closeAnswerSheet}
                hitSlop={8}
                style={[
                  styles.sheetCloseBtn,
                  { backgroundColor: isDark ? '#23262F' : '#F3F4F6' },
                ]}>
                <X size={16} color={colors.text} strokeWidth={2.4} />
              </Pressable>
            </View>

            {/* Hint subtitle */}
            <View style={{ paddingHorizontal: 16, paddingBottom: 6 }}>
              <Text style={{ fontSize: 10, fontWeight: '600', color: colors.textSecondary }}>
                Tap: Final choice • Hold: Tentative
              </Text>
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
                  temporaryChoiceId={temporaryAnswers[q.id]}
                  isFlagged={Boolean(flaggedQuestions[q.id])}
                  onSelectOption={handleSelectOption}
                  onToggleTemporaryOption={handleToggleTemporaryOption}
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
                  closeAnswerSheet();
                  setIsSubmitConfirmVisible(true);
                }}
                style={[styles.sheetSubmitBtn, { backgroundColor: colors.accent }]}>
                <Text style={styles.sheetSubmitBtnText}>
                  Submit Exam ({answeredCount}/{questions.length})
                </Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* Click outside to dismiss */}
          <Pressable
            style={styles.sheetModalDismiss}
            onPress={closeAnswerSheet}
          />
        </Animated.View>
      )}

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
    left: -35,
    top: '46%',
    zIndex: 40,
    width: 98,
    height: 30,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1.5,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    transform: [{ rotate: '-90deg' }],
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 1, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
      },
    }),
  },
  floatingTabText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  questionTextRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  questionNumberText: {
    fontSize: 14.5,
    fontWeight: '900',
    marginTop: 0.5,
    flexShrink: 0,
  },
  flagButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  questionBodyText: {
    flex: 1,
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
    alignItems: 'center',
    gap: 12,
    paddingVertical: 5,
  },
  simpleRadioCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  simpleRadioKeyText: {
    fontSize: 12,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: 16,
  },
  simpleOptionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    includeFontPadding: false,
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
    fontWeight: '800',
  },
  fullReviewSheetBtn: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  fullReviewSheetBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  /* Results View Styles (Matching Drawing Layout) */
  resultsContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 16,
  },

  /* Drawing Score Header Row */
  drawingScoreHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingVertical: 6,
  },
  drawingPercentageBox: {
    width: 120,
    height: 120,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      },
    }),
  },
  drawingPercentageText: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
  },
  drawingScoreInfoCol: {
    flex: 1,
    gap: 2,
  },
  drawingYourScoreLabel: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  drawingScoreFraction: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: -2,
  },
  drawingScoreDenominator: {
    fontSize: 20,
    fontWeight: '700',
  },
  drawingBenchmarkText: {
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 2,
  },

  /* Subject Performance Bar Chart */
  chartCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 14,
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
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
      },
    }),
  },
  chartSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  barChartContainer: {
    position: 'relative',
    paddingLeft: 14,
    paddingRight: 6,
    paddingTop: 8,
  },
  chartYAxis: {
    position: 'absolute',
    left: 8,
    top: 4,
    bottom: 26,
    width: 2,
  },
  chartGraphArea: {
    width: '100%',
  },
  chartBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 155,
  },
  barColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  barPercentText: {
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 4,
    textAlign: 'center',
  },
  barFill: {
    width: 28,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 1.5,
  },
  chartXAxis: {
    width: '100%',
    height: 2,
  },
  chartLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  barLabelWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barUnderLabelText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  /* Results Action Buttons */
  resultActionsContainer: {
    gap: 10,
    marginTop: 4,
  },
  viewQuestionsBtn: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  viewQuestionsBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  reviewFooterButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  retakeExamBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  retakeExamBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  finishExamBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishExamBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },

  /* Review Questions Section */
  reviewQuestionsListContainer: {
    gap: 14,
    marginTop: 6,
  },
  reviewSectionHeader: {
    paddingHorizontal: 2,
    gap: 2,
  },
  reviewHeading: {
    fontSize: 15,
    fontWeight: '800',
  },
  reviewSubheading: {
    fontSize: 11.5,
    fontWeight: '500',
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
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  explanationText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },

  /* Left Slide-out Answer Sheet Drawer */
  sheetModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  sheetModalDrawer: {
    width: 248,
    maxWidth: 256,
    height: '100%',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderRightWidth: 1,
    borderRightColor: 'rgba(150, 150, 150, 0.12)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
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
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: 16,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
