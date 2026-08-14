import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BookOpen,
  Layers,
  Building,
  Scale,
  TreePine,
  ChevronRight,
} from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';

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
                    { backgroundColor: 'rgba(217, 119, 6, 0.12)' },
                  ]}>
                  <Icon size={22} color={theme.accent} />
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
  modulesContainer: {
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
    gap: 3,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardSubtext: {
    fontSize: 12,
    lineHeight: 16,
  },
  cardCount: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});
