import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Timer,
  FileCheck2,
  AlertTriangle,
  CheckCircle,
  Play,
  ShieldCheck,
} from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { Radius } from '@/constants/theme';

export default function ExamDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();

  const examId = id || 'area-1';

  const handleStartSession = () => {
    router.push({
      pathname: '/(tabs)/exams/session' as any,
      params: { id: examId },
    });
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}>
          <ArrowLeft size={18} color={theme.text} />
        </Pressable>

        <View style={styles.headerTitles}>
          <Text style={[styles.headerSubtitle, { color: theme.accent }]}>
            BOARD EXAM BRIEFING
          </Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Exam Instructions
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}>
        {/* Title Hero */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
            },
          ]}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: theme.accentMuted, borderColor: theme.border },
            ]}>
            <FileCheck2 size={24} color={theme.accent} />
          </View>
          <Text style={[styles.examHeading, { color: theme.text }]}>
            {examId === 'area-2'
              ? 'Area 2: Structural, Utilities & Building Materials'
              : examId === 'area-3'
              ? 'Area 3: Architectural Design & Site Planning'
              : 'Area 1: History, Theory, Planning & Laws'}
          </Text>
          <Text style={[styles.examSubtext, { color: theme.textSecondary }]}>
            Official PRC Architecture Licensure Examination format simulation.
          </Text>

          {/* Quick Details Pills */}
          <View style={styles.pillsRow}>
            <View
              style={[
                styles.pill,
                { backgroundColor: theme.background, borderColor: theme.border },
              ]}>
              <Timer size={13} color={theme.accent} />
              <Text style={[styles.pillText, { color: theme.text }]}>
                30 Mins (Demo)
              </Text>
            </View>

            <View
              style={[
                styles.pill,
                { backgroundColor: theme.background, borderColor: theme.border },
              ]}>
              <CheckCircle size={13} color={theme.accent} />
              <Text style={[styles.pillText, { color: theme.text }]}>
                3 Multiple Choice Items
              </Text>
            </View>

            <View
              style={[
                styles.pill,
                { backgroundColor: theme.background, borderColor: theme.border },
              ]}>
              <ShieldCheck size={13} color={theme.accent} />
              <Text style={[styles.pillText, { color: theme.text }]}>
                70% Passing Score
              </Text>
            </View>
          </View>
        </View>

        {/* Rules & Guidelines */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            IMPORTANT GUIDELINES
          </Text>

          <View
            style={[
              styles.guidelineCard,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}>
            <View style={styles.ruleItem}>
              <View
                style={[
                  styles.ruleBullet,
                  { backgroundColor: theme.accent },
                ]}
              />
              <Text style={[styles.ruleText, { color: theme.text }]}>
                Each question has 4 options (A, B, C, D). Only one is correct.
              </Text>
            </View>

            <View style={styles.ruleItem}>
              <View
                style={[
                  styles.ruleBullet,
                  { backgroundColor: theme.accent },
                ]}
              />
              <Text style={[styles.ruleText, { color: theme.text }]}>
                You can flag questions for review and navigate freely between items before final submission.
              </Text>
            </View>

            <View style={styles.ruleItem}>
              <View
                style={[
                  styles.ruleBullet,
                  { backgroundColor: theme.accent },
                ]}
              />
              <Text style={[styles.ruleText, { color: theme.text }]}>
                Timer runs continuously once started. Answers will be scored instantly upon completion.
              </Text>
            </View>
          </View>
        </View>

        {/* Start Button */}
        <Pressable
          onPress={handleStartSession}
          style={({ pressed }) => [
            styles.startBtn,
            {
              backgroundColor: theme.accent,
              opacity: pressed ? 0.88 : 1,
            },
          ]}>
          <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.startBtnText}>Start Examination</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  heroCard: {
    padding: 18,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 10,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  examHeading: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  examSubtext: {
    fontSize: 13,
    lineHeight: 18,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1,
  },
  guidelineCard: {
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  ruleBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  ruleText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: Radius.md,
    marginTop: 8,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
