import React from 'react';
import {
  ArrowRight,
  ChevronRight,
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

        {/* BLOCK 1: NOTES */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Study Notes
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/learn/notes' as any)}
              style={({ pressed }) => [
                styles.openLink,
                { opacity: pressed ? 0.6 : 1 },
              ]}>
              <Text style={[styles.openLinkText, { color: theme.accent }]}>
                Open Notes
              </Text>
              <ArrowRight size={13} color={theme.accent} />
            </Pressable>
          </View>

          <View
            style={[
              styles.blockCard,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}>
            <View style={styles.blockHeader}>
              <View style={styles.blockTitleBox}>
                <Text style={[styles.blockKicker, { color: theme.accent }]}>
                  SYLLABUS & DOCUMENTATION
                </Text>
                <Text style={[styles.blockHeading, { color: theme.text }]}>
                  Comprehensive Notes
                </Text>
                <Text
                  style={[styles.blockSubtext, { color: theme.textSecondary }]}>
                  Organized curriculum notes covering all board exam areas, building laws, and structural fundamentals.
                </Text>
              </View>
            </View>

            {/* Sub-block Items */}
            <View
              style={[
                styles.subListContainer,
                { borderTopColor: theme.border },
              ]}>
              {/* Subjects */}
              <Pressable
                onPress={() => router.push({ pathname: '/(tabs)/learn/notes', params: { tab: 'subjects' } } as any)}
                style={({ pressed }) => [
                  styles.subItem,
                  { opacity: pressed ? 0.7 : 1 },
                ]}>
                <View style={styles.subItemLeft}>
                  <Text style={[styles.subItemTitle, { color: theme.text }]}>
                    Subjects
                  </Text>
                  <Text
                    style={[styles.subItemDesc, { color: theme.textSecondary }]}>
                    Area 1, Area 2, and Area 3 board subjects
                  </Text>
                </View>
                <View style={styles.subItemRight}>
                  <Text
                    style={[styles.countBadge, { color: theme.textSecondary }]}>
                    3 Areas
                  </Text>
                  <ChevronRight size={15} color={theme.textSecondary} />
                </View>
              </Pressable>

              <View
                style={[styles.itemDivider, { backgroundColor: theme.border }]}
              />

              {/* Modules */}
              <Pressable
                onPress={() => router.push({ pathname: '/(tabs)/learn/notes', params: { tab: 'modules' } } as any)}
                style={({ pressed }) => [
                  styles.subItem,
                  { opacity: pressed ? 0.7 : 1 },
                ]}>
                <View style={styles.subItemLeft}>
                  <Text style={[styles.subItemTitle, { color: theme.text }]}>
                    Modules
                  </Text>
                  <Text
                    style={[styles.subItemDesc, { color: theme.textSecondary }]}>
                    History, Building Tech, Laws & Planning
                  </Text>
                </View>
                <View style={styles.subItemRight}>
                  <Text
                    style={[styles.countBadge, { color: theme.textSecondary }]}>
                    4 Modules
                  </Text>
                  <ChevronRight size={15} color={theme.textSecondary} />
                </View>
              </Pressable>

              <View
                style={[styles.itemDivider, { backgroundColor: theme.border }]}
              />

              {/* Lessons */}
              <Pressable
                onPress={() => router.push({ pathname: '/(tabs)/learn/notes', params: { tab: 'lessons' } } as any)}
                style={({ pressed }) => [
                  styles.subItem,
                  { opacity: pressed ? 0.7 : 1 },
                ]}>
                <View style={styles.subItemLeft}>
                  <Text style={[styles.subItemTitle, { color: theme.text }]}>
                    Lessons
                  </Text>
                  <Text
                    style={[styles.subItemDesc, { color: theme.textSecondary }]}>
                    Detailed study guides and formula breakdowns
                  </Text>
                </View>
                <View style={styles.subItemRight}>
                  <Text
                    style={[styles.countBadge, { color: theme.textSecondary }]}>
                    127 Lessons
                  </Text>
                  <ChevronRight size={15} color={theme.textSecondary} />
                </View>
              </Pressable>
            </View>

            {/* Bottom CTA */}
            <Pressable
              onPress={() => router.push('/(tabs)/learn/notes' as any)}
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  backgroundColor: theme.accent,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <Text style={styles.primaryBtnText}>Browse All Notes</Text>
              <ArrowRight size={14} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* BLOCK 2: FLASHCARDS */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Flashcards
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/learn/flashcards' as any)}
              style={({ pressed }) => [
                styles.openLink,
                { opacity: pressed ? 0.6 : 1 },
              ]}>
              <Text style={[styles.openLinkText, { color: theme.accent }]}>
                Open Decks
              </Text>
              <ArrowRight size={13} color={theme.accent} />
            </Pressable>
          </View>

          <View
            style={[
              styles.blockCard,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}>
            <View style={styles.blockHeader}>
              <View style={styles.blockTitleBox}>
                <Text style={[styles.blockKicker, { color: theme.accent }]}>
                  SPACED REPETITION
                </Text>
                <Text style={[styles.blockHeading, { color: theme.text }]}>
                  Review Flashcards
                </Text>
                <Text
                  style={[styles.blockSubtext, { color: theme.textSecondary }]}>
                  Master architectural styles, legal provisions, and high-yield terms through quick active recall drills.
                </Text>
              </View>
            </View>

            {/* Sub-block Items */}
            <View
              style={[
                styles.subListContainer,
                { borderTopColor: theme.border },
              ]}>
              {/* Subject Decks */}
              <Pressable
                onPress={() => router.push({ pathname: '/(tabs)/learn/flashcards', params: { tab: 'decks' } } as any)}
                style={({ pressed }) => [
                  styles.subItem,
                  { opacity: pressed ? 0.7 : 1 },
                ]}>
                <View style={styles.subItemLeft}>
                  <Text style={[styles.subItemTitle, { color: theme.text }]}>
                    Subject Decks
                  </Text>
                  <Text
                    style={[styles.subItemDesc, { color: theme.textSecondary }]}>
                    Organized decks for History, Laws & Technology
                  </Text>
                </View>
                <View style={styles.subItemRight}>
                  <Text
                    style={[styles.countBadge, { color: theme.textSecondary }]}>
                    24 Decks
                  </Text>
                  <ChevronRight size={15} color={theme.textSecondary} />
                </View>
              </Pressable>

              <View
                style={[styles.itemDivider, { backgroundColor: theme.border }]}
              />

              {/* Difficult Cards */}
              <Pressable
                onPress={() => router.push({ pathname: '/(tabs)/learn/flashcards', params: { tab: 'difficult' } } as any)}
                style={({ pressed }) => [
                  styles.subItem,
                  { opacity: pressed ? 0.7 : 1 },
                ]}>
                <View style={styles.subItemLeft}>
                  <Text style={[styles.subItemTitle, { color: theme.text }]}>
                    Difficult Cards
                  </Text>
                  <Text
                    style={[styles.subItemDesc, { color: theme.textSecondary }]}>
                    Flagged and low-retention terms needing review
                  </Text>
                </View>
                <View style={styles.subItemRight}>
                  <Text
                    style={[styles.alertCountBadge, { color: theme.accent }]}>
                    18 Due
                  </Text>
                  <ChevronRight size={15} color={theme.textSecondary} />
                </View>
              </Pressable>

              <View
                style={[styles.itemDivider, { backgroundColor: theme.border }]}
              />

              {/* Favorites */}
              <Pressable
                onPress={() => router.push({ pathname: '/(tabs)/learn/flashcards', params: { tab: 'favorites' } } as any)}
                style={({ pressed }) => [
                  styles.subItem,
                  { opacity: pressed ? 0.7 : 1 },
                ]}>
                <View style={styles.subItemLeft}>
                  <Text style={[styles.subItemTitle, { color: theme.text }]}>
                    Favorites
                  </Text>
                  <Text
                    style={[styles.subItemDesc, { color: theme.textSecondary }]}>
                    Bookmarked high-yield terms for quick review
                  </Text>
                </View>
                <View style={styles.subItemRight}>
                  <Text
                    style={[styles.countBadge, { color: theme.textSecondary }]}>
                    32 Saved
                  </Text>
                  <ChevronRight size={15} color={theme.textSecondary} />
                </View>
              </Pressable>
            </View>

            {/* Bottom CTA */}
            <Pressable
              onPress={() => router.push('/(tabs)/learn/flashcards' as any)}
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  backgroundColor: theme.accent,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <Text style={styles.primaryBtnText}>Start Flashcards Drill</Text>
              <ArrowRight size={14} color="#FFFFFF" />
            </Pressable>
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
    paddingTop: 12,
    gap: 22,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -4,
  },
  kicker: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
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

  /* Section Structure */
  section: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  openLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  openLinkText: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* Block Cards */
  blockCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  blockHeader: {
    padding: 16,
  },
  blockTitleBox: {
    gap: 3,
  },
  blockKicker: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  blockHeading: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  blockSubtext: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },

  /* Sub List */
  subListContainer: {
    borderTopWidth: 1,
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  subItemLeft: {
    flex: 1,
    gap: 2,
  },
  subItemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  subItemDesc: {
    fontSize: 11.5,
  },
  subItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countBadge: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  alertCountBadge: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  itemDivider: {
    height: 1,
    marginHorizontal: 16,
  },

  /* Action Button */
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 6,
    borderRadius: Radius.sm,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
