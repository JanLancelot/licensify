import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  ArrowRight,
  Check,
  Layers,
  Plus,
  X,
} from 'lucide-react-native';
import Svg, {
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { useRouter } from 'expo-router';

import { PRESET_ICONS } from '@/components/flashcards/FlashcardPresetBuilderModal';
import { useAppTheme } from '@/context/theme-context';
import { useLocalFlashcards } from '@/hooks/useLocalData';
import { useFlashcardPresets } from '@/services/flashcardPresetStore';
import { FlashcardPreset } from '@/types/curriculum';

export interface AddQuizFromFlashcardsModalProps {
  visible: boolean;
  onClose: () => void;
  onAddFlashcardToQuiz: (preset: FlashcardPreset) => void;
  onRemoveFlashcardFromQuiz?: (preset: FlashcardPreset) => void;
  existingQuizTitles: Set<string>;
  bottomInset?: number;
}

/* Custom Deck Gradient Icon Component */
function CustomDeckIcon({
  iconName = 'Layers',
  size = 46,
}: {
  iconName?: string;
  size?: number;
}) {
  const iconConfig = PRESET_ICONS.find((i) => i.id === iconName) || PRESET_ICONS[0];
  const IconComp = iconConfig.icon;
  const [startC, endC] = iconConfig.gradient;
  const gradId = `modal_deck_bento_${iconConfig.id}_${size}`;

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

export function AddQuizFromFlashcardsModal({
  visible,
  onClose,
  onAddFlashcardToQuiz,
  onRemoveFlashcardFromQuiz,
  existingQuizTitles,
  bottomInset = 0,
}: AddQuizFromFlashcardsModalProps) {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();

  const { presets: userFlashcards } = useFlashcardPresets();
  const { flashcards: dbFlashcards } = useLocalFlashcards();

  // Combine user flashcard presets + system database flashcards deck
  const allFlashcardPresets = React.useMemo(() => {
    const list = [...userFlashcards];
    if (dbFlashcards.length > 0) {
      const defaultDeck: FlashcardPreset = {
        id: 'preset-core-ale',
        title: 'Core ALE Essential Concepts',
        lessonCount: 6,
        cardCount: dbFlashcards.length,
        isShuffled: true,
        iconName: 'Layers',
        createdAt: 'Auto Generated',
        subjectNames: ['History', 'Utilities', 'Design'],
        cards: dbFlashcards,
      };
      if (!list.some((p) => p.id === 'preset-core-ale')) {
        list.push(defaultDeck);
      }
    }
    return list;
  }, [userFlashcards, dbFlashcards]);

  const handleGoToFlashcards = () => {
    onClose();
    router.push('/(tabs)/learn/flashcards' as any);
  };

  const handleToggleCard = (preset: FlashcardPreset, isAdded: boolean) => {
    if (isAdded) {
      onRemoveFlashcardFromQuiz?.(preset);
    } else {
      onAddFlashcardToQuiz(preset);
    }
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
              paddingBottom: Math.max(bottomInset + 16, 24),
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

          {/* Clean Minimal Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Add to Quiz Sets
            </Text>

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
            contentContainerStyle={styles.modalContent}>
            {allFlashcardPresets.length > 0 ? (
              /* Bento 2-Column Grid */
              <View style={styles.bentoGrid}>
                {allFlashcardPresets.map((preset) => {
                  const isAdded =
                    existingQuizTitles.has(preset.title) ||
                    existingQuizTitles.has(`${preset.title} (Quiz)`);

                  return (
                    <Pressable
                      key={preset.id}
                      onPress={() => handleToggleCard(preset, isAdded)}
                      style={({ pressed }) => [
                        styles.bentoCard,
                        {
                          backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
                          borderColor: isDark
                            ? 'rgba(255, 255, 255, 0.06)'
                            : 'rgba(0, 0, 0, 0.04)',
                          opacity: pressed ? 0.85 : 1,
                          transform: [{ scale: pressed ? 0.97 : 1 }],
                        },
                      ]}>
                      {/* Top Action Icon Button */}
                      <View style={styles.cardTopBadgeRow}>
                        {isAdded ? (
                          <View
                            style={[
                              styles.actionCircle,
                              {
                                backgroundColor: isDark
                                  ? 'rgba(16, 185, 129, 0.2)'
                                  : '#D1FAE5',
                              },
                            ]}>
                            <Check size={13} color="#10B981" strokeWidth={2.8} />
                          </View>
                        ) : (
                          <View
                            style={[
                              styles.actionCircle,
                              {
                                backgroundColor: colors.accent,
                              },
                            ]}>
                            <Plus size={13} color="#FFFFFF" strokeWidth={2.8} />
                          </View>
                        )}
                      </View>

                      {/* Center Deck Icon */}
                      <CustomDeckIcon iconName={preset.iconName} size={46} />

                      {/* Title & Count */}
                      <View style={styles.bentoTextGroup}>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.bentoTitle,
                            { color: isDark ? '#F9FAFB' : '#0F172A' },
                          ]}>
                          {preset.title}
                        </Text>
                        <Text
                          style={[
                            styles.bentoSub,
                            { color: colors.textSecondary },
                          ]}>
                          {preset.cardCount || preset.cards?.length || 0} Cards
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              /* Minimal Empty State */
              <View style={styles.emptyStateBox}>
                <View
                  style={[
                    styles.emptyIconBadge,
                    {
                      backgroundColor: isDark ? '#23262F' : '#F6F0ED',
                    },
                  ]}>
                  <Layers size={26} color={colors.accent} strokeWidth={2} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No Flashcards Found
                </Text>

                <Pressable
                  onPress={handleGoToFlashcards}
                  style={({ pressed }) => [
                    styles.goToFlashcardsBtn,
                    {
                      backgroundColor: colors.accent,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}>
                  <Text style={styles.goToFlashcardsBtnText}>
                    Create Flashcards
                  </Text>
                  <ArrowRight size={15} color="#FFFFFF" strokeWidth={2.4} />
                </Pressable>
              </View>
            )}
          </ScrollView>
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
    maxHeight: '84%',
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
    paddingBottom: 14,
  },
  modalTitle: {
    fontSize: 19,
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bentoCard: {
    width: '48.2%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    position: 'relative',
    minHeight: 136,
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
  cardTopBadgeRow: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
  },
  actionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoTextGroup: {
    alignItems: 'center',
    gap: 2,
    width: '100%',
  },
  bentoTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  bentoSub: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  emptyStateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    gap: 10,
  },
  emptyIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  goToFlashcardsBtn: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  goToFlashcardsBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
