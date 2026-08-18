import { useRouter } from 'expo-router';
import {
  BookOpen,
  ChevronRight,
  FileText,
  GraduationCap,
  Layers,
  Sparkles,
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

/* Reusable Gradient Squircle Container */
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

export default function LearnScreen() {
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
          <Text style={[styles.title, { color: colors.text }]}>
            Learn
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Master syllabus modules & active recall
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
        {/* 2. Main Study Action Cards (Flat, No borders, Gradient Icons) */}
        <View style={styles.blockContainer}>
          {/* BLOCK 1: COMPREHENSIVE NOTES */}
          <Pressable
            onPress={() => router.push('/(tabs)/learn/notes' as any)}
            style={({ pressed }) => [
              styles.cardBlock,
              {
                backgroundColor: isDark ? '#261C19' : '#FDF4F0',
                opacity: pressed ? 0.88 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}>
            <View style={styles.cardTopRow}>
              <GradientIconBox
                colors={['#E58368', '#C85A32']}
                size={54}
                borderRadius={16}>
                <BookOpen size={26} color="#FFFFFF" strokeWidth={2.2} />
              </GradientIconBox>

              <View style={styles.cardTextBox}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Comprehensive Notes
                </Text>
                <Text
                  style={[styles.cardDescription, { color: colors.textSecondary }]}>
                  Curriculum notes, building laws (PD 1096, BP 220), & formulas
                </Text>
              </View>
            </View>

            {/* Bottom Row */}
            <View style={styles.cardBottomRow}>
              <View style={styles.bottomLeftRow}>
                <FileText size={14} color={colors.accent} strokeWidth={2} />
                <Text style={[styles.bottomCountText, { color: colors.text }]}>
                  9 Subjects
                </Text>
                <Text style={[styles.bottomDot, { color: colors.textSecondary }]}>
                  •
                </Text>
                <Text style={[styles.bottomSubCount, { color: colors.textSecondary }]}>
                  120+ Lessons
                </Text>
              </View>

              <View
                style={[
                  styles.chevronCircle,
                  { backgroundColor: isDark ? '#3D2822' : '#F8DDD3' },
                ]}>
                <ChevronRight size={16} color={colors.accent} strokeWidth={2.4} />
              </View>
            </View>
          </Pressable>

          {/* BLOCK 2: FLASHCARDS */}
          <Pressable
            onPress={() => router.push('/(tabs)/learn/flashcards' as any)}
            style={({ pressed }) => [
              styles.cardBlock,
              {
                backgroundColor: isDark ? '#281E15' : '#FEF8EE',
                opacity: pressed ? 0.88 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}>
            <View style={styles.cardTopRow}>
              <GradientIconBox
                colors={['#FBBF24', '#D97706']}
                size={54}
                borderRadius={16}>
                <Layers size={26} color="#FFFFFF" strokeWidth={2.2} />
              </GradientIconBox>

              <View style={styles.cardTextBox}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Flashcard Decks
                </Text>
                <Text
                  style={[styles.cardDescription, { color: colors.textSecondary }]}>
                  Active recall drills, architectural terms, & visual recognition
                </Text>
              </View>
            </View>

            {/* Bottom Row */}
            <View style={styles.cardBottomRow}>
              <View style={styles.bottomLeftRow}>
                <Layers size={14} color="#D97706" strokeWidth={2} />
                <Text style={[styles.bottomCountText, { color: colors.text }]}>
                  24 Decks
                </Text>
                <Text style={[styles.bottomDot, { color: colors.textSecondary }]}>
                  •
                </Text>
                <Text style={[styles.bottomSubCount, { color: colors.textSecondary }]}>
                  450+ Cards
                </Text>
              </View>

              <View
                style={[
                  styles.chevronCircle,
                  { backgroundColor: isDark ? '#3D2F1E' : '#FCE8CB' },
                ]}>
                <ChevronRight size={16} color="#D97706" strokeWidth={2.4} />
              </View>
            </View>
          </Pressable>
        </View>

        {/* 3. Recommended Focus Modules (Flat Card) */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            Recommended Focus
          </Text>

          <Pressable
            onPress={() => router.push('/(tabs)/learn/building-tech' as any)}
            style={({ pressed }) => [
              styles.moduleCard,
              {
                backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
                opacity: pressed ? 0.88 : 1,
              },
            ]}>
            <GradientIconBox
              colors={['#34D399', '#059669']}
              size={48}
              borderRadius={14}>
              <GraduationCap size={24} color="#FFFFFF" strokeWidth={2.2} />
            </GradientIconBox>

            <View style={styles.moduleTextGroup}>
              <Text style={[styles.moduleTitle, { color: colors.text }]}>
                Building Technology & Utilities
              </Text>
              <Text
                style={[styles.moduleSubtitle, { color: colors.textSecondary }]}>
                Sanitary, Electrical, & Mechanical Systems
              </Text>
            </View>

            <ChevronRight size={18} color={colors.textSecondary} strokeWidth={2.2} />
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
    gap: 18,
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

  /* Block Cards (Flat, No border, No shadow) */
  blockContainer: {
    gap: 14,
  },
  cardBlock: {
    borderRadius: 20,
    padding: 18,
    gap: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cardTextBox: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  cardDescription: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bottomCountText: {
    fontSize: 13,
    fontWeight: '700',
  },
  bottomDot: {
    fontSize: 12,
  },
  bottomSubCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  chevronCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Recommended Section */
  sectionContainer: {
    gap: 10,
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    gap: 14,
  },
  moduleTextGroup: {
    flex: 1,
    gap: 3,
  },
  moduleTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  moduleSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
});
