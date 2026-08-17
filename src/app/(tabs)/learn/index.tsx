import React from 'react';
import {
  BookOpen,
  ChevronRight,
  FileText,
  Layers,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { Radius } from '@/constants/theme';

export default function LearnScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
          <Text style={[styles.title, { color: theme.text }]}>
            Learn
          </Text>
        </View>

        {/* 2 Main Action Blocks */}
        <View style={styles.blockContainer}>
          {/* BLOCK 1: COMPREHENSIVE NOTES */}
          <Pressable
            onPress={() => router.push('/(tabs)/learn/notes' as any)}
            style={({ pressed }) => [
              styles.cardBlock,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
                opacity: pressed ? 0.88 : 1,
                transform: [{ scale: pressed ? 0.99 : 1 }],
              },
            ]}>
            {/* Top Row: Large Circular Logo + (Title & Description) */}
            <View style={styles.cardTopRow}>
              {/* Extra Large Circular Logo */}
              <View
                style={[
                  styles.circleLogo,
                  {
                    backgroundColor: theme.accentMuted,
                  },
                ]}>
                <BookOpen size={30} color={theme.accent} strokeWidth={2.2} />
              </View>

              {/* Title and Description */}
              <View style={styles.cardTextBox}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  Comprehensive Notes
                </Text>
                <Text
                  style={[styles.cardDescription, { color: theme.textSecondary }]}>
                  Organized curriculum notes, building laws, and formulas
                </Text>
              </View>
            </View>

            {/* Horizontal Line */}
            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Bottom Row: [Icon] 9 Subjects                        > */}
            <View style={styles.cardBottomRow}>
              <View style={styles.bottomLeftRow}>
                <FileText size={14} color={theme.textSecondary} strokeWidth={1.8} />
                <Text style={[styles.bottomCountText, { color: theme.textSecondary }]}>
                  9 Subjects
                </Text>
                <Text style={[styles.bottomDot, { color: theme.textSecondary }]}>
                  •
                </Text>
                <Text style={[styles.bottomSubCount, { color: theme.textSecondary }]}>
                  120+ Lessons
                </Text>
              </View>

              <ChevronRight size={16} color={theme.accent} />
            </View>
          </Pressable>

          {/* BLOCK 2: FLASHCARDS */}
          <Pressable
            onPress={() => router.push('/(tabs)/learn/flashcards' as any)}
            style={({ pressed }) => [
              styles.cardBlock,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
                opacity: pressed ? 0.88 : 1,
                transform: [{ scale: pressed ? 0.99 : 1 }],
              },
            ]}>
            {/* Top Row: Large Circular Logo + (Title & Description) */}
            <View style={styles.cardTopRow}>
              {/* Extra Large Circular Logo */}
              <View
                style={[
                  styles.circleLogo,
                  {
                    backgroundColor: theme.accentMuted,
                  },
                ]}>
                <Layers size={30} color={theme.accent} strokeWidth={2.2} />
              </View>

              {/* Title and Description */}
              <View style={styles.cardTextBox}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  Review Flashcards
                </Text>
                <Text
                  style={[styles.cardDescription, { color: theme.textSecondary }]}>
                  Active recall drills, key provisions, and visual recognition
                </Text>
              </View>
            </View>

            {/* Horizontal Line */}
            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Bottom Row: [Icon] 24 Decks                        > */}
            <View style={styles.cardBottomRow}>
              <View style={styles.bottomLeftRow}>
                <Layers size={14} color={theme.textSecondary} strokeWidth={1.8} />
                <Text style={[styles.bottomCountText, { color: theme.textSecondary }]}>
                  24 Decks
                </Text>
                <Text style={[styles.bottomDot, { color: theme.textSecondary }]}>
                  •
                </Text>
                <Text style={[styles.bottomSubCount, { color: theme.textSecondary }]}>
                  450+ Cards
                </Text>
              </View>

              <ChevronRight size={16} color={theme.accent} />
            </View>
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
    paddingTop: 16,
    gap: 20,
  },

  header: {
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  /* Block Cards */
  blockContainer: {
    gap: 16,
  },
  cardBlock: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },

  /* Top Row */
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  circleLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
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

  /* Horizontal Divider */
  divider: {
    height: 1,
    width: '100%',
  },

  /* Bottom Row */
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  bottomLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bottomCountText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  bottomDot: {
    fontSize: 12,
  },
  bottomSubCount: {
    fontSize: 12,
    fontWeight: '500',
  },
});
