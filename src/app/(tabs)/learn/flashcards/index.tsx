import { useRouter } from 'expo-router';
import { ArrowLeft, Layers, Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
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
  FlashcardPresetBuilderModal,
  PRESET_ICONS,
} from '@/components/flashcards/FlashcardPresetBuilderModal';
import { FlashcardStudyView } from '@/components/flashcards/FlashcardStudyView';
import { buildCardsForLessons } from '@/components/flashcards/flashcard-utils';
import { useAppTheme } from '@/context/theme-context';
import { SUBJECT_NOTES } from '@/data/curriculum';
import {
  FlashcardItem,
  FlashcardPreset,
  SubjectNote,
  Topic,
} from '@/types/curriculum';

/* Custom Deck Gradient Icon Component */
function CustomDeckIcon({
  iconName = 'Layers',
  size = 52,
}: {
  iconName?: string;
  size?: number;
}) {
  const iconConfig = PRESET_ICONS.find((i) => i.id === iconName) || PRESET_ICONS[0];
  const IconComp = iconConfig.icon;
  const [startC, endC] = iconConfig.gradient;
  const gradId = `deck_icon_${iconConfig.id}_${size}`;

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
      <IconComp size={24} color="#FFFFFF" strokeWidth={2.4} />
    </View>
  );
}

