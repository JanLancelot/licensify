import { useRouter } from 'expo-router';
import {
  BookOpen,
  ChevronRight,
  Layers,
} from 'lucide-react-native';
import React from 'react';
import {
  Pressable,
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
  size = 64,
  borderRadius = 20,
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
        <Text style={[styles.title, { color: colors.text }]}>
          Learn
        </Text>
      </View>

      {/* 2. Two Full-Height Action Blocks (No extra text, fills the screen) */}
      <View
        style={[
          styles.fillContainer,
          { paddingBottom: insets.bottom + 84 },
        ]}>
        {/* BLOCK 1: COMPREHENSIVE NOTES */}
        <Pressable
          onPress={() => router.push('/(tabs)/learn/notes' as any)}
          style={({ pressed }) => [
            styles.heroBlock,
            {
              backgroundColor: isDark ? '#261C19' : '#FDF4F0',
              opacity: pressed ? 0.88 : 1,
              transform: [{ scale: pressed ? 0.985 : 1 }],
            },
          ]}>
          <GradientIconBox
            colors={['#E58368', '#C85A32']}
            size={72}
            borderRadius={22}>
            <BookOpen size={36} color="#FFFFFF" strokeWidth={2.2} />
          </GradientIconBox>

          <View style={styles.heroTextRow}>
            <Text style={[styles.heroTitle, { color: colors.text }]}>
              Comprehensive Notes
            </Text>
            <View
              style={[
                styles.chevronCircle,
                { backgroundColor: isDark ? '#3D2822' : '#F8DDD3' },
              ]}>
              <ChevronRight
                size={20}
                color={colors.accent}
                strokeWidth={2.4}
              />
            </View>
          </View>
        </Pressable>

        {/* BLOCK 2: FLASHCARDS */}
        <Pressable
          onPress={() => router.push('/(tabs)/learn/flashcards' as any)}
          style={({ pressed }) => [
            styles.heroBlock,
            {
              backgroundColor: isDark ? '#281E15' : '#FEF8EE',
              opacity: pressed ? 0.88 : 1,
              transform: [{ scale: pressed ? 0.985 : 1 }],
            },
          ]}>
          <GradientIconBox
            colors={['#FBBF24', '#D97706']}
            size={72}
            borderRadius={22}>
            <Layers size={36} color="#FFFFFF" strokeWidth={2.2} />
          </GradientIconBox>

          <View style={styles.heroTextRow}>
            <Text style={[styles.heroTitle, { color: colors.text }]}>
              Flashcards
            </Text>
            <View
              style={[
                styles.chevronCircle,
                { backgroundColor: isDark ? '#3D2F1E' : '#FCE8CB' },
              ]}>
              <ChevronRight size={20} color="#D97706" strokeWidth={2.4} />
            </View>
          </View>
        </Pressable>
      </View>
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
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  fillContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 16,
  },
  heroBlock: {
    flex: 1,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroTextRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  chevronCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
