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
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  Compass,
  Flame,
  Landmark,
  Layers,
  Lightbulb,
  PenTool,
  Plus,
  Shuffle,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react-native';
import Svg, {
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { PresetTopicItem } from '@/components/flashcards/PresetTopicItem';
import { RotatingChevron } from '@/components/ui/RotatingChevron';
import { useAppTheme } from '@/context/theme-context';
import { SUBJECT_NOTES } from '@/data/curriculum';
import { SubjectNote, Topic } from '@/types/curriculum';

export const PRESET_ICONS = [
  { id: 'Layers', name: 'Layers', icon: Layers, gradient: ['#E58368', '#C85A32'] as [string, string] },
  { id: 'Sparkles', name: 'Sparkles', icon: Sparkles, gradient: ['#FBBF24', '#D97706'] as [string, string] },
  { id: 'BookOpen', name: 'Book', icon: BookOpen, gradient: ['#38BDF8', '#0284C7'] as [string, string] },
  { id: 'Compass', name: 'Compass', icon: Compass, gradient: ['#34D399', '#059669'] as [string, string] },
  { id: 'Landmark', name: 'Landmark', icon: Landmark, gradient: ['#A78BFA', '#7C3AED'] as [string, string] },
  { id: 'Flame', name: 'Flame', icon: Flame, gradient: ['#FB7185', '#E11D48'] as [string, string] },
  { id: 'Zap', name: 'Zap', icon: Zap, gradient: ['#F59E0B', '#B45309'] as [string, string] },
  { id: 'Brain', name: 'Brain', icon: Brain, gradient: ['#EC4899', '#BE185D'] as [string, string] },
  { id: 'Lightbulb', name: 'Idea', icon: Lightbulb, gradient: ['#10B981', '#047857'] as [string, string] },
  { id: 'Target', name: 'Target', icon: Target, gradient: ['#6366F1', '#4338CA'] as [string, string] },
  { id: 'PenTool', name: 'Design', icon: PenTool, gradient: ['#14B8A6', '#0F766E'] as [string, string] },
  { id: 'Trophy', name: 'Trophy', icon: Trophy, gradient: ['#EAB308', '#A16207'] as [string, string] },
];

export interface FlashcardPresetBuilderModalProps {
  visible: boolean;
  isEditing?: boolean;
  onClose: () => void;
  onSubmit: () => void;
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
  customTitle: string;
  setCustomTitle: (val: string) => void;
  selectedIconId: string;
  setSelectedIconId: (val: string) => void;
  bottomInset: number;
  theme?: any;
}

/* Subject Gradient Squircle */
function SubjectGradientIcon({
  icon: IconComponent,
  colors: [startColor, endColor],
  size = 44,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  colors: [string, string];
  size?: number;
}) {
  const gradId = `bld_subj_${startColor.replace(/[^a-zA-Z0-9]/g, '')}_${endColor.replace(/[^a-zA-Z0-9]/g, '')}_${size}`;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={startColor} />
            <Stop offset="100%" stopColor={endColor} />
          </LinearGradient>
        </Defs>
        <Rect width={size} height={size} rx={14} fill={`url(#${gradId})`} />
      </Svg>
      <IconComponent size={22} color="#FFFFFF" strokeWidth={2.2} />
    </View>
  );
}

const SUBJECT_GRADIENTS: [string, string][] = [
  ['#E58368', '#C85A32'], // Terracotta
  ['#FBBF24', '#D97706'], // Amber
  ['#38BDF8', '#0284C7'], // Sky Blue
  ['#34D399', '#059669'], // Emerald
  ['#A78BFA', '#7C3AED'], // Violet
  ['#FB7185', '#E11D48'], // Rose
];

