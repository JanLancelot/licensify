import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Target,
  FileCheck2,
  Trophy,
  AlertCircle,
  ChevronRight,
  Timer,
} from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';

const MOCK_EXAMS = [
  {
    id: 'day1-am',
    title: 'Area 1: History, Theory, Planning & Laws',
    questions: '100 Questions',
    timeLimit: '3 Hours',
    passingRate: 'Target: 70%',
    status: 'Ready to Start',
  },
  {
    id: 'day1-pm',
    title: 'Area 2: Structural, Utilities & Building Materials',
    questions: '100 Questions',
    timeLimit: '3 Hours',
    passingRate: 'Target: 70%',
    status: 'Ready to Start',
  },
  {
    id: 'day2-full',
    title: 'Area 3: Architectural Design & Site Planning Simulation',
    questions: 'Design Scenario + Computations',
    timeLimit: '6 Hours',
    passingRate: 'Target: 70%',
    status: 'Mock Board Sim',
  },
];

export default function ExamsScreen() {
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
            FULL SIMULATION
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>
            Mock Board Exams
          </Text>
        </View>

        {/* Notice Card */}
        <View
          style={[
            styles.noticeCard,
            {
              backgroundColor: 'rgba(217, 119, 6, 0.08)',
              borderColor: 'rgba(217, 119, 6, 0.25)',
            },
          ]}>
          <AlertCircle size={18} color={theme.accent} />
          <Text style={[styles.noticeText, { color: theme.text }]}>
            Simulations mirror official PRC ALE time limits, question weighting, and negative marking rules.
          </Text>
        </View>

        {/* Exam Cards */}
        <View style={styles.listContainer}>
          {MOCK_EXAMS.map((exam) => (
            <Pressable
              key={exam.id}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: 'rgba(217, 119, 6, 0.12)' },
                  ]}>
                  <FileCheck2 size={22} color={theme.accent} />
                </View>
                <View style={styles.headerInfo}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>
                    {exam.title}
                  </Text>
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Timer size={13} color={theme.textSecondary} />
                      <Text
                        style={[
                          styles.metaText,
                          { color: theme.textSecondary },
                        ]}>
                        {exam.timeLimit}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.metaText,
                        { color: theme.textSecondary },
                      ]}>
                      • {exam.questions}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.cardFooter,
                  { borderTopColor: theme.border },
                ]}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: 'rgba(217, 119, 6, 0.12)' },
                  ]}>
                  <Text style={[styles.statusText, { color: theme.accent }]}>
                    {exam.status}
                  </Text>
                </View>
                <ChevronRight size={18} color={theme.textSecondary} />
              </View>
            </Pressable>
          ))}
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
    marginBottom: 16,
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
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  listContainer: {
    gap: 14,
  },
  card: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
