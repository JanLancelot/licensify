import React from 'react';
import { StyleSheet, View, Text, ScrollView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Compass,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import DebugSQLite from '@/components/DebugSQLite';

export default function HomeScreen() {
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
          <View>
            <Text style={[styles.kicker, { color: theme.accent }]}>
              ARCHITECTURE LICENSURE EXAM
            </Text>
            <Text style={[styles.title, { color: theme.text }]}>
              Reviewer Dashboard
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            ]}>
            <Compass size={18} color={theme.accent} />
            <Text style={[styles.badgeText, { color: theme.text }]}>ALE 2026</Text>
          </View>
        </View>

        {/* Exam Countdown & Readiness Hero */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
            },
          ]}>
          <View style={styles.heroHeader}>
            <View style={styles.heroTitleRow}>
              <Award size={20} color={theme.accent} />
              <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
                Overall Readiness
              </Text>
            </View>
            <View
              style={[styles.tag, { backgroundColor: 'rgba(217, 119, 6, 0.15)' }]}>
              <Text style={[styles.tagText, { color: theme.accent }]}>
                72% Prepared
              </Text>
            </View>
          </View>

          <Text style={[styles.heroHeading, { color: theme.text }]}>
            Target: Topnotch Board Passer
          </Text>

          {/* Quick Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Clock size={16} color={theme.textSecondary} />
              <Text style={[styles.metricValue, { color: theme.text }]}>
                128 hrs
              </Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                Logged
              </Text>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: theme.border }]} />
            <View style={styles.metricItem}>
              <BookOpen size={16} color={theme.textSecondary} />
              <Text style={[styles.metricValue, { color: theme.text }]}>
                1,420
              </Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                Questions
              </Text>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: theme.border }]} />
            <View style={styles.metricItem}>
              <CheckCircle2 size={16} color={theme.accent} />
              <Text style={[styles.metricValue, { color: theme.accent }]}>
                84%
              </Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                Accuracy
              </Text>
            </View>
          </View>
        </View>

        {/* Database Diagnostic & Sync Component */}
        <View style={styles.sectionHeader}>
          <Sparkles size={16} color={theme.accent} />
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            DATABASE & ENGINE STATUS
          </Text>
        </View>
        <DebugSQLite />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroHeading: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: 11,
  },
  metricDivider: {
    width: 1,
    height: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
