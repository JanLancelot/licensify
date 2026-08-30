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
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  HelpCircle,
  Play,
  ShieldCheck,
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

const GENERAL_REMINDERS = [
  {
    icon: Timer,
    title: 'Continuous Timer',
    desc: 'The examination clock runs continuously to simulate real board exam pressure.',
  },
  {
    icon: CheckCircle2,
    title: 'Flag & Review',
    desc: 'You can flag questions for later review before your final exam submission.',
  },
  {
    icon: BookOpen,
    title: 'Materials & Scratchpad',
    desc: 'Keep scratch paper, architectural scale, and non-programmable calculator ready.',
  },
  {
    icon: ShieldCheck,
    title: 'Passing Criterion',
    desc: 'Target score is 70% General Weighted Average with no subject score below 50%.',
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
              {target.subtitle ? (
                <Text
                  numberOfLines={1}
                  style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  {target.subtitle}
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
            {/* Overview Key Metrics Box */}
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
                      backgroundColor: isDark
                        ? 'rgba(224, 122, 95, 0.18)'
                        : '#F8EAE4',
                    },
                  ]}>
                  <Clock size={16} color={colors.accent} strokeWidth={2.4} />
                </View>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                  TOTAL TIME
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

              {/* Total Items */}
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
                  <HelpCircle size={16} color="#0284C7" strokeWidth={2.4} />
                </View>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                  QUESTIONS
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.metricValue, { color: colors.text }]}>
                  {typeof target.itemCount === 'number'
                    ? `${target.itemCount} Items`
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
                  <Award size={16} color="#059669" strokeWidth={2.4} />
                </View>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                  PASSING GWA
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.metricValue, { color: colors.text }]}>
                  70% Target
                </Text>
              </View>
            </View>

            {/* Covered Subjects Chips */}
            {target.subjects && target.subjects.length > 0 && (
              <View style={styles.subjectsSection}>
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

            {/* General Reminders List */}
            <View style={styles.remindersSection}>
              <Text
                style={[
                  styles.sectionHeading,
                  { color: isDark ? '#9CA3AF' : '#6B7280' },
                ]}>
                GENERAL REMINDERS
              </Text>

              <View
                style={[
                  styles.remindersCard,
                  {
                    backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                    borderColor: isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.06)',
                  },
                ]}>
                {GENERAL_REMINDERS.map((item, idx) => {
                  const IconComp = item.icon;
                  return (
                    <View
                      key={item.title}
                      style={[
                        styles.reminderRow,
                        idx < GENERAL_REMINDERS.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: isDark
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.04)',
                        },
                      ]}>
                      <View
                        style={[
                          styles.reminderIconBox,
                          {
                            backgroundColor: isDark ? '#23262F' : '#F6F0ED',
                          },
                        ]}>
                        <IconComp
                          size={15}
                          color={colors.accent}
                          strokeWidth={2.2}
                        />
                      </View>
                      <View style={styles.reminderTextBox}>
                        <Text
                          style={[
                            styles.reminderTitle,
                            { color: isDark ? '#F9FAFB' : '#111827' },
                          ]}>
                          {item.title}
                        </Text>
                        <Text
                          style={[
                            styles.reminderDesc,
                            { color: colors.textSecondary },
                          ]}>
                          {item.desc}
                        </Text>
                      </View>
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
              <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
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
    paddingBottom: 14,
    gap: 12,
  },
  modalHeaderTitleBox: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18.5,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 2,
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
    gap: 18,
    paddingBottom: 16,
  },
  metricsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 14,
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
    gap: 4,
  },
  metricIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
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
    height: 36,
  },
  subjectsSection: {
    gap: 8,
  },
  sectionHeading: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subjectChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  subjectChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  subjectChipText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  remindersSection: {
    gap: 8,
  },
  remindersCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
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
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    gap: 12,
  },
  reminderIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  reminderTextBox: {
    flex: 1,
    gap: 2,
  },
  reminderTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  reminderDesc: {
    fontSize: 12,
    lineHeight: 16.5,
    fontWeight: '500',
  },
  bottomCtaContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
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
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
