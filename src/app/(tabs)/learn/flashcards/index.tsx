import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Star,
} from 'lucide-react-native';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { Radius } from '@/constants/theme';

type FlashcardTab = 'decks' | 'difficult' | 'favorites';

interface FlashcardItem {
  id: string;
  deckId: string;
  deckTitle: string;
  topic: string;
  question: string;
  answer: string;
  explanation: string;
  isDifficult: boolean;
  isFavorite: boolean;
}

const INITIAL_CARDS: FlashcardItem[] = [
  {
    id: 'fc-1',
    deckId: 'history',
    deckTitle: 'History & Theory',
    topic: 'Classical Orders',
    question: 'Which Greek classical order is characterized by spiral volutes on its capital?',
    answer: 'Ionic Order',
    explanation: 'The Ionic order is identified by its paired scroll-like ornaments called volutes, slender fluted shafts, and molded circular bases.',
    isDifficult: false,
    isFavorite: true,
  },
  {
    id: 'fc-2',
    deckId: 'history',
    deckTitle: 'History & Theory',
    topic: 'Philippine Architecture',
    question: 'Who was the first registered architect and first National Artist for Architecture in the Philippines?',
    answer: 'Juan F. Nakpil',
    explanation: 'Juan Nakpil was named National Artist for Architecture in 1973 for his monumental contributions including the UP Quezon Hall and Quiapo Church reconstruction.',
    isDifficult: false,
    isFavorite: false,
  },
  {
    id: 'fc-3',
    deckId: 'laws',
    deckTitle: 'Building Laws & Codes',
    topic: 'PD 1096 (NBCP Rule 8)',
    question: 'Under NBCP Rule 8, what is the formula for calculating Total Open Space within Lot (TOSL)?',
    answer: 'TOSL = ISA + USA',
    explanation: 'Total Open Space within Lot is the sum of Impervious Surface Area (paved/driveways) and Unpaved Surface Area (soil/vegetation).',
    isDifficult: true,
    isFavorite: true,
  },
  {
    id: 'fc-4',
    deckId: 'laws',
    deckTitle: 'Building Laws & Codes',
    topic: 'RA 9266',
    question: 'What is the required Continuing Professional Development (CPD) credit unit renewal requirement for Registered and Licensed Architects (RLAs)?',
    answer: '15 Credit Units per 3-year compliance period (under current PRC CPD guidelines).',
    explanation: 'Compliance is required for the triennial renewal of the Professional Identification Card.',
    isDifficult: true,
    isFavorite: false,
  },
  {
    id: 'fc-5',
    deckId: 'tech',
    deckTitle: 'Building Tech & Utilities',
    topic: 'National Plumbing Code',
    question: 'What is the required standard water trap seal depth for sanitary fixtures?',
    answer: '2 inches (51 mm) to 4 inches (102 mm)',
    explanation: 'A trap seal below 2 inches is susceptible to siphonage, while seals exceeding 4 inches create excessive friction and clogging.',
    isDifficult: true,
    isFavorite: true,
  },
  {
    id: 'fc-6',
    deckId: 'tech',
    deckTitle: 'Building Tech & Utilities',
    topic: 'Concrete Mix Ratios',
    question: 'What is the standard volumetric proportion for Class A concrete mix?',
    answer: '1 : 2 : 4 (Cement : Sand : Gravel)',
    explanation: 'Class A mix yields approximately 3,000 psi compressive strength at 28 days for beams, columns, and slabs.',
    isDifficult: false,
    isFavorite: false,
  },
  {
    id: 'fc-7',
    deckId: 'structures',
    deckTitle: 'Structural Concepts',
    topic: 'Truss Analysis',
    question: 'In a standard Pratt roof truss, what type of internal stress do the diagonal web members experience under standard gravity loads?',
    answer: 'Tension',
    explanation: 'Pratt trusses feature tension diagonals and compression verticals, making steel design economical.',
    isDifficult: true,
    isFavorite: false,
  },
];

