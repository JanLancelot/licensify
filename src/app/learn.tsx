import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Layers,
  Building,
  Scale,
  TreePine,
  ChevronRight,
} from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { Radius } from '@/constants/theme';

const MODULES = [
  {
    id: 'history',
    title: 'History & Theory of Architecture',
    subtext: 'Ancient Egyptian to Contemporary Architecture',
    icon: Building,
    count: '34 Lessons',
  },
  {
    id: 'building-tech',
    title: 'Building Technology & Utilities',
    subtext: 'Structural Systems, MEPFS & Materials',
    icon: Layers,
    count: '48 Lessons',
  },
  {
    id: 'practice-law',
    title: 'Professional Practice & Laws',
    subtext: 'RA 9266, NBCP (PD 1096), Fire Code (RA 9514)',
    icon: Scale,
    count: '26 Lessons',
  },
  {
    id: 'urban-planning',
    title: 'Urban Planning & Site Planning',
    subtext: 'Zoning, Subdivisions (BP 220, PD 957)',
    icon: TreePine,
    count: '19 Lessons',
  },
];

export default function LearnScreen() {
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
            CURRICULUM & SYLLABUS
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>
            Board Exam Modules
          </Text>
        </View>

        {/* Modules List */}
        <View style={styles.modulesContainer}>
          {MODULES.map((item) => {
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
                    {
                      backgroundColor: theme.accentMuted,
                      borderColor: theme.border,
                    },
                  ]}>
                  <Icon size={20} color={theme.accent} />
                </View>

                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>
                    {item.title}
                  </Text>
                  <Text
                    style={[styles.cardSubtext, { color: theme.textSecondary }]}>
                    {item.subtext}
                  </Text>
                  <Text style={[styles.cardCount, { color: theme.accent }]}>
                    {item.count}
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
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  modulesContainer: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: Radius.md, // Sharp clean edges
    borderWidth: 1,
    gap: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm, // Sharp square icon container
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cardContent: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  cardSubtext: {
    fontSize: 12,
    lineHeight: 16,
  },
  cardCount: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
