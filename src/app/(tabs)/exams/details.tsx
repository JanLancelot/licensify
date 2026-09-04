import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle,
  Compass,
  Landmark,
  PenTool,
  Play,
  ShieldCheck,
  Timer,
  Trophy,
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
import Svg, {
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { useAppTheme } from '@/context/theme-context';
import { useLocalQuizWithQuestions } from '@/hooks/useLocalData';

/* Gradient Squircle Icon */
function ExamDetailGradientIcon({
  icon: IconComponent,
  colors: [startColor, endColor],
  size = 56,
  borderRadius = 18,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  colors: [string, string];
  size?: number;
  borderRadius?: number;
}) {
  const gradId = `exam_det_${startColor.replace(/[^a-zA-Z0-9]/g, '')}_${endColor.replace(/[^a-zA-Z0-9]/g, '')}_${size}`;

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
      <IconComponent size={Math.round(size * 0.48)} color="#FFFFFF" strokeWidth={2.3} />
    </View>
  );
}

export default function ExamDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const examId = id || 'area-1';
  const { quiz, questions } = useLocalQuizWithQuestions(examId);

  const getExamMetadata = () => {
    const totalItems = `${questions.length > 0 ? questions.length : 50} Questions`;
    const title = quiz?.title || 'Board Exam Simulation';
    const subtitle = quiz?.description || 'Standard Board Examination Simulation';
    const durationMin = quiz?.timeLimitSeconds ? Math.round(quiz.timeLimitSeconds / 60) : 90;
    const durationHours = (durationMin / 60).toFixed(1).replace('.0', '');
    const duration = `${durationHours} Hours (${durationMin} Mins)`;
    const passing = `${quiz?.passingScore || 70}% Passing GWA`;

    let Icon = Landmark;
    let gradient: [string, string] = colors.accentGradient;

    const lower = (quiz?.title || '').toLowerCase();
    if (lower.includes('area 2') || lower.includes('structural') || lower.includes('utilities')) {
      Icon = Compass;
      gradient = ['#FBBF24', '#D97706'];
    } else if (lower.includes('area 3') || lower.includes('design') || lower.includes('planning') || lower.includes('zoning')) {
      Icon = PenTool;
      gradient = ['#34D399', '#059669'];
    } else if (lower.includes('mock') || lower.includes('comprehensive')) {
      Icon = Trophy;
      gradient = ['#38BDF8', '#0284C7'];
    }

    return {
      title,
      subtitle,
      icon: Icon,
      gradient,
      duration,
      items: totalItems,
      passing,
    };
  };

  const examMeta = getExamMetadata();
  const IconComp = examMeta.icon;

  const handleStartSession = () => {
    router.push({
      pathname: '/(tabs)/exams/session' as any,
      params: { id: examId },
    });
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
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
          <Text style={[styles.headerTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
            Board Exam Briefing
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 80 },
        ]}>
        {/* 2. Hero Overview Card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
            },
          ]}>
          <ExamDetailGradientIcon
            icon={IconComp}
            colors={examMeta.gradient}
            size={58}
            borderRadius={20}
          />

          <View style={styles.heroInfo}>
            <Text style={[styles.examHeading, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
              {examMeta.title}
            </Text>
            <Text style={[styles.examSubtext, { color: colors.textSecondary }]}>
              {examMeta.subtitle}
            </Text>
          </View>

          {/* Quick Stats Badges Row */}
          <View style={styles.pillsRow}>
            <View
              style={[
                styles.statPill,
                { backgroundColor: isDark ? '#23262F' : '#FFFFFF' },
              ]}>
              <Timer size={14} color={colors.accent} strokeWidth={2.2} />
              <Text style={[styles.statPillText, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
                {examMeta.duration}
              </Text>
            </View>

            <View
              style={[
                styles.statPill,
                { backgroundColor: isDark ? '#23262F' : '#FFFFFF' },
              ]}>
              <CheckCircle size={14} color={colors.accent} strokeWidth={2.2} />
              <Text style={[styles.statPillText, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
                {examMeta.items}
              </Text>
            </View>

            <View
              style={[
                styles.statPill,
                { backgroundColor: isDark ? '#23262F' : '#FFFFFF' },
              ]}>
              <ShieldCheck size={14} color={colors.accent} strokeWidth={2.2} />
              <Text style={[styles.statPillText, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
                {examMeta.passing}
              </Text>
            </View>
          </View>
        </View>

        {/* 3. Guidelines & Rules Card */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
            EXAM GUIDELINES
          </Text>

          <View
            style={[
              styles.guidelineCard,
              {
                backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
              },
            ]}>
            <View style={styles.ruleItem}>
              <View
                style={[
                  styles.ruleBullet,
                  { backgroundColor: colors.accent },
                ]}
              />
              <Text style={[styles.ruleText, { color: isDark ? '#E2E8F0' : '#1E293B' }]}>
                Each question has 4 multiple-choice options (A, B, C, D) with exactly one correct answer.
              </Text>
            </View>

            <View style={styles.ruleItem}>
              <View
                style={[
                  styles.ruleBullet,
                  { backgroundColor: colors.accent },
                ]}
              />
              <Text style={[styles.ruleText, { color: isDark ? '#E2E8F0' : '#1E293B' }]}>
                You can flag items for review and navigate back and forth freely before final submission.
              </Text>
            </View>

            <View style={styles.ruleItem}>
              <View
                style={[
                  styles.ruleBullet,
                  { backgroundColor: colors.accent },
                ]}
              />
              <Text style={[styles.ruleText, { color: isDark ? '#E2E8F0' : '#1E293B' }]}>
                Timer runs continuously once started. Complete answers are graded instantly upon finish.
              </Text>
            </View>
          </View>
        </View>

        {/* 4. Start Button */}
        <Pressable
          onPress={handleStartSession}
          style={({ pressed }) => [
            styles.startBtn,
            {
              backgroundColor: colors.accent,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.985 : 1 }],
            },
          ]}>
          <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.startBtnText}>Start Examination</Text>
        </Pressable>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 14,
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 18,
  },
  heroCard: {
    padding: 20,
    borderRadius: 24,
    gap: 14,
    alignItems: 'flex-start',
  },
  heroInfo: {
    gap: 4,
  },
  examHeading: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 25,
  },
  examSubtext: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  statPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    paddingHorizontal: 4,
  },
  guidelineCard: {
    padding: 18,
    borderRadius: 22,
    gap: 14,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  ruleBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  ruleText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: '400',
  },
  startBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
