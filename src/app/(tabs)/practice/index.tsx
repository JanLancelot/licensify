import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  HelpCircle,
  Play,
  RotateCcw,
  X,
  XCircle,
} from 'lucide-react-native';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { Radius } from '@/constants/theme';

type SubjectArea = 'all' | 'area-1' | 'area-2' | 'area-3';
type Difficulty = 'easy' | 'medium' | 'hard';
type QuestionCount = 5 | 10 | 20;

interface Question {
  id: string;
  area: string;
  areaLabel: string;
  difficulty: Difficulty;
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

const PAST_HISTORY = [
  {
    id: 'h1',
    topic: 'Area 3: NBCP Rule 7 & 8 Computations',
    difficulty: 'Medium',
    score: '90%',
    scoreDetail: '9/10 correct',
    date: 'Today, 10:15 AM',
  },
  {
    id: 'h2',
    topic: 'Area 1: Classical Orders & Greek History',
    difficulty: 'Easy',
    score: '80%',
    scoreDetail: '8/10 correct',
    date: 'Yesterday',
  },
  {
    id: 'h3',
    topic: 'Area 2: Plumbing & Electrical Utilities',
    difficulty: 'Hard',
    score: '70%',
    scoreDetail: '7/10 correct',
    date: '2 days ago',
  },
  {
    id: 'h4',
    topic: 'Mixed Syllabus Comprehensive Review',
    difficulty: 'Medium',
    score: '85%',
    scoreDetail: '17/20 correct',
    date: '3 days ago',
  },
];

export default function PracticeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Launcher State
  const [selectedArea, setSelectedArea] = useState<SubjectArea>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [selectedCount, setSelectedCount] = useState<QuestionCount>(5);

  // Active Quiz State
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  const startQuiz = () => {
    let pool = QUESTION_BANK;
    if (selectedArea !== 'all') {
      pool = pool.filter((q) => q.area === selectedArea);
    }
    const questionsToUse = pool.length > 0 ? pool : QUESTION_BANK;
    const shuffled = [...questionsToUse].slice(0, selectedCount);

    setActiveQuestions(shuffled);
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setCorrectAnswersCount(0);
    setIsQuizFinished(false);
    setIsQuizActive(true);
  };

