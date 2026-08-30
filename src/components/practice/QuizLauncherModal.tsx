import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Play, X } from 'lucide-react-native';

import { useAppTheme } from '@/context/theme-context';

export interface QuizLaunchConfig {
  timerSeconds: number; // 0 for untimed
  questionCount: number;
}

export interface QuizLauncherModalProps {
  visible: boolean;
  quizTitle: string;
  quizSubtitle?: string;
  initialTimerSeconds?: number;
  initialQuestionCount?: number;
  onClose: () => void;
  onStartQuiz: (config: QuizLaunchConfig) => void;
  bottomInset?: number;
}

const TIMER_OPTIONS = [
  { label: '10s', value: 10 },
  { label: '15s', value: 15 },
  { label: '30s', value: 30 },
  { label: '45s', value: 45 },
  { label: '60s', value: 60 },
  { label: 'Off', value: 0 },
];

const QUESTION_COUNT_OPTIONS = [
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '15', value: 15 },
  { label: '20', value: 20 },
  { label: '25', value: 25 },
  { label: '30', value: 30 },
];

export function QuizLauncherModal({
  visible,
  quizTitle,
  initialTimerSeconds = 15,
  initialQuestionCount = 10,
  onClose,
  onStartQuiz,
  bottomInset = 0,
}: QuizLauncherModalProps) {
  const { colors, isDark } = useAppTheme();

  const [selectedTimer, setSelectedTimer] = useState<number>(initialTimerSeconds);
  const [selectedCount, setSelectedCount] = useState<number>(initialQuestionCount);

  // Sync initial values when modal opens
  React.useEffect(() => {
    if (visible) {
      setSelectedTimer(initialTimerSeconds);
      setSelectedCount(initialQuestionCount);
    }
  }, [visible, initialTimerSeconds, initialQuestionCount]);

  const handleStart = () => {
    onStartQuiz({
      timerSeconds: selectedTimer,
      questionCount: selectedCount,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalDismissArea} onPress={onClose} />

        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: colors.background,
              paddingBottom: Math.max(bottomInset + 16, 24),
            },
          ]}>
          {/* Sheet Handle */}
          <View style={styles.modalHandleBar}>
            <View
              style={[
                styles.modalHandle,
                { backgroundColor: isDark ? '#374151' : '#D1D5DB' },
              ]}
            />
          </View>

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text
              numberOfLines={2}
              style={[styles.modalTitle, { color: colors.text }]}>
              {quizTitle || 'Practice Drill'}
            </Text>

            <Pressable
              onPress={onClose}
              hitSlop={8}
              style={({ pressed }) => [
                styles.modalCloseBtn,
                {
                  backgroundColor: isDark ? '#23262F' : '#F3F4F6',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <X size={18} color={colors.text} strokeWidth={2.4} />
            </Pressable>
          </View>

          <View style={styles.modalContent}>
            {/* 1. Question Timer Section */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Question Timer
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}>
                {TIMER_OPTIONS.map((item) => {
                  const isSelected = selectedTimer === item.value;
                  return (
                    <Pressable
                      key={item.label}
                      onPress={() => setSelectedTimer(item.value)}
                      style={({ pressed }) => [
                        styles.circleBtn,
                        {
                          backgroundColor: isSelected
                            ? colors.accent
                            : isDark
                              ? '#1C1F26'
                              : '#F6F0ED',
                          borderColor: isSelected
                            ? colors.accent
                            : isDark
                              ? 'rgba(255, 255, 255, 0.08)'
                              : 'rgba(0, 0, 0, 0.06)',
                          opacity: pressed ? 0.8 : 1,
                          transform: [{ scale: isSelected ? 1.04 : 1 }],
                        },
                      ]}>
                      <Text
                        style={[
                          styles.circleBtnText,
                          {
                            color: isSelected ? '#FFFFFF' : colors.text,
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* 2. Question Items Section */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Question Items
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}>
                {QUESTION_COUNT_OPTIONS.map((item) => {
                  const isSelected = selectedCount === item.value;
                  return (
                    <Pressable
                      key={item.label}
                      onPress={() => setSelectedCount(item.value)}
                      style={({ pressed }) => [
                        styles.circleBtn,
                        {
                          backgroundColor: isSelected
                            ? colors.accent
                            : isDark
                              ? '#1C1F26'
                              : '#F6F0ED',
                          borderColor: isSelected
                            ? colors.accent
                            : isDark
                              ? 'rgba(255, 255, 255, 0.08)'
                              : 'rgba(0, 0, 0, 0.06)',
                          opacity: pressed ? 0.8 : 1,
                          transform: [{ scale: isSelected ? 1.04 : 1 }],
                        },
                      ]}>
                      <Text
                        style={[
                          styles.circleBtnText,
                          {
                            color: isSelected ? '#FFFFFF' : colors.text,
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Sticky Start Quiz CTA */}
          <View style={styles.bottomCtaContainer}>
            <Pressable
              onPress={handleStart}
              style={({ pressed }) => [
                styles.startQuizBtn,
                {
                  backgroundColor: colors.accent,
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                },
              ]}>
              <Play size={17} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.startQuizBtnText}>Start Quiz</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0 -8px 32px rgba(0,0,0,0.18)',
      },
    }),
  },
  modalHandleBar: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 16,
    gap: 12,
  },
  modalTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    paddingHorizontal: 20,
    gap: 20,
    paddingBottom: 20,
  },
  sectionBlock: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  horizontalList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 2,
  },
  circleBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
      },
    }),
  },
  circleBtnText: {
    fontSize: 14,
    letterSpacing: -0.2,
  },
  bottomCtaContainer: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  startQuizBtn: {
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 14px rgba(224, 122, 95, 0.35)',
      },
    }),
  },
  startQuizBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
