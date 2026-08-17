import React from 'react';
import {
  BookOpen,
  ChevronRight,
  Layers,
  Sparkles,
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
          <View>
            <Text style={[styles.kicker, { color: theme.accent }]}>
              CURRICULUM & STUDY MATERIALS
            </Text>
            <Text style={[styles.title, { color: theme.text }]}>
              Learn
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

        {/* Action Buttons Section */}
        <View style={styles.blockContainer}>
          {/* BLOCK 1: COMPREHENSIVE NOTES */}
          <Pressable
            onPress={() => router.push('/(tabs)/learn/notes' as any)}
            style={({ pressed }) => [
              styles.buttonBlock,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
                opacity: pressed ? 0.88 : 1,
                transform: [{ scale: pressed ? 0.99 : 1 }],
              },
            ]}>
            <View style={styles.blockHeader}>
              <View
                style={[
                  styles.iconHandler,
                  {
                    backgroundColor: theme.accentMuted,
                    borderColor: theme.border,
                  },
                ]}>
                <BookOpen size={24} color={theme.accent} strokeWidth={2} />
              </View>

              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.tagBadge,
                    {
                      backgroundColor: theme.accentMuted,
                      borderColor: theme.accentLight,
                    },
                  ]}>
                  <Text style={[styles.tagBadgeText, { color: theme.accent }]}>
                    9 SUBJECTS
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.blockBody}>
              <Text style={[styles.blockTitle, { color: theme.text }]}>
                Comprehensive Notes
              </Text>
              <Text
                style={[styles.blockDescription, { color: theme.textSecondary }]}>
                In-depth curriculum notes, building laws, structural formulas, and step-by-step topic breakdowns.
              </Text>
            </View>

            <View style={[styles.blockFooter, { borderTopColor: theme.border }]}>
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                120+ Organized Lessons
              </Text>
              <View style={styles.actionArrow}>
                <Text style={[styles.actionText, { color: theme.accent }]}>
                  Browse Notes
                </Text>
                <ChevronRight size={16} color={theme.accent} />
              </View>
            </View>
          </Pressable>

          {/* BLOCK 2: FLASHCARDS */}
          <Pressable
            onPress={() => router.push('/(tabs)/learn/flashcards' as any)}
            style={({ pressed }) => [
              styles.buttonBlock,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
                opacity: pressed ? 0.88 : 1,
                transform: [{ scale: pressed ? 0.99 : 1 }],
              },
            ]}>
            <View style={styles.blockHeader}>
              <View
                style={[
                  styles.iconHandler,
                  {
                    backgroundColor: theme.accentMuted,
                    borderColor: theme.border,
                  },
                ]}>
                <Layers size={24} color={theme.accent} strokeWidth={2} />
              </View>

              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.tagBadge,
                    {
                      backgroundColor: theme.accentMuted,
                      borderColor: theme.accentLight,
                    },
                  ]}>
                  <Text style={[styles.tagBadgeText, { color: theme.accent }]}>
                    SPACED RECALL
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.blockBody}>
              <Text style={[styles.blockTitle, { color: theme.text }]}>
                Review Flashcards
              </Text>
              <Text
                style={[styles.blockDescription, { color: theme.textSecondary }]}>
                Active recall flashcards for architectural styles, high-yield legal provisions, and visual recognition drills.
              </Text>
            </View>

            <View style={[styles.blockFooter, { borderTopColor: theme.border }]}>
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                24 Decks • 450+ Cards
              </Text>
              <View style={styles.actionArrow}>
                <Text style={[styles.actionText, { color: theme.accent }]}>
                  Start Practice
                </Text>
                <ChevronRight size={16} color={theme.accent} />
              </View>
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

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  kicker: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
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

  /* Block Buttons */
  blockContainer: {
    gap: 16,
  },
  buttonBlock: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconHandler: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  tagBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  blockBody: {
    gap: 6,
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  blockDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  blockFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
});
