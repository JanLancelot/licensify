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
import { X } from 'lucide-react-native';

import { Radius } from '@/constants/theme';
import { Lesson } from '@/types/curriculum';

export interface LessonDetailModalProps {
  selectedLesson: {
    subjectTitle: string;
    topicTitle: string;
    lesson: Lesson;
  } | null;
  onClose: () => void;
  theme: any;
}

export function LessonDetailModal({
  selectedLesson,
  onClose,
  theme,
}: LessonDetailModalProps) {
  const router = useRouter();

  return (
    <Modal
      visible={!!selectedLesson}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView
        style={[
          styles.modalContainer,
          { backgroundColor: theme.background },
        ]}>
        <View style={[styles.modalTopBar, { borderBottomColor: theme.border }]}>
          <View style={styles.modalTitleBox}>
            <Text style={[styles.modalAreaTag, { color: theme.accent }]}>
              {selectedLesson?.subjectTitle} • {selectedLesson?.topicTitle}
            </Text>
            <Text style={[styles.modalMainTitle, { color: theme.text }]}>
              {selectedLesson?.lesson.title}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={({ pressed }) => [
              styles.modalCloseBtn,
              { opacity: pressed ? 0.5 : 1 },
            ]}>
            <X size={20} color={theme.text} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.modalContent}
          showsVerticalScrollIndicator={false}>
          {/* Overview Card */}
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}>
            <Text style={[styles.modalCardLabel, { color: theme.accent }]}>
              CORE SUMMARY & CONCEPTS
            </Text>
            <Text style={[styles.modalSummaryText, { color: theme.text }]}>
              {selectedLesson?.lesson.summary}
            </Text>
          </View>

          {/* Key Points */}
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}>
            <Text style={[styles.modalCardLabel, { color: theme.accent }]}>
              KEY EXAM PROVISIONS & SPECIFICATIONS
            </Text>

            <View style={styles.keyPointsList}>
              {selectedLesson?.lesson.keyPoints.map((point, index) => (
                <View key={index} style={styles.pointRow}>
                  <View
                    style={[
                      styles.pointBullet,
                      { backgroundColor: theme.accent },
                    ]}
                  />
                  <Text style={[styles.pointText, { color: theme.text }]}>
                    {point}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Practice CTA */}
          <Pressable
            onPress={() => {
              onClose();
              router.push('/(tabs)/practice' as any);
            }}
            style={[
              styles.modalPracticeBtn,
              { backgroundColor: theme.accent },
            ]}>
            <Text style={styles.modalPracticeText}>
              Practice Questions on this Subject
            </Text>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
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
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  modalCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  modalCardLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  modalSummaryText: {
    fontSize: 14,
    lineHeight: 22,
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
  },
  modalPracticeBtn: {
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  modalPracticeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
