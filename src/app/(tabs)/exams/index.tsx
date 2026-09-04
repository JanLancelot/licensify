import { useFocusEffect, useRouter } from 'expo-router';
import {
  Clock,
  Plus,
  X,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import {
  ExamRemindersModal,
  ExamRemindersTarget,
} from '@/components/exams/ExamRemindersModal';
import {
  ModularExamBuilderModal,
  PRESET_ICONS,
} from '@/components/exams/ModularExamBuilderModal';
import { useAppTheme } from '@/context/theme-context';
import { useLocalHierarchy, useLocalQuizzes } from '@/hooks/useLocalData';
import {
  ModularExamPreset,
  useModularExamPresets,
} from '@/services/modularExamStore';

export interface ComprehensiveMockSetItem {
  id: string;
  setNumber: string;
  title: string;
  itemsCount: number;
  itemsLabel: string;
  durationLabel: string;
  durationSeconds: number;
  subjects: string[];
}

/* Custom Bento Deck Squircle Icon */
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
  const gradId = `exam_deck_icon_${iconConfig.id}_${size}`;

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
      <IconComp size={Math.round(size * 0.46)} color="#FFFFFF" strokeWidth={2.4} />
    </View>
  );
}


export default function ExamsSelectionScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { curriculum, refetch: refetchCurriculum } = useLocalHierarchy();
  const { quizzes: mockExamQuizzes, refetch: refetchMockQuizzes } = useLocalQuizzes({ type: 'mock_exam' });
  const {
    presets: modularPresets,
    savePreset: saveModularPreset,
    deletePreset: deleteModularPreset,
  } = useModularExamPresets();

  // Modal states
  const [isBuilderModalVisible, setIsBuilderModalVisible] = useState(false);
  const [activeRemindersTarget, setActiveRemindersTarget] = useState<ExamRemindersTarget | null>(null);

  useFocusEffect(
    useCallback(() => {
      refetchCurriculum?.();
      refetchMockQuizzes?.();
    }, [refetchCurriculum, refetchMockQuizzes])
  );

  const comprehensiveSets = useMemo<ComprehensiveMockSetItem[]>(() => {
    if (!mockExamQuizzes || mockExamQuizzes.length === 0) {
      return [];
    }

    return mockExamQuizzes.map((quiz, idx) => {
      const matchNumber = quiz.title.match(/(\d+)/);
      const setNumber = matchNumber ? matchNumber[1] : String(idx + 1);
      let qCount = 100;
      if (quiz.questionIds) {
        try {
          const parsed = typeof quiz.questionIds === 'string' ? JSON.parse(quiz.questionIds) : quiz.questionIds;
          if (Array.isArray(parsed) && parsed.length > 0) {
            qCount = parsed.length;
          }
        } catch {
          // ignore
        }
      }
      const durationSec = quiz.timeLimitSeconds || 10800;
      const durationHours = Math.round(durationSec / 3600);
      const durationLabel = `${durationHours} Hours`;

      let subjects: string[] = [];
      if (quiz.description && quiz.description.toLowerCase().includes('covering')) {
        const afterCovering = quiz.description.slice(quiz.description.toLowerCase().indexOf('covering') + 8);
        subjects = afterCovering.replace(/\.$/, '').split(/,|and/).map((s) => s.trim()).filter(Boolean);
      } else if (quiz.description && quiz.description.includes('Subjects:')) {
        subjects = quiz.description.replace('Subjects:', '').split(',').map((s) => s.trim()).filter(Boolean);
      }
      if (subjects.length === 0) {
        subjects = [
          'History of Architecture',
          'Building Utilities',
          'Architectural Design',
        ];
      }

      return {
        id: quiz.id,
        setNumber,
        title: quiz.title,
        itemsCount: qCount,
        itemsLabel: `${qCount} ITEMS`,
        durationLabel,
        durationSeconds: durationSec,
        subjects,
      };
    });
  }, [mockExamQuizzes]);

  // Handle selecting a custom Modular Test
  const handleSelectModularTest = (test: ModularExamPreset) => {
    const durationHours = test.timeLimitSeconds
      ? `${(test.timeLimitSeconds / 3600).toFixed(1).replace('.0', '')} Hours`
      : '1.5 Hours';

    setActiveRemindersTarget({
      id: test.id,
      title: test.title,
      subtitle: `${test.lessonIds.length} Lessons Configured`,
      itemCount: test.questionCount || 50,
      durationLabel: durationHours,
      durationSeconds: test.timeLimitSeconds || 5400,
      subjects: test.subjectNames,
      isComprehensive: false,
    });
  };

  // Handle deleting a custom Modular Test
  const handleDeleteModularTest = (test: ModularExamPreset) => {
    Alert.alert(
      'Remove Modular Test',
      `Remove "${test.title}" from your modular tests?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteModularPreset(test.id),
        },
      ]
    );
  };

  // Handle selecting a Comprehensive Mock Set
  const handleSelectComprehensiveSet = (set: ComprehensiveMockSetItem) => {
    setActiveRemindersTarget({
      id: set.id,
      title: `${set.setNumber}: ${set.title}`,
      subtitle: `${set.itemsLabel} • ${set.durationLabel} Simulation`,
      itemCount: set.itemsCount,
      durationLabel: set.durationLabel,
      durationSeconds: set.durationSeconds,
      subjects: set.subjects,
      isComprehensive: true,
    });
  };

  // Start exam session from the reminders modal
  const handleStartExamSession = (target: ExamRemindersTarget) => {
    setActiveRemindersTarget(null);

    router.push({
      pathname: '/(tabs)/exams/session' as any,
      params: {
        id: target.id,
        title: target.title,
        timer: String(target.durationSeconds),
        count: String(target.itemCount),
      },
    });
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
          Exams
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 90 },
        ]}>
        {/* =================================================================== */}
        {/* SECTION 1: MODULAR TESTS                                            */}
        {/* =================================================================== */}
        <View style={styles.section}>
          <View style={styles.sectionHeadingRow}>
            <Text style={[styles.sectionHeading, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
              MODULAR TESTS
            </Text>
            <Pressable
              onPress={() => setIsBuilderModalVisible(true)}
              hitSlop={8}
              style={({ pressed }) => [
                styles.addCircleBtn,
                {
                  backgroundColor: isDark ? '#23262F' : '#F6F0ED',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <Plus size={16} color={colors.accent} strokeWidth={2.5} />
            </Pressable>
          </View>

          {/* 2-Column Bento Grid of Custom Modular Tests + Dashed Add Card */}
          <View style={styles.bentoGrid}>
            {modularPresets.map((test) => {
              const durationHours = test.timeLimitSeconds
                ? `${(test.timeLimitSeconds / 3600).toFixed(1).replace('.0', '')}h`
                : '1.5h';

              return (
                <Pressable
                  key={test.id}
                  onPress={() => handleSelectModularTest(test)}
                  style={({ pressed }) => [
                    styles.bentoCard,
                    {
                      backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
                      opacity: pressed ? 0.9 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}>
                  {/* Top-Right Delete Button */}
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteModularTest(test);
                    }}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.cardDeleteBtn,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.06)',
                        opacity: pressed ? 0.6 : 1,
                      },
                    ]}>
                    <X size={12} color={isDark ? '#9CA3AF' : '#6B7280'} strokeWidth={2.4} />
                  </Pressable>

                  {/* Circular Gradient Icon */}
                  <CustomDeckIcon iconName={test.iconName} size={48} />

                  {/* Test Title */}
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.bentoTitle,
                      { color: isDark ? '#F9FAFB' : '#0F172A' },
                    ]}>
                    {test.title}
                  </Text>

                  {/* Meta Subtitle */}
                  <Text
                    numberOfLines={1}
                    style={[styles.bentoSubtitle, { color: colors.textSecondary }]}>
                    {test.questionCount || 50} Qs • {durationHours}
                  </Text>
                </Pressable>
              );
            })}

            {/* Minimal Bento Dashed Add Button */}
            <Pressable
              onPress={() => setIsBuilderModalVisible(true)}
              style={({ pressed }) => [
                styles.dashedAddCard,
                {
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(0, 0, 0, 0.18)',
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.02)'
                    : 'rgba(0, 0, 0, 0.02)',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <View
                style={[
                  styles.dashedIconCircle,
                  {
                    backgroundColor: isDark ? '#23262F' : '#F0EBE8',
                  },
                ]}>
                <Plus size={24} color={colors.accent} strokeWidth={2.6} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* =================================================================== */}
        {/* SECTION 2: COMPREHENSIVE MOCK SIMULATION                            */}
        {/* =================================================================== */}
        <View style={styles.section}>
          <View style={styles.sectionHeadingRow}>
            <Text style={[styles.sectionHeading, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
              COMPREHENSIVE MOCK SIMULATION
            </Text>
          </View>

          {/* Dynamic Set Cards Matching Drawing Layout */}
          <View style={styles.comprehensiveList}>
            {comprehensiveSets.length === 0 ? (
              <View
                style={[
                  styles.comprehensiveSetCard,
                  {
                    backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 24,
                  },
                ]}>
                <Text style={{ color: colors.textSecondary, fontSize: 13.5, fontWeight: '500' }}>
                  No comprehensive mock simulations found. Sync your data to load examination papers.
                </Text>
              </View>
            ) : (
              comprehensiveSets.map((set: ComprehensiveMockSetItem) => {
              return (
                <Pressable
                  key={set.id}
                  onPress={() => handleSelectComprehensiveSet(set)}
                  style={({ pressed }) => [
                    styles.comprehensiveSetCard,
                    {
                      backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                      borderColor: isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.06)',
                      opacity: pressed ? 0.92 : 1,
                      transform: [{ scale: pressed ? 0.985 : 1 }],
                    },
                  ]}>
                  {/* Left Section: SET + Large Prominent Number */}
                  <View style={styles.setNumberCol}>
                    <Text
                      style={[
                        styles.setLabelText,
                        { color: colors.accent },
                      ]}>
                      SET
                    </Text>
                    <Text
                      style={[
                        styles.setBigNumberText,
                        { color: isDark ? '#F9FAFB' : '#0F172A' },
                      ]}>
                      {set.setNumber}
                    </Text>
                  </View>

                  {/* Vertical Divider */}
                  <View
                    style={[
                      styles.setDivider,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.06)',
                      },
                    ]}
                  />

                  {/* Right Section: Header + Stacked Subject List */}
                  <View style={styles.setContentCol}>
                    {/* Header: Items Count Title + Timer Icon in Hours */}
                    <View style={styles.setHeaderRow}>
                      <Text
                        style={[
                          styles.setItemsTitle,
                          { color: isDark ? '#F9FAFB' : '#0F172A' },
                        ]}>
                        {set.itemsLabel}
                      </Text>
                      <View style={styles.durationBadge}>
                        <Clock
                          size={11.5}
                          color={colors.accent}
                          strokeWidth={2.4}
                        />
                        <Text
                          style={[
                            styles.setDurationText,
                            { color: colors.accent },
                          ]}>
                          {set.durationLabel}
                        </Text>
                      </View>
                    </View>

                    {/* Stacked Subjects List with Bullet Points */}
                    <View style={styles.subjectsStack}>
                      {set.subjects.map((sub: string, sIdx: number) => (
                        <View key={sIdx} style={styles.subjectItemRow}>
                          <View
                            style={[
                              styles.bulletDot,
                              { backgroundColor: isDark ? '#6B7280' : '#9CA3AF' },
                            ]}
                          />
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.subjectItemText,
                              { color: isDark ? '#D1D5DB' : '#4B5563' },
                            ]}>
                            {sub.toUpperCase()}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </Pressable>
              );
            }))}
          </View>
        </View>
      </ScrollView>

      {/* Modular Exam Builder Modal */}
      <ModularExamBuilderModal
        visible={isBuilderModalVisible}
        subjects={curriculum}
        onClose={() => setIsBuilderModalVisible(false)}
        onSavePreset={(newPreset) => saveModularPreset(newPreset)}
        bottomInset={insets.bottom}
      />

      {/* Exam Reminders Slide-Up Modal */}
      <ExamRemindersModal
        visible={activeRemindersTarget !== null}
        target={activeRemindersTarget}
        onClose={() => setActiveRemindersTarget(null)}
        onStartExam={handleStartExamSession}
        bottomInset={insets.bottom}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  contentContainer: {
    paddingHorizontal: 16,
    gap: 22,
    paddingTop: 8,
  },
  section: {
    gap: 12,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  addCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bentoCard: {
    width: '48.2%',
    minHeight: 132,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      },
    }),
  },
  cardDeleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  bentoTitle: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.2,
    marginTop: 2,
  },
  bentoSubtitle: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  dashedAddCard: {
    width: '48.2%',
    minHeight: 132,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  dashedIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comprehensiveList: {
    gap: 12,
  },
  comprehensiveSetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
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
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      },
    }),
  },
  setNumberCol: {
    width: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setLabelText: {
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  setBigNumberText: {
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 42,
    marginTop: -2,
    letterSpacing: -1,
  },
  setDivider: {
    width: 1,
    height: '84%',
    marginHorizontal: 14,
  },
  setContentCol: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  setHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  setItemsTitle: {
    fontSize: 15.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  setDurationText: {
    fontSize: 12,
    fontWeight: '700',
  },
  subjectsStack: {
    gap: 4,
    marginTop: 3,
  },
  subjectItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  bulletDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
  },
  subjectItemText: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.3,
    lineHeight: 16,
  },
});
