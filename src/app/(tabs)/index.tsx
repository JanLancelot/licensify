import { useRouter } from 'expo-router';
import {
  Award,
  BookOpen,
  Building2,
  ChevronRight,
  ClipboardList,
  FileText,
  Layers,
  User,
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

import { Radius } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

/* Reusable Gradient Squircle / Circle Container */
function GradientIconBox({
  colors: [startColor, endColor],
  size = 54,
  borderRadius = 16,
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

export default function HomeScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* 1. Header */}
      <View style={styles.header}>
        <View style={styles.headerTexts}>
          <Text style={[styles.headerGreeting, { color: colors.text }]}>
            Good morning, Alex!
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Keep going, future architect.
          </Text>
        </View>

        <Pressable
          onPress={() => router.push('/(tabs)/profile' as any)}
          style={({ pressed }) => [
            styles.avatarButton,
            { opacity: pressed ? 0.8 : 1 },
          ]}>
          <GradientIconBox
            colors={['#E07A5F', '#C85A32']}
            size={40}
            borderRadius={20}>
            <User size={20} color="#FFFFFF" strokeWidth={2.2} />
          </GradientIconBox>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 90 },
        ]}>
        {/* 2. Light Terracotta Hero Progress Card with Right Icon */}
        <View
          style={[
            styles.progressHeroCard,
            {
              backgroundColor: isDark ? '#2B1D19' : '#F8EBE5',
            },
          ]}>
          {/* Left Column: Progress details */}
          <View style={styles.progressHeroLeft}>
            <Text
              style={[
                styles.progressHeroLabel,
                { color: isDark ? '#F4A261' : '#B84922' },
              ]}>
              YOUR PROGRESS
            </Text>
            <Text
              style={[
                styles.progressHeroPercentage,
                { color: isDark ? '#FFFFFF' : '#2D120B' },
              ]}>
              72%
            </Text>
            <Text
              style={[
                styles.progressHeroMotivation,
                { color: isDark ? '#E07A5F' : '#A23F1C' },
              ]}>
              You're doing great!
            </Text>

            {/* Progress Bar */}
            <View
              style={[
                styles.progressBarTrack,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.12)'
                    : '#EAD5CC',
                },
              ]}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: '72%', backgroundColor: colors.accent },
                ]}
              />
            </View>
          </View>

          {/* Right Column: Gradient Award Icon */}
          <View style={styles.progressHeroRight}>
            <GradientIconBox
              colors={['#E58368', '#C85A32']}
              size={68}
              borderRadius={34}>
              <Award size={34} color="#FFFFFF" strokeWidth={2.2} />
            </GradientIconBox>
          </View>
        </View>

        {/* 3. Bento 2x2 Grid with Bigger Gradient Icons */}
        <View style={styles.bentoGrid}>
          {/* Row 1 */}
          <View style={styles.bentoGridRow}>
            {/* 1. Review (Learn) */}
            <Pressable
              onPress={() => router.push('/(tabs)/learn' as any)}
              style={({ pressed }) => [
                styles.bentoTile,
                {
                  backgroundColor: isDark ? '#261C19' : '#FDF4F0',
                  opacity: pressed ? 0.88 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}>
              <GradientIconBox
                colors={['#E58368', '#C85A32']}
                size={50}
                borderRadius={15}>
                <BookOpen size={26} color="#FFFFFF" strokeWidth={2.2} />
              </GradientIconBox>

              <View style={styles.bentoTileBottom}>
                <Text
                  style={[
                    styles.bentoTileTitle,
                    { color: isDark ? '#F9FAFB' : '#1C1917' },
                  ]}>
                  Review
                </Text>
                <ChevronRight
                  size={19}
                  color={colors.accent}
                  strokeWidth={2.4}
                />
              </View>
            </Pressable>

            {/* 2. Flashcards */}
            <Pressable
              onPress={() => router.push('/(tabs)/practice/flashcards' as any)}
              style={({ pressed }) => [
                styles.bentoTile,
                {
                  backgroundColor: isDark ? '#281E15' : '#FEF8EE',
                  opacity: pressed ? 0.88 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}>
              <GradientIconBox
                colors={['#FBBF24', '#D97706']}
                size={50}
                borderRadius={15}>
                <Layers size={26} color="#FFFFFF" strokeWidth={2.2} />
              </GradientIconBox>

              <View style={styles.bentoTileBottom}>
                <Text
                  style={[
                    styles.bentoTileTitle,
                    { color: isDark ? '#F9FAFB' : '#1C1917' },
                  ]}>
                  Flashcards
                </Text>
                <ChevronRight size={19} color="#D97706" strokeWidth={2.4} />
              </View>
            </Pressable>
          </View>

          {/* Row 2 */}
          <View style={styles.bentoGridRow}>
            {/* 3. Practice Quiz */}
            <Pressable
              onPress={() => router.push('/(tabs)/practice/quiz' as any)}
              style={({ pressed }) => [
                styles.bentoTile,
                {
                  backgroundColor: isDark ? '#17261D' : '#F0F8F3',
                  opacity: pressed ? 0.88 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}>
              <GradientIconBox
                colors={['#34D399', '#059669']}
                size={50}
                borderRadius={15}>
                <ClipboardList size={26} color="#FFFFFF" strokeWidth={2.2} />
              </GradientIconBox>

              <View style={styles.bentoTileBottom}>
                <Text
                  style={[
                    styles.bentoTileTitle,
                    { color: isDark ? '#F9FAFB' : '#1C1917' },
                  ]}>
                  Practice Quiz
                </Text>
                <ChevronRight size={19} color="#059669" strokeWidth={2.4} />
              </View>
            </Pressable>

            {/* 4. Mock Exam */}
            <Pressable
              onPress={() => router.push('/(tabs)/exams' as any)}
              style={({ pressed }) => [
                styles.bentoTile,
                {
                  backgroundColor: isDark ? '#261A23' : '#F9F1F6',
                  opacity: pressed ? 0.88 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}>
              <GradientIconBox
                colors={['#F472B6', '#BE185D']}
                size={50}
                borderRadius={15}>
                <FileText size={26} color="#FFFFFF" strokeWidth={2.2} />
              </GradientIconBox>

              <View style={styles.bentoTileBottom}>
                <Text
                  style={[
                    styles.bentoTileTitle,
                    { color: isDark ? '#F9FAFB' : '#1C1917' },
                  ]}>
                  Mock Exam
                </Text>
                <ChevronRight size={19} color="#BE185D" strokeWidth={2.4} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* 4. Continue Learning (Clean, Flat with Gradient Icon) */}
        <View style={styles.continueSection}>
          <View style={styles.continueSectionHeader}>
            <Text style={[styles.continueSectionTitle, { color: colors.text }]}>
              Continue Learning
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/learn' as any)}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <Text style={[styles.seeAllText, { color: colors.accent }]}>
                See all
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.push('/(tabs)/learn/building-tech' as any)}
            style={({ pressed }) => [
              styles.continueCard,
              {
                backgroundColor: colors.backgroundElement,
                opacity: pressed ? 0.88 : 1,
              },
            ]}>
            {/* Left Gradient Squircle Icon */}
            <GradientIconBox
              colors={['#E58368', '#C85A32']}
              size={50}
              borderRadius={15}>
              <Building2 size={26} color="#FFFFFF" strokeWidth={2.2} />
            </GradientIconBox>

            {/* Middle Title & Progress */}
            <View style={styles.continueCardBody}>
              <View style={styles.continueTitleRow}>
                <Text
                  style={[styles.continueCourseTitle, { color: colors.text }]}
                  numberOfLines={1}>
                  Structural Analysis
                </Text>
                <Text
                  style={[
                    styles.continuePercentageText,
                    { color: colors.accent },
                  ]}>
                  65%
                </Text>
              </View>

              <Text
                style={[
                  styles.continueCourseSubtitle,
                  { color: colors.textSecondary },
                ]}>
                Strength of Materials
              </Text>

              {/* Progress Line */}
              <View
                style={[
                  styles.continueProgressTrack,
                  { backgroundColor: colors.backgroundSelected },
                ]}>
                <View
                  style={[
                    styles.continueProgressFill,
                    { width: '65%', backgroundColor: colors.accent },
                  ]}
                />
              </View>
            </View>

            {/* Right Action Chevron */}
            <ChevronRight
              size={19}
              color={colors.textSecondary}
              strokeWidth={2.2}
            />
          </Pressable>
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
    gap: 16,
  },

  /* 1. Header */
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTexts: {
    gap: 2,
  },
  headerGreeting: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  avatarButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* 2. Hero Progress Card (Lighter Terracotta, No Outlines, No Shadows) */
  progressHeroCard: {
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressHeroLeft: {
    flex: 1,
    paddingRight: 14,
    gap: 2,
  },
  progressHeroLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  progressHeroPercentage: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 2,
    lineHeight: 42,
  },
  progressHeroMotivation: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 12,
  },
  progressBarTrack: {
    height: 6.5,
    borderRadius: Radius.full,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  progressHeroRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* 3. Bento 2x2 Grid (Flat, Bigger Gradient Icons) */
  bentoGrid: {
    gap: 12,
  },
  bentoGridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bentoTile: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    height: 126,
    justifyContent: 'space-between',
  },
  bentoTileBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  bentoTileTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  /* 4. Continue Learning (Flat, Clean) */
  continueSection: {
    gap: 10,
    marginTop: 2,
  },
  continueSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  continueSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    gap: 14,
  },
  continueCardBody: {
    flex: 1,
    gap: 3,
  },
  continueTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  continueCourseTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
    flex: 1,
    marginRight: 8,
  },
  continuePercentageText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  continueCourseSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  continueProgressTrack: {
    height: 4.5,
    borderRadius: Radius.full,
    overflow: 'hidden',
    width: '100%',
  },
  continueProgressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
