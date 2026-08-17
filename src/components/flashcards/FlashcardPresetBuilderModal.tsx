import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from 'react-native-reanimated';
import { Check, Plus, Shuffle, Sparkles, X } from 'lucide-react-native';

import { Radius } from '@/constants/theme';
import { RotatingChevron } from '@/components/ui/RotatingChevron';
import { PresetTopicItem } from '@/components/flashcards/PresetTopicItem';
import { SUBJECT_NOTES } from '@/data/curriculum';
import { SubjectNote, Topic } from '@/types/curriculum';

export interface FlashcardPresetBuilderModalProps {
  visible: boolean;
  onClose: () => void;
  onCreatePreset: () => void;
  expandedSubjects: Record<string, boolean>;
  expandedTopics: Record<string, boolean>;
  selectedLessonIds: Set<string>;
  toggleSubject: (subjectId: string) => void;
  toggleSubjectSelection: (subject: SubjectNote) => void;
  toggleTopic: (topicId: string) => void;
  toggleTopicSelection: (topic: Topic) => void;
  toggleLessonSelection: (lessonId: string) => void;
  isShuffled: boolean;
  setIsShuffled: (val: boolean) => void;
  isRandomized: boolean;
  setIsRandomized: (val: boolean) => void;
  customTitle: string;
  setCustomTitle: (val: string) => void;
  bottomInset: number;
  theme: any;
}