export default function FlashcardsHubScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // User-created Custom Flashcard Decks (Top Grid)
  const [customPresets, setCustomPresets] = useState<FlashcardPreset[]>([]);

  // Active Session State
  const [activeSessionTitle, setActiveSessionTitle] = useState<string | null>(null);
  const [activeCards, setActiveCards] = useState<FlashcardItem[]>([]);
  const [studyIndex, setStudyIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Preset Builder Modal State
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [modalExpandedSubjects, setModalExpandedSubjects] = useState<Record<string, boolean>>({});
  const [modalExpandedTopics, setModalExpandedTopics] = useState<Record<string, boolean>>({});
  const [selectedLessonIds, setSelectedLessonIds] = useState<Set<string>>(new Set());
  const [modalIsShuffled, setModalIsShuffled] = useState(true);
  const [customTitle, setCustomTitle] = useState('');
  const [selectedIconId, setSelectedIconId] = useState('Layers');

  // ── Launching Custom Deck ────────────────────────────────────────────────
  const startCustomPresetDrill = (preset: FlashcardPreset) => {
    let drillCards = [...preset.cards];
    if (preset.isShuffled) {
      drillCards = drillCards.sort(() => Math.random() - 0.5);
    }
    setActiveSessionTitle(preset.title);
    setActiveCards(drillCards);
    setStudyIndex(0);
    setIsFlipped(false);
  };

  // ── Modal Actions (Create / Edit Preset) ──────────────────────────────────
  const handleOpenAddModal = () => {
    setEditingPresetId(null);
    setSelectedLessonIds(new Set());
    setModalExpandedSubjects({});
    setModalExpandedTopics({});
    setCustomTitle('');
    setSelectedIconId('Layers');
    setModalIsShuffled(true);
    setIsAddModalVisible(true);
  };

  const handleModalSubmitPreset = () => {
    if (selectedLessonIds.size === 0) {
      Alert.alert(
        'No Lessons Selected',
        'Please select at least one lesson, topic, or subject to generate your flashcards.'
      );
      return;
    }

    const cards = buildCardsForLessons(selectedLessonIds, modalIsShuffled);
    if (cards.length === 0) {
      Alert.alert('Notice', 'No flashcards could be generated for the selected lessons.');
      return;
    }

    const selectedSubjectsSet = new Set<string>();
    SUBJECT_NOTES.forEach((sub) => {
      const hasAny = sub.topics.some((t) =>
        t.lessons.some((l) => selectedLessonIds.has(l.id))
      );
      if (hasAny) {
        selectedSubjectsSet.add(sub.title);
      }
    });

    const finalTitle =
      customTitle.trim() ||
      `Custom Preset ${customPresets.length + 1}`;

    const newPreset: FlashcardPreset = {
      id: `preset-${Date.now()}`,
      title: finalTitle,
      lessonCount: selectedLessonIds.size,
      cardCount: cards.length,
      isShuffled: modalIsShuffled,
      iconName: selectedIconId,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      subjectNames: Array.from(selectedSubjectsSet),
      cards,
      selectedLessonIds: Array.from(selectedLessonIds),
    };

    setCustomPresets((prev) => [newPreset, ...prev]);
    setIsAddModalVisible(false);
  };

  const toggleModalSubject = (subjectId: string) => {
    setModalExpandedSubjects((prev) => ({ ...prev, [subjectId]: !prev[subjectId] }));
  };

  const toggleModalSubjectSelection = (subject: SubjectNote) => {
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

  const toggleModalTopic = (topicId: string) => {
    setModalExpandedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const toggleModalTopicSelection = (topic: Topic) => {
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

  const toggleModalLessonSelection = (lessonId: string) => {
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

  // ── Study Session Controls ───────────────────────────────────────────────
  const toggleDifficult = (cardId: string) => {
    setActiveCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isDifficult: !c.isDifficult } : c))
    );
  };

  const toggleFavorite = (cardId: string) => {
    setActiveCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFavorite: !c.isFavorite } : c))
    );
  };

  const currentStudyCard = activeCards[studyIndex];

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => {
            if (activeCards.length > 0) {
              setActiveCards([]);
              setActiveSessionTitle(null);
            } else {
              router.back();
            }
          }}
          hitSlop={12}
          style={({ pressed }) => [
            styles.backBtn,
            {
              backgroundColor: isDark ? '#23262F' : '#F6F0ED',
              opacity: pressed ? 0.7 : 1,
            },
          ]}>
          <ArrowLeft size={20} color={colors.text} strokeWidth={2.4} />
        </Pressable>

        <View style={styles.topBarTitles}>
          <Text style={[styles.topBarHeading, { color: colors.text }]}>
            {activeSessionTitle ? activeSessionTitle : 'Flashcards'}
          </Text>
        </View>
      </View>

      {/* Active Study View or Flashcards Hub */}
      {activeCards.length > 0 && currentStudyCard ? (
        <FlashcardStudyView
          currentCard={currentStudyCard}
          studyIndex={studyIndex}
          totalCards={activeCards.length}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
          onPrev={() => {
            setStudyIndex(studyIndex - 1);
            setIsFlipped(false);
          }}
          onNext={() => {
            if (studyIndex < activeCards.length - 1) {
              setStudyIndex(studyIndex + 1);
              setIsFlipped(false);
            } else {
              setActiveCards([]);
              setActiveSessionTitle(null);
            }
          }}
          onToggleDifficult={toggleDifficult}
          onToggleFavorite={toggleFavorite}
          theme={colors}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 80 },
          ]}>
          {/* SECTION HEADER: YOUR FLASHCARDS (+) */}
          <View style={styles.sectionHeadingRow}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
              YOUR FLASHCARDS
            </Text>
            <Pressable
              onPress={handleOpenAddModal}
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

          {/* 2-Column Grid of Custom Decks + Dashed Add Button */}
          <View style={styles.gridContainer}>
            {customPresets.map((preset) => (
              <Pressable
                key={preset.id}
                onPress={() => startCustomPresetDrill(preset)}
                style={({ pressed }) => [
                  styles.customDeckCard,
                  {
                    backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}>
                {/* Customizable Circular Icon on Top */}
                <CustomDeckIcon iconName={preset.iconName} size={52} />

                {/* Deck Title */}
                <Text
                  numberOfLines={1}
                  style={[
                    styles.customDeckTitle,
                    { color: isDark ? '#F9FAFB' : '#0F172A' },
                  ]}>
                  {preset.title}
                </Text>

                {/* Card Count Subtitle */}
                <Text style={[styles.customDeckSub, { color: colors.textSecondary }]}>
                  {preset.cardCount} Cards
                </Text>
              </Pressable>
            ))}

            {/* Dashed Add New Preset Card */}
            <Pressable
              onPress={handleOpenAddModal}
              style={({ pressed }) => [
                styles.dashedAddCard,
                {
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.18)',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
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
                <Plus size={24} color={colors.accent} strokeWidth={2.4} />
              </View>
              <Text style={[styles.dashedAddText, { color: colors.textSecondary }]}>
                New Preset
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}

      {/* Preset Builder Modal */}
      <FlashcardPresetBuilderModal
        visible={isAddModalVisible}
        isEditing={false}
        onClose={() => setIsAddModalVisible(false)}
        onSubmit={handleModalSubmitPreset}
        expandedSubjects={modalExpandedSubjects}
        expandedTopics={modalExpandedTopics}
        selectedLessonIds={selectedLessonIds}
        toggleSubject={toggleModalSubject}
        toggleSubjectSelection={toggleModalSubjectSelection}
        toggleTopic={toggleModalTopic}
        toggleTopicSelection={toggleModalTopicSelection}
        toggleLessonSelection={toggleModalLessonSelection}
        isShuffled={modalIsShuffled}
        setIsShuffled={setModalIsShuffled}
        customTitle={customTitle}
        setCustomTitle={setCustomTitle}
        selectedIconId={selectedIconId}
        setSelectedIconId={setSelectedIconId}
        bottomInset={insets.bottom}
        theme={colors}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitles: {
    flex: 1,
  },
  topBarHeading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 14,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  addCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  customDeckCard: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 124,
  },
  customDeckTitle: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  customDeckSub: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  dashedAddCard: {
    width: '48%',
    borderRadius: 20,
    borderWidth: 1.8,
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 124,
  },
  dashedIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedAddText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
