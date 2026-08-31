import React from 'react';
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
  Award,
  Calculator,
  CheckCircle2,
  Clock,
  Flag,
  HelpCircle,
  Play,
  Timer,
  X,
} from 'lucide-react-native';

import { useAppTheme } from '@/context/theme-context';

export interface ExamRemindersTarget {
  id: string;
  title: string;
  subtitle?: string;
  itemCount: number | string;
  durationLabel: string;
  durationSeconds: number;
  subjects?: string[];
  isComprehensive?: boolean;
}

export interface ExamRemindersModalProps {
  visible: boolean;
  target: ExamRemindersTarget | null;
  onClose: () => void;
  onStartExam: (target: ExamRemindersTarget) => void;
  bottomInset?: number;
}

const QUICK_REMINDERS = [
  {
    icon: Timer,
    text: 'Continuous timer — cannot be paused once started',
  },
  {
    icon: Flag,
    text: 'Flag items to review before final submission',
  },
  {
    icon: Calculator,
    text: 'Calculator, scale, and scratchpad permitted',
  },
];

export function ExamRemindersModal({
  visible,
  target,
  onClose,
  onStartExam,
  bottomInset = 0,
}: ExamRemindersModalProps) {
  const { colors, isDark } = useAppTheme();

  if (!target) return null;

  const handleStart = () => {
    onStartExam(target);
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
                {target.title}
              </Text>
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
            {/* Overview 3-Stat Key Metrics Card */}
            <View
              style={[
                styles.metricsCard,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.06)',
                },
              ]}>
              {/* Total Duration */}
              <View style={styles.metricItem}>
                <View
                  style={[
                    styles.metricIconCircle,
                    {
                      backgroundColor: colors.accentMuted,
                    },
                  ]}>
                  <Clock size={15} color={colors.accent} strokeWidth={2.4} />
                </View>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                  TIME
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.metricValue, { color: colors.text }]}>
                  {target.durationLabel}
                </Text>
              </View>

              <View
                style={[
                  styles.metricDivider,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.06)',
                  },
                ]}
              />

              {/* Total Questions */}
              <View style={styles.metricItem}>
                <View
                  style={[
                    styles.metricIconCircle,
                    {
                      backgroundColor: isDark
                        ? 'rgba(14, 165, 233, 0.18)'
                        : '#E0F2FE',
                    },
                  ]}>
                  <HelpCircle size={15} color="#0284C7" strokeWidth={2.4} />
                </View>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                  ITEMS
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.metricValue, { color: colors.text }]}>
                  {typeof target.itemCount === 'number'
                    ? `${target.itemCount} Qs`
                    : target.itemCount}
                </Text>
              </View>

              <View
                style={[
                  styles.metricDivider,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.06)',
                  },
                ]}
              />

              {/* Passing Standard */}
              <View style={styles.metricItem}>
                <View
                  style={[
                    styles.metricIconCircle,
                    {
                      backgroundColor: isDark
                        ? 'rgba(16, 185, 129, 0.18)'
                        : '#D1FAE5',
                    },
                  ]}>
                  <Award size={15} color="#059669" strokeWidth={2.4} />
                </View>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                  PASSING
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.metricValue, { color: colors.text }]}>
                  70% GWA
                </Text>
              </View>
            </View>

            {/* Covered Subjects Chips */}
            {target.subjects && target.subjects.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text
                  style={[
                    styles.sectionHeading,
                    { color: isDark ? '#9CA3AF' : '#6B7280' },
                  ]}>
                  COVERED SUBJECTS
                </Text>
                <View style={styles.subjectChipsRow}>
                  {target.subjects.map((sub, sIdx) => (
                    <View
                      key={sIdx}
                      style={[
                        styles.subjectChip,
                        {
                          backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
                          borderColor: isDark
                            ? 'rgba(255, 255, 255, 0.06)'
                            : 'rgba(0, 0, 0, 0.05)',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.subjectChipText,
                          { color: isDark ? '#F3F4F6' : '#1F2937' },
                        ]}>
                        {sub}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Quick Reminders List */}
            <View style={styles.sectionBlock}>
              <Text
                style={[
                  styles.sectionHeading,
                  { color: isDark ? '#9CA3AF' : '#6B7280' },
                ]}>
                EXAM REMINDERS
              </Text>

              <View
                style={[
                  styles.remindersBox,
                  {
                    backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                    borderColor: isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.06)',
                  },
                ]}>
                {QUICK_REMINDERS.map((item, idx) => {
                  const IconComp = item.icon;
                  return (
                    <View
                      key={item.text}
                      style={[
                        styles.reminderLine,
                        idx < QUICK_REMINDERS.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: isDark
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.04)',
                        },
                      ]}>
                      <View
                        style={[
                          styles.reminderDot,
                          {
                            backgroundColor: isDark ? '#23262F' : '#F6F0ED',
                          },
                        ]}>
                        <IconComp
                          size={13}
                          color={colors.accent}
                          strokeWidth={2.4}
                        />
                      </View>
                      <Text
                        style={[
                          styles.reminderText,
                          { color: isDark ? '#E5E7EB' : '#374151' },
                        ]}>
                        {item.text}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Sticky Bottom Start Button */}
          <View style={styles.bottomCtaContainer}>
            <Pressable
              onPress={handleStart}
              style={({ pressed }) => [
                styles.startBtn,
                {
                  backgroundColor: colors.accent,
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                },
              ]}>
              <Play size={17} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.startBtnText}>Start Examination</Text>
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
    maxHeight: '88%',
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
    paddingBottom: 4,
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
    paddingBottom: 12,
    gap: 12,
  },
  modalHeaderTitleBox: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 14,
  },
  metricsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      },
    }),
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  metricIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  metricDivider: {
    width: 1,
    height: 32,
  },
  sectionBlock: {
    gap: 8,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subjectChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  subjectChip: {
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 9,
    borderWidth: 1,
  },
  subjectChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  remindersBox: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  reminderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    gap: 10,
  },
  reminderDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  bottomCtaContainer: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  startBtn: {
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
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
