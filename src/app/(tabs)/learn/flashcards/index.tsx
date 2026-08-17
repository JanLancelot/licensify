import { useRouter } from 'expo-router';
import { ArrowLeft, Plus } from 'lucide-react-native';
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

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SUBJECT_NOTES } from '@/data/curriculum';
import {
  FlashcardItem,
  FlashcardPreset,
  SubjectNote,
  Topic,
} from '@/types/curriculum';
import { buildCardsForLessons } from '@/components/flashcards/flashcard-utils';
import { FlashcardPresetCard } from '@/components/flashcards/FlashcardPresetCard';
import { FlashcardStudyView } from '@/components/flashcards/FlashcardStudyView';
import { FlashcardPresetBuilderModal } from '@/components/flashcards/FlashcardPresetBuilderModal';

export default function FlashcardsHubScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // User-created Flashcard Presets (Empty initially)
  const [presets, setPresets] = useState<FlashcardPreset[]>([]);

  // Active Session State
  const [activePreset, setActivePreset] = useState<FlashcardPreset | null>(null);
  const [activeCards, setActiveCards] = useState<FlashcardItem[]>([]);
  const [studyIndex, setStudyIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Bottom Sheet Modal for Preset Creation / Editing
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [selectedLessonIds, setSelectedLessonIds] = useState<Set<string>>(new Set());
  const [isShuffled, setIsShuffled] = useState(true);
  const [customTitle, setCustomTitle] = useState('');

  // ── Accordion Handlers ───────────────────────────────────────────────────
  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects((prev) => {
      const isCurrentlyOpen = !!prev[subjectId];
      if (isCurrentlyOpen) {
        const subject = SUBJECT_NOTES.find((s) => s.id === subjectId);
        if (subject) {
          setExpandedTopics((topicPrev) => {
            const next = { ...topicPrev };
            subject.topics.forEach((t) => {
              delete next[t.id];
            });
            return next;
          });
        }
      }
      return { ...prev, [subjectId]: !isCurrentlyOpen };
    });
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  // ── Selection Handlers ───────────────────────────────────────────────────
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

  // ── Modal Actions (Create / Edit) ────────────────────────────────────────
  const handleOpenAddModal = () => {
    setEditingPresetId(null);
    setSelectedLessonIds(new Set());
    setExpandedSubjects({});
    setExpandedTopics({});
    setCustomTitle('');
    setIsShuffled(true);
    setIsAddModalVisible(true);
  };

  const handleEditPreset = (preset: FlashcardPreset) => {
    setEditingPresetId(preset.id);
    const lessonIdSet = new Set(preset.selectedLessonIds || []);
    setSelectedLessonIds(lessonIdSet);
    setCustomTitle(preset.title);
    setIsShuffled(preset.isShuffled);

    // Expand subjects and topics that contain selected lessons
    const subjectsToExpand: Record<string, boolean> = {};
    const topicsToExpand: Record<string, boolean> = {};

    SUBJECT_NOTES.forEach((sub) => {
      sub.topics.forEach((top) => {
        const hasMatch = top.lessons.some((l) => lessonIdSet.has(l.id));
        if (hasMatch) {
          subjectsToExpand[sub.id] = true;
          topicsToExpand[top.id] = true;
        }
      });
    });

    setExpandedSubjects(subjectsToExpand);
    setExpandedTopics(topicsToExpand);
    setIsAddModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsAddModalVisible(false);
    setEditingPresetId(null);
  };

  const handleSubmitPreset = () => {
    if (selectedLessonIds.size === 0) {
      Alert.alert(
        'No Lessons Selected',
        'Please select at least one lesson, topic, or subject to generate your flashcards.'
      );
      return;
    }

    const cards = buildCardsForLessons(selectedLessonIds, isShuffled);

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
      (selectedSubjectsSet.size > 1
        ? `Multi-Subject Preset (${selectedLessonIds.size} Lessons)`
        : `${Array.from(selectedSubjectsSet)[0] || 'Curriculum'} Preset (${selectedLessonIds.size} Lessons)`);

    if (editingPresetId) {
      // Update existing preset
      setPresets((prev) =>
        prev.map((preset) => {
          if (preset.id === editingPresetId) {
            return {
              ...preset,
              title: finalTitle,
              lessonCount: selectedLessonIds.size,
              cardCount: cards.length,
              isShuffled,
              subjectNames: Array.from(selectedSubjectsSet),
              cards,
              selectedLessonIds: Array.from(selectedLessonIds),
            };
          }
          return preset;
        })
      );
    } else {
      // Create new preset
      const newPreset: FlashcardPreset = {
        id: `preset-${Date.now()}`,
        title: finalTitle,
        lessonCount: selectedLessonIds.size,
        cardCount: cards.length,
        isShuffled,
        createdAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        subjectNames: Array.from(selectedSubjectsSet),
        cards,
        selectedLessonIds: Array.from(selectedLessonIds),
      };

      setPresets((prev) => [newPreset, ...prev]);
    }

    handleCloseModal();
  };

  // ── Study Session Actions ────────────────────────────────────────────────
  const startPresetDrill = (preset: FlashcardPreset) => {
    let drillCards = [...preset.cards];
    if (preset.isShuffled) {
      drillCards = drillCards.sort(() => Math.random() - 0.5);
    }
    setActivePreset(preset);
    setActiveCards(drillCards);
    setStudyIndex(0);
    setIsFlipped(false);
  };

  const handleDeletePreset = (presetId: string) => {
    Alert.alert('Delete Preset', 'Are you sure you want to remove this flashcard preset?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setPresets((prev) => prev.filter((p) => p.id !== presetId));
        },
      },
    ]);
  };

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
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* ── Top App Bar ─────────────────────────────────────────────────────── */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <Pressable
          onPress={() => {
            if (activePreset) {
              setActivePreset(null);
            } else {
              router.back();
            }
          }}
          hitSlop={12}
          style={({ pressed }) => [
            styles.backBtn,
            { opacity: pressed ? 0.5 : 1 },
          ]}>
          <ArrowLeft size={20} color={theme.text} strokeWidth={2.2} />
        </Pressable>

        <View style={styles.topBarTitles}>
          <Text style={[styles.topBarHeading, { color: theme.text }]}>
            {activePreset ? activePreset.title : 'Flashcards'}
          </Text>
        </View>
      </View>

      {/* ── Active Flashcard Drill View or Presets Hub ────────────────────── */}
      {activePreset && currentStudyCard ? (
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
              setActivePreset(null);
            }
          }}
          onToggleDifficult={toggleDifficult}
          onToggleFavorite={toggleFavorite}
          theme={theme}
        />
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 80 },
          ]}>
          {presets.length === 0 ? (
            /* Clean Empty State */
            <View style={styles.emptyState}>
              <View
                style={[
                  styles.emptyIconCircle,
                  { backgroundColor: theme.accentMuted },
                ]}>
                <Plus size={32} color={theme.accent} strokeWidth={2.5} />
              </View>
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                No Flashcard Presets
              </Text>
              <Text style={[styles.emptyStateDesc, { color: theme.textSecondary }]}>
                Create custom flashcard presets by selecting lessons, topics, or subjects from your Comprehensive Notes curriculum.
              </Text>
              <Pressable
                onPress={handleOpenAddModal}
                style={({ pressed }) => [
                  styles.emptyStateBtn,
                  {
                    backgroundColor: theme.accent,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}>
                <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.emptyStateBtnText}>Create Flashcard Preset</Text>
              </Pressable>
            </View>
          ) : (
            /* Created Presets List */
            <View style={styles.presetListContainer}>
              <View style={styles.presetHeaderRow}>
                <Text style={[styles.presetSectionHeading, { color: theme.text }]}>
                  Your Flashcard Presets ({presets.length})
                </Text>
                <Pressable
                  onPress={handleOpenAddModal}
                  style={({ pressed }) => [
                    styles.listAddBtn,
                    {
                      backgroundColor: theme.accent,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}>
                  <Plus size={14} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.listAddBtnText}>Add Preset</Text>
                </Pressable>
              </View>

              {presets.map((preset) => (
                <FlashcardPresetCard
                  key={preset.id}
                  preset={preset}
                  onStartDrill={startPresetDrill}
                  onEditPreset={handleEditPreset}
                  onDeletePreset={handleDeletePreset}
                  theme={theme}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* ── Add / Edit Preset Bottom Sheet Modal ──────────────────────────── */}
      <FlashcardPresetBuilderModal
        visible={isAddModalVisible}
        isEditing={!!editingPresetId}
        onClose={handleCloseModal}
        onSubmit={handleSubmitPreset}
        expandedSubjects={expandedSubjects}
        expandedTopics={expandedTopics}
        selectedLessonIds={selectedLessonIds}
        toggleSubject={toggleSubject}
        toggleSubjectSelection={toggleSubjectSelection}
        toggleTopic={toggleTopic}
        toggleTopicSelection={toggleTopicSelection}
        toggleLessonSelection={toggleLessonSelection}
        isShuffled={isShuffled}
        setIsShuffled={setIsShuffled}
        customTitle={customTitle}
        setCustomTitle={setCustomTitle}
        bottomInset={insets.bottom}
        theme={theme}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 14,
  },
  backBtn: {
    padding: 6,
    marginLeft: -4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitles: {
    flex: 1,
  },
  topBarHeading: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 16,
    gap: 12,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  emptyStateDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  emptyStateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.xs,
    marginTop: 8,
  },
  emptyStateBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  presetListContainer: {
    gap: 12,
  },
  presetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  presetSectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  listAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.xs,
  },
  listAddBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
});
