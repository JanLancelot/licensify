import React, { useState } from 'react';
import {
  Alert,
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
  BookOpen,
  Brain,
  Compass,
  Flame,
  Landmark,
  Layers,
  Lightbulb,
  PenTool,
  Play,
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
import { SubjectNote, Topic, QuizPreset } from '@/types/curriculum';

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
  { bg: '#EDE9FE', darkBg: 'rgba(139, 92, 246, 0.22)', icon: '#7C3AED', darkIcon: '#C4B5FD' },
  { bg: '#FCE7F3', darkBg: 'rgba(236, 72, 153, 0.22)', icon: '#DB2777', darkIcon: '#F472B6' },
  { bg: '#E0E7FF', darkBg: 'rgba(99, 102, 241, 0.22)', icon: '#4F46E5', darkIcon: '#A5B4FC' },
  { bg: '#FFEDD5', darkBg: 'rgba(249, 115, 22, 0.22)', icon: '#EA580C', darkIcon: '#FDBA74' },
  { bg: '#E0F2FE', darkBg: 'rgba(14, 165, 233, 0.22)', icon: '#0284C7', darkIcon: '#7DD3FC' },
  { bg: '#D1FAE5', darkBg: 'rgba(16, 185, 129, 0.22)', icon: '#059669', darkIcon: '#6EE7B7' },
];

export interface QuizPresetBuilderModalProps {
  visible: boolean;
  subjects: SubjectNote[];
  onClose: () => void;
  onSubmit: (newPreset: QuizPreset) => void;
  bottomInset?: number;
}

