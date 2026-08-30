import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Pencil, Play, Shuffle, Trash2 } from 'lucide-react-native';

import { useAppTheme } from '@/context/theme-context';
import { FlashcardPreset } from '@/types/curriculum';

export interface FlashcardPresetCardProps {
  preset: FlashcardPreset;
  onStartDrill: (preset: FlashcardPreset) => void;
  onEditPreset: (preset: FlashcardPreset) => void;
  onDeletePreset: (id: string) => void;
  onAddToQuizSets?: (preset: FlashcardPreset) => void;
  theme?: any;
}

export function FlashcardPresetCard({
  preset,
  onStartDrill,
  onEditPreset,
  onDeletePreset,
  onAddToQuizSets,
}: FlashcardPresetCardProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.presetCard,
        {
          backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
        },
      ]}>
      {/* Top Badges & Actions */}
      <View style={styles.presetCardTop}>
        <View style={styles.presetBadgesRow}>
          <View
            style={[
              styles.presetPill,
              {
                backgroundColor: isDark
                  ? 'rgba(224, 122, 95, 0.2)'
                  : '#F8EAE4',
              },
            ]}>
            <Text style={[styles.presetPillText, { color: colors.accent }]}>
              {preset.cardCount} Cards
            </Text>
          </View>

          <View
            style={[
              styles.presetPill,
              {
                backgroundColor: isDark ? '#23262F' : '#FFFFFF',
              },
            ]}>
            <Text style={[styles.presetPillText, { color: colors.textSecondary }]}>
              {preset.lessonCount} Lessons
            </Text>
          </View>

          {preset.isShuffled && (
            <View
              style={[
                styles.presetPill,
                {
                  backgroundColor: isDark ? '#23262F' : '#FFFFFF',
                },
              ]}>
              <Shuffle size={10} color={colors.textSecondary} />
              <Text style={[styles.presetPillText, { color: colors.textSecondary }]}>
                Shuffled
              </Text>
            </View>
          )}
        </View>

        <View style={styles.topActionsRow}>
          <Pressable
            onPress={() => onEditPreset(preset)}
            hitSlop={8}
            style={({ pressed }) => [
              styles.iconBtn,
              {
                backgroundColor: isDark ? '#23262F' : '#FFFFFF',
                opacity: pressed ? 0.6 : 1,
              },
            ]}>
            <Pencil size={13} color={colors.textSecondary} />
          </Pressable>

          <Pressable
            onPress={() => onDeletePreset(preset.id)}
            hitSlop={8}
            style={({ pressed }) => [
              styles.iconBtn,
              {
                backgroundColor: isDark ? '#23262F' : '#FFFFFF',
                opacity: pressed ? 0.6 : 1,
              },
            ]}>
            <Trash2 size={13} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Preset Title & Scope */}
      <View style={styles.presetCardBody}>
        <Text style={[styles.presetCardTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
          {preset.title}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.presetCardScope, { color: colors.textSecondary }]}>
          {preset.subjectNames.join(' • ')}
        </Text>
      </View>

      {/* Footer & Actions */}
      <View style={styles.presetCardFooter}>
        <Text style={[styles.presetCardDate, { color: colors.textSecondary }]}>
          {preset.createdAt}
        </Text>

        <View style={styles.footerActions}>
          {onAddToQuizSets && (
            <Pressable
              onPress={() => onAddToQuizSets(preset)}
              style={({ pressed }) => [
                styles.addQuizBtn,
                {
                  backgroundColor: isDark ? '#23262F' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                  opacity: pressed ? 0.75 : 1,
                },
              ]}>
              <Text style={[styles.addQuizBtnText, { color: colors.accent }]}>
                + Quiz Set
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => onStartDrill(preset)}
            style={({ pressed }) => [
              styles.startDrillBtn,
              {
                backgroundColor: colors.accent,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}>
            <Play size={12} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.startDrillBtnText}>Start Deck</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  presetCard: {
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  presetCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  presetBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  presetPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetCardBody: {
    gap: 4,
  },
  presetCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  presetCardScope: {
    fontSize: 12,
  },
  presetCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  presetCardDate: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addQuizBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  addQuizBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  startDrillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  startDrillBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
