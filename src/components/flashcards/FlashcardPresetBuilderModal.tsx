import React from 'react';
import {
  Modal,
  Platform,
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

export const SUBJECT_PALETTES = [
  {
    bg: '#EDE9FE',
    darkBg: 'rgba(139, 92, 246, 0.22)',
    icon: '#7C3AED',
    darkIcon: '#C4B5FD',
  }, // Lavender / Purple
  {
    bg: '#FCE7F3',
    darkBg: 'rgba(236, 72, 153, 0.22)',
    icon: '#DB2777',
    darkIcon: '#F472B6',
  }, // Soft Pink
  {
    bg: '#E0E7FF',
    darkBg: 'rgba(99, 102, 241, 0.22)',
    icon: '#4F46E5',
    darkIcon: '#A5B4FC',
  }, // Indigo / Violet
  {
    bg: '#FFEDD5',
    darkBg: 'rgba(249, 115, 22, 0.22)',
    icon: '#EA580C',
    darkIcon: '#FDBA74',
  }, // Peach / Orange
  {
    bg: '#E0F2FE',
    darkBg: 'rgba(14, 165, 233, 0.22)',
    icon: '#0284C7',
    darkIcon: '#7DD3FC',
  }, // Sky Blue / Cyan
  {
    bg: '#D1FAE5',
    darkBg: 'rgba(16, 185, 129, 0.22)',
    icon: '#059669',
    darkIcon: '#6EE7B7',
  }, // Mint / Emerald
];

export interface FlashcardPresetBuilderModalProps {
  visible: boolean;
  isEditing?: boolean;
  subjects?: SubjectNote[];
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

export function FlashcardPresetBuilderModal({
  visible,
  isEditing = false,
  subjects = [],
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {isEditing ? 'Edit Flashcard Preset' : 'New Flashcard Preset'}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={[
                styles.modalCloseBtn,
                { backgroundColor: isDark ? '#23262F' : '#F3F4F6' },
              ]}>
              <X size={18} color={colors.text} strokeWidth={2.4} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalNotesContent}>
            {/* 1. Preset Title & Customization Card Box */}
            <View
              style={[
                styles.configCard,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                },
              ]}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
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
                    backgroundColor: isDark ? '#23262F' : '#F9FAFB',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB',
                    color: isDark ? '#F9FAFB' : '#111827',
                  },
                ]}
              />

              {/* Icon Selection Row */}
              <View style={styles.iconSelectionSection}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  PRESET ICON
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
                                : '#F9FAFB',
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

            {/* 3. Subjects & Topics List (Matching Comprehensive Notes style) */}
            <View style={styles.notesList}>
              {(subjects || []).map((subject, sIdx) => {
                const isSubjectOpen = !!expandedSubjects[subject.id];
                const IconComponent = subject.icon;
                const palette = SUBJECT_PALETTES[sIdx % SUBJECT_PALETTES.length];

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

                return (
                  <Animated.View
                    key={subject.id}
                    layout={LinearTransition.duration(240)}
                    style={[
                      styles.subjectCardBox,
                      {
                        backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                        borderColor: isDark
                          ? isSubjectOpen
                            ? 'rgba(255, 255, 255, 0.15)'
                            : 'rgba(255, 255, 255, 0.07)'
                          : isSubjectOpen
                            ? 'rgba(0, 0, 0, 0.09)'
                            : 'rgba(0, 0, 0, 0.05)',
                      },
                    ]}>
                    {/* Subject Header Row */}
                    <View style={styles.subjectHeaderRow}>
                      <Pressable
                        onPress={() => toggleSubject(subject.id)}
                        style={styles.subjectHeaderClickable}>
                        {/* Circular Pastel Icon Badge */}
                        <View
                          style={[
                            styles.subjectIconBadge,
                            {
                              backgroundColor: isDark ? palette.darkBg : palette.bg,
                            },
                          ]}>
                          <IconComponent
                            size={20}
                            color={isDark ? palette.darkIcon : palette.icon}
                            strokeWidth={2.2}
                          />
                        </View>

                        {/* Clean Subject Title */}
                        <Text
                          numberOfLines={2}
                          style={[
                            styles.subjectTitle,
                            { color: isDark ? '#F9FAFB' : '#111827' },
                          ]}>
                          {subject.title}
                        </Text>

                        {/* Rotating Chevron */}
                        <View style={styles.chevronWrapper}>
                          <RotatingChevron
                            isOpen={isSubjectOpen}
                            color={isDark ? '#9CA3AF' : '#4B5563'}
                            size={20}
                          />
                        </View>
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
                                  : '#F3F4F6',
                            borderColor: isAllSubjectSelected || isSomeSubjectSelected
                              ? colors.accent
                              : isDark
                                ? 'rgba(255, 255, 255, 0.1)'
                                : '#E5E7EB',
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

                    {/* Topics Dropdown inside Subject */}
                    {isSubjectOpen && (
                      <Animated.View
                        entering={FadeInDown.duration(220)}
                        exiting={FadeOutUp.duration(180)}
                        layout={LinearTransition.duration(240)}
                        style={[
                          styles.topicsListWrapper,
                          {
                            borderTopColor: isDark
                              ? 'rgba(255, 255, 255, 0.06)'
                              : 'rgba(0, 0, 0, 0.05)',
                          },
                        ]}>
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
                            parentPalette={palette}
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
    paddingTop: 8,
    paddingBottom: 12,
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
  modalNotesContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  configCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 14,
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
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  titleInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '600',
  },
  iconSelectionSection: {
    gap: 8,
  },
  iconScrollRow: {
    gap: 8,
    paddingVertical: 2,
  },
  iconPickButton: {
    padding: 3,
    borderRadius: 15,
    borderWidth: 2,
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
    gap: 10,
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
    padding: 2,
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
    letterSpacing: -0.2,
  },
  selectedCountText: {
    fontSize: 13,
    fontWeight: '700',
  },
  notesList: {
    gap: 12,
  },
  subjectCardBox: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
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
  subjectHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  subjectHeaderClickable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subjectIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  chevronWrapper: {
    padding: 2,
  },
  subjectSelectAllBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
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
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    borderTopWidth: 1,
    gap: 6,
  },
  modalFooterBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 16,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
