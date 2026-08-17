import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Pencil, Play, Shuffle, Trash2 } from 'lucide-react-native';

import { Radius } from '@/constants/theme';
import { FlashcardPreset } from '@/types/curriculum';

export interface FlashcardPresetCardProps {
  preset: FlashcardPreset;
  onStartDrill: (preset: FlashcardPreset) => void;
  onEditPreset: (preset: FlashcardPreset) => void;
  onDeletePreset: (id: string) => void;
  theme: any;
}

export function FlashcardPresetCard({
  preset,
  onStartDrill,
  onEditPreset,
  onDeletePreset,
  theme,
}: FlashcardPresetCardProps) {
  return (
    <View
      style={[
        styles.presetCard,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
        },
      ]}>
      {/* Top Badges & Actions */}
      <View style={styles.presetCardTop}>
        <View style={styles.presetBadgesRow}>
          <View
            style={[
              styles.presetPill,
              {
                backgroundColor: theme.accentMuted,
                borderColor: theme.border,
              },
            ]}>
            <Text style={[styles.presetPillText, { color: theme.accent }]}>
              {preset.cardCount} Cards
            </Text>
          </View>

          <View
            style={[
              styles.presetPill,
              {
                backgroundColor: theme.backgroundSelected,
                borderColor: theme.border,
              },
            ]}>
            <Text style={[styles.presetPillText, { color: theme.textSecondary }]}>
              {preset.lessonCount} Lessons
            </Text>
          </View>

          {preset.isShuffled && (
            <View
              style={[
                styles.presetPill,
                {
                  backgroundColor: theme.backgroundSelected,
                  borderColor: theme.border,
                },
              ]}>
              <Shuffle size={10} color={theme.textSecondary} />
              <Text style={[styles.presetPillText, { color: theme.textSecondary }]}>
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
              { opacity: pressed ? 0.6 : 1 },
            ]}>
            <Pencil size={15} color={theme.textSecondary} />
          </Pressable>

          <Pressable
            onPress={() => onDeletePreset(preset.id)}
            hitSlop={8}
            style={({ pressed }) => [
              styles.iconBtn,
              { opacity: pressed ? 0.6 : 1 },
            ]}>
            <Trash2 size={15} color={theme.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Preset Title & Scope */}
      <View style={styles.presetCardBody}>
        <Text style={[styles.presetCardTitle, { color: theme.text }]}>
          {preset.title}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.presetCardScope, { color: theme.textSecondary }]}>
          {preset.subjectNames.join(' • ')}
        </Text>
      </View>

      {/* Footer & Actions */}
      <View style={[styles.presetCardFooter, { borderTopColor: theme.border }]}>
        <Text style={[styles.presetCardDate, { color: theme.textSecondary }]}>
          {preset.createdAt}
        </Text>

        <View style={styles.footerActions}>
          <Pressable
            onPress={() => onEditPreset(preset)}
            style={({ pressed }) => [
              styles.editBtn,
              {
                backgroundColor: theme.backgroundSelected,
                borderColor: theme.border,
                opacity: pressed ? 0.75 : 1,
              },
            ]}>
            <Pencil size={11} color={theme.text} />
            <Text style={[styles.editBtnText, { color: theme.text }]}>Edit</Text>
          </Pressable>

          <Pressable
            onPress={() => onStartDrill(preset)}
            style={({ pressed }) => [
              styles.startDrillBtn,
              {
                backgroundColor: theme.accent,
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <Play size={12} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.startDrillBtnText}>Start Flashcards</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  presetCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 14,
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
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  presetPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    padding: 4,
  },
  presetCardBody: {
    gap: 4,
  },
  presetCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  presetCardScope: {
    fontSize: 11.5,
  },
  presetCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  presetCardDate: {
    fontSize: 11,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  editBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  startDrillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.xs,
  },
  startDrillBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
});
