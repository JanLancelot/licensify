import React, { useState } from 'react';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  XCircle,
} from 'lucide-react-native';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { Radius } from '@/constants/theme';

interface Question {
  id: string;
  area: string;
  areaLabel: string;
  difficulty: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  reference: string;
}

const QUESTION_BANK: Question[] = [
  {
    id: 'q1',
    area: 'area-3',
    areaLabel: 'Area 3: Design & Laws',
    difficulty: 'medium',
    question:
      'Under the National Building Code of the Philippines (PD 1096), what is the formula to determine the Allowable Maximum Building Footprint (AMBF)?',
    options: [
      'AMBF = TLA - TOSL',
      'AMBF = TLA x FLAR',
      'AMBF = ISA + USA',
      'AMBF = TLA - GFA',
    ],
    correctIndex: 0,
    explanation:
      'The Allowable Maximum Building Footprint (AMBF) is calculated by subtracting the Total Open Space within Lot (TOSL) from the Total Lot Area (TLA). TOSL itself consists of ISA (Impervious Surface Area) and USA (Unpaved Surface Area).',
    reference: 'PD 1096 (NBCP) Rule 7 & 8 Guidelines',
  },
  {
    id: 'q2',
    area: 'area-1',
    areaLabel: 'Area 1: History & Planning',
    difficulty: 'easy',
    question:
      'Which Greek architectural order features a capital composed of two rows of acanthus leaves topped by small volutes?',
    options: ['Doric Order', 'Ionic Order', 'Corinthian Order', 'Tuscan Order'],
    correctIndex: 2,
    explanation:
      'The Corinthian order is the most ornate of the classical Greek orders, characterized by inverted bell-shaped capitals adorned with sculpted acanthus leaves and miniature volutes at the corners.',
    reference: 'History of Architecture — Classical Antiquity',
  },
  {
    id: 'q3',
    area: 'area-2',
    areaLabel: 'Area 2: Structural & Utilities',
    difficulty: 'medium',
    question:
      'What is the standard minimum depth of water trap seal required for sanitary plumbing fixtures to prevent sewer gas entry?',
    options: ['1 inch (25 mm)', '2 inches (51 mm)', '6 inches (152 mm)', '8 inches (203 mm)'],
    correctIndex: 1,
    explanation:
      'Under the Revised National Plumbing Code of the Philippines, standard plumbing fixture traps must have a liquid trap seal of not less than 2 inches (51 mm) and not more than 4 inches (102 mm).',
    reference: 'Revised National Plumbing Code (Sec. 1002)',
  },
  {
    id: 'q4',
    area: 'area-3',
    areaLabel: 'Area 3: Design & Laws',
    difficulty: 'easy',
    question:
      'Under Republic Act No. 9266 (The Architecture Act of 2004), who is legally mandated to sign and dry-seal architectural plans and documents?',
    options: [
      'Any Civil Engineer with building experience',
      'Registered and Licensed Architect (RLA)',
      'Master Plumber or Environmental Planner',
      'Draftsman certified by TESDA',
    ],
    correctIndex: 1,
    explanation:
      'Section 20 of RA 9266 explicitly restricts the signing and dry-sealing of all architectural drawings, specifications, and related contract documents exclusively to Registered and Licensed Architects (RLAs).',
    reference: 'RA 9266 — Architecture Act of 2004, Sec. 20',
  },
  {
    id: 'q5',
    area: 'area-2',
    areaLabel: 'Area 2: Structural & Utilities',
    difficulty: 'hard',
    question:
      'What is the volumetric proportion for Class A concrete mix and its expected compressive strength at 28 days?',
    options: [
      '1 : 1.5 : 3 (4,000 psi)',
      '1 : 2 : 4 (3,000 psi)',
      '1 : 2.5 : 5 (2,500 psi)',
      '1 : 3 : 6 (2,000 psi)',
    ],
    correctIndex: 1,
    explanation:
      'Class A concrete mix consists of 1 part cement, 2 parts sand, and 4 parts gravel (1:2:4), commonly developing 3,000 psi compressive strength after 28 days of standard hydration and curing.',
    reference: 'National Structural Code of the Philippines (NSCP)',
  },
  {
    id: 'q6',
    area: 'area-1',
    areaLabel: 'Area 1: History & Planning',
    difficulty: 'medium',
    question:
      'Under BP 220 (Socialized Housing Standards), what is the minimum lot size for a single-detached residential dwelling?',
    options: ['48 sq.m', '54 sq.m', '64 sq.m', '72 sq.m'],
    correctIndex: 2,
    explanation:
      'Under Batas Pambansa Blg. 220, the minimum lot size for single-detached socialized housing is 64 sq.m (whereas economic housing requires 72 sq.m).',
    reference: 'BP 220 Economic and Socialized Housing Standards',
  },
];

