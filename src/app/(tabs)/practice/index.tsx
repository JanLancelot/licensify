import { useRouter } from 'expo-router';
import {
  CheckCircle2,
  Clock,
  Play,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Radius } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

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

function GradientIconBox({
  colors: [startColor, endColor],
  size = 46,
  borderRadius = 14,
  children,
}: {
  colors: [string, string];
  size?: number;
  borderRadius?: number;
  children: React.ReactNode;
}) {
  const gradId = `grad_${startColor.replace(/[^a-zA-Z0-9]/g, '')}_${endColor.replace(/[^a-zA-Z0-9]/g, '')}_${size}`;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={startColor} />
            <Stop offset="100%" stopColor={endColor} />
          </LinearGradient>
        </Defs>
        <Rect
          width={size}
          height={size}
          rx={borderRadius}
          fill={`url(#${gradId})`}
        />
      </Svg>
      {children}
    </View>
  );
}

export default function PracticeScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Launcher State
  const [selectedArea, setSelectedArea] = useState<SubjectArea>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [selectedCount, setSelectedCount] = useState<QuestionCount>(10);

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
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* 1. Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
          Practice
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 90 },
        ]}>
        {/* SECTION 1: CONFIGURE QUIZ (Flat card, no borders, no shadows) */}
        <View style={styles.section}>
          <View
            style={[
              styles.configCard,
              {
                backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
              },
            ]}>
            {/* 1. Subject / Topic Selection */}
            <View style={styles.configGroup}>
              <Text
                style={[
                  styles.configLabel,
                  { color: isDark ? '#E07A5F' : '#A23F1C' },
                ]}>
                SELECT SUBJECT AREA
              </Text>
              <View style={styles.pillsRow}>
                {[
                  { key: 'all', label: 'All Subjects' },
                  { key: 'area-1', label: 'Area 1: History' },
                  { key: 'area-2', label: 'Area 2: Structures' },
                  { key: 'area-3', label: 'Area 3: Design & Laws' },
                ].map((item) => {
                  const isSelected = selectedArea === item.key;
                  return (
                    <Pressable
                      key={item.key}
                      onPress={() => setSelectedArea(item.key as SubjectArea)}
                      style={[
                        styles.pillBtn,
                        {
                          backgroundColor: isSelected
                            ? colors.accent
                            : isDark
                              ? '#272B35'
                              : '#EBE2DC',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.pillBtnText,
                          {
                            color: isSelected ? '#FFFFFF' : colors.text,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 2. Difficulty Level */}
            <View style={styles.configGroup}>
              <Text
                style={[
                  styles.configLabel,
                  { color: isDark ? '#E07A5F' : '#A23F1C' },
                ]}>
                DIFFICULTY LEVEL
              </Text>
              <View style={styles.pillsRow}>
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => {
                  const isSelected = selectedDifficulty === level;
                  return (
                    <Pressable
                      key={level}
                      onPress={() => setSelectedDifficulty(level)}
                      style={[
                        styles.pillBtnFlex,
                        {
                          backgroundColor: isSelected
                            ? colors.accent
                            : isDark
                              ? '#272B35'
                              : '#EBE2DC',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.pillBtnText,
                          {
                            color: isSelected ? '#FFFFFF' : colors.text,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}>
                        {level.toUpperCase()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 3. Question Count */}
            <View style={styles.configGroup}>
              <Text
                style={[
                  styles.configLabel,
                  { color: isDark ? '#E07A5F' : '#A23F1C' },
                ]}>
                QUESTION COUNT
              </Text>
              <View style={styles.pillsRow}>
                {([5, 10, 20] as QuestionCount[]).map((count) => {
                  const isSelected = selectedCount === count;
                  return (
                    <Pressable
                      key={count}
                      onPress={() => setSelectedCount(count)}
                      style={[
                        styles.pillBtnFlex,
                        {
                          backgroundColor: isSelected
                            ? colors.accent
                            : isDark
                              ? '#272B35'
                              : '#EBE2DC',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.pillBtnText,
                          {
                            color: isSelected ? '#FFFFFF' : colors.text,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}>
                        {count} Qs
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Start Quiz CTA with Terracotta Gradient */}
            <Pressable
              onPress={handleStartQuiz}
              style={({ pressed }) => [
                styles.startQuizBtn,
                {
                  opacity: pressed ? 0.88 : 1,
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                },
              ]}>
              <View style={StyleSheet.absoluteFill}>
                <Svg width="100%" height="100%">
                  <Defs>
                    <LinearGradient id="ctaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor="#E58368" />
                      <Stop offset="100%" stopColor="#C85A32" />
                    </LinearGradient>
                  </Defs>
                  <Rect width="100%" height="100%" rx={16} fill="url(#ctaGrad)" />
                </Svg>
              </View>
              <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.startQuizBtnText}>Start Practice Drill</Text>
            </Pressable>
          </View>
        </View>

        {/* SECTION 2: PRACTICE HISTORY */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            Recent Practice Drills
          </Text>

          <View style={styles.historyList}>
            {PAST_HISTORY.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.historyCard,
                  {
                    backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
                  },
                ]}>
                <GradientIconBox
                  colors={
                    item.score === '90%'
                      ? ['#34D399', '#059669']
                      : ['#FBBF24', '#D97706']
                  }
                  size={44}
                  borderRadius={13}>
                  <Zap size={22} color="#FFFFFF" strokeWidth={2.2} />
                </GradientIconBox>

                <View style={styles.historyInfo}>
                  <Text
                    style={[styles.historyTopic, { color: colors.text }]}
                    numberOfLines={1}>
                    {item.topic}
                  </Text>
                  <Text
                    style={[styles.historyMeta, { color: colors.textSecondary }]}>
                    {item.difficulty} • {item.date}
                  </Text>
                </View>

                <View style={styles.historyScoreBox}>
                  <Text
                    style={[styles.historyScoreText, { color: colors.accent }]}>
                    {item.score}
                  </Text>
                  <Text
                    style={[
                      styles.historyScoreSub,
                      { color: colors.textSecondary },
                    ]}>
                    {item.scoreDetail}
                  </Text>
                </View>
              </View>
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
    paddingTop: 8,
    gap: 18,
  },

  /* Header */
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  /* Section Structure */
  section: {
    gap: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  /* Config Card (Flat, No borders, No shadows) */
  configCard: {
    borderRadius: 20,
    padding: 18,
    gap: 16,
  },
  configGroup: {
    gap: 8,
  },
  configLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  pillBtnFlex: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  pillBtnText: {
    fontSize: 12.5,
  },

  /* CTA Button */
  startQuizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 16,
    marginTop: 4,
    overflow: 'hidden',
  },
  startQuizBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* History Cards */
  historyList: {
    gap: 10,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    gap: 12,
  },
  historyInfo: {
    flex: 1,
    gap: 3,
  },
  historyTopic: {
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  historyMeta: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  historyScoreBox: {
    alignItems: 'flex-end',
    gap: 2,
  },
  historyScoreText: {
    fontSize: 14,
    fontWeight: '800',
  },
  historyScoreSub: {
    fontSize: 11,
  },
});
