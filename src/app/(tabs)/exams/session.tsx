import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Timer,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  BookOpen,
} from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { Radius } from '@/constants/theme';

export interface Question {
  id: number;
  question: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correct: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  topic: string;
}

const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    topic: 'History & Theory of Architecture',
    question:
      'Which monumental Roman building, dedicated to all planetary gods, is celebrated for having the world’s largest unreinforced concrete dome illuminated by an 8.8m central oculus?',
    options: [
      { key: 'A', text: 'Parthenon in Athens' },
      { key: 'B', text: 'Pantheon in Rome' },
      { key: 'C', text: 'Colosseum (Flavian Amphitheater)' },
      { key: 'D', text: 'Basilica of Maxentius and Constantine' },
    ],
    correct: 'B',
    explanation:
      'The Pantheon in Rome was commissioned by Marcus Agrippa and rebuilt by Emperor Hadrian. Its stepped unreinforced concrete dome and oculus remain an engineering masterpiece of antiquity.',
  },
  {
    id: 2,
    topic: 'Professional Practice & Building Laws (PD 1096)',
    question:
      'Under the National Building Code of the Philippines (PD 1096) Rule 7 & 8, which parameter represents the maximum allowable ground footprint of a proposed building structure?',
    options: [
      { key: 'A', text: 'AMBF (Allowable Maximum Building Footprint)' },
      { key: 'B', text: 'TOSL (Total Open Space within Lot)' },
      { key: 'C', text: 'GFA (Gross Floor Area)' },
      { key: 'D', text: 'USA (Unpaved Surface Area)' },
    ],
    correct: 'A',
    explanation:
      'AMBF = TLA - TOSL. It defines the maximum footprint area on the ground floor level that a building structure may occupy on a given lot.',
  },
  {
    id: 3,
    topic: 'Building Technology & Utilities',
    question:
      'According to ASTM C150 standards for Portland Cement, which classification designates High Early Strength cement used for cold-weather construction and accelerated formwork removal?',
    options: [
      { key: 'A', text: 'Type I (Normal Portland)' },
      { key: 'B', text: 'Type II (Moderate Sulfate Resistance)' },
      { key: 'C', text: 'Type III (High Early Strength)' },
      { key: 'D', text: 'Type IV (Low Heat of Hydration)' },
    ],
    correct: 'C',
    explanation:
      'Type III Portland cement achieves in 3 days the compressive strength normally attained by Type I in 7 or 28 days, making it ideal for rapid cycle schedules and precast components.',
  },
];