  const handleSelectOption = (idx: number) => {
    if (!isAnswerSubmitted) {
      setSelectedOption(idx);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    if (selectedOption === activeQuestions[currentIdx].correctIndex) {
      setCorrectAnswersCount((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < activeQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizFinished(true);
    }
  };

  const currentQ = activeQuestions[currentIdx];

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 90 },
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.kicker, { color: theme.accent }]}>
              HANDS-ON REVIEW
            </Text>
            <Text style={[styles.title, { color: theme.text }]}>
              Practice Arena
            </Text>
          </View>
          <View
            style={[
              styles.yearPill,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}>
            <Text style={[styles.yearPillText, { color: theme.textSecondary }]}>
              ALE 2026
            </Text>
          </View>
        </View>

        {/* SECTION 1: CONFIGURE QUIZ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Configure Practice Quiz
          </Text>

          <View
            style={[
              styles.configCard,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}>
            {/* 1. Subject / Topic Selection */}
            <View style={styles.configGroup}>
              <Text style={[styles.configLabel, { color: theme.textSecondary }]}>
                1. SELECT SUBJECT AREA
              </Text>
              <View style={styles.pillsRow}>
                <Pressable
                  onPress={() => setSelectedArea('all')}
                  style={[
                    styles.pillBtn,
                    {
                      backgroundColor:
                        selectedArea === 'all'
                          ? theme.accent
                          : theme.backgroundSelected,
                      borderColor:
                        selectedArea === 'all'
                          ? theme.accent
                          : theme.borderStrong,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.pillBtnText,
                      {
                        color:
                          selectedArea === 'all' ? '#FFFFFF' : theme.text,
                      },
                    ]}>
                    All Subjects (Mixed)
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setSelectedArea('area-1')}
                  style={[
                    styles.pillBtn,
                    {
                      backgroundColor:
                        selectedArea === 'area-1'
                          ? theme.accent
                          : theme.backgroundSelected,
                      borderColor:
                        selectedArea === 'area-1'
                          ? theme.accent
                          : theme.borderStrong,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.pillBtnText,
                      {
                        color:
                          selectedArea === 'area-1' ? '#FFFFFF' : theme.text,
                      },
                    ]}>
                    Area 1: History & Planning
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setSelectedArea('area-2')}
                  style={[
                    styles.pillBtn,
                    {
                      backgroundColor:
                        selectedArea === 'area-2'
                          ? theme.accent
                          : theme.backgroundSelected,
                      borderColor:
                        selectedArea === 'area-2'
                          ? theme.accent
                          : theme.borderStrong,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.pillBtnText,
                      {
                        color:
                          selectedArea === 'area-2' ? '#FFFFFF' : theme.text,
                      },
                    ]}>
                    Area 2: Structural & Utilities
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setSelectedArea('area-3')}
                  style={[
                    styles.pillBtn,
                    {
                      backgroundColor:
                        selectedArea === 'area-3'
                          ? theme.accent
                          : theme.backgroundSelected,
                      borderColor:
                        selectedArea === 'area-3'
                          ? theme.accent
                          : theme.borderStrong,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.pillBtnText,
                      {
                        color:
                          selectedArea === 'area-3' ? '#FFFFFF' : theme.text,
                      },
                    ]}>
                    Area 3: Design & Laws
                  </Text>
                </Pressable>
              </View>
            </View>

            <View
              style={[styles.configDivider, { backgroundColor: theme.border }]}
            />

            {/* 2. Difficulty Level */}
            <View style={styles.configGroup}>
              <Text style={[styles.configLabel, { color: theme.textSecondary }]}>
                2. DIFFICULTY LEVEL
              </Text>
              <View style={styles.pillsRow}>
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                  <Pressable
                    key={level}
                    onPress={() => setSelectedDifficulty(level)}
                    style={[
                      styles.pillBtnFlex,
                      {
                        backgroundColor:
                          selectedDifficulty === level
                            ? theme.accent
                            : theme.backgroundSelected,
                        borderColor:
                          selectedDifficulty === level
                            ? theme.accent
                            : theme.borderStrong,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.pillBtnText,
                        {
                          color:
                            selectedDifficulty === level
                              ? '#FFFFFF'
                              : theme.text,
                        },
                      ]}>
                      {level === 'easy'
                        ? 'Easy (Basics)'
                        : level === 'medium'
                          ? 'Medium (Standard)'
                          : 'Hard (Tricky)'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View
              style={[styles.configDivider, { backgroundColor: theme.border }]}
            />

            {/* 3. Question Count */}
            <View style={styles.configGroup}>
              <Text style={[styles.configLabel, { color: theme.textSecondary }]}>
                3. QUESTION COUNT
              </Text>
              <View style={styles.pillsRow}>
                {([5, 10, 20] as QuestionCount[]).map((count) => (
                  <Pressable
                    key={count}
                    onPress={() => setSelectedCount(count)}
                    style={[
                      styles.pillBtnFlex,
                      {
                        backgroundColor:
                          selectedCount === count
                            ? theme.accent
                            : theme.backgroundSelected,
                        borderColor:
                          selectedCount === count
                            ? theme.accent
                            : theme.borderStrong,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.pillBtnText,
                        {
                          color:
                            selectedCount === count ? '#FFFFFF' : theme.text,
                        },
                      ]}>
                      {count} Questions
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Start Quiz CTA */}
            <Pressable
              onPress={startQuiz}
              style={({ pressed }) => [
                styles.startQuizBtn,
                {
                  backgroundColor: theme.accent,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <Play size={15} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.startQuizBtnText}>Start Practice Quiz</Text>
            </Pressable>
          </View>
        </View>

        {/* SECTION 2: PRACTICE HISTORY */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Practice History
          </Text>

          <View
            style={[
              styles.historyCard,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}>
            {PAST_HISTORY.map((item, idx) => (
              <React.Fragment key={item.id}>
                <View style={styles.historyRow}>
                  <View style={styles.historyLeft}>
                    <View style={styles.historyTagRow}>
                      <View
                        style={[
                          styles.diffBadge,
                          {
                            backgroundColor: theme.backgroundSelected,
                            borderColor: theme.border,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.diffBadgeText,
                            { color: theme.textSecondary },
                          ]}>
                          {item.difficulty}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.historyDate,
                          { color: theme.textSecondary },
                        ]}>
                        {item.date}
                      </Text>
                    </View>
                    <Text style={[styles.historyTopic, { color: theme.text }]}>
                      {item.topic}
                    </Text>
                  </View>

                  <View style={styles.historyRight}>
                    <View
                      style={[
                        styles.scoreBadge,
                        {
                          backgroundColor: theme.accentMuted,
                          borderColor: theme.border,
                        },
                      ]}>
                      <Text
                        style={[styles.scoreBadgeText, { color: theme.accent }]}>
                        {item.score}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.scoreDetail,
                        { color: theme.textSecondary },
                      ]}>
                      {item.scoreDetail}
                    </Text>
                  </View>
                </View>

                {idx < PAST_HISTORY.length - 1 && (
                  <View
                    style={[
                      styles.historyDivider,
                      { backgroundColor: theme.border },
                    ]}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* LIVE QUIZ MODAL WITH INSTANT EXPLANATIONS */}
      <Modal
        visible={isQuizActive}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsQuizActive(false)}>
        <SafeAreaView
          style={[styles.modalSafe, { backgroundColor: theme.background }]}>
          {/* Top Bar */}
          <View style={[styles.quizTopBar, { borderBottomColor: theme.border }]}>
            <Pressable
              onPress={() => setIsQuizActive(false)}
              style={({ pressed }) => [
                styles.quizCloseBtn,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <X size={18} color={theme.text} />
            </Pressable>

            <View style={styles.quizTopCenter}>
              <Text style={[styles.quizAreaLabel, { color: theme.accent }]}>
                {currentQ?.areaLabel || 'Practice Quiz'}
              </Text>
              <Text style={[styles.quizCounter, { color: theme.textSecondary }]}>
                Question {currentIdx + 1} of {activeQuestions.length}
              </Text>
            </View>

            <View style={styles.dummySpace} />
          </View>

          {/* Progress Bar */}
          <View
            style={[
              styles.quizTrack,
              { backgroundColor: theme.backgroundSelected },
            ]}>
            <View
              style={[
                styles.quizFill,
                {
                  width: `${((currentIdx + 1) / (activeQuestions.length || 1)) * 100}%`,
                  backgroundColor: theme.accent,
                },
              ]}
            />
          </View>

          {/* If Quiz Finished -> Results Card */}
          {isQuizFinished ? (
            <View style={styles.resultsContainer}>
              <View
                style={[
                  styles.resultCard,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.border,
                  },
                ]}>
                <Award size={36} color={theme.accent} />
                <Text style={[styles.resultTitle, { color: theme.text }]}>
                  Drill Completed!
                </Text>
                <Text style={[styles.resultScore, { color: theme.accent }]}>
                  {Math.round((correctAnswersCount / (activeQuestions.length || 1)) * 100)}%
                </Text>
                <Text style={[styles.resultSub, { color: theme.textSecondary }]}>
                  You got {correctAnswersCount} out of {activeQuestions.length}{' '}
                  questions correct.
                </Text>

                <View
                  style={[
                    styles.resultDivider,
                    { backgroundColor: theme.border },
                  ]}
                />

                <Pressable
                  onPress={startQuiz}
                  style={[
                    styles.retakeBtn,
                    { backgroundColor: theme.accent },
                  ]}>
                  <RotateCcw size={15} color="#FFFFFF" />
                  <Text style={styles.retakeBtnText}>Retake Quiz</Text>
                </Pressable>

                <Pressable
                  onPress={() => setIsQuizActive(false)}
                  style={[
                    styles.doneBtn,
                    {
                      backgroundColor: theme.backgroundSelected,
                      borderColor: theme.borderStrong,
                    },
                  ]}>
                  <Text style={[styles.doneBtnText, { color: theme.text }]}>
                    Return to Practice
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            /* Active Question View */
            <ScrollView
              contentContainerStyle={styles.quizContent}
              showsVerticalScrollIndicator={false}>
              {/* Question Box */}
              <View
                style={[
                  styles.questionCard,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.border,
                  },
                ]}>
                <Text style={[styles.questionText, { color: theme.text }]}>
                  {currentQ?.question}
                </Text>
              </View>

              {/* Options */}
              <View style={styles.optionsList}>
                {currentQ?.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctIndex;

                  let optBorder: string = theme.border;
                  let optBg: string = theme.backgroundElement;
                  const textColor: string = theme.text;

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optBorder = '#10B981'; // Green
                      optBg = 'rgba(16, 185, 129, 0.12)';
                    } else if (isSelected && !isCorrect) {
                      optBorder = '#EF4444'; // Red
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
                        styles.optionCard,
                        {
                          backgroundColor: optBg,
                          borderColor: optBorder,
                          opacity: pressed ? 0.85 : 1,
                        },
                      ]}>
                      <View
                        style={[
                          styles.optionIndexPill,
                          {
                            backgroundColor: isSelected
                              ? theme.accent
                              : theme.backgroundSelected,
                            borderColor: theme.borderStrong,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.optionIndexText,
                            {
                              color: isSelected ? '#FFFFFF' : theme.textSecondary,
                            },
                          ]}>
                          {String.fromCharCode(65 + idx)}
                        </Text>
                      </View>
                      <Text style={[styles.optionText, { color: textColor }]}>
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

              {/* Instant Explanation Box (Revealed upon Submission) */}
              {isAnswerSubmitted && (
                <View
                  style={[
                    styles.explanationCard,
                    {
                      backgroundColor: theme.backgroundElement,
                      borderColor: theme.border,
                    },
                  ]}>
                  <View style={styles.explanationHeader}>
                    <HelpCircle size={16} color={theme.accent} />
                    <Text
                      style={[
                        styles.explanationKicker,
                        { color: theme.accent },
                      ]}>
                      ARCHITECTURAL EXPLANATION & CITATION
                    </Text>
                  </View>
                  <Text
                    style={[styles.explanationBody, { color: theme.text }]}>
                    {currentQ?.explanation}
                  </Text>
                  <View
                    style={[
                      styles.refRow,
                      { borderTopColor: theme.border },
                    ]}>
                    <Text
                      style={[styles.refLabel, { color: theme.textSecondary }]}>
                      Legal/Technical Reference:
                    </Text>
                    <Text style={[styles.refValue, { color: theme.accent }]}>
                      {currentQ?.reference}
                    </Text>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.quizBottomActions}>
                {!isAnswerSubmitted ? (
                  <Pressable
                    disabled={selectedOption === null}
                    onPress={handleSubmitAnswer}
                    style={[
                      styles.submitBtn,
                      {
                        backgroundColor: theme.accent,
                        opacity: selectedOption === null ? 0.4 : 1,
                      },
                    ]}>
                    <Text style={styles.submitBtnText}>Check Answer</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={handleNextQuestion}
                    style={[
                      styles.submitBtn,
                      { backgroundColor: theme.accent },
                    ]}>
                    <Text style={styles.submitBtnText}>
                      {currentIdx < activeQuestions.length - 1
                        ? 'Next Question →'
                        : 'View Quiz Results'}
                    </Text>
                  </Pressable>
                )}
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 22,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -4,
  },
  kicker: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  yearPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  yearPillText: {
    fontSize: 11,
    fontWeight: '700',
  },

  /* Section Structure */
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  /* Config Card */
  configCard: {
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 14,
  },
  configGroup: {
    gap: 8,
  },
  configLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.9,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  pillBtnFlex: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  pillBtnText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  configDivider: {
    height: 1,
  },
  startQuizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: Radius.sm,
    marginTop: 4,
  },
  startQuizBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Practice History Card */
  historyCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 10,
  },
  historyLeft: {
    flex: 1,
    gap: 3,
  },
  historyTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  diffBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  diffBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  historyDate: {
    fontSize: 11,
  },
  historyTopic: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  scoreBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  scoreBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  scoreDetail: {
    fontSize: 10.5,
  },
  historyDivider: {
    height: 1,
    marginHorizontal: 16,
  },

  /* Modal Styles */
  modalSafe: {
    flex: 1,
  },
  quizTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  quizCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizTopCenter: {
    alignItems: 'center',
    gap: 2,
  },
  quizAreaLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  quizCounter: {
    fontSize: 11.5,
  },
  dummySpace: {
    width: 36,
  },
  quizTrack: {
    height: 4,
    width: '100%',
  },
  quizFill: {
    height: '100%',
  },
  quizContent: {
    padding: 20,
    gap: 16,
  },
  questionCard: {
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  questionText: {
    fontSize: 15.5,
    fontWeight: '700',
    lineHeight: 22,
  },
  optionsList: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 12,
  },
  optionIndexPill: {
    width: 26,
    height: 26,
    borderRadius: Radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  optionIndexText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  optionText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    lineHeight: 18,
  },
  explanationCard: {
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 10,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  explanationKicker: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.9,
  },
  explanationBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  refRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 2,
  },
  refLabel: {
    fontSize: 10.5,
  },
  refValue: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  quizBottomActions: {
    marginTop: 6,
    marginBottom: 20,
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },

  /* Results Card */
  resultsContainer: {
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
  resultTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1.5,
    lineHeight: 52,
  },
  resultSub: {
    fontSize: 13,
    textAlign: 'center',
  },
  resultDivider: {
    height: 1,
    width: '100%',
    marginVertical: 6,
  },
  retakeBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: Radius.sm,
  },
  retakeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  doneBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