export function QuizPresetBuilderModal({
  visible,
  subjects = [],
  onClose,
  onSubmit,
  bottomInset = 0,
}: QuizPresetBuilderModalProps) {
  const { colors, isDark } = useAppTheme();

  const [customTitle, setCustomTitle] = useState('');
  const [selectedIconId, setSelectedIconId] = useState('Layers');
  const [selectedLessonIds, setSelectedLessonIds] = useState<Set<string>>(new Set());
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [selectedCount, setSelectedCount] = useState<number>(10);
  const [selectedTimer, setSelectedTimer] = useState<number>(15);

  const handleReset = () => {
    setCustomTitle('');
    setSelectedIconId('Layers');
    setSelectedLessonIds(new Set());
    setExpandedSubjects({});
    setExpandedTopics({});
    setSelectedCount(10);
    setSelectedTimer(15);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects((prev) => ({ ...prev, [subjectId]: !prev[subjectId] }));
  };

  const toggleSubjectSelection = (subject: SubjectNote) => {
    const allLessonIds = subject.topics.flatMap((t) => t.lessons.map((l) => l.id));
    const allSelected = allLessonIds.every((id) => selectedLessonIds.has(id));

    setSelectedLessonIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        allLessonIds.forEach((id) => next.delete(id));
      } else {
        allLessonIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const toggleTopicSelection = (topic: Topic) => {
    const lessonIds = topic.lessons.map((l) => l.id);
    const allSelected = lessonIds.every((id) => selectedLessonIds.has(id));

    setSelectedLessonIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        lessonIds.forEach((id) => next.delete(id));
      } else {
        lessonIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleLessonSelection = (lessonId: string) => {
    setSelectedLessonIds((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });
  };

  const handleSave = () => {
    if (selectedLessonIds.size === 0) {
      Alert.alert(
        'No Lessons Selected',
        'Please select at least one lesson, topic, or subject for your custom quiz set.'
      );
      return;
    }

    const selectedSubjectsSet = new Set<string>();
    subjects.forEach((sub) => {
      const hasAny = sub.topics.some((t) =>
        t.lessons.some((l) => selectedLessonIds.has(l.id))
      );
      if (hasAny) {
        selectedSubjectsSet.add(sub.title);
      }
    });

    const finalTitle = customTitle.trim() || 'Custom Quiz Set';

    const newPreset: QuizPreset = {
      id: `quiz-preset-${Date.now()}`,
      title: finalTitle,
      questionCount: selectedCount,
      lessonCount: selectedLessonIds.size,
      iconName: selectedIconId,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      subjectNames: Array.from(selectedSubjectsSet),
      selectedLessonIds: Array.from(selectedLessonIds),
      defaultTimerSeconds: selectedTimer,
      difficulty: 'medium',
    };

    onSubmit(newPreset);
    handleReset();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalDismissArea} onPress={handleClose} />

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
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              New Quiz Set
            </Text>
            <Pressable
              onPress={handleClose}
              style={[
                styles.modalCloseBtn,
                { backgroundColor: isDark ? '#23262F' : '#F3F4F6' },
              ]}>
              <X size={18} color={colors.text} strokeWidth={2.4} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalContent}>
            {/* 1. Title & Icon Configuration */}
            <View
              style={[
                styles.configCard,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                },
              ]}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                QUIZ SET TITLE
              </Text>
              <TextInput
                value={customTitle}
                onChangeText={setCustomTitle}
                placeholder="e.g., Rule 7 & 8 High Yield Set"
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

              {/* Icon Selection */}
              <View style={styles.iconSelectionSection}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  SELECT ICON
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.iconScrollRow}>
                  {PRESET_ICONS.map((item) => {
                    const isSelected = selectedIconId === item.id;
                    const IconComp = item.icon;
                    const [startC, endC] = item.gradient;
                    const gradId = `quiz_sel_icon_${item.id}`;

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
            </View>

            {/* 2. Select Syllabus Scope */}
            <View
              style={[
                styles.configCard,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                },
              ]}>
              <View style={styles.scopeHeaderRow}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  SELECT TOPICS & LESSONS
                </Text>
                <View
                  style={[
                    styles.counterBadge,
                    {
                      backgroundColor: isDark ? 'rgba(224, 122, 95, 0.18)' : '#F8EAE4',
                    },
                  ]}>
                  <Text style={[styles.counterBadgeText, { color: colors.accent }]}>
                    {selectedLessonIds.size} Selected
                  </Text>
                </View>
              </View>

              {/* Hierarchy Subjects Tree */}
              <View style={styles.subjectsTree}>
                {subjects.map((subject, sIdx) => {
                  const isSubjectOpen = !!expandedSubjects[subject.id];
                  const IconComponent = subject.icon;
                  const palette = SUBJECT_PALETTES[sIdx % SUBJECT_PALETTES.length];

                  const allLessonIds = subject.topics.flatMap((t) =>
                    t.lessons.map((l) => l.id)
                  );
                  const selectedInSubjectCount = allLessonIds.filter((id) =>
                    selectedLessonIds.has(id)
                  ).length;
                  const isAllSubjectSelected =
                    allLessonIds.length > 0 &&
                    selectedInSubjectCount === allLessonIds.length;
                  const isSomeSubjectSelected =
                    selectedInSubjectCount > 0 && !isAllSubjectSelected;
                  const hasSubjectSelected = selectedInSubjectCount > 0;

                  return (
                    <Animated.View
                      key={subject.id}
                      layout={LinearTransition.duration(200)}
                      style={[
                        styles.subjectCard,
                        {
                          backgroundColor: hasSubjectSelected
                            ? isDark
                              ? 'rgba(224, 122, 95, 0.08)'
                              : '#FAF0EB'
                            : isDark
                              ? '#1C1F26'
                              : '#FFFFFF',
                          borderColor: isDark
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(0, 0, 0, 0.06)',
                        },
                      ]}>
                      {/* Subject Row */}
                      <View style={styles.subjectHeaderRow}>
                        <Pressable
                          onPress={() => toggleSubject(subject.id)}
                          style={styles.subjectClickable}>
                          <View
                            style={[
                              styles.subjectIconBadge,
                              {
                                backgroundColor: isDark ? palette.darkBg : palette.bg,
                              },
                            ]}>
                            <IconComponent
                              size={18}
                              color={isDark ? palette.darkIcon : palette.icon}
                              strokeWidth={2.2}
                            />
                          </View>
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.subjectTitle,
                              { color: isDark ? '#F9FAFB' : '#111827' },
                            ]}>
                            {subject.title}
                          </Text>
                          <RotatingChevron
                            isOpen={isSubjectOpen}
                            color={isDark ? '#9CA3AF' : '#6B7280'}
                            size={18}
                          />
                        </Pressable>

                        <Pressable
                          onPress={() => toggleSubjectSelection(subject)}
                          hitSlop={8}
                          style={({ pressed }) => [
                            styles.selectionCheckBtn,
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
                                  ? 'rgba(255, 255, 255, 0.15)'
                                  : '#D1D5DB',
                              opacity: pressed ? 0.75 : 1,
                            },
                          ]}>
                          {isAllSubjectSelected ? (
                            <Text style={styles.checkIconText}>✓</Text>
                          ) : isSomeSubjectSelected ? (
                            <Text style={styles.dashIconText}>–</Text>
                          ) : null}
                        </Pressable>
                      </View>

                      {/* Topics List */}
                      {isSubjectOpen && (
                        <Animated.View
                          entering={FadeInDown.duration(200)}
                          exiting={FadeOutUp.duration(160)}
                          layout={LinearTransition.duration(200)}
                          style={styles.topicsWrapper}>
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
            </View>
          </ScrollView>

          {/* Sticky Create Button */}
          <View style={styles.bottomCta}>
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.saveBtn,
                {
                  backgroundColor: colors.accent,
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                },
              ]}>
              <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.saveBtnText}>Save Quiz Set</Text>
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
    maxHeight: '90%',
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
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
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
    gap: 14,
    paddingBottom: 16,
  },
  configCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  titleInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '600',
  },
  iconSelectionSection: {
    gap: 8,
    marginTop: 4,
  },
  iconScrollRow: {
    gap: 10,
    paddingVertical: 4,
  },
  iconPickButton: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 4,
  },
  scopeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  counterBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  subjectsTree: {
    gap: 10,
    marginTop: 4,
  },
  subjectCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  subjectHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subjectClickable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subjectIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  selectionCheckBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIconText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    marginTop: -2,
  },
  dashIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: -3,
  },
  topicsWrapper: {
    paddingTop: 6,
    gap: 6,
  },
  bottomCta: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  saveBtn: {
    height: 50,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
