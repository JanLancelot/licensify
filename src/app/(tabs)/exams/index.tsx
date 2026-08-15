import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  FileCheck2,
  AlertCircle,
  ChevronRight,
  Timer,
} from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { Radius } from '@/constants/theme';

export const MOCK_EXAMS = [
  {
    id: 'area-1',
    title: 'Area 1: History, Theory, Planning & Laws',
    description: 'History of Architecture, Theory of Design, Urban & Regional Planning, RA 9266, NBCP (PD 1096).',
    questions: '3 Demo Items (100 Official)',
    timeLimit: '3 Hours',
    passingRate: 'Passing: 70%',
    status: 'Ready to Start',
  },
  {
    id: 'area-2',
    title: 'Area 2: Structural, Utilities & Building Materials',
    description: 'Structural Conceptualization, Building Technology, MEPFS Systems, Specifications & Estimation.',
    questions: '3 Demo Items (100 Official)',
    timeLimit: '3 Hours',
    passingRate: 'Passing: 70%',
    status: 'Ready to Start',
  },
  {
    id: 'area-3',
    title: 'Area 3: Architectural Design & Site Planning',
    description: 'Design problem scenarios, space programming, site planning, zoning analysis and Rule 7 & 8 computations.',
    questions: 'Design Scenario',
    timeLimit: '6 Hours',
    passingRate: 'Passing: 70%',
    status: 'Mock Board Sim',
  },
];

export default function ExamsSelectionScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleSelectExam = (id: string) => {
    router.push({
      pathname: '/(tabs)/exams/details' as any,
      params: { id },
    });
  };

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
            PRC ALE SIMULATION
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>
            Select Mock Exam
          </Text>
        </View>

        {/* Notice Card */}
        <View
          style={[
            styles.noticeCard,
            {
              backgroundColor: theme.accentMuted,
              borderColor: theme.border,
            },
          ]}>
          <AlertCircle size={16} color={theme.accent} />
          <Text style={[styles.noticeText, { color: theme.text }]}>
            Select a subject area below to review instructions and start the timed multiple-choice simulation.
          </Text>
        </View>

        {/* Exam Cards */}
        <View style={styles.listContainer}>
          {MOCK_EXAMS.map((exam) => (
            <Pressable
              key={exam.id}
              onPress={() => handleSelectExam(exam.id)}
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
                    {
                      backgroundColor: theme.accentMuted,
                      borderColor: theme.border,
                    },
                  ]}>
                  <FileCheck2 size={20} color={theme.accent} />
                </View>
                <View style={styles.headerInfo}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>
                    {exam.title}
                  </Text>
                  <Text
                    style={[styles.cardDesc, { color: theme.textSecondary }]}>
                    {exam.description}
                  </Text>
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Timer size={12} color={theme.textSecondary} />
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
                    {
                      backgroundColor: theme.accentMuted,
                      borderColor: theme.border,
                    },
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
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: 16,
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  listContainer: {
    gap: 10,
  },
  card: {
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerInfo: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
});
