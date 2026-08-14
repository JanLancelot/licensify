import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  RotateCw,
  BookOpen,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';
import { Radius } from '@/constants/theme';

const FLASHCARDS_DATA = [
  {
    id: 1,
    topic: 'Architectural History & Theory',
    question: 'Who is known as the "Father of Modern Architecture in the Philippines"?',
    answer: 'Juan M. Arellano & Andres Luna de San Pedro were pioneers, but Juan Nakpil was named the first National Artist for Architecture.',
    tag: 'National Artists',
  },
  {
    id: 2,
    topic: 'Building Laws (PD 1096)',
    question: 'What is the minimum ceiling height for naturally ventilated habitable rooms under NBCP Rule 8?',
    answer: '2.70 meters (9 feet) on ground floor, 2.40 meters on second floor, and 2.10 meters on succeeding storeys.',
    tag: 'NBCP Rule 8',
  },
  {
    id: 3,
    topic: 'Architectural Orders',
    question: 'Which Greek classical order is characterized by spiral volutes on its capital?',
    answer: 'Ionic Order.',
    tag: 'Classical Orders',
  },
  {
    id: 4,
    topic: 'Building Utilities (MEPFS)',
    question: 'What is the standard trap seal depth range for plumbing fixtures?',
    answer: '2 inches (51 mm) to 4 inches (102 mm).',
    tag: 'Sanitary Code',
  },
];

export default function FlashcardsScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const flipRotation = useSharedValue(0);

  const currentCard = FLASHCARDS_DATA[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    flipRotation.value = withSpring(isFlipped ? 0 : 180, {
      damping: 14,
      stiffness: 200,
    });
  };

  const handleNext = () => {
    setIsFlipped(false);
    flipRotation.value = 0;
    if (currentIndex < FLASHCARDS_DATA.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    flipRotation.value = 0;
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(FLASHCARDS_DATA.length - 1);
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Top Header with Instant Back Navigation */}
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
            PRACTICE / FLASHCARDS
          </Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Board Exam Recall
          </Text>
        </View>

        <View
          style={[
            styles.progressBadge,
            { backgroundColor: theme.accentMuted, borderColor: theme.border },
          ]}>
          <Text style={[styles.progressText, { color: theme.accent }]}>
            {currentIndex + 1} / {FLASHCARDS_DATA.length}
          </Text>
        </View>
      </View>

      {/* Main Flashcard Body */}
      <View style={styles.cardContainer}>
        <Pressable
          onPress={handleFlip}
          style={({ pressed }) => [
            styles.flashcard,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: isFlipped ? theme.accent : theme.border,
              opacity: pressed ? 0.95 : 1,
            },
          ]}>
          {/* Card Header */}
          <View style={styles.cardMeta}>
            <View
              style={[
                styles.topicTag,
                { backgroundColor: theme.accentMuted, borderColor: theme.border },
              ]}>
              <BookOpen size={13} color={theme.accent} />
              <Text style={[styles.topicTagText, { color: theme.accent }]}>
                {currentCard.tag}
              </Text>
            </View>

            <View style={styles.flipHint}>
              <RotateCw size={14} color={theme.textSecondary} />
              <Text style={[styles.flipHintText, { color: theme.textSecondary }]}>
                {isFlipped ? 'Tap for Question' : 'Tap to Flip Answer'}
              </Text>
            </View>
          </View>

          {/* Card Content */}
          <View style={styles.cardBody}>
            <Text
              style={[
                styles.stateLabel,
                { color: isFlipped ? theme.accent : theme.textSecondary },
              ]}>
              {isFlipped ? 'ANSWER / EXPLANATION' : 'QUESTION'}
            </Text>

            <Text style={[styles.cardMainText, { color: theme.text }]}>
              {isFlipped ? currentCard.answer : currentCard.question}
            </Text>
          </View>

          {/* Card Footer */}
          <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
            <Text style={[styles.topicSubtext, { color: theme.textSecondary }]}>
              {currentCard.topic}
            </Text>
          </View>
        </Pressable>

        {/* Action Controls */}
        <View style={styles.controlsRow}>
          <Pressable
            onPress={handlePrev}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}>
            <Text style={[styles.actionBtnText, { color: theme.text }]}>
              Previous
            </Text>
          </Pressable>

          <Pressable
            onPress={handleFlip}
            style={({ pressed }) => [
              styles.actionBtnPrimary,
              {
                backgroundColor: theme.accent,
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <RotateCw size={16} color="#FFFFFF" />
            <Text style={styles.actionBtnPrimaryText}>
              {isFlipped ? 'Show Question' : 'Reveal Answer'}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}>
            <Text style={[styles.actionBtnText, { color: theme.text }]}>
              Next
            </Text>
          </Pressable>
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
  progressBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  flashcard: {
    flex: 1,
    maxHeight: 460,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: 20,
    justifyContent: 'space-between',
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topicTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  topicTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  flipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flipHintText: {
    fontSize: 11,
  },
  cardBody: {
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  stateLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardMainText: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
  cardFooter: {
    borderTopWidth: 1,
    paddingTop: 12,
  },
  topicSubtext: {
    fontSize: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionBtnPrimary: {
    flex: 1.5,
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
