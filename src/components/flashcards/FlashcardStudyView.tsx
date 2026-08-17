import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react-native';

import { Radius } from '@/constants/theme';
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
  theme: any;
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
  theme,
}: FlashcardStudyViewProps) {
  return (
    <View style={styles.studyContainer}>
      <View style={styles.studyHeader}>
        <View style={styles.studyHeaderLeft}>
          <Text style={[styles.studyDeckLabel, { color: theme.accent }]}>
            {currentCard.subjectTitle}
          </Text>
          <Text style={[styles.studyTopicLabel, { color: theme.textSecondary }]}>
            {currentCard.lessonTitle}
          </Text>
        </View>
        <View
          style={[
            styles.studyCounterBadge,
            {
              backgroundColor: theme.backgroundSelected,
              borderColor: theme.border,
            },
          ]}>
          <Text style={[styles.studyCounter, { color: theme.text }]}>
            {studyIndex + 1} / {totalCards}
          </Text>
        </View>
      </View>

      {/* Flashcard Flip Box */}
      <Pressable
        onPress={onFlip}
        style={({ pressed }) => [
          styles.flashcardBox,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.border,
            opacity: pressed ? 0.95 : 1,
          },
        ]}>
        <View style={styles.cardSideBadgeRow}>
          <View
            style={[
              styles.sideBadge,
              {
                backgroundColor: isFlipped
                  ? theme.accentMuted
                  : theme.backgroundSelected,
                borderColor: theme.border,
              },
            ]}>
            <Text
              style={[
                styles.sideBadgeText,
                { color: isFlipped ? theme.accent : theme.textSecondary },
              ]}>
              {isFlipped ? 'ANSWER' : 'QUESTION'}
            </Text>
          </View>
          <Text style={[styles.flipHint, { color: theme.textSecondary }]}>
            Tap to flip card
          </Text>
        </View>

        <View style={styles.cardMainContent}>
          {!isFlipped ? (
            <Text style={[styles.questionText, { color: theme.text }]}>
              {currentCard.question}
            </Text>
          ) : (
            <View style={styles.answerBox}>
              <Text style={[styles.answerText, { color: theme.accent }]}>
                {currentCard.answer}
              </Text>
              <Text
                style={[
                  styles.explanationText,
                  { color: theme.textSecondary },
                ]}>
                {currentCard.explanation}
              </Text>
            </View>
          )}
        </View>

        <View
          style={[
            styles.cardActionRow,
            { borderTopColor: theme.border },
          ]}>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onToggleDifficult(currentCard.id);
            }}
            style={({ pressed }) => [
              styles.flagBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}>
            <AlertTriangle
              size={14}
              color={
                currentCard.isDifficult
                  ? theme.accent
                  : theme.textSecondary
              }
            />
            <Text
              style={[
                styles.flagBtnText,
                {
                  color: currentCard.isDifficult
                    ? theme.accent
                    : theme.textSecondary,
                },
              ]}>
              {currentCard.isDifficult ? 'Flagged Hard' : 'Mark Hard'}
            </Text>
          </Pressable>

          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onToggleFavorite(currentCard.id);
            }}
            style={({ pressed }) => [
              styles.flagBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}>
            <Star
              size={14}
              color={
                currentCard.isFavorite
                  ? theme.accent
                  : theme.textSecondary
              }
              fill={currentCard.isFavorite ? theme.accent : 'transparent'}
            />
            <Text
              style={[
                styles.flagBtnText,
                {
                  color: currentCard.isFavorite
                    ? theme.accent
                    : theme.textSecondary,
                },
              ]}>
              {currentCard.isFavorite ? 'Saved' : 'Save'}
            </Text>
          </Pressable>
        </View>
      </Pressable>

      {/* Navigation Controls */}
      <View style={styles.studyControls}>
        <Pressable
          disabled={studyIndex === 0}
          onPress={onPrev}
          style={({ pressed }) => [
            styles.navBtn,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
              opacity: studyIndex === 0 ? 0.4 : pressed ? 0.7 : 1,
            },
          ]}>
          <ChevronLeft size={18} color={theme.text} />
          <Text style={[styles.navBtnText, { color: theme.text }]}>
            Previous
          </Text>
        </Pressable>

        <Pressable
          onPress={onNext}
          style={({ pressed }) => [
            styles.navBtnPrimary,
            {
              backgroundColor: theme.accent,
              opacity: pressed ? 0.85 : 1,
            },
          ]}>
          <Text style={styles.navBtnPrimaryText}>
            {studyIndex < totalCards - 1 ? 'Next Card' : 'Finish Drill'}
          </Text>
          <ChevronRight size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  studyContainer: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  studyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studyHeaderLeft: {
    gap: 2,
    flex: 1,
  },
  studyDeckLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  studyTopicLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  studyCounterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  studyCounter: {
    fontSize: 12,
    fontWeight: '700',
  },
  flashcardBox: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: 20,
    justifyContent: 'space-between',
    minHeight: 280,
  },
  cardSideBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  sideBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  flipHint: {
    fontSize: 11.5,
  },
  cardMainContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    textAlign: 'center',
  },
  answerBox: {
    gap: 12,
    alignItems: 'center',
  },
  answerText: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  explanationText: {
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
  },
  flagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 4,
  },
  flagBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  studyControls: {
    flexDirection: 'row',
    gap: 12,
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  navBtnPrimary: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: Radius.md,
  },
  navBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