export default function ExamSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(1800); // 30 mins
  const [isSubmitted, setIsSubmitted] = useState(false);

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
  }, [isSubmitted]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentQ = MOCK_QUESTIONS[currentIndex];
  const userSelection = selectedAnswers[currentQ.id];
  const isFlagged = Boolean(flaggedQuestions[currentQ.id]);

  const handleSelectOption = (key: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: key,
    }));
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const handleSubmitExam = () => {
    setIsSubmitted(true);
  };

  // Calculate score
  const correctCount = MOCK_QUESTIONS.reduce((acc, q) => {
    return selectedAnswers[q.id] === q.correct ? acc + 1 : acc;
  }, 0);
  const scorePercent = Math.round((correctCount / MOCK_QUESTIONS.length) * 100);
  const isPassed = scorePercent >= 70;

  const handleRetake = () => {
    setSelectedAnswers({});
    setFlaggedQuestions({});
    setSecondsRemaining(1800);
    setCurrentIndex(0);
    setIsSubmitted(false);
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Top Header Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}>
          <ArrowLeft size={18} color={theme.text} />
        </Pressable>

        <View style={styles.headerTitles}>
          <Text style={[styles.headerSubtitle, { color: theme.accent }]}>
            {id ? String(id).toUpperCase() : 'AREA 1 MOCK'}
          </Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {isSubmitted ? 'Exam Results' : `Question ${currentIndex + 1} of ${MOCK_QUESTIONS.length}`}
          </Text>
        </View>

        {/* Countdown Timer or Score badge */}
        {!isSubmitted ? (
          <View
            style={[
              styles.timerBadge,
              {
                backgroundColor: theme.accentMuted,
                borderColor: theme.border,
              },
            ]}>
            <Timer size={14} color={theme.accent} />
            <Text style={[styles.timerText, { color: theme.accent }]}>
              {formatTimer(secondsRemaining)}
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.timerBadge,
              {
                backgroundColor: isPassed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                borderColor: isPassed ? '#22C55E' : '#EF4444',
              },
            ]}>
            <Text
              style={[
                styles.timerText,
                { color: isPassed ? '#22C55E' : '#EF4444' },
              ]}>
              {scorePercent}% {isPassed ? 'PASSED' : 'FAILED'}
            </Text>
          </View>
        )}
      </View>

      {!isSubmitted ? (
        /* Active Question View */
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}>
          {/* Question Item Card */}
          <View
            style={[
              styles.questionCard,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: isFlagged ? theme.accent : theme.border,
              },
            ]}>
            {/* Meta Row */}
            <View style={styles.questionMetaRow}>
              <View
                style={[
                  styles.topicPill,
                  { backgroundColor: theme.accentMuted, borderColor: theme.border },
                ]}>
                <BookOpen size={12} color={theme.accent} />
                <Text style={[styles.topicPillText, { color: theme.accent }]}>
                  {currentQ.topic}
                </Text>
              </View>

              <Pressable
                onPress={handleToggleFlag}
                style={({ pressed }) => [
                  styles.flagBtn,
                  isFlagged && { backgroundColor: theme.accentMuted },
                  { opacity: pressed ? 0.8 : 1 },
                ]}>
                <Flag
                  size={14}
                  color={isFlagged ? theme.accent : theme.textSecondary}
                  fill={isFlagged ? theme.accent : 'transparent'}
                />
                <Text
                  style={[
                    styles.flagText,
                    { color: isFlagged ? theme.accent : theme.textSecondary },
                  ]}>
                  {isFlagged ? 'Flagged' : 'Flag'}
                </Text>
              </Pressable>
            </View>

            {/* Question Text */}
            <Text style={[styles.questionText, { color: theme.text }]}>
              {currentQ.question}
            </Text>
          </View>

          {/* Multiple Choices (ABCD) */}
          <View style={styles.optionsContainer}>
            {currentQ.options.map((opt) => {
              const isSelected = userSelection === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => handleSelectOption(opt.key)}
                  style={({ pressed }) => [
                    styles.optionCard,
                    {
                      backgroundColor: isSelected
                        ? theme.accentMuted
                        : theme.backgroundElement,
                      borderColor: isSelected ? theme.accent : theme.border,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}>
                  <View
                    style={[
                      styles.keyBadge,
                      {
                        backgroundColor: isSelected
                          ? theme.accent
                          : theme.background,
                        borderColor: isSelected ? theme.accent : theme.border,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.keyText,
                        { color: isSelected ? '#FFFFFF' : theme.text },
                      ]}>
                      {opt.key}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: isSelected ? theme.accent : theme.text,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}>
                    {opt.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Bottom Navigation & Submit Bar */}
          <View style={styles.navControls}>
            <Pressable
              onPress={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentIndex === 0}
              style={({ pressed }) => [
                styles.navBtn,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                  opacity: currentIndex === 0 ? 0.4 : pressed ? 0.8 : 1,
                },
              ]}>
              <ChevronLeft size={16} color={theme.text} />
              <Text style={[styles.navBtnText, { color: theme.text }]}>Prev</Text>
            </Pressable>

            {currentIndex < MOCK_QUESTIONS.length - 1 ? (
              <Pressable
                onPress={() => setCurrentIndex((prev) => prev + 1)}
                style={({ pressed }) => [
                  styles.navBtnPrimary,
                  {
                    backgroundColor: theme.accent,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}>
                <Text style={styles.navBtnPrimaryText}>Next Question</Text>
                <ChevronRight size={16} color="#FFFFFF" />
              </Pressable>
            ) : (
              <Pressable
                onPress={handleSubmitExam}
                style={({ pressed }) => [
                  styles.navBtnPrimary,
                  {
                    backgroundColor: '#16A34A',
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}>
                <Text style={styles.navBtnPrimaryText}>Submit Exam</Text>
                <CheckCircle2 size={16} color="#FFFFFF" />
              </Pressable>
            )}
          </View>
        </ScrollView>
      ) : (
        /* Results Overview View */
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}>
          {/* Result Score Card */}
          <View
            style={[
              styles.resultsCard,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: isPassed ? '#22C55E' : '#EF4444',
              },
            ]}>
            <View
              style={[
                styles.resultIconBox,
                {
                  backgroundColor: isPassed
                    ? 'rgba(34, 197, 94, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                },
              ]}>
              {isPassed ? (
                <Award size={32} color="#22C55E" />
              ) : (
                <XCircle size={32} color="#EF4444" />
              )}
            </View>

            <Text style={[styles.resultTitle, { color: theme.text }]}>
              {isPassed ? 'Congratulations! You Passed!' : 'Needs Review & Practice'}
            </Text>
            <Text
              style={[styles.resultSubtext, { color: theme.textSecondary }]}>
              You scored {correctCount} out of {MOCK_QUESTIONS.length} questions ({scorePercent}%).
            </Text>
          </View>

          {/* Answer Key Review */}
          <Text style={[styles.sectionHeaderTitle, { color: theme.textSecondary }]}>
            ANSWER REVIEW & EXPLANATIONS
          </Text>

          <View style={styles.reviewList}>
            {MOCK_QUESTIONS.map((q, idx) => {
              const uAns = selectedAnswers[q.id];
              const isCorrect = uAns === q.correct;
              return (
                <View
                  key={q.id}
                  style={[
                    styles.reviewCard,
                    {
                      backgroundColor: theme.backgroundElement,
                      borderColor: isCorrect ? '#22C55E' : '#EF4444',
                    },
                  ]}>
                  <View style={styles.reviewHeader}>
                    <Text style={[styles.reviewNumber, { color: theme.text }]}>
                      Item {idx + 1}
                    </Text>
                    <View
                      style={[
                        styles.reviewTag,
                        {
                          backgroundColor: isCorrect
                            ? 'rgba(34, 197, 94, 0.15)'
                            : 'rgba(239, 68, 68, 0.15)',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.reviewTagText,
                          { color: isCorrect ? '#22C55E' : '#EF4444' },
                        ]}>
                        {isCorrect ? 'Correct (+1.0)' : 'Incorrect (0.0)'}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.reviewQuestion, { color: theme.text }]}>
                    {q.question}
                  </Text>

                  <View
                    style={[
                      styles.answerBox,
                      {
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                      },
                    ]}>
                    <Text style={[styles.ansLine, { color: theme.text }]}>
                      Your Answer: <Text style={{ fontWeight: '700' }}>{uAns || 'Unanswered'}</Text>
                    </Text>
                    <Text style={[styles.ansLine, { color: '#22C55E', fontWeight: '700' }]}>
                      Correct Answer: {q.correct} — {q.options.find((o) => o.key === q.correct)?.text}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.explanationText,
                      { color: theme.textSecondary },
                    ]}>
                    <Text style={{ fontWeight: '700', color: theme.text }}>
                      Explanation:{' '}
                    </Text>
                    {q.explanation}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Action Buttons */}
          <View style={styles.resultsActions}>
            <Pressable
              onPress={handleRetake}
              style={({ pressed }) => [
                styles.retakeBtn,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              <RotateCcw size={16} color={theme.text} />
              <Text style={[styles.retakeBtnText, { color: theme.text }]}>
                Retake Exam
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.replace('/(tabs)/exams')}
              style={({ pressed }) => [
                styles.finishBtn,
                {
                  backgroundColor: theme.accent,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <Text style={styles.finishBtnText}>Finish & Return</Text>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 15.5,
    fontWeight: '700',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 18,
    gap: 16,
  },
  questionCard: {
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 10,
  },
  questionMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  topicPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  flagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.xs,
  },
  flagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    gap: 12,
  },
  keyBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.xs,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 13,
    fontWeight: '700',
  },
  optionText: {
    fontSize: 13.5,
    flex: 1,
    lineHeight: 18,
  },
  navControls: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  navBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: Radius.md,
  },
  navBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  resultsCard: {
    padding: 20,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 8,
    textAlign: 'center',
  },
  resultIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  resultSubtext: {
    fontSize: 13,
    textAlign: 'center',
  },
  sectionHeaderTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 8,
  },
  reviewList: {
    gap: 12,
  },
  reviewCard: {
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  reviewTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.xs,
  },
  reviewTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  reviewQuestion: {
    fontSize: 13.5,
    fontWeight: '600',
    lineHeight: 19,
  },
  answerBox: {
    padding: 10,
    borderRadius: Radius.xs,
    borderWidth: 1,
    gap: 3,
    marginTop: 4,
  },
  ansLine: {
    fontSize: 12,
  },
  explanationText: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  resultsActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  retakeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  retakeBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  finishBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: Radius.md,
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
