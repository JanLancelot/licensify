import React, { useState } from 'react';
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
  Edit2,
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

/* Custom Deck Gradient Icon Component */
function CustomDeckIcon({
  iconName = 'Layers',
  size = 48,
}: {
  iconName?: string;
  size?: number;
}) {
  const iconConfig = PRESET_ICONS.find((i) => i.id === iconName) || PRESET_ICONS[0];
  const IconComp = iconConfig.icon;
  const [startC, endC] = iconConfig.gradient;
  const gradId = `bento_preview_icon_${iconConfig.id}_${size}`;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={startC} />
            <Stop offset="100%" stopColor={endC} />
          </LinearGradient>
        </Defs>
        <Rect width={size} height={size} rx={size / 2} fill={`url(#${gradId})`} />
      </Svg>
      <IconComp size={22} color="#FFFFFF" strokeWidth={2.4} />
    </View>
  );
}

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

  // Pop-up states
  const [isIconPickerVisible, setIsIconPickerVisible] = useState(false);
  const [isNameEditorVisible, setIsNameEditorVisible] = useState(false);
  const [tempTitle, setTempTitle] = useState(customTitle);

  // Sync tempTitle when opening name editor
  const handleOpenNameEditor = () => {
    setTempTitle(customTitle);
    setIsNameEditorVisible(true);
  };

  const handleSaveName = () => {
    setCustomTitle(tempTitle);
    setIsNameEditorVisible(false);
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
            contentContainerStyle={styles.modalNotesContent}>
            {/* 1. Centered Live Bento Box Preview Section */}
            <View style={styles.bentoPreviewSection}>
              {/* Bento Box Card */}
              <View
                style={[
                  styles.bentoPreviewCard,
                  {
                    backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
                    borderColor: isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.06)',
                  },
                ]}>
                {/* 1A. Clickable Icon to open Icon Picker Pop-up */}
                <Pressable
                  onPress={() => setIsIconPickerVisible(true)}
                  style={({ pressed }) => [
                    styles.iconPressableBox,
                    {
                      opacity: pressed ? 0.75 : 1,
                      transform: [{ scale: pressed ? 0.94 : 1 }],
                    },
                  ]}>
                  <View style={styles.iconContainerWithBadge}>
                    <CustomDeckIcon iconName={selectedIconId} size={48} />
                    <View
                      style={[
                        styles.iconEditBadge,
                        {
                          backgroundColor: isDark ? '#374151' : '#E5E7EB',
                          borderColor: isDark ? '#1C1F26' : '#F6F0ED',
                        },
                      ]}>
                      <Edit2
                        size={8.5}
                        color={isDark ? '#9CA3AF' : '#6B7280'}
                        strokeWidth={2.4}
                      />
                    </View>
                  </View>
                </Pressable>

                {/* 1B. Clickable Preset Title to open Name Editor Pop-up */}
                <Pressable
                  onPress={handleOpenNameEditor}
                  style={({ pressed }) => [
                    styles.titlePressableBox,
                    {
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.bentoPreviewTitle,
                      { color: isDark ? '#F9FAFB' : '#0F172A' },
                    ]}>
                    {customTitle.trim() || 'Preset Name'}
                  </Text>
                  <Edit2
                    size={11}
                    color={isDark ? '#9CA3AF' : '#6B7280'}
                    strokeWidth={2.2}
                  />
                </Pressable>

                {/* 1C. Card / Lesson Count Subtitle */}
                <Text
                  style={[
                    styles.bentoPreviewSub,
                    { color: colors.textSecondary },
                  ]}>
                  {selectedLessonIds.size > 0
                    ? `${selectedLessonIds.size} Lessons`
                    : '0 Cards'}
                </Text>
              </View>

              {/* Shuffle Toggle Row */}
              <Pressable
                onPress={() => setIsShuffled(!isShuffled)}
                style={[
                  styles.shuffleToggleCard,
                  {
                    backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                    borderColor: isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.06)',
                  },
                ]}>
                <View style={styles.shuffleLeft}>
                  <Shuffle size={16} color={colors.accent} strokeWidth={2.2} />
                  <Text
                    style={[
                      styles.shuffleLabel,
                      { color: isDark ? '#E2E8F0' : '#1E293B' },
                    ]}>
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

            {/* 2. Section Header: Curriculum Selection */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Select Subjects & Lessons
              </Text>
              <Text style={[styles.selectedCountText, { color: colors.accent }]}>
                {selectedLessonIds.size} Selected
              </Text>
            </View>

            {/* 3. Subjects & Topics List */}
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

      {/* =================================================================== */}
      {/* POP-UP 1: CHOOSE PRESET ICON MODAL                                  */}
      {/* =================================================================== */}
      <Modal
        visible={isIconPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsIconPickerVisible(false)}>
        <View style={styles.subModalOverlay}>
          <Pressable
            style={styles.modalDismissArea}
            onPress={() => setIsIconPickerVisible(false)}
          />
          <View
            style={[
              styles.subModalCard,
              {
                backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'rgba(0, 0, 0, 0.08)',
              },
            ]}>
            {/* Pop-up Header */}
            <View style={styles.subModalHeader}>
              <Text style={[styles.subModalTitle, { color: colors.text }]}>
                Choose Preset Icon
              </Text>
              <Pressable
                onPress={() => setIsIconPickerVisible(false)}
                hitSlop={8}
                style={[
                  styles.subModalCloseBtn,
                  { backgroundColor: isDark ? '#23262F' : '#F3F4F6' },
                ]}>
                <X size={16} color={colors.text} strokeWidth={2.4} />
              </Pressable>
            </View>

            {/* Grid of Icons */}
            <View style={styles.iconPickerGrid}>
              {PRESET_ICONS.map((item) => {
                const isSelected = selectedIconId === item.id;
                const IconComp = item.icon;
                const [startC, endC] = item.gradient;
                const gradId = `popup_icon_${item.id}`;

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      setSelectedIconId(item.id);
                      setIsIconPickerVisible(false);
                    }}
                    style={({ pressed }) => [
                      styles.popupIconBtn,
                      {
                        borderColor: isSelected ? colors.accent : 'transparent',
                        backgroundColor: isSelected
                          ? colors.accentMuted
                          : isDark
                            ? '#23262F'
                            : '#F6F0ED',
                        opacity: pressed ? 0.75 : 1,
                        transform: [{ scale: isSelected ? 1.08 : pressed ? 0.94 : 1 }],
                      },
                    ]}>
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}>
                      <Svg width={44} height={44} style={StyleSheet.absoluteFill}>
                        <Defs>
                          <LinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor={startC} />
                            <Stop offset="100%" stopColor={endC} />
                          </LinearGradient>
                        </Defs>
                        <Rect width={44} height={44} rx={22} fill={`url(#${gradId})`} />
                      </Svg>
                      <IconComp size={22} color="#FFFFFF" strokeWidth={2.4} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* =================================================================== */}
      {/* POP-UP 2: EDIT PRESET NAME MODAL                                    */}
      {/* =================================================================== */}
      <Modal
        visible={isNameEditorVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsNameEditorVisible(false)}>
        <View style={styles.subModalOverlay}>
          <Pressable
            style={styles.modalDismissArea}
            onPress={() => setIsNameEditorVisible(false)}
          />
          <View
            style={[
              styles.subModalCard,
              {
                backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'rgba(0, 0, 0, 0.08)',
              },
            ]}>
            {/* Pop-up Header */}
            <View style={styles.subModalHeader}>
              <Text style={[styles.subModalTitle, { color: colors.text }]}>
                Edit Preset Name
              </Text>
              <Pressable
                onPress={() => setIsNameEditorVisible(false)}
                hitSlop={8}
                style={[
                  styles.subModalCloseBtn,
                  { backgroundColor: isDark ? '#23262F' : '#F3F4F6' },
                ]}>
                <X size={16} color={colors.text} strokeWidth={2.4} />
              </Pressable>
            </View>

            {/* Input Field */}
            <View style={styles.nameEditorBody}>
              <TextInput
                value={tempTitle}
                onChangeText={setTempTitle}
                placeholder="Enter preset name..."
                placeholderTextColor={colors.textSecondary}
                autoFocus
                onSubmitEditing={handleSaveName}
                style={[
                  styles.popupNameInput,
                  {
                    backgroundColor: isDark ? '#23262F' : '#F9FAFB',
                    borderColor: isDark
                      ? 'rgba(255, 255, 255, 0.1)'
                      : '#E5E7EB',
                    color: isDark ? '#F9FAFB' : '#111827',
                  },
                ]}
              />

              <Pressable
                onPress={handleSaveName}
                style={({ pressed }) => [
                  styles.saveNameBtn,
                  {
                    backgroundColor: colors.accent,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}>
                <Text style={styles.saveNameBtnText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  bentoPreviewSection: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 4,
  },
  bentoPreviewCard: {
    width: 154,
    height: 136,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
      },
    }),
  },
  iconPressableBox: {
    padding: 2,
  },
  iconContainerWithBadge: {
    position: 'relative',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  titlePressableBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
    paddingHorizontal: 4,
  },
  bentoPreviewTitle: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  bentoPreviewSub: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  shuffleToggleCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
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
    width: 40,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingTop: 6,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  selectedCountText: {
    fontSize: 13,
    fontWeight: '700',
  },
  notesList: {
    gap: 10,
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
        shadowRadius: 6,
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
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 12,
  },
  subjectHeaderClickable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subjectIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectTitle: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  chevronWrapper: {
    paddingHorizontal: 4,
  },
  subjectSelectAllBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  someSelectedMark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: -2,
  },
  topicsListWrapper: {
    borderTopWidth: 1,
    padding: 10,
    gap: 6,
  },
  modalFooterBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  submitBtn: {
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
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  /* Pop-up Modal Styles */
  subModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  subModalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 18,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 10px 30px rgba(0,0,0,0.22)',
      },
    }),
  },
  subModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subModalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  popupIconBtn: {
    padding: 3,
    borderRadius: 26,
    borderWidth: 2,
  },
  nameEditorBody: {
    gap: 12,
  },
  popupNameInput: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
  },
  saveNameBtn: {
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveNameBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
});
