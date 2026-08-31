import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Star,
} from 'lucide-react-native';

import { useAppTheme } from '@/context/theme-context';
import { FlashcardItem } from '@/types/curriculum';

export interface FlashcardStudyViewProps {
  currentCard: FlashcardItem;
  studyIndex: number;
  totalCards: number;
  isFlipped: boolean;
  onFlip: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleDifficult: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  theme?: any;
}

export function FlashcardStudyView({
  currentCard,
  studyIndex,
  totalCards,
  isFlipped,
  onFlip,
  onPrev,
  onNext,
  onToggleDifficult,
  onToggleFavorite,
}: FlashcardStudyViewProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <View style={styles.studyContainer}>
      {/* Session Top Header */}
      <View style={styles.studyHeader}>
        <View style={styles.studyHeaderLeft}>
          <Text style={[styles.studyDeckLabel, { color: colors.accent }]}>
            {currentCard.subjectTitle}
          </Text>
          <Text style={[styles.studyTopicLabel, { color: colors.textSecondary }]}>
            {currentCard.lessonTitle}
          </Text>
        </View>
        <View
          style={[
            styles.studyCounterBadge,
            {
              backgroundColor: colors.accentMuted,
            },
          ]}>
          <Text style={[styles.studyCounter, { color: colors.accent }]}>
            {studyIndex + 1} / {totalCards}
          </Text>
        </View>
      </View>

      {/* Flashcard Flip Surface */}
      <Pressable
        onPress={onFlip}
        style={({ pressed }) => [
          styles.flashcardBox,
          {
            backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
            opacity: pressed ? 0.95 : 1,
          },
        ]}>
        <View style={styles.cardSideBadgeRow}>
          <View
            style={[
              styles.sideBadge,
              {
                backgroundColor: isFlipped
                  ? colors.accent
                  : isDark
                    ? '#23262F'
                    : '#FFFFFF',
              },
            ]}>
            <Text
              style={[
                styles.sideBadgeText,
                { color: isFlipped ? '#FFFFFF' : colors.textSecondary },
              ]}>
              {isFlipped ? 'ANSWER' : 'QUESTION'}
            </Text>
          </View>

          <View style={styles.flipHintRow}>
            <RotateCw size={12} color={colors.textSecondary} />
            <Text style={[styles.flipHint, { color: colors.textSecondary }]}>
              Tap to flip card
            </Text>
          </View>
        </View>

        <View style={styles.cardMainContent}>
          {!isFlipped ? (
            <Text style={[styles.questionText, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
              {currentCard.question}
            </Text>
          ) : (
            <Text style={[styles.answerText, { color: isDark ? '#E2E8F0' : '#1E293B' }]}>
              {currentCard.answer}
            </Text>
          )}
        </View>

        {/* Card Footer Info */}
        <View style={styles.cardFooterTag}>
          <Text style={[styles.categoryTagText, { color: colors.textSecondary }]}>
            {currentCard.topicTitle || 'Flashcard Concept'}
          </Text>
        </View>
      </Pressable>

      {/* Action Controls & Navigation */}
      <View style={styles.controlsRow}>
        {/* Toggle Difficult */}
        <Pressable
          onPress={() => onToggleDifficult(currentCard.id)}
          style={({ pressed }) => [
            styles.actionCircleBtn,
            {
              backgroundColor: currentCard.isDifficult
                ? '#EF4444'
                : isDark
                  ? '#23262F'
                  : '#F6F0ED',
              opacity: pressed ? 0.7 : 1,
            },
          ]}>
          <AlertTriangle
            size={18}
            color={currentCard.isDifficult ? '#FFFFFF' : colors.textSecondary}
          />
        </Pressable>

        {/* Prev Card */}
        <Pressable
          disabled={studyIndex === 0}
          onPress={onPrev}
          style={({ pressed }) => [
            styles.navBtn,
            {
              backgroundColor: isDark ? '#23262F' : '#F6F0ED',
              opacity: studyIndex === 0 ? 0.35 : pressed ? 0.7 : 1,
            },
          ]}>
          <ChevronLeft size={22} color={colors.text} />
        </Pressable>

        {/* Next Card */}
        <Pressable
          onPress={onNext}
          style={({ pressed }) => [
            styles.navBtnPrimary,
            {
              backgroundColor: colors.accent,
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}>
          <Text style={styles.navBtnPrimaryText}>
            {studyIndex === totalCards - 1 ? 'Finish' : 'Next'}
          </Text>
          <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.4} />
        </Pressable>

        {/* Toggle Favorite */}
        <Pressable
          onPress={() => onToggleFavorite(currentCard.id)}
          style={({ pressed }) => [
            styles.actionCircleBtn,
            {
              backgroundColor: currentCard.isFavorite
                ? '#F59E0B'
                : isDark
                  ? '#23262F'
                  : '#F6F0ED',
              opacity: pressed ? 0.7 : 1,
            },
          ]}>
          <Star
            size={18}
            color={currentCard.isFavorite ? '#FFFFFF' : colors.textSecondary}
            fill={currentCard.isFavorite ? '#FFFFFF' : 'none'}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  studyContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    gap: 16,
  },
  studyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studyHeaderLeft: {
    flex: 1,
    gap: 2,
  },
  studyDeckLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  studyTopicLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  studyCounterBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  studyCounter: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  flashcardBox: {
    flex: 1,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardSideBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sideBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  flipHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flipHint: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  cardMainContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  answerText: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 25,
  },
  cardFooterTag: {
    alignItems: 'center',
  },
  categoryTagText: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 4,
  },
  actionCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnPrimary: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  navBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
});
