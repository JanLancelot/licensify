import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowRight, Check, CheckCircle2, Circle, X } from 'lucide-react-native';

import { useAppTheme } from '@/context/theme-context';
import { Lesson } from '@/types/curriculum';

export interface LessonDetailModalProps {
  selectedLesson: {
    subjectTitle: string;
    topicTitle: string;
    lesson: Lesson;
  } | null;
  onClose: () => void;
  isCompleted?: boolean;
  onToggleComplete?: (lessonId: string) => void;
  theme?: any;
}

export function LessonDetailModal({
  selectedLesson,
  onClose,
  isCompleted = false,
  onToggleComplete,
}: LessonDetailModalProps) {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();

  if (!selectedLesson) return null;

  return (
    <Modal
      visible={!!selectedLesson}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView
        style={[
          styles.modalContainer,
          { backgroundColor: colors.background },
        ]}>
        {/* Top Header Bar */}
        <View style={styles.modalTopBar}>
          <View style={styles.modalTitleBox}>
            <Text style={[styles.modalAreaTag, { color: colors.accent }]}>
              {selectedLesson?.subjectTitle} • {selectedLesson?.topicTitle}
            </Text>
            <Text style={[styles.modalMainTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
              {selectedLesson?.lesson.title}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={({ pressed }) => [
              styles.modalCloseBtn,
              {
                backgroundColor: isDark ? '#23262F' : '#F6F0ED',
                opacity: pressed ? 0.6 : 1,
              },
            ]}>
            <X size={18} color={colors.text} strokeWidth={2.4} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.modalContent}
          showsVerticalScrollIndicator={false}>
          {/* Completion Status Pill / Action */}
          {onToggleComplete && selectedLesson && (
            <Pressable
              onPress={() => onToggleComplete(selectedLesson.lesson.id)}
              style={({ pressed }) => [
                styles.completionToggleBtn,
                {
                  backgroundColor: isCompleted
                    ? isDark
                      ? 'rgba(16, 185, 129, 0.18)'
                      : '#ECFDF5'
                    : isDark
                      ? '#232731'
                      : '#F3F4F6',
                  borderColor: isCompleted
                    ? '#10B981'
                    : isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.06)',
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.99 : 1 }],
                },
              ]}>
              <View
                style={[
                  styles.completionIconBox,
                  {
                    backgroundColor: isCompleted ? '#10B981' : isDark ? '#374151' : '#E5E7EB',
                  },
                ]}>
                {isCompleted ? (
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                ) : (
                  <Circle size={14} color={isDark ? '#9CA3AF' : '#6B7280'} strokeWidth={2} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.completionTitle,
                    { color: isCompleted ? '#10B981' : colors.text },
                  ]}>
                  {isCompleted ? 'Completed Lesson' : 'Mark as Completed'}
                </Text>
                <Text
                  style={[
                    styles.completionSubtitle,
                    { color: isDark ? '#9CA3AF' : '#6B7280' },
                  ]}>
                  {isCompleted
                    ? 'Saved to your progress • Tap to mark uncompleted'
                    : 'Tap when finished studying this lesson'}
                </Text>
              </View>
              {isCompleted && (
                <CheckCircle2 size={20} color="#10B981" strokeWidth={2.4} />
              )}
            </Pressable>
          )}

          {/* Overview Card */}
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
              },
            ]}>
            <Text style={[styles.modalCardLabel, { color: colors.accent }]}>
              CORE SUMMARY & CONCEPTS
            </Text>
            <Text style={[styles.modalSummaryText, { color: isDark ? '#E2E8F0' : '#1E293B' }]}>
              {selectedLesson?.lesson.summary}
            </Text>
          </View>

          {/* Key Points */}
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
              },
            ]}>
            <Text style={[styles.modalCardLabel, { color: colors.accent }]}>
              KEY EXAM PROVISIONS & SPECIFICATIONS
            </Text>

            <View style={styles.keyPointsList}>
              {selectedLesson?.lesson.keyPoints.map((point, index) => (
                <View key={index} style={styles.pointRow}>
                  <View
                    style={[
                      styles.pointBullet,
                      { backgroundColor: colors.accent },
                    ]}
                  />
                  <Text style={[styles.pointText, { color: isDark ? '#CBD5E1' : '#334155' }]}>
                    {point}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Practice CTA Button */}
          <Pressable
            onPress={() => {
              onClose();
              router.push('/(tabs)/practice' as any);
            }}
            style={({ pressed }) => [
              styles.modalPracticeBtn,
              {
                backgroundColor: colors.accent,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              },
            ]}>
            <Text style={styles.modalPracticeText}>
              Practice Questions on this Subject
            </Text>
            <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.4} />
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 16,
  },
  modalTitleBox: {
    flex: 1,
    gap: 4,
  },
  modalAreaTag: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    padding: 20,
    gap: 14,
    paddingBottom: 40,
  },
  completionToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  completionIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  completionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  modalCard: {
    borderRadius: 20,
    padding: 18,
    gap: 12,
  },
  modalCardLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  modalSummaryText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },
  keyPointsList: {
    gap: 12,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  pointBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  pointText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: '400',
  },
  modalPracticeBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  modalPracticeText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
});
