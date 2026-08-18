import { useRouter } from 'expo-router';
import {
  Award,
  ChevronRight,
  Clock,
  FileCheck2,
  Layers,
  ShieldAlert,
  ShieldCheck,
  Target,
} from 'lucide-react-native';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useAppTheme } from '@/context/theme-context';

export const PRACTICE_TESTS = [
  {
    id: 'area-1',
    area: 'Area 1 • 30% Weight',
    title: 'History, Theory, Planning & Laws',
    description:
      'History of Architecture, Theory of Design, Urban Planning & RA 9266.',
    itemsCount: '50 Items',
    timeLimit: '1.5 Hours',
    passingRate: 'Passing: 70%',
    status: 'Score: 84% • Passed',
    statusType: 'passed',
    gradient: ['#E58368', '#C85A32'] as [string, string],
  },
  {
    id: 'area-2',
    area: 'Area 2 • 30% Weight',
    title: 'Structural, Utilities & Building Materials',
    description:
      'Structural Conceptualization, Building Technology, MEPFS Systems & Estimation.',
    itemsCount: '50 Items',
    timeLimit: '1.5 Hours',
    passingRate: 'Passing: 70%',
    status: 'Ready to Start',
    statusType: 'ready',
    gradient: ['#FBBF24', '#D97706'] as [string, string],
  },
  {
    id: 'area-3',
    area: 'Area 3 • 40% Weight',
    title: 'Architectural Design & Site Planning',
    description:
      'Design scenarios, space programming, site planning, & NBCP Rule 7 & 8.',
    itemsCount: '50 Items',
    timeLimit: '2.0 Hours',
    passingRate: 'Passing: 70%',
    status: 'Ready to Start',
    statusType: 'ready',
    gradient: ['#34D399', '#059669'] as [string, string],
  },
];

export const MOCK_TESTS = [
  {
    id: 'mock-day-1',
    badge: 'Official Simulation',
    title: 'ALE Day 1 Mock Board Exam',
    description:
      'Part 1: History & Planning (100 Qs) + Part 2: Structural & Utilities (100 Qs).',
    itemsCount: '200 Items',
    timeLimit: '6.0 Hours',
    passingRate: 'Passing: 70% GWA',
    gradient: ['#60A5FA', '#2563EB'] as [string, string],
  },
  {
    id: 'mock-day-2',
    badge: 'Design Problem',
    title: 'ALE Day 2 Design & Site Planning',
    description:
      'Comprehensive design scenario, zoning compliance, & computations.',
    itemsCount: 'Design Scenario',
    timeLimit: '6.0 Hours',
    passingRate: 'Passing: 70% GWA',
    gradient: ['#F472B6', '#BE185D'] as [string, string],
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

export default function ExamsSelectionScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleSelectExam = (id: string) => {
    router.push({
      pathname: '/(tabs)/exams/details' as any,
      params: { id },
    });
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* 1. Header */}
      <View style={styles.header}>
        <View style={styles.headerTexts}>
          <Text style={[styles.title, { color: colors.text }]}>
            Exams
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Modular tests & full ALE board simulations
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 90 },
        ]}>
        {/* BLOCK 1: MODULAR PRACTICE TESTS */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            Modular Practice Tests
          </Text>

          <View style={styles.cardsList}>
            {PRACTICE_TESTS.map((test) => (
              <Pressable
                key={test.id}
                onPress={() => handleSelectExam(test.id)}
                style={({ pressed }) => [
                  styles.examCard,
                  {
                    backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
                    opacity: pressed ? 0.88 : 1,
                    transform: [{ scale: pressed ? 0.985 : 1 }],
                  },
                ]}>
                <GradientIconBox
                  colors={test.gradient}
                  size={48}
                  borderRadius={14}>
                  <Target size={24} color="#FFFFFF" strokeWidth={2.2} />
                </GradientIconBox>

                <View style={styles.examCardInfo}>
                  <View style={styles.tagRow}>
                    <Text style={[styles.areaTagText, { color: colors.accent }]}>
                      {test.area}
                    </Text>
                    <Text style={[styles.dotText, { color: colors.textSecondary }]}>
                      •
                    </Text>
                    <Text
                      style={[styles.timeText, { color: colors.textSecondary }]}>
                      {test.itemsCount}
                    </Text>
                  </View>

                  <Text
                    style={[styles.examCardTitle, { color: colors.text }]}
                    numberOfLines={1}>
                    {test.title}
                  </Text>

                  <Text
                    style={[styles.examCardDesc, { color: colors.textSecondary }]}
                    numberOfLines={1}>
                    {test.description}
                  </Text>
                </View>

                <ChevronRight
                  size={18}
                  color={colors.textSecondary}
                  strokeWidth={2.2}
                />
              </Pressable>
            ))}
          </View>
        </View>

        {/* BLOCK 2: MOCK BOARD EXAMS */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            Full Mock Simulations
          </Text>

          <View style={styles.cardsList}>
            {MOCK_TESTS.map((test) => (
              <Pressable
                key={test.id}
                onPress={() => handleSelectExam(test.id)}
                style={({ pressed }) => [
                  styles.examCard,
                  {
                    backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
                    opacity: pressed ? 0.88 : 1,
                    transform: [{ scale: pressed ? 0.985 : 1 }],
                  },
                ]}>
                <GradientIconBox
                  colors={test.gradient}
                  size={48}
                  borderRadius={14}>
                  <Award size={24} color="#FFFFFF" strokeWidth={2.2} />
                </GradientIconBox>

                <View style={styles.examCardInfo}>
                  <View style={styles.tagRow}>
                    <Text
                      style={[
                        styles.badgeTagText,
                        { color: isDark ? '#60A5FA' : '#2563EB' },
                      ]}>
                      {test.badge}
                    </Text>
                    <Text style={[styles.dotText, { color: colors.textSecondary }]}>
                      •
                    </Text>
                    <Text
                      style={[styles.timeText, { color: colors.textSecondary }]}>
                      {test.itemsCount} ({test.timeLimit})
                    </Text>
                  </View>

                  <Text
                    style={[styles.examCardTitle, { color: colors.text }]}
                    numberOfLines={1}>
                    {test.title}
                  </Text>

                  <Text
                    style={[styles.examCardDesc, { color: colors.textSecondary }]}
                    numberOfLines={1}>
                    {test.description}
                  </Text>
                </View>

                <ChevronRight
                  size={18}
                  color={colors.textSecondary}
                  strokeWidth={2.2}
                />
              </Pressable>
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
    gap: 20,
  },

  /* Header */
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTexts: {
    gap: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
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
  cardsList: {
    gap: 10,
  },
  examCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    gap: 14,
  },
  examCardInfo: {
    flex: 1,
    gap: 3,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  areaTagText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  badgeTagText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  dotText: {
    fontSize: 12,
  },
  timeText: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  examCardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  examCardDesc: {
    fontSize: 12,
    fontWeight: '500',
  },
});
