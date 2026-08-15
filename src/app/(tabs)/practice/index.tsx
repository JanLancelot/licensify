import React, { useState } from 'react';
import {
  Play,
} from 'lucide-react-native';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { Radius } from '@/constants/theme';

type SubjectArea = 'all' | 'area-1' | 'area-2' | 'area-3';
type Difficulty = 'easy' | 'medium' | 'hard';
type QuestionCount = 5 | 10 | 20;

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
  const router = useRouter();

  // Launcher State
  const [selectedArea, setSelectedArea] = useState<SubjectArea>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [selectedCount, setSelectedCount] = useState<QuestionCount>(5);

  const handleStartQuiz = () => {
    router.push({
      pathname: '/(tabs)/practice/quiz' as any,
      params: {
        area: selectedArea,
        difficulty: selectedDifficulty,
        count: String(selectedCount),
      },
    });
  };

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
              onPress={handleStartQuiz}
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
});