export function FlashcardPresetBuilderModal({
  visible,
  onClose,
  onCreatePreset,
  expandedSubjects,
  expandedTopics,
  selectedLessonIds,
  toggleSubject,
  toggleSubjectSelection,
  toggleTopic,
  toggleTopicSelection,
  toggleLessonSelection,
  isShuffled,
  setIsShuffled,
  isRandomized,
  setIsRandomized,
  customTitle,
  setCustomTitle,
  bottomInset,
  theme,
}: FlashcardPresetBuilderModalProps) {
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
              backgroundColor: theme.background,
              borderColor: theme.border,
              paddingBottom: Math.max(bottomInset + 12, 20),
            },
          ]}>
          {/* Sheet Handle */}
          <View style={styles.modalHandleBar}>
            <View style={[styles.modalHandle, { backgroundColor: theme.borderStrong }]} />
          </View>

          {/* Modal Header */}
          <View
            style={[
              styles.modalHeader,
              {
                backgroundColor: theme.backgroundElement,
                borderBottomColor: theme.border,
              },
            ]}>
            <View style={styles.modalHeaderTitleBox}>
              <Text style={[styles.modalKicker, { color: theme.accent }]}>
                FLASHCARD PRESET BUILDER
              </Text>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Select from Notes
              </Text>
            </View>

            <Pressable onPress={onClose} style={styles.modalCloseBtn}>
              <X size={20} color={theme.text} />
            </Pressable>
          </View>

          {/* Notes List with + Add Selection Buttons */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalNotesContent}>
            <View style={styles.notesList}>
              {SUBJECT_NOTES.map((subject) => {
                const isSubjectOpen = !!expandedSubjects[subject.id];
                const IconComponent = subject.icon;
                const subjectLessonIds = subject.topics.flatMap((t) =>
                  t.lessons.map((l) => l.id)
                );
                const selectedInSubjectCount = subjectLessonIds.filter((id) =>
                  selectedLessonIds.has(id)
                ).length;
                const isAllSubjectSelected =
                  subjectLessonIds.length > 0 &&
                  selectedInSubjectCount === subjectLessonIds.length;
                const isSomeSubjectSelected =
                  selectedInSubjectCount > 0 && !isAllSubjectSelected;
                const hasSubjectSelected = selectedInSubjectCount > 0;

                // Find index of the last topic in this subject that has selected lessons
                const lastSelectedTopicIndex = subject.topics.reduce(
                  (lastIdx, topic, idx) => {
                    const hasSelected = topic.lessons.some((l) =>
                      selectedLessonIds.has(l.id)
                    );
                    return hasSelected ? idx : lastIdx;
                  },
                  -1
                );

                return (
                  <Animated.View
                    key={subject.id}
                    layout={LinearTransition.duration(200)}
                    style={[
                      styles.subjectCard,
                      {
                        backgroundColor: hasSubjectSelected
                          ? theme.backgroundSelected
                          : theme.backgroundElement,
                        borderColor: hasSubjectSelected
                          ? theme.accent
                          : theme.border,
                        borderWidth: hasSubjectSelected ? 1.5 : 1,
                      },
                    ]}>
                    {/* Subject Level Header */}
                    <View style={styles.subjectHeaderRow}>
                      <Pressable
                        onPress={() => toggleSubject(subject.id)}
                        style={styles.subjectHeaderLeftArea}>
                        <View
                          style={[
                            styles.circleLogo,
                            {
                              backgroundColor: hasSubjectSelected
                                ? theme.accent
                                : theme.accentMuted,
                            },
                          ]}>
                          <IconComponent
                            size={20}
                            color={hasSubjectSelected ? '#FFFFFF' : theme.accent}
                            strokeWidth={2.2}
                          />
                        </View>

                        <View style={styles.subjectHeaderInfo}>
                          <Text style={[styles.subjectTitle, { color: theme.text }]}>
                            {subject.title}
                          </Text>
                          <Text
                            style={[
                              styles.subjectSubtext,
                              {
                                color: hasSubjectSelected
                                  ? theme.accent
                                  : theme.textSecondary,
                                fontWeight: hasSubjectSelected ? '700' : '400',
                              },
                            ]}>
                            {hasSubjectSelected
                              ? `${selectedInSubjectCount} of ${subjectLessonIds.length} Lessons Selected`
                              : `${subject.topics.length} Topics • ${subjectLessonIds.length} Lessons`}
                          </Text>
                        </View>
                      </Pressable>

                      {/* + Add Subject Button */}
                      <Pressable
                        onPress={() => toggleSubjectSelection(subject)}
                        style={({ pressed }) => [
                          styles.addCircleBtn,
                          {
                            backgroundColor: isAllSubjectSelected
                              ? theme.accent
                              : isSomeSubjectSelected
                              ? theme.accentMuted
                              : theme.backgroundSelected,
                            borderColor: isAllSubjectSelected || isSomeSubjectSelected
                              ? theme.accent
                              : theme.border,
                            opacity: pressed ? 0.75 : 1,
                          },
                        ]}>
                        {isAllSubjectSelected ? (
                          <Check size={14} color="#FFFFFF" strokeWidth={3} />
                        ) : (
                          <Plus
                            size={14}
                            color={isSomeSubjectSelected ? theme.accent : theme.text}
                            strokeWidth={2.5}
                          />
                        )}
                      </Pressable>

                      {/* Chevron Expand */}
                      <Pressable
                        onPress={() => toggleSubject(subject.id)}
                        style={styles.chevronPressable}>
                        <RotatingChevron
                          isOpen={isSubjectOpen}
                          color={hasSubjectSelected ? theme.accent : theme.textSecondary}
                          size={18}
                        />
                      </Pressable>
                    </View>

                    {/* Topic Level Accordion */}
                    {isSubjectOpen && (
                      <Animated.View
                        entering={FadeInDown.duration(200)}
                        exiting={FadeOutUp.duration(160)}
                        layout={LinearTransition.duration(200)}
                        style={styles.topicsContainer}>
                        {subject.topics.map((topic, tIdx) => {
                          const isLastTopic = tIdx === subject.topics.length - 1;
                          return (
                            <PresetTopicItem
                              key={topic.id}
                              topic={topic}
                              tIdx={tIdx}
                              isLastTopic={isLastTopic}
                              selectedLessonIds={selectedLessonIds}
                              expandedTopics={expandedTopics}
                              toggleTopic={toggleTopic}
                              toggleTopicSelection={toggleTopicSelection}
                              toggleLessonSelection={toggleLessonSelection}
                              lastSelectedTopicIndex={lastSelectedTopicIndex}
                              theme={theme}
                            />
                          );
                        })}
                      </Animated.View>
                    )}
                  </Animated.View>
                );
              })}
            </View>
          </ScrollView>

          {/* ── Modal Bottom Controls & Action Bar ──────────────────────── */}
          <View
            style={[
              styles.modalBottomPanel,
              {
                backgroundColor: theme.backgroundElement,
                borderTopColor: theme.border,
              },
            ]}>
            {/* Selected Summary and Toggles */}
            <View style={styles.optionsRow}>
              <View style={styles.selectionCountBox}>
                <Text style={[styles.selectionCountNumber, { color: theme.accent }]}>
                  {selectedLessonIds.size}
                </Text>
                <Text style={[styles.selectionCountLabel, { color: theme.textSecondary }]}>
                  Lessons selected
                </Text>
              </View>

              {/* Shuffled Toggle */}
              <Pressable
                onPress={() => setIsShuffled(!isShuffled)}
                style={[
                  styles.toggleChip,
                  {
                    backgroundColor: isShuffled
                      ? theme.accentMuted
                      : theme.backgroundSelected,
                    borderColor: isShuffled ? theme.accent : theme.border,
                  },
                ]}>
                <Shuffle
                  size={12}
                  color={isShuffled ? theme.accent : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.toggleChipText,
                    { color: isShuffled ? theme.accent : theme.textSecondary },
                  ]}>
                  Shuffled
                </Text>
              </Pressable>

              {/* Randomized Toggle */}
              <Pressable
                onPress={() => setIsRandomized(!isRandomized)}
                style={[
                  styles.toggleChip,
                  {
                    backgroundColor: isRandomized
                      ? theme.accentMuted
                      : theme.backgroundSelected,
                    borderColor: isRandomized ? theme.accent : theme.border,
                  },
                ]}>
                <Sparkles
                  size={12}
                  color={isRandomized ? theme.accent : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.toggleChipText,
                    { color: isRandomized ? theme.accent : theme.textSecondary },
                  ]}>
                  Randomized
                </Text>
              </Pressable>
            </View>

            {/* Custom Title Input */}
            <TextInput
              value={customTitle}
              onChangeText={setCustomTitle}
              placeholder="Custom Preset Title (Optional)"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.titleInput,
                {
                  backgroundColor: theme.backgroundSelected,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
            />

            {/* Create Action Button */}
            <Pressable
              onPress={onCreatePreset}
              style={({ pressed }) => [
                styles.createPresetActionBtn,
                {
                  backgroundColor: theme.accent,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.createPresetActionBtnText}>
                Add to Flashcards ({selectedLessonIds.size} Lessons)
              </Text>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalSheet: {
    maxHeight: '90%',
    minHeight: '75%',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHandleBar: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalHandle: {
    width: 38,
    height: 4.5,
    borderRadius: Radius.full,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalHeaderTitleBox: {
    gap: 2,
  },
  modalKicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalNotesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  notesList: {
    gap: 12,
  },
  subjectCard: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  subjectHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  subjectHeaderLeftArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circleLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectHeaderInfo: {
    flex: 1,
    gap: 2,
  },
  subjectTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  subjectSubtext: {
    fontSize: 11,
  },
  addCircleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  chevronPressable: {
    padding: 4,
  },
  topicsContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingLeft: 12,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 2,
    gap: 0,
  },
  modalBottomPanel: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  selectionCountBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    flex: 1,
  },
  selectionCountNumber: {
    fontSize: 16,
    fontWeight: '800',
  },
  selectionCountLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  toggleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  toggleChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  titleInput: {
    height: 40,
    borderRadius: Radius.xs,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  createPresetActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: Radius.xs,
  },
  createPresetActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
