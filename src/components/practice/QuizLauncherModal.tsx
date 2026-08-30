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
import {
  Clock,
  HelpCircle,
  Play,
  Sparkles,
  Timer,
  X,
  Zap,
} from 'lucide-react-native';

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
  { label: '10s', value: 10, desc: 'Blitz' },
  { label: '15s', value: 15, desc: 'Fast' },
  { label: '30s', value: 30, desc: 'Standard' },
  { label: '45s', value: 45, desc: 'Relaxed' },
  { label: '60s', value: 60, desc: 'Extended' },
  { label: 'Untimed', value: 0, desc: 'No Limit' },
];

const QUESTION_COUNT_OPTIONS = [
  { label: '5 Questions', value: 5 },
  { label: '10 Questions', value: 10 },
  { label: '15 Questions', value: 15 },
  { label: '20 Questions', value: 20 },
  { label: '25 Questions', value: 25 },
  { label: '30 Questions', value: 30 },
];

export function QuizLauncherModal({
  visible,
  quizTitle,
  quizSubtitle,
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
            <View style={styles.modalHeaderTitleBox}>
              <Text
                numberOfLines={2}
                style={[styles.modalTitle, { color: colors.text }]}>
                {quizTitle || 'Practice Drill'}
              </Text>
              {quizSubtitle ? (
                <Text
                  numberOfLines={1}
                  style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  {quizSubtitle}
                </Text>
              ) : null}
            </View>

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

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalContent}>
            {/* 1. Question Timer Section */}
            <View
              style={[
                styles.configSectionBox,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                },
              ]}>
              <View style={styles.sectionHeaderRow}>
                <View
                  style={[
                    styles.sectionIconBadge,
                    {
                      backgroundColor: isDark ? 'rgba(224, 122, 95, 0.18)' : '#F8EAE4',
                    },
                  ]}>
                  <Timer size={16} color={colors.accent} strokeWidth={2.4} />
                </View>
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Question Timer
                  </Text>
                  <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
                    Time allowed per individual question
                  </Text>
                </View>
              </View>

              {/* Timer Options Grid */}
              <View style={styles.optionsGrid}>
                {TIMER_OPTIONS.map((item) => {
                  const isSelected = selectedTimer === item.value;
                  return (
                    <Pressable
                      key={item.label}
                      onPress={() => setSelectedTimer(item.value)}
                      style={({ pressed }) => [
                        styles.timerPillBtn,
                        {
                          backgroundColor: isSelected
                            ? colors.accent
                            : isDark
                              ? '#23262F'
                              : '#F8FAFC',
                          borderColor: isSelected
                            ? colors.accent
                            : isDark
                              ? 'rgba(255, 255, 255, 0.06)'
                              : 'rgba(0, 0, 0, 0.05)',
                          opacity: pressed ? 0.8 : 1,
                          transform: [{ scale: isSelected ? 1.02 : 1 }],
                        },
                      ]}>
                      <Text
                        style={[
                          styles.timerPillLabel,
                          {
                            color: isSelected ? '#FFFFFF' : colors.text,
                            fontWeight: isSelected ? '700' : '600',
                          },
                        ]}>
                        {item.label}
                      </Text>
                      <Text
                        style={[
                          styles.timerPillDesc,
                          {
                            color: isSelected ? 'rgba(255, 255, 255, 0.8)' : colors.textSecondary,
                          },
                        ]}>
                        {item.desc}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 2. Question Items Section */}
            <View
              style={[
                styles.configSectionBox,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                },
              ]}>
              <View style={styles.sectionHeaderRow}>
                <View
                  style={[
                    styles.sectionIconBadge,
                    {
                      backgroundColor: isDark ? 'rgba(14, 165, 233, 0.18)' : '#E0F2FE',
                    },
                  ]}>
                  <HelpCircle size={16} color="#0284C7" strokeWidth={2.4} />
                </View>
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Question Items
                  </Text>
                  <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
                    Number of items in this drill session
                  </Text>
                </View>
              </View>

              {/* Question Count Grid */}
              <View style={styles.optionsGrid}>
                {QUESTION_COUNT_OPTIONS.map((item) => {
                  const isSelected = selectedCount === item.value;
                  return (
                    <Pressable
                      key={item.label}
                      onPress={() => setSelectedCount(item.value)}
                      style={({ pressed }) => [
                        styles.countPillBtn,
                        {
                          backgroundColor: isSelected
                            ? colors.accent
                            : isDark
                              ? '#23262F'
                              : '#F8FAFC',
                          borderColor: isSelected
                            ? colors.accent
                            : isDark
                              ? 'rgba(255, 255, 255, 0.06)'
                              : 'rgba(0, 0, 0, 0.05)',
                          opacity: pressed ? 0.8 : 1,
                          transform: [{ scale: isSelected ? 1.02 : 1 }],
                        },
                      ]}>
                      <Text
                        style={[
                          styles.countPillLabel,
                          {
                            color: isSelected ? '#FFFFFF' : colors.text,
                            fontWeight: isSelected ? '700' : '600',
                          },
                        ]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

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
              <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
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
    maxHeight: '86%',
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
    paddingTop: 8,
    paddingBottom: 14,
    gap: 12,
  },
  modalHeaderTitleBox: {
    flex: 1,
    gap: 2,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  modalSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
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
    gap: 14,
    paddingBottom: 16,
  },
  configSectionBox: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionDesc: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timerPillBtn: {
    width: '31%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 14,
    borderWidth: 1,
    gap: 2,
  },
  timerPillLabel: {
    fontSize: 14,
  },
  timerPillDesc: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  countPillBtn: {
    width: '48.5%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  countPillLabel: {
    fontSize: 13,
  },
  bottomCtaContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  startQuizBtn: {
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#E07A5F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
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
