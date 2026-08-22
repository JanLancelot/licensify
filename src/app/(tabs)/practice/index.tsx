import { useRouter } from 'expo-router';
import {
  Award,
  BookOpen,
  Compass,
  Layers,
  Play,
  Zap,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/context/theme-context';

type SubjectArea = 'all' | 'area-1' | 'area-2' | 'area-3';
type Difficulty = 'easy' | 'medium' | 'hard';
type QuestionCount = 5 | 10 | 20;

// Subject Area Options with Pastel Badges
const SUBJECT_AREAS: {
  key: SubjectArea;
  title: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  bg: string;
  darkBg: string;
  iconColor: string;
}[] = [
  {
    key: 'all',
    title: 'All Subjects',
    icon: Layers,
    bg: '#EDE9FE',
    darkBg: 'rgba(139, 92, 246, 0.2)',
    iconColor: '#7C3AED',
  },
  {
    key: 'area-1',
    title: 'Area 1: History',
    icon: BookOpen,
    bg: '#FCE7F3',
    darkBg: 'rgba(236, 72, 153, 0.2)',
    iconColor: '#DB2777',
  },
  {
    key: 'area-2',
    title: 'Area 2: Tech',
    icon: Zap,
    bg: '#E0F2FE',
    darkBg: 'rgba(14, 165, 233, 0.2)',
    iconColor: '#0284C7',
  },
  {
    key: 'area-3',
    title: 'Area 3: Practice',
    icon: Compass,
    bg: '#FFEDD5',
    darkBg: 'rgba(249, 115, 22, 0.2)',
    iconColor: '#EA580C',
  },
];

const RECENT_DRILLS = [
  {
    id: 'h1',
    topic: 'NBCP Rule 7 & 8 Computations',
    score: '90%',
    isPassed: true,
    bg: '#D1FAE5',
    darkBg: 'rgba(16, 185, 129, 0.2)',
    iconColor: '#10B981',
  },
  {
    id: 'h2',
    topic: 'Classical Greek & Roman Orders',
    score: '80%',
    isPassed: true,
    bg: '#EDE9FE',
    darkBg: 'rgba(139, 92, 246, 0.2)',
    iconColor: '#7C3AED',
  },
  {
    id: 'h3',
    topic: 'Plumbing & Electrical Systems',
    score: '70%',
    isPassed: false,
    bg: '#FFEDD5',
    darkBg: 'rgba(249, 115, 22, 0.2)',
    iconColor: '#EA580C',
  },
  {
    id: 'h4',
    topic: 'Mixed Syllabus Quick Drill',
    score: '85%',
    isPassed: true,
    bg: '#E0F2FE',
    darkBg: 'rgba(14, 165, 233, 0.2)',
    iconColor: '#0284C7',
  },
];

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
      {/* 1. Standard Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Practice</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 90 },
        ]}>
        {/* 2. CONFIGURE DRILL CARD BOX */}
        <View
          style={[
            styles.cardBox,
            {
              backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            },
          ]}>
          {/* Section: Select Subject */}
          <View style={styles.configGroup}>
            <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>
              SUBJECT AREA
            </Text>

            <View style={styles.subjectGrid}>
              {SUBJECT_AREAS.map((item) => {
                const isSelected = selectedArea === item.key;
                const IconComp = item.icon;

                return (
                  <Pressable
                    key={item.key}
                    onPress={() => setSelectedArea(item.key)}
                    style={({ pressed }) => [
                      styles.subjectOptionBtn,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? 'rgba(224, 122, 95, 0.18)'
                            : '#F8EAE4'
                          : isDark
                            ? '#23262F'
                            : '#F8FAFC',
                        borderColor: isSelected
                          ? colors.accent
                          : isDark
                            ? 'rgba(255, 255, 255, 0.06)'
                            : 'rgba(0, 0, 0, 0.04)',
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}>
                    <View
                      style={[
                        styles.pastelIconBadge,
                        {
                          backgroundColor: isDark ? item.darkBg : item.bg,
                        },
                      ]}>
                      <IconComp size={16} color={item.iconColor} strokeWidth={2.3} />
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.subjectOptionText,
                        {
                          color: isSelected ? colors.accent : colors.text,
                          fontWeight: isSelected ? '700' : '600',
                        },
                      ]}>
                      {item.title}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Section: Difficulty */}
          <View style={styles.configGroup}>
            <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>
              DIFFICULTY
            </Text>
            <View style={styles.segmentedRow}>
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => {
                const isSelected = selectedDifficulty === level;
                return (
                  <Pressable
                    key={level}
                    onPress={() => setSelectedDifficulty(level)}
                    style={({ pressed }) => [
                      styles.segmentBtn,
                      {
                        backgroundColor: isSelected
                          ? colors.accent
                          : isDark
                            ? '#23262F'
                            : '#F8FAFC',
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.segmentBtnText,
                        {
                          color: isSelected ? '#FFFFFF' : colors.text,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Section: Questions Count */}
          <View style={styles.configGroup}>
            <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>
              QUESTIONS
            </Text>
            <View style={styles.segmentedRow}>
              {([5, 10, 20] as QuestionCount[]).map((count) => {
                const isSelected = selectedCount === count;
                return (
                  <Pressable
                    key={count}
                    onPress={() => setSelectedCount(count)}
                    style={({ pressed }) => [
                      styles.segmentBtn,
                      {
                        backgroundColor: isSelected
                          ? colors.accent
                          : isDark
                            ? '#23262F'
                            : '#F8FAFC',
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.segmentBtnText,
                        {
                          color: isSelected ? '#FFFFFF' : colors.text,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}>
                      {count} Questions
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Start Drill CTA Button */}
          <Pressable
            onPress={handleStartQuiz}
            style={({ pressed }) => [
              styles.startBtn,
              {
                backgroundColor: colors.accent,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              },
            ]}>
            <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.startBtnText}>Start Drill</Text>
          </Pressable>
        </View>

        {/* 3. RECENT DRILLS LIST (Matching reference design) */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Drills
          </Text>

          <View
            style={[
              styles.cardBoxGroup,
              {
                backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}>
            {RECENT_DRILLS.map((item, idx) => (
              <React.Fragment key={item.id}>
                <View style={styles.drillRow}>
                  {/* Pastel Icon Badge */}
                  <View
                    style={[
                      styles.drillIconBadge,
                      {
                        backgroundColor: isDark ? item.darkBg : item.bg,
                      },
                    ]}>
                    <Award size={18} color={item.iconColor} strokeWidth={2.2} />
                  </View>

                  {/* Drill Title */}
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.drillTitle,
                      { color: isDark ? '#F9FAFB' : '#111827' },
                    ]}>
                    {item.topic}
                  </Text>

                  {/* Score Tag */}
                  <View
                    style={[
                      styles.scoreTag,
                      {
                        backgroundColor: item.isPassed
                          ? isDark
                            ? 'rgba(16, 185, 129, 0.2)'
                            : '#D1FAE5'
                          : isDark
                            ? 'rgba(249, 115, 22, 0.2)'
                            : '#FFEDD5',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.scoreText,
                        { color: item.isPassed ? '#10B981' : '#F97316' },
                      ]}>
                      {item.score}
                    </Text>
                  </View>
                </View>

                {idx < RECENT_DRILLS.length - 1 && (
                  <View
                    style={[
                      styles.itemDivider,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255,255,255,0.06)'
                          : 'rgba(0,0,0,0.05)',
                      },
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 18,
  },
  cardBox: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      },
    }),
  },
  configGroup: {
    gap: 8,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectOptionBtn: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  pastelIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectOptionText: {
    fontSize: 13,
    flex: 1,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  segmentBtnText: {
    fontSize: 12.5,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    marginTop: 2,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionContainer: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    paddingHorizontal: 4,
  },
  cardBoxGroup: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
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
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      },
    }),
  },
  drillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  drillIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drillTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  scoreTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '800',
  },
  itemDivider: {
    height: 1,
  },
});