export default function PracticeQuizScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    area?: string;
    difficulty?: string;
    count?: string;
  }>();

  const selectedArea = params.area || 'all';
  const count = parseInt(params.count || '5', 10);

  const getFilteredQuestions = () => {
    let pool = QUESTION_BANK;
    if (selectedArea !== 'all') {
      pool = pool.filter((q) => q.area === selectedArea);
    }
    const questionsToUse = pool.length > 0 ? pool : QUESTION_BANK;
    return [...questionsToUse].slice(0, count);
  };

  const [questions, setQuestions] = useState<Question[]>(getFilteredQuestions);
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

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backBtn,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
              opacity: pressed ? 0.75 : 1,
            },
          ]}>
          <ArrowLeft size={18} color={theme.text} />
        </Pressable>

        <View style={styles.topCenter}>
          <Text style={[styles.areaLabel, { color: theme.accent }]}>
            {currentQ?.areaLabel || 'Practice Quiz'}
          </Text>
          <Text style={[styles.counterText, { color: theme.textSecondary }]}>
            Question {currentIdx + 1} of {questions.length}
          </Text>
        </View>

        <View style={styles.dummySpace} />
      </View>

      {/* Progress Track */}
      <View
        style={[
          styles.track,
          { backgroundColor: theme.backgroundSelected },
        ]}>
        <View
          style={[
            styles.trackFill,
            {
              width: `${((currentIdx + 1) / (questions.length || 1)) * 100}%`,
              backgroundColor: theme.accent,
            },
          ]}
        />
      </View>

      {/* Finished Results Screen */}
      {isQuizFinished ? (
        <View style={styles.resultsWrapper}>
          <View
            style={[
              styles.resultCard,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}>
            <Award size={38} color={theme.accent} />
            <Text style={[styles.resultHeading, { color: theme.text }]}>
              Drill Completed!
            </Text>
            <Text style={[styles.resultScoreText, { color: theme.accent }]}>
              {Math.round((correctAnswersCount / (questions.length || 1)) * 100)}%
            </Text>
            <Text style={[styles.resultSubtext, { color: theme.textSecondary }]}>
              You got {correctAnswersCount} out of {questions.length} questions correct.
            </Text>

            <View
              style={[styles.resultDivider, { backgroundColor: theme.border }]}
            />

            <Pressable
              onPress={restartQuiz}
              style={[styles.actionBtn, { backgroundColor: theme.accent }]}>
              <RotateCcw size={15} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Retake Quiz</Text>
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              style={[
                styles.secondaryBtn,
                {
                  backgroundColor: theme.backgroundSelected,
                  borderColor: theme.borderStrong,
                },
              ]}>
              <Text style={[styles.secondaryBtnText, { color: theme.text }]}>
                Return to Practice Arena
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        /* Active Question Content */
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}>
          {/* Question Box */}
          <View
            style={[
              styles.questionBox,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}>
            <Text style={[styles.questionText, { color: theme.text }]}>
              {currentQ?.question}
            </Text>
          </View>

          {/* Options List */}
          <View style={styles.optionsContainer}>
            {currentQ?.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let optBorder: string = theme.border;
              let optBg: string = theme.backgroundElement;
              const textColor: string = theme.text;

              if (isAnswerSubmitted) {
                if (isCorrect) {
                  optBorder = '#10B981';
                  optBg = 'rgba(16, 185, 129, 0.12)';
                } else if (isSelected && !isCorrect) {
                  optBorder = '#EF4444';
                  optBg = 'rgba(239, 68, 68, 0.12)';
                }
              } else if (isSelected) {
                optBorder = theme.accent;
                optBg = theme.accentMuted;
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
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}>
                  <View
                    style={[
                      styles.optionPill,
                      {
                        backgroundColor: isSelected
                          ? theme.accent
                          : theme.backgroundSelected,
                        borderColor: theme.borderStrong,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.optionPillText,
                        {
                          color: isSelected ? '#FFFFFF' : theme.textSecondary,
                        },
                      ]}>
                      {String.fromCharCode(65 + idx)}
                    </Text>
                  </View>

                  <Text style={[styles.optionLabel, { color: textColor }]}>
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

          {/* Instant Explanation Box */}
          {isAnswerSubmitted && (
            <View
              style={[
                styles.explanationContainer,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}>
              <View style={styles.explanationTitleRow}>
                <HelpCircle size={16} color={theme.accent} />
                <Text
                  style={[
                    styles.explanationKickerText,
                    { color: theme.accent },
                  ]}>
                  ARCHITECTURAL EXPLANATION & CITATION
                </Text>
              </View>

              <Text style={[styles.explanationBodyText, { color: theme.text }]}>
                {currentQ?.explanation}
              </Text>

              <View
                style={[
                  styles.refContainer,
                  { borderTopColor: theme.border },
                ]}>
                <Text style={[styles.refLabelText, { color: theme.textSecondary }]}>
                  Legal / Technical Reference:
                </Text>
                <Text style={[styles.refValueText, { color: theme.accent }]}>
                  {currentQ?.reference}
                </Text>
              </View>
            </View>
          )}

          {/* Action Button */}
          <View style={styles.bottomActionWrapper}>
            {!isAnswerSubmitted ? (
              <Pressable
                disabled={selectedOption === null}
                onPress={handleSubmitAnswer}
                style={[
                  styles.submitActionBtn,
                  {
                    backgroundColor: theme.accent,
                    opacity: selectedOption === null ? 0.4 : 1,
                  },
                ]}>
                <Text style={styles.submitActionBtnText}>Check Answer</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleNextQuestion}
                style={[
                  styles.submitActionBtn,
                  { backgroundColor: theme.accent },
                ]}>
                <Text style={styles.submitActionBtnText}>
                  {currentIdx < questions.length - 1
                    ? 'Next Question →'
                    : 'View Quiz Results'}
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: '100%',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCenter: {
    alignItems: 'center',
    gap: 2,
  },
  areaLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  counterText: {
    fontSize: 11.5,
  },
  dummySpace: {
    width: 36,
  },
  track: {
    height: 4,
    width: '100%',
  },
  trackFill: {
    height: '100%',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  questionBox: {
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  questionText: {
    fontSize: 15.5,
    fontWeight: '700',
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 12,
  },
  optionPill: {
    width: 26,
    height: 26,
    borderRadius: Radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  optionPillText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  optionLabel: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    lineHeight: 18,
  },
  explanationContainer: {
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 10,
  },
  explanationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  explanationKickerText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.9,
  },
  explanationBodyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  refContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 2,
  },
  refLabelText: {
    fontSize: 10.5,
  },
  refValueText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  bottomActionWrapper: {
    marginTop: 6,
    marginBottom: 20,
  },
  submitActionBtn: {
    paddingVertical: 14,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  resultsWrapper: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  resultCard: {
    padding: 24,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  resultHeading: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  resultScoreText: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1.5,
    lineHeight: 52,
  },
  resultSubtext: {
    fontSize: 13,
    textAlign: 'center',
  },
  resultDivider: {
    height: 1,
    width: '100%',
    marginVertical: 6,
  },
  actionBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: Radius.sm,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
