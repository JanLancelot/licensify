import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { Radius } from '@/constants/theme';

export default function ModuleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header with instant back */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [
            styles.backButton,
            {
              opacity: pressed ? 0.5 : 1,
            },
          ]}>
          <ArrowLeft size={22} color={theme.text} strokeWidth={2.2} />
        </Pressable>

        <View style={styles.headerTitles}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Module: {id ? String(id).toUpperCase() : 'DETAILS'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
            },
          ]}>
          <Text style={[styles.infoTitle, { color: theme.text }]}>
            Comprehensive Syllabus Lessons
          </Text>
          <Text style={[styles.infoBody, { color: theme.textSecondary }]}>
            Master key architectural board topics, legal codifications, structural formulas, and visual identification.
          </Text>
        </View>
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
    padding: 6,
    marginLeft: -4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  content: {
    padding: 20,
  },
  infoCard: {
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoBody: {
    fontSize: 13,
    lineHeight: 18,
  },
});
