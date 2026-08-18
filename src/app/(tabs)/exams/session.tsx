import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flag,
  RotateCcw,
  Timer,
  Trophy,
  XCircle,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
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
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(1800); // 30 mins
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitExam = () => {
    setIsSubmitted(true);
  };

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
            {id ? String(id).replace('-', ' ').toUpperCase() : 'BOARD EXAM'}
          </Text>
          <Text style={[styles.headerTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
            {isSubmitted ? 'Exam Results' : `Question ${currentIndex + 1} of ${MOCK_QUESTIONS.length}`}
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
              {scorePercent}%
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
              width: `${((currentIndex + 1) / (MOCK_QUESTIONS.length || 1)) * 100}%`,
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
              styles.content,
              { paddingBottom: insets.bottom + 100 },
            ]}
            showsVerticalScrollIndicator={false}>
            {/* Question Card */}
            <View
              style={[
                styles.questionCard,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
                },
              ]}>
              {/* Meta Row */}
              <View style={styles.questionMetaRow}>
                <View
                  style={[
                    styles.topicPill,
                    {
                      backgroundColor: isDark
                        ? 'rgba(224, 122, 95, 0.18)'
                        : '#F8EAE4',
                    },
                  ]}>
                  <BookOpen size={12} color={colors.accent} strokeWidth={2.2} />
                  <Text style={[styles.topicPillText, { color: colors.accent }]}>
                    {currentQ.topic}
                  </Text>
                </View>

                <Pressable
                  onPress={handleToggleFlag}
                  style={({ pressed }) => [
                    styles.flagBtn,
                    {
                      backgroundColor: isFlagged
                        ? isDark
                          ? 'rgba(224, 122, 95, 0.25)'
                          : '#F8EAE4'
                        : isDark
                          ? '#23262F'
                          : '#FFFFFF',
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}>
                  <Flag
                    size={14}
                    color={isFlagged ? colors.accent : colors.textSecondary}
                    fill={isFlagged ? colors.accent : 'transparent'}
                  />
                  <Text
                    style={[
                      styles.flagText,
                      { color: isFlagged ? colors.accent : colors.textSecondary },
                    ]}>
                    {isFlagged ? 'Flagged' : 'Flag'}
                  </Text>
                </Pressable>
              </View>

              {/* Question Text */}
              <Text style={[styles.questionText, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
                {currentQ.question}
              </Text>
            </View>

            {/* Options List */}
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
                          ? isDark
                            ? 'rgba(224, 122, 95, 0.22)'
                            : '#F8EAE4'
                          : isDark
                            ? '#23262F'
                            : '#FFFFFF',
                        borderColor: isSelected ? colors.accent : 'transparent',
                        borderWidth: isSelected ? 1.4 : 0,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}>
                    <View
                      style={[
                        styles.keyBadge,
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
                          styles.keyBadgeText,
                          {
                            color: isSelected ? '#FFFFFF' : colors.textSecondary,
                          },
                        ]}>
                        {opt.key}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: isDark ? '#F9FAFB' : '#0F172A',
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

          {/* Sticky Bottom Nav Bar */}
          <View
            style={[
              styles.bottomBar,
              { paddingBottom: Math.max(insets.bottom + 12, 16) },
            ]}>
            <Pressable
              disabled={currentIndex === 0}
              onPress={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              style={({ pressed }) => [
                styles.navSquareBtn,
                {
                  backgroundColor: isDark ? '#23262F' : '#F6F0ED',
                  opacity: currentIndex === 0 ? 0.35 : pressed ? 0.7 : 1,
                },
              ]}>
              <ChevronLeft size={22} color={colors.text} />
            </Pressable>

            {currentIndex < MOCK_QUESTIONS.length - 1 ? (
              <Pressable
                onPress={() => setCurrentIndex((prev) => prev + 1)}
                style={({ pressed }) => [
                  styles.navPrimaryBtn,
                  {
                    backgroundColor: colors.accent,
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.985 : 1 }],
                  },
                ]}>
                <Text style={styles.navPrimaryText}>Next Question</Text>
                <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.4} />
              </Pressable>
            ) : (
              <Pressable
                onPress={handleSubmitExam}
                style={({ pressed }) => [
                  styles.navPrimaryBtn,
                  {
                    backgroundColor: colors.accent,
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.985 : 1 }],
                  },
                ]}>
                <Text style={styles.navPrimaryText}>Submit Examination</Text>
              </Pressable>
            )}
          </View>
        </View>
      ) : (
        /* Results View */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.resultsContent,
            { paddingBottom: insets.bottom + 40 },
          ]}>
          <View
            style={[
              styles.resultsCard,
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
                  <LinearGradient id="exam_award_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#E58368" />
                    <Stop offset="100%" stopColor="#C85A32" />
                  </LinearGradient>
                </Defs>
                <Rect width={64} height={64} rx={22} fill="url(#exam_award_grad)" />
              </Svg>
              <Trophy size={30} color="#FFFFFF" strokeWidth={2.2} />
            </View>

            <Text style={[styles.resultHeading, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
              {isPassed ? 'Examination Passed!' : 'Needs Review'}
            </Text>

            <Text style={[styles.resultScore, { color: isPassed ? '#10B981' : colors.accent }]}>
              {scorePercent}%
            </Text>

            <Text style={[styles.resultSubtext, { color: colors.textSecondary }]}>
              You correctly answered {correctCount} of {MOCK_QUESTIONS.length} questions (70% required to pass).
            </Text>

            <View style={styles.statsGrid}>
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: isDark ? '#23262F' : '#FFFFFF' },
                ]}>
                <Text style={[styles.statNum, { color: '#10B981' }]}>
                  {correctCount}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Correct
                </Text>
              </View>

              <View
                style={[
                  styles.statCard,
                  { backgroundColor: isDark ? '#23262F' : '#FFFFFF' },
                ]}>
                <Text style={[styles.statNum, { color: '#EF4444' }]}>
                  {MOCK_QUESTIONS.length - correctCount}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Incorrect
                </Text>
              </View>

              <View
                style={[
                  styles.statCard,
                  { backgroundColor: isDark ? '#23262F' : '#FFFFFF' },
                ]}>
                <Text style={[styles.statNum, { color: colors.accent }]}>
                  {scorePercent}%
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Score
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleRetake}
              style={({ pressed }) => [
                styles.retakeBtn,
                {
                  backgroundColor: colors.accent,
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                },
              ]}>
              <RotateCcw size={16} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.retakeBtnText}>Retake Examination</Text>
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
                Return to Exams Hub
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
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
    gap: 2,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  timerText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  track: {
    height: 4,
    width: '100%',
  },
  trackFill: {
    height: '100%',
    borderRadius: 2,
  },
  sessionLayout: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 14,
  },
  questionCard: {
    borderRadius: 22,
    padding: 18,
    gap: 14,
  },
  questionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
    maxWidth: '70%',
  },
  topicPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  flagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  flagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  optionsContainer: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 12,
  },
  keyBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  navSquareBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navPrimaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  navPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  resultsContent: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsCard: {
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
  resultScore: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1,
  },
  resultSubtext: {
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginVertical: 4,
  },
  statCard: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    gap: 3,
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  retakeBtn: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  retakeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  returnBtn: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
