import React from 'react';
import { ChevronRight } from 'lucide-react-native';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { Radius } from '@/constants/theme';

export const PRACTICE_TESTS = [
  {
    id: 'area-1',
    area: 'Area 1 • 30% Weight',
    title: 'History, Theory, Planning & Laws',
    description: 'History of Architecture, Theory of Design, Urban Planning (BP 220, PD 957) & RA 9266.',
    itemsCount: '50 Items',
    timeLimit: '1.5 Hours',
    passingRate: 'Passing: 70%',
    status: 'Score: 84% • Passed',
    statusType: 'passed',
  },
  {
    id: 'area-2',
    area: 'Area 2 • 30% Weight',
    title: 'Structural, Utilities & Building Materials',
    description: 'Structural Conceptualization, Building Technology, MEPFS Systems, Specifications & Estimation.',
    itemsCount: '50 Items',
    timeLimit: '1.5 Hours',
    passingRate: 'Passing: 70%',
    status: 'Ready to Start',
    statusType: 'ready',
  },
  {
    id: 'area-3',
    area: 'Area 3 • 40% Weight',
    title: 'Architectural Design & Site Planning',
    description: 'Design problem scenarios, space programming, site planning, zoning analysis and Rule 7 & 8 computations.',
    itemsCount: '50 Items',
    timeLimit: '2.0 Hours',
    passingRate: 'Passing: 70%',
    status: 'Ready to Start',
    statusType: 'ready',
  },
];

export const MOCK_TESTS = [
  {
    id: 'mock-day-1',
    badge: 'Official Simulation',
    title: 'ALE Day 1 Mock Board Exam',
    description: 'Part 1: History & Planning (100 Items) + Part 2: Structural & Utilities (100 Items). Full board rules.',
    itemsCount: '200 Items',
    timeLimit: '6.0 Hours',
    passingRate: 'Passing: 70% GWA',
    dateNotice: 'Timed Simulation',
  },
  {
    id: 'mock-day-2',
    badge: 'Design Problem',
    title: 'ALE Day 2 Architectural Design & Site Planning',
    description: 'Comprehensive design problem scenario, zoning compliance, space programming, and NBCP computations.',
    itemsCount: 'Design Scenario',
    timeLimit: '6.0 Hours',
    passingRate: 'Passing: 70% GWA',
    dateNotice: 'Scenario Based',
  },
  {
    id: 'mock-bundle',
    badge: 'Full Board Bundle',
    title: 'Complete 2-Day Mock Examination Bundle',
    description: 'Simulate the full 2-day PRC licensure experience with official percentile rank and performance breakdown.',
    itemsCount: 'Day 1 & Day 2',
    timeLimit: '12 Hours Total',
    passingRate: 'Full Board Simulation',
    dateNotice: 'Comprehensive',
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 90 },
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Exams
          </Text>
        </View>

        {/* BLOCK 1: PRACTICE TESTS */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Practice Tests
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Area-based Modular Exams
            </Text>
          </View>

          <View
            style={[
              styles.groupedCard,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}>
            {PRACTICE_TESTS.map((test, idx) => (
              <React.Fragment key={test.id}>
                <Pressable
                  onPress={() => handleSelectExam(test.id)}
                  style={({ pressed }) => [
                    styles.testRow,
                    { opacity: pressed ? 0.75 : 1 },
                  ]}>
                  <View style={styles.testInfo}>
                    <View style={styles.testTagRow}>
                      <Text style={[styles.testAreaTag, { color: theme.accent }]}>
                        {test.area}
                      </Text>
                      <Text
                        style={[styles.testMetaDot, { color: theme.textSecondary }]}>
                        •
                      </Text>
                      <Text
                        style={[styles.testMetaTime, { color: theme.textSecondary }]}>
                        {test.itemsCount} ({test.timeLimit})
                      </Text>
                    </View>

                    <Text style={[styles.testTitle, { color: theme.text }]}>
                      {test.title}
                    </Text>
                    <Text
                      style={[styles.testDesc, { color: theme.textSecondary }]}>
                      {test.description}
                    </Text>

                    <View style={styles.testFooterRow}>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              test.statusType === 'passed'
                                ? theme.accentMuted
                                : theme.backgroundSelected,
                            borderColor: theme.border,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.statusBadgeText,
                            {
                              color:
                                test.statusType === 'passed'
                                  ? theme.accent
                                  : theme.textSecondary,
                            },
                          ]}>
                          {test.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <ChevronRight size={16} color={theme.textSecondary} />
                </Pressable>

                {idx < PRACTICE_TESTS.length - 1 && (
                  <View
                    style={[styles.rowDivider, { backgroundColor: theme.border }]}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* BLOCK 2: MOCK TESTS */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Mock Tests
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Full Board Simulations
            </Text>
          </View>

          <View
            style={[
              styles.groupedCard,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}>
            {MOCK_TESTS.map((test, idx) => (
              <React.Fragment key={test.id}>
                <Pressable
                  onPress={() => handleSelectExam(test.id)}
                  style={({ pressed }) => [
                    styles.testRow,
                    { opacity: pressed ? 0.75 : 1 },
                  ]}>
                  <View style={styles.testInfo}>
                    <View style={styles.testTagRow}>
                      <View
                        style={[
                          styles.mockPill,
                          {
                            backgroundColor: theme.accentMuted,
                            borderColor: theme.border,
                          },
                        ]}>
                        <Text
                          style={[styles.mockPillText, { color: theme.accent }]}>
                          {test.badge}
                        </Text>
                      </View>
                      <Text
                        style={[styles.testMetaTime, { color: theme.textSecondary }]}>
                        {test.itemsCount} • {test.timeLimit}
                      </Text>
                    </View>

                    <Text style={[styles.testTitle, { color: theme.text }]}>
                      {test.title}
                    </Text>
                    <Text
                      style={[styles.testDesc, { color: theme.textSecondary }]}>
                      {test.description}
                    </Text>

                    <View style={styles.testFooterRow}>
                      <Text
                        style={[styles.passingText, { color: theme.textSecondary }]}>
                        {test.passingRate}
                      </Text>
                    </View>
                  </View>

                  <ChevronRight size={16} color={theme.textSecondary} />
                </Pressable>

                {idx < MOCK_TESTS.length - 1 && (
                  <View
                    style={[styles.rowDivider, { backgroundColor: theme.border }]}
                  />
                )}
              </React.Fragment>
            ))}
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
    gap: 24,
  },

  header: {
    marginBottom: -4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  /* Section Structure */
  section: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
  },

  /* Grouped Card */
  groupedCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  testInfo: {
    flex: 1,
    gap: 3,
  },
  testTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  testAreaTag: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  testMetaDot: {
    fontSize: 10,
  },
  testMetaTime: {
    fontSize: 11,
  },
  testTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  testDesc: {
    fontSize: 11.5,
    lineHeight: 15,
  },
  testFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  mockPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  mockPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  passingText: {
    fontSize: 11,
  },
  rowDivider: {
    height: 1,
    marginHorizontal: 16,
  },
});