const DECKS_METADATA = [
  {
    id: 'history',
    title: 'History & Architectural Theory',
    description: 'Classical orders, Renaissance styles, and Philippine heritage.',
    cardCount: 45,
    mastery: '85%',
  },
  {
    id: 'laws',
    title: 'Building Laws & Professional Practice',
    description: 'RA 9266, NBCP (PD 1096), Fire Code (RA 9514), and SPP docs.',
    cardCount: 60,
    mastery: '72%',
  },
  {
    id: 'tech',
    title: 'Building Technology & Utilities',
    description: 'MEPFS, Plumbing code, materials, and concrete specifications.',
    cardCount: 50,
    mastery: '60%',
  },
  {
    id: 'structures',
    title: 'Structural Concepts & Theory',
    description: 'Truss behavior, moments, shear, and timber/steel basics.',
    cardCount: 35,
    mastery: '58%',
  },
];

export default function FlashcardsHubScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();

  const [activeTab, setActiveTab] = useState<FlashcardTab>(
    (params.tab as FlashcardTab) || 'decks'
  );
  const [cards, setCards] = useState<FlashcardItem[]>(INITIAL_CARDS);

  // Active Session state
  const [activeStudyCards, setActiveStudyCards] = useState<FlashcardItem[] | null>(null);
  const [studyIndex, setStudyIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const difficultCards = cards.filter((c) => c.isDifficult);
  const favoriteCards = cards.filter((c) => c.isFavorite);

  const startDeckDrill = (deckId: string) => {
    const deckCards = cards.filter((c) => c.deckId === deckId);
    setActiveStudyCards(deckCards.length > 0 ? deckCards : cards);
    setStudyIndex(0);
    setIsFlipped(false);
  };

  const startDifficultDrill = () => {
    setActiveStudyCards(difficultCards.length > 0 ? difficultCards : cards);
    setStudyIndex(0);
    setIsFlipped(false);
  };

  const startFavoritesDrill = () => {
    setActiveStudyCards(favoriteCards.length > 0 ? favoriteCards : cards);
    setStudyIndex(0);
    setIsFlipped(false);
  };

  const toggleDifficult = (id: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isDifficult: !c.isDifficult } : c))
    );
  };

  const toggleFavorite = (id: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    );
  };

  const currentStudyCard = activeStudyCards ? activeStudyCards[studyIndex] : null;

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <Pressable
          onPress={() => {
            if (activeStudyCards) {
              setActiveStudyCards(null);
            } else {
              router.back();
            }
          }}
          hitSlop={12}
          style={({ pressed }) => [
            styles.backBtn,
            {
              opacity: pressed ? 0.5 : 1,
            },
          ]}>
          <ArrowLeft size={22} color={theme.text} strokeWidth={2.2} />
        </Pressable>

        <View style={styles.topBarTitles}>
          <Text style={[styles.topBarKicker, { color: theme.accent }]}>
            ACTIVE RECALL & MEMORIZATION
          </Text>
          <Text style={[styles.topBarHeading, { color: theme.text }]}>
            {activeStudyCards ? 'Flashcards Drill' : 'Flashcards Hub'}
          </Text>
        </View>
      </View>

      {/* If Active Study Session */}
      {activeStudyCards && currentStudyCard ? (
        <View style={styles.studyContainer}>
          {/* Header Status */}
          <View style={styles.studyHeader}>
            <Text style={[styles.studyDeckLabel, { color: theme.accent }]}>
              {currentStudyCard.deckTitle} • {currentStudyCard.topic}
            </Text>
            <Text style={[styles.studyCounter, { color: theme.textSecondary }]}>
              {studyIndex + 1} of {activeStudyCards.length}
            </Text>
          </View>

          {/* Flashcard Box */}
          <Pressable
            onPress={() => setIsFlipped(!isFlipped)}
            style={({ pressed }) => [
              styles.flashcardBox,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
                opacity: pressed ? 0.95 : 1,
              },
            ]}>
            <View style={styles.cardSideBadgeRow}>
              <View
                style={[
                  styles.sideBadge,
                  {
                    backgroundColor: isFlipped
                      ? theme.accentMuted
                      : theme.backgroundSelected,
                    borderColor: theme.border,
                  },
                ]}>
                <Text
                  style={[
                    styles.sideBadgeText,
                    { color: isFlipped ? theme.accent : theme.textSecondary },
                  ]}>
                  {isFlipped ? 'ANSWER' : 'QUESTION'}
                </Text>
              </View>
              <Text
                style={[styles.flipHint, { color: theme.textSecondary }]}>
                Tap to flip
              </Text>
            </View>

            <View style={styles.cardMainContent}>
              {!isFlipped ? (
                <Text style={[styles.questionText, { color: theme.text }]}>
                  {currentStudyCard.question}
                </Text>
              ) : (
                <View style={styles.answerBox}>
                  <Text style={[styles.answerText, { color: theme.accent }]}>
                    {currentStudyCard.answer}
                  </Text>
                  <Text
                    style={[
                      styles.explanationText,
                      { color: theme.textSecondary },
                    ]}>
                    {currentStudyCard.explanation}
                  </Text>
                </View>
              )}
            </View>

            {/* Quick Card Flags */}
            <View
              style={[
                styles.cardActionRow,
                { borderTopColor: theme.border },
              ]}>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  toggleDifficult(currentStudyCard.id);
                }}
                style={({ pressed }) => [
                  styles.flagBtn,
                  { opacity: pressed ? 0.7 : 1 },
                ]}>
                <AlertTriangle
                  size={14}
                  color={
                    currentStudyCard.isDifficult
                      ? theme.accent
                      : theme.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.flagBtnText,
                    {
                      color: currentStudyCard.isDifficult
                        ? theme.accent
                        : theme.textSecondary,
                    },
                  ]}>
                  {currentStudyCard.isDifficult ? 'Flagged Hard' : 'Mark Hard'}
                </Text>
              </Pressable>

              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  toggleFavorite(currentStudyCard.id);
                }}
                style={({ pressed }) => [
                  styles.flagBtn,
                  { opacity: pressed ? 0.7 : 1 },
                ]}>
                <Star
                  size={14}
                  color={
                    currentStudyCard.isFavorite
                      ? theme.accent
                      : theme.textSecondary
                  }
                  fill={currentStudyCard.isFavorite ? theme.accent : 'transparent'}
                />
                <Text
                  style={[
                    styles.flagBtnText,
                    {
                      color: currentStudyCard.isFavorite
                        ? theme.accent
                        : theme.textSecondary,
                    },
                  ]}>
                  {currentStudyCard.isFavorite ? 'Saved' : 'Save'}
                </Text>
              </Pressable>
            </View>
          </Pressable>

          {/* Navigation Controls */}
          <View style={styles.studyControls}>
            <Pressable
              disabled={studyIndex === 0}
              onPress={() => {
                setStudyIndex(studyIndex - 1);
                setIsFlipped(false);
              }}
              style={({ pressed }) => [
                styles.navBtn,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                  opacity: studyIndex === 0 ? 0.4 : pressed ? 0.7 : 1,
                },
              ]}>
              <ChevronLeft size={18} color={theme.text} />
              <Text style={[styles.navBtnText, { color: theme.text }]}>
                Previous
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (studyIndex < activeStudyCards.length - 1) {
                  setStudyIndex(studyIndex + 1);
                  setIsFlipped(false);
                } else {
                  setActiveStudyCards(null);
                }
              }}
              style={({ pressed }) => [
                styles.navBtnPrimary,
                {
                  backgroundColor: theme.accent,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <Text style={styles.navBtnPrimaryText}>
                {studyIndex < activeStudyCards.length - 1
                  ? 'Next Card'
                  : 'Finish Drill'}
              </Text>
              <ChevronRight size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      ) : (
        /* Regular Hub View with Tabs */
        <>
          {/* Segmented Control */}
          <View
            style={[
              styles.segmentContainer,
              {
                backgroundColor: theme.backgroundElement,
                borderBottomColor: theme.border,
              },
            ]}>
            <Pressable
              onPress={() => setActiveTab('decks')}
              style={[
                styles.segmentBtn,
                activeTab === 'decks' && [
                  styles.segmentBtnActive,
                  { backgroundColor: theme.accent, borderColor: theme.accent },
                ],
              ]}>
              <Text
                style={[
                  styles.segmentText,
                  {
                    color:
                      activeTab === 'decks' ? '#FFFFFF' : theme.textSecondary,
                  },
                ]}>
                Subject Decks
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('difficult')}
              style={[
                styles.segmentBtn,
                activeTab === 'difficult' && [
                  styles.segmentBtnActive,
                  { backgroundColor: theme.accent, borderColor: theme.accent },
                ],
              ]}>
              <Text
                style={[
                  styles.segmentText,
                  {
                    color:
                      activeTab === 'difficult'
                        ? '#FFFFFF'
                        : theme.textSecondary,
                  },
                ]}>
                Difficult ({difficultCards.length})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('favorites')}
              style={[
                styles.segmentBtn,
                activeTab === 'favorites' && [
                  styles.segmentBtnActive,
                  { backgroundColor: theme.accent, borderColor: theme.accent },
                ],
              ]}>
              <Text
                style={[
                  styles.segmentText,
                  {
                    color:
                      activeTab === 'favorites'
                        ? '#FFFFFF'
                        : theme.textSecondary,
                  },
                ]}>
                Favorites ({favoriteCards.length})
              </Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.contentContainer,
              { paddingBottom: insets.bottom + 60 },
            ]}>
            {/* VIEW 1: SUBJECT DECKS */}
            {activeTab === 'decks' && (
              <View style={styles.tabContent}>
                <View
                  style={[
                    styles.groupedList,
                    {
                      backgroundColor: theme.backgroundElement,
                      borderColor: theme.border,
                    },
                  ]}>
                  {DECKS_METADATA.map((deck, idx) => (
                    <React.Fragment key={deck.id}>
                      <Pressable
                        onPress={() => startDeckDrill(deck.id)}
                        style={({ pressed }) => [
                          styles.deckRow,
                          { opacity: pressed ? 0.7 : 1 },
                        ]}>
                        <View style={styles.deckRowLeft}>
                          <View style={styles.deckTagRow}>
                            <Text
                              style={[
                                styles.deckMastery,
                                { color: theme.accent },
                              ]}>
                              {deck.mastery} Mastered
                            </Text>
                            <Text
                              style={[
                                styles.deckDot,
                                { color: theme.textSecondary },
                              ]}>
                              •
                            </Text>
                            <Text
                              style={[
                                styles.deckCount,
                                { color: theme.textSecondary },
                              ]}>
                              {deck.cardCount} Cards
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.deckRowTitle,
                              { color: theme.text },
                            ]}>
                            {deck.title}
                          </Text>
                          <Text
                            style={[
                              styles.deckRowDesc,
                              { color: theme.textSecondary },
                            ]}>
                            {deck.description}
                          </Text>
                        </View>
                        <ChevronRight size={16} color={theme.textSecondary} />
                      </Pressable>

                      {idx < DECKS_METADATA.length - 1 && (
                        <View
                          style={[
                            styles.rowDivider,
                            { backgroundColor: theme.border },
                          ]}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            )}

            {/* VIEW 2: DIFFICULT CARDS */}
            {activeTab === 'difficult' && (
              <View style={styles.tabContent}>
                {/* Action Banner */}
                <View
                  style={[
                    styles.actionBanner,
                    {
                      backgroundColor: theme.backgroundElement,
                      borderColor: theme.border,
                    },
                  ]}>
                  <View style={styles.bannerInfo}>
                    <Text style={[styles.bannerTitle, { color: theme.text }]}>
                      {difficultCards.length} Cards Needing Focus
                    </Text>
                    <Text
                      style={[
                        styles.bannerDesc,
                        { color: theme.textSecondary },
                      ]}>
                      Targeted review of terms flagged or with low recall rates.
                    </Text>
                  </View>
                  <Pressable
                    onPress={startDifficultDrill}
                    style={[
                      styles.bannerActionBtn,
                      { backgroundColor: theme.accent },
                    ]}>
                    <Play size={13} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={styles.bannerActionText}>Start Drill</Text>
                  </Pressable>
                </View>

                {/* Card list */}
                <View
                  style={[
                    styles.groupedList,
                    {
                      backgroundColor: theme.backgroundElement,
                      borderColor: theme.border,
                    },
                  ]}>
                  {difficultCards.map((card, idx) => (
                    <React.Fragment key={card.id}>
                      <View style={styles.cardRow}>
                        <View style={styles.cardRowInfo}>
                          <Text
                            style={[
                              styles.cardRowTopic,
                              { color: theme.accent },
                            ]}>
                            {card.deckTitle} • {card.topic}
                          </Text>
                          <Text
                            style={[
                              styles.cardRowQuestion,
                              { color: theme.text },
                            ]}>
                            {card.question}
                          </Text>
                          <Text
                            style={[
                              styles.cardRowAnswer,
                              { color: theme.textSecondary },
                            ]}>
                            {card.answer}
                          </Text>
                        </View>
                      </View>

                      {idx < difficultCards.length - 1 && (
                        <View
                          style={[
                            styles.rowDivider,
                            { backgroundColor: theme.border },
                          ]}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            )}

            {/* VIEW 3: FAVORITES */}
            {activeTab === 'favorites' && (
              <View style={styles.tabContent}>
                {/* Action Banner */}
                <View
                  style={[
                    styles.actionBanner,
                    {
                      backgroundColor: theme.backgroundElement,
                      borderColor: theme.border,
                    },
                  ]}>
                  <View style={styles.bannerInfo}>
                    <Text style={[styles.bannerTitle, { color: theme.text }]}>
                      {favoriteCards.length} Starred Terms
                    </Text>
                    <Text
                      style={[
                        styles.bannerDesc,
                        { color: theme.textSecondary },
                      ]}>
                      Quick access collection of high-yield architectural terms.
                    </Text>
                  </View>
                  <Pressable
                    onPress={startFavoritesDrill}
                    style={[
                      styles.bannerActionBtn,
                      { backgroundColor: theme.accent },
                    ]}>
                    <Play size={13} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={styles.bannerActionText}>Review Starred</Text>
                  </Pressable>
                </View>

                {/* Card list */}
                <View
                  style={[
                    styles.groupedList,
                    {
                      backgroundColor: theme.backgroundElement,
                      borderColor: theme.border,
                    },
                  ]}>
                  {favoriteCards.map((card, idx) => (
                    <React.Fragment key={card.id}>
                      <View style={styles.cardRow}>
                        <View style={styles.cardRowInfo}>
                          <Text
                            style={[
                              styles.cardRowTopic,
                              { color: theme.accent },
                            ]}>
                            {card.deckTitle} • {card.topic}
                          </Text>
                          <Text
                            style={[
                              styles.cardRowQuestion,
                              { color: theme.text },
                            ]}>
                            {card.question}
                          </Text>
                          <Text
                            style={[
                              styles.cardRowAnswer,
                              { color: theme.textSecondary },
                            ]}>
                            {card.answer}
                          </Text>
                        </View>
                      </View>

                      {idx < favoriteCards.length - 1 && (
                        <View
                          style={[
                            styles.rowDivider,
                            { backgroundColor: theme.border },
                          ]}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </>
      )}
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

  /* Top Bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
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
  topBarKicker: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1,
  },
  topBarHeading: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  /* Segment Control */
  segmentContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: Radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    borderWidth: 1,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
  },

  tabContent: {
    gap: 14,
  },

  /* Grouped List */
  groupedList: {
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  deckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  deckRowLeft: {
    flex: 1,
    gap: 3,
  },
  deckTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  deckMastery: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  deckDot: {
    fontSize: 10,
  },
  deckCount: {
    fontSize: 11,
  },
  deckRowTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  deckRowDesc: {
    fontSize: 11.5,
    lineHeight: 15,
  },
  rowDivider: {
    height: 1,
    marginHorizontal: 16,
  },

  /* Action Banner */
  actionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 12,
  },
  bannerInfo: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  bannerDesc: {
    fontSize: 11.5,
  },
  bannerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.xs,
  },
  bannerActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Card Item Rows */
  cardRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardRowInfo: {
    gap: 3,
  },
  cardRowTopic: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  cardRowQuestion: {
    fontSize: 13.5,
    fontWeight: '600',
    lineHeight: 18,
  },
  cardRowAnswer: {
    fontSize: 12,
    lineHeight: 16,
  },

  /* Active Study Container */
  studyContainer: {
    flex: 1,
    padding: 20,
    gap: 16,
    justifyContent: 'space-between',
  },
  studyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studyDeckLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  studyCounter: {
    fontSize: 12,
    fontWeight: '600',
  },
  flashcardBox: {
    flex: 1,
    minHeight: 280,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  cardSideBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sideBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  sideBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  flipHint: {
    fontSize: 11,
  },
  cardMainContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 25,
    textAlign: 'center',
  },
  answerBox: {
    gap: 10,
  },
  answerText: {
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 26,
    textAlign: 'center',
  },
  explanationText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  flagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
  },
  flagBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  studyControls: {
    flexDirection: 'row',
    gap: 12,
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  navBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: Radius.sm,
  },
  navBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
