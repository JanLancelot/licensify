import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  FileEdit,
  Zap,
  Flame,
  Shuffle,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';

const PRACTICE_MODES = [
  {
    id: 'daily-streak',
    title: 'Daily 20-Question Drill',
    description: 'Fresh curated questions across all areas to build habit.',
    icon: Flame,
    badge: 'Daily Streak',
  },
  {
    id: 'rule7-8',
    title: 'Rule 7 & 8 NBCP Computation',
    description: 'TOSL, AMBF, PSO, ISA, USA, and GFA practice problems.',
    icon: Zap,
    badge: 'High Yield',
  },
  {
    id: 'flashcards',
    title: 'Architectural Terms & Styles',
    description: 'Flashcards on architectural orders, periods, and architects.',
    icon: Shuffle,
    badge: 'Quick Recall',
  },
  {
    id: 'timed-quiz',
    title: 'Speed Challenge Drill',
    description: '60 seconds per question with instant explanations.',
    icon: Clock,
    badge: 'Timed Mode',
  },
];

export default function PracticeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 90 },
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.kicker, { color: theme.accent }]}>
            HANDS-ON REVIEW
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>
            Practice Arena
          </Text>
        </View>

        {/* Practice Modes */}
        <View style={styles.listContainer}>
          {PRACTICE_MODES.map((item) => {
            const Icon = item.icon;
            return (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: 'rgba(217, 119, 6, 0.12)' },
                  ]}>
                  <Icon size={22} color={theme.accent} />
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                      {item.title}
                    </Text>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: 'rgba(217, 119, 6, 0.12)' },
                      ]}>
                      <Text style={[styles.badgeText, { color: theme.accent }]}>
                        {item.badge}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[styles.cardSubtext, { color: theme.textSecondary }]}>
                    {item.description}
                  </Text>
                </View>

                <ChevronRight size={18} color={theme.textSecondary} />
              </Pressable>
            );
          })}
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
  },
  header: {
    marginBottom: 20,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  listContainer: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardSubtext: {
    fontSize: 12,
    lineHeight: 16,
  },
});
