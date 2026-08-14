import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Timer, AlertCircle } from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { Radius } from '@/constants/theme';

export default function ExamSimulationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Top Header with Instant Back */}
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
            EXAM SIMULATION
          </Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {id ? String(id).toUpperCase() : 'MOCK BOARD'}
          </Text>
        </View>

        <View
          style={[
            styles.timerBadge,
            { backgroundColor: theme.accentMuted, borderColor: theme.border },
          ]}>
          <Timer size={14} color={theme.accent} />
          <Text style={[styles.timerText, { color: theme.accent }]}>
            03:00:00
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View
          style={[
            styles.noticeCard,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
            },
          ]}>
          <AlertCircle size={20} color={theme.accent} />
          <Text style={[styles.noticeTitle, { color: theme.text }]}>
            Active Examination Session
          </Text>
          <Text style={[styles.noticeSubtext, { color: theme.textSecondary }]}>
            Timed mock exam is running. Answers will be scored with PRC-standard passing criteria (70% minimum).
          </Text>
        </View>
      </View>
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
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    padding: 20,
  },
  noticeCard: {
    padding: 18,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 8,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  noticeSubtext: {
    fontSize: 13,
    lineHeight: 18,
  },
});