export function FlashcardPresetBuilderModal({
  visible,
  isEditing = false,
  onClose,
  onSubmit,
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
  customTitle,
  setCustomTitle,
  selectedIconId,
  setSelectedIconId,
  bottomInset,
}: FlashcardPresetBuilderModalProps) {
  const { colors, isDark } = useAppTheme();

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
              paddingBottom: Math.max(bottomInset + 12, 20),
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
              <Text style={[styles.modalTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
                FLASHCARD PRESETS
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={[
                styles.modalCloseBtn,
                { backgroundColor: isDark ? '#23262F' : '#F6F0ED' },
              ]}>
              <X size={18} color={colors.text} strokeWidth={2.4} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalNotesContent}>
            {/* 1. Preset Title & Customization Card */}
            <View
              style={[
                styles.configCard,
                { backgroundColor: isDark ? '#1C1F26' : '#F6F0ED' },
              ]}>
              <Text style={[styles.fieldLabel, { color: colors.accent }]}>
                PRESET TITLE (OPTIONAL)
              </Text>
              <TextInput
                value={customTitle}
                onChangeText={setCustomTitle}
                placeholder="e.g., Structural & History Focus"
                placeholderTextColor={colors.textSecondary}
                style={[
                  styles.titleInput,
                  {
                    backgroundColor: isDark ? '#23262F' : '#FFFFFF',
                    color: isDark ? '#F9FAFB' : '#0F172A',
                  },
                ]}
              />

              {/* Icon Selection Row */}
              <View style={styles.iconSelectionSection}>
                <Text style={[styles.fieldLabel, { color: colors.accent }]}>
                  CHOOSE DECK ICON
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.iconScrollRow}>
                  {PRESET_ICONS.map((item) => {
                    const isSelected = selectedIconId === item.id;
                    const IconComp = item.icon;
                    const [startC, endC] = item.gradient;
                    const gradId = `sel_icon_${item.id}`;

                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => setSelectedIconId(item.id)}
                        style={({ pressed }) => [
                          styles.iconPickButton,
                          {
                            borderColor: isSelected ? colors.accent : 'transparent',
                            backgroundColor: isSelected
                              ? isDark
                                ? 'rgba(224, 122, 95, 0.25)'
                                : '#F8EAE4'
                              : isDark
                                ? '#23262F'
                                : '#FFFFFF',
                            opacity: pressed ? 0.75 : 1,
                            transform: [{ scale: isSelected ? 1.05 : 1 }],
                          },
                        ]}>
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                          }}>
                          <Svg width={36} height={36} style={StyleSheet.absoluteFill}>
                            <Defs>
                              <LinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                                <Stop offset="0%" stopColor={startC} />
                                <Stop offset="100%" stopColor={endC} />
                              </LinearGradient>
                            </Defs>
                            <Rect width={36} height={36} rx={12} fill={`url(#${gradId})`} />
                          </Svg>
                          <IconComp size={18} color="#FFFFFF" strokeWidth={2.4} />
                        </View>
                        {isSelected && (
                          <View style={[styles.iconSelectedDot, { backgroundColor: colors.accent }]} />
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Shuffle Toggle Row */}
              <Pressable
                onPress={() => setIsShuffled(!isShuffled)}
                style={styles.shuffleToggleRow}>
                <View style={styles.shuffleLeft}>
                  <Shuffle size={16} color={colors.accent} strokeWidth={2.2} />
                  <Text style={[styles.shuffleLabel, { color: isDark ? '#E2E8F0' : '#1E293B' }]}>
                    Shuffle Cards in Session
                  </Text>
                </View>

                <View
                  style={[
                    styles.shuffleSwitchPill,
                    {
                      backgroundColor: isShuffled
                        ? colors.accent
                        : isDark
                          ? '#23262F'
                          : '#E2E8F0',
                    },
                  ]}>
                  <View
                    style={[
                      styles.switchThumb,
                      {
                        transform: [{ translateX: isShuffled ? 18 : 2 }],
                      },
                    ]}
                  />
                </View>
              </Pressable>
            </View>

            {/* 2. Section Subhead */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Select Subjects & Lessons
              </Text>
              <Text style={[styles.selectedCountText, { color: colors.accent }]}>
                {selectedLessonIds.size} Selected
              </Text>
            </View>

            {/* 3. Subjects & Topics Accordion List */}
            <View style={styles.notesList}>
              {SUBJECT_NOTES.map((subject, sIdx) => {
                const isSubjectOpen = !!expandedSubjects[subject.id];
                const IconComponent = subject.icon;
                const gradColors = SUBJECT_GRADIENTS[sIdx % SUBJECT_GRADIENTS.length];
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
                    layout={LinearTransition.duration(240)}
                    style={[
                      styles.subjectCard,
                      {
                        backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
                      },
                    ]}>
                    {/* Subject Header Row */}
                    <View style={styles.subjectHeaderRow}>
                      <Pressable
                        onPress={() => toggleSubject(subject.id)}
                        style={styles.subjectHeaderClickable}>
                        {/* Prominent Left Icon */}
                        <SubjectGradientIcon
                          icon={IconComponent}
                          colors={gradColors}
                          size={44}
                        />

                        <Text
                          numberOfLines={2}
                          style={[
                            styles.subjectTitle,
                            { color: isDark ? '#F9FAFB' : '#0F172A' },
                          ]}>
                          {subject.title}
                        </Text>

                        <RotatingChevron
                          isOpen={isSubjectOpen}
                          color={colors.accent}
                          size={18}
                        />
                      </Pressable>

                      {/* Select All Subject Lessons Button */}
                      <Pressable
                        onPress={() => toggleSubjectSelection(subject)}
                        hitSlop={8}
                        style={({ pressed }) => [
                          styles.subjectSelectAllBtn,
                          {
                            backgroundColor: isAllSubjectSelected
                              ? colors.accent
                              : isSomeSubjectSelected
                                ? colors.accent
                                : isDark
                                  ? '#23262F'
                                  : '#EBE5E1',
                            opacity: pressed ? 0.75 : 1,
                          },
                        ]}>
                        {isAllSubjectSelected ? (
                          <Check size={14} color="#FFFFFF" strokeWidth={3} />
                        ) : isSomeSubjectSelected ? (
                          <Text style={styles.someSelectedMark}>-</Text>
                        ) : (
                          <Plus size={14} color={colors.textSecondary} strokeWidth={2.4} />
                        )}
                      </Pressable>
                    </View>

                    {/* Topics Dropdown */}
                    {isSubjectOpen && (
                      <Animated.View
                        entering={FadeInDown.duration(220)}
                        exiting={FadeOutUp.duration(180)}
                        layout={LinearTransition.duration(240)}
                        style={styles.topicsListWrapper}>
                        {subject.topics.map((topic, tIdx) => (
                          <PresetTopicItem
                            key={topic.id}
                            topic={topic}
                            tIdx={tIdx}
                            isLastTopic={tIdx === subject.topics.length - 1}
                            selectedLessonIds={selectedLessonIds}
                            expandedTopics={expandedTopics}
                            toggleTopic={toggleTopic}
                            toggleTopicSelection={toggleTopicSelection}
                            toggleLessonSelection={toggleLessonSelection}
                            lastSelectedTopicIndex={lastSelectedTopicIndex}
                          />
                        ))}
                      </Animated.View>
                    )}
                  </Animated.View>
                );
              })}
            </View>
          </ScrollView>

          {/* Bottom Submit CTA */}
          <View style={styles.modalFooterBar}>
            <Pressable
              onPress={onSubmit}
              style={({ pressed }) => [
                styles.submitBtn,
                {
                  backgroundColor: colors.accent,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                },
              ]}>
              <Text style={styles.submitBtnText}>
                {isEditing
                  ? `Save Preset (${selectedLessonIds.size} Lessons)`
                  : `Create Preset (${selectedLessonIds.size} Lessons)`}
              </Text>
              <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.4} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalSheet: {
    maxHeight: '92%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  modalHandleBar: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  modalHandle: {
    width: 38,
    height: 4.5,
    borderRadius: 2.5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalHeaderTitleBox: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 19,
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
  modalNotesContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
    gap: 16,
  },
  configCard: {
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  titleInput: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  iconSelectionSection: {
    gap: 8,
    paddingTop: 2,
  },
  iconScrollRow: {
    gap: 10,
    paddingVertical: 4,
  },
  iconPickButton: {
    padding: 6,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconSelectedDot: {
    position: 'absolute',
    bottom: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  shuffleToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  shuffleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shuffleLabel: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  shuffleSwitchPill: {
    width: 42,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  selectedCountText: {
    fontSize: 13,
    fontWeight: '700',
  },
  notesList: {
    gap: 12,
  },
  subjectCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  subjectHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  subjectHeaderClickable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  subjectTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
    flex: 1,
  },
  subjectSelectAllBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  someSelectedMark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 14,
  },
  topicsListWrapper: {
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 4,
  },
  modalFooterBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  submitBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
