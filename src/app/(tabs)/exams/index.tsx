import { useRouter } from 'expo-router';
import {
  Award,
  Compass,
  Landmark,
  PenTool,
  Trophy,
  Zap,
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

export const MODULAR_TESTS = [
  {
    id: 'area-1',
    title: 'Area 1',
    subtitle: 'History & Theory',
    itemsCount: '50 Questions',
    icon: Landmark,
    gradient: ['#E58368', '#C85A32'] as [string, string],
  },
  {
    id: 'area-2',
    title: 'Area 2',
    subtitle: 'Utilities & Tech',
    itemsCount: '50 Questions',
    icon: Compass,
    gradient: ['#FBBF24', '#D97706'] as [string, string],
  },
  {
    id: 'area-3',
    title: 'Area 3',
    subtitle: 'Design & Laws',
    itemsCount: '50 Questions',
    icon: PenTool,
    gradient: ['#34D399', '#059669'] as [string, string],
  },
  {
    id: 'all-modular',
    title: 'Full Drill',
    subtitle: 'All Subjects',
    itemsCount: '100 Questions',
    icon: Zap,
    gradient: ['#A78BFA', '#7C3AED'] as [string, string],
  },
];

export const MOCK_SIMULATIONS = [
  {
    id: 'mock-day-1',
    title: 'Day 1 Mock Exam',
    itemsCount: '200 Items • 6h',
    icon: Trophy,
    gradient: ['#38BDF8', '#0284C7'] as [string, string],
  },
  {
    id: 'mock-day-2',
    title: 'Day 2 Design Exam',
    itemsCount: 'Design Problem • 6h',
    icon: Award,
    gradient: ['#FB7185', '#E11D48'] as [string, string],
  },
];

/* Bento Squircle Gradient Icon */
function BentoGradientIcon({
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
  const gradId = `bento_exam_${startColor.replace(/[^a-zA-Z0-9]/g, '')}_${endColor.replace(/[^a-zA-Z0-9]/g, '')}_${size}`;

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
      <IconComponent size={Math.round(size * 0.48)} color="#FFFFFF" strokeWidth={2.4} />
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
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
          Exams
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 90 },
        ]}>
        {/* ═════════════════════════════════════════════════════════════════════
            SECTION 1: MODULAR TESTS (2-Column Bento Grid)
           ═════════════════════════════════════════════════════════════════════ */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
            MODULAR TESTS
          </Text>

          <View style={styles.bentoGrid}>
            {MODULAR_TESTS.map((test) => {
              const IconComp = test.icon;
              return (
                <Pressable
                  key={test.id}
                  onPress={() => handleSelectExam(test.id)}
                  style={({ pressed }) => [
                    styles.bentoCard,
                    {
                      backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
                      opacity: pressed ? 0.88 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}>
                  {/* Centered Large Gradient Icon */}
                  <BentoGradientIcon
                    icon={IconComp}
                    colors={test.gradient}
                    size={56}
                    borderRadius={18}
                  />

                  {/* Title & Subtitle */}
                  <View style={styles.bentoInfo}>
                    <Text
                      numberOfLines={1}
                      style={[styles.bentoTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
                      {test.title}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.bentoSubtitle, { color: colors.textSecondary }]}>
                      {test.subtitle}
                    </Text>
                  </View>

                  {/* Card Count Pill */}
                  <View
                    style={[
                      styles.bentoCountPill,
                      {
                        backgroundColor: isDark
                          ? 'rgba(224, 122, 95, 0.18)'
                          : '#F8EAE4',
                      },
                    ]}>
                    <Text style={[styles.bentoCountText, { color: colors.accent }]}>
                      {test.itemsCount}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ═════════════════════════════════════════════════════════════════════
            SECTION 2: MOCK SIMULATIONS (2-Column Bento Grid)
           ═════════════════════════════════════════════════════════════════════ */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
            MOCK SIMULATIONS
          </Text>

          <View style={styles.bentoGrid}>
            {MOCK_SIMULATIONS.map((mock) => {
              const IconComp = mock.icon;
              return (
                <Pressable
                  key={mock.id}
                  onPress={() => handleSelectExam(mock.id)}
                  style={({ pressed }) => [
                    styles.bentoCard,
                    {
                      backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
                      opacity: pressed ? 0.88 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}>
                  {/* Centered Large Gradient Icon */}
                  <BentoGradientIcon
                    icon={IconComp}
                    colors={mock.gradient}
                    size={56}
                    borderRadius={18}
                  />

                  {/* Title */}
                  <Text
                    numberOfLines={1}
                    style={[styles.bentoTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
                    {mock.title}
                  </Text>

                  {/* Meta Pill */}
                  <View
                    style={[
                      styles.bentoCountPill,
                      {
                        backgroundColor: isDark ? '#23262F' : '#FFFFFF',
                      },
                    ]}>
                    <Text style={[styles.bentoCountText, { color: colors.textSecondary }]}>
                      {mock.itemsCount}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
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
    paddingTop: 10,
    paddingBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  contentContainer: {
    paddingHorizontal: 16,
    gap: 20,
    paddingTop: 4,
  },
  section: {
    gap: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
    paddingHorizontal: 4,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bentoCard: {
    width: '48%',
    borderRadius: 22,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 156,
  },
  bentoInfo: {
    alignItems: 'center',
    gap: 2,
    width: '100%',
  },
  bentoTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  bentoSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    textAlign: 'center',
  },
  bentoCountPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bentoCountText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
