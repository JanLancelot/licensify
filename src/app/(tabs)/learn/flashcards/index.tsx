import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  Box,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Hammer,
  Layers,
  Play,
  Plus,
  Scale,
  Shuffle,
  Sparkles,
  Star,
  Trash2,
  X
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// ── Rotating Chevron Animation ─────────────────────────────────────────────
function RotatingChevron({
  isOpen,
  color,
  size = 18,
}: {
  isOpen: boolean;
  color: string;
  size?: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: withTiming(isOpen ? '90deg' : '0deg', {
            duration: 220,
          }),
        },
      ],
    };
  }, [isOpen]);

  return (
    <Animated.View style={animatedStyle}>
      <ChevronRight size={size} color={color} strokeWidth={2.2} />
    </Animated.View>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────
export interface FlashcardItem {
  id: string;
  subjectTitle: string;
  topicTitle: string;
  lessonTitle: string;
  question: string;
  answer: string;
  explanation: string;
  isDifficult: boolean;
  isFavorite: boolean;
}

export interface FlashcardPreset {
  id: string;
  title: string;
  lessonCount: number;
  cardCount: number;
  isShuffled: boolean;
  isRandomized: boolean;
  createdAt: string;
  subjectNames: string[];
  cards: FlashcardItem[];
}

interface Lesson {
  id: string;
  lessonNumber: number;
  title: string;
  duration: string;
  summary: string;
  keyPoints: string[];
}

interface Topic {
  id: string;
  topicNumber: number;
  title: string;
  lessons: Lesson[];
}

interface SubjectNote {
  id: string;
  subjectNumber: number;
  title: string;
  area: string;
  weight: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  topics: Topic[];
}

// ── Comprehensive Notes Curriculum Data ─────────────────────────────────────
const SUBJECT_NOTES: SubjectNote[] = [
  {
    id: 's1',
    subjectNumber: 1,
    title: 'History & Theory of Architecture',
    area: 'Area 1',
    weight: '30% Weight',
    icon: Building2,
    topics: [
      {
        id: 's1-t1',
        topicNumber: 1,
        title: 'Ancient & Classical Antiquity',
        lessons: [
          {
            id: 's1-t1-l1',
            lessonNumber: 1,
            title: 'Greek Classical Orders (Doric, Ionic, Corinthian)',
            duration: '8 min read',
            summary: 'Proportions, entablature components, column capital characteristics, and optical corrections (entasis) in Greek temple architecture.',
            keyPoints: [
              'Doric Order: Simplest and earliest order. No separate base in Greek Doric; fluted shaft rests directly on stylobate; triglyphs and metopes in frieze.',
              'Ionic Order: Characterized by spiral volutes on capitals, molded base, and continuous decorative frieze.',
              'Corinthian Order: Most ornate classical order, adorned with two rows of acanthus leaves and four corner volutes.',
              'Entasis: Slight convex curving of the column shaft to correct the optical illusion of concavity at a distance.',
            ],
          },
          {
            id: 's1-t1-l2',
            lessonNumber: 2,
            title: 'Roman Monuments, Vaulting & Concrete Systems',
            duration: '10 min read',
            summary: 'Roman structural engineering breakthroughs using pozzolanic concrete (opus caementicium), barrel vaults, cross vaults, and domes.',
            keyPoints: [
              'Opus Caementicium: Roman concrete composed of lime, volcanic pozzolana ash, and aggregate.',
              'Pantheon: Unreinforced concrete dome spanning 43.3m with central open oculus (8.8m diameter) and stepped exterior rings.',
              'Roman Orders: Addition of Tuscan (unfluted simplified Doric) and Composite (Ionic volutes over Corinthian acanthus).',
              'Monumental Types: Colosseum (Amphitheater), Thermae (Baths of Caracalla), Basilica (law courts), and Aqueducts.',
            ],
          },
          {
            id: 's1-t1-l3',
            lessonNumber: 3,
            title: 'Egyptian Temples, Pylons & Hypostyle Halls',
            duration: '7 min read',
            summary: 'Monumental stone architecture of the Old, Middle, and New Kingdoms along the Nile River.',
            keyPoints: [
              'Pylon: Massive trapezoidal entrance gateway with battered (sloping) walls representing the horizon (akhet).',
              'Hypostyle Hall: Forest of columns supporting stone roof slabs with higher central clerestory lighting (e.g. Karnak).',
              'Mastaba: Flat-roofed rectangular tomb structure with sloping sides, precursor to the stepped pyramid of Djoser by Imhotep.',
              'Lotus & Papyrus Capitals: Stylized plant forms symbolizing Upper and Lower Egypt.',
            ],
          },
        ],
      },
      {
        id: 's1-t2',
        topicNumber: 2,
        title: 'Medieval, Renaissance & Baroque',
        lessons: [
          {
            id: 's1-t2-l1',
            lessonNumber: 1,
            title: 'Early Christian & Byzantine Basilicas',
            duration: '9 min read',
            summary: 'Transition of Roman basilicas into Christian houses of worship and Byzantine domical mastery.',
            keyPoints: [
              'Hagia Sophia: 31-meter dome supported on spherical triangular pendentives by Isidore of Miletus & Anthemius of Tralles.',
              'Pendentive: Triangular curved masonry segment allowing a circular dome to rest securely over a square base.',
              'Early Christian Plan: Atrium → Narthex → Nave with Aisles → Transept → Apse.',
            ],
          },
          {
            id: 's1-t2-l2',
            lessonNumber: 2,
            title: 'High Gothic Cathedrals & Flying Buttresses',
            duration: '11 min read',
            summary: 'The quest for height and light through skeletal stone engineering in 12th-14th century Europe.',
            keyPoints: [
              'Three Core Gothic Inventions: Pointed Arches, Ribbed Groin Vaults, and Exterior Flying Buttresses.',
              'Flying Buttress: Masonry arch transmitting lateral roof thrust away from walls to exterior piers, enabling vast stained-glass clerestories.',
              'Abbot Suger: Pioneered Gothic architecture with the choir of the Basilica of Saint-Denis (1144).',
            ],
          },
          {
            id: 's1-t2-l3',
            lessonNumber: 3,
            title: 'Italian Renaissance Humanism & Brunelleschi',
            duration: '10 min read',
            summary: 'Revival of classical proportions, symmetry, geometry, and humanistic scale in 15th century Florence.',
            keyPoints: [
              'Filippo Brunelleschi: Florence Cathedral dome (Santa Maria del Fiore) built without wooden centering using herringbone brickwork.',
              'Leon Battista Alberti: Author of "De Re Aedificatoria" (Ten Books on Architecture); designer of Palazzo Rucellai.',
              'Andrea Palladio: Master of villas; author of "I Quattro Libri dell\'Architettura" (Four Books of Architecture).',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 's2',
    subjectNumber: 2,
    title: 'Architectural Design & Space Planning',
    area: 'Area 3',
    weight: '40% Weight',
    icon: Compass,
    topics: [
      {
        id: 's2-t1',
        topicNumber: 1,
        title: 'Space Programming & Functional Matrices',
        lessons: [
          {
            id: 's2-t1-l1',
            lessonNumber: 1,
            title: 'Adjacency Matrices & Bubble Diagramming',
            duration: '7 min read',
            summary: 'Methods for spatial relationship modeling, privacy zoning, and traffic flow optimization.',
            keyPoints: [
              'Adjacency Matrix: Tabular chart scoring the interaction level between spaces (Direct, Indirect, Undesirable).',
              'Zoning Hierarchy: Public → Semi-Public → Private → Service Zones.',
              'Corridor Clearance: Minimum 1.0m for residential circulation; 1.2m to 2.0m for primary commercial egress.',
            ],
          },
          {
            id: 's2-t1-l2',
            lessonNumber: 2,
            title: 'Anthropometrics & Ergonomic Clearances',
            duration: '8 min read',
            summary: 'Human dimensional data applied to architectural clear dimensions, countertop heights, and reach zones.',
            keyPoints: [
              'Kitchen Counter Height: Standard 0.85m to 0.90m height with 0.60m depth.',
              'Dining Clearance: Minimum 0.90m from table edge to wall for chair movement and service pass.',
              'Stair Ergonomics (Blondel Formula): 2R + T = 600 to 650 mm (Riser max 200mm, Tread min 250mm).',
            ],
          },
        ],
      },
      {
        id: 's2-t2',
        topicNumber: 2,
        title: 'Site Analysis & Climate-Responsive Design',
        lessons: [
          {
            id: 's2-t2-l1',
            lessonNumber: 1,
            title: 'Sun Path & Wind Orientation (Amihan / Habagat)',
            duration: '9 min read',
            summary: 'Passive solar orientation, prevailing monsoons, and natural ventilation in tropical architecture.',
            keyPoints: [
              'Amihan (Northeast Monsoon): Cool, dry winds prevailing from October to February.',
              'Habagat (Southwest Monsoon): Warm, humid rain-bearing winds from June to September.',
              'Solar Orientation: Place longer building axis East-West to minimize heat gain on North-South facades.',
              'Stack Effect: Low air inlets on windward side with high warm-air exhaust outlets on leeward side.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 's3',
    subjectNumber: 3,
    title: 'Building Technology & Materials',
    area: 'Area 2',
    weight: '30% Weight',
    icon: Hammer,
    topics: [
      {
        id: 's3-t1',
        topicNumber: 1,
        title: 'Concrete Mix Ratios & Quality Testing',
        lessons: [
          {
            id: 's3-t1-l1',
            lessonNumber: 1,
            title: 'Concrete Mix Classes (AA, A, B, C) & Applications',
            duration: '8 min read',
            summary: 'Proportioning cement, sand, and gravel for specified compressive strengths.',
            keyPoints: [
              'Class AA (1:1.5:3): 4,000 psi compressive strength; underwater and high-strength retaining walls.',
              'Class A (1:2:4): 3,000 psi; reinforced columns, beams, girders, and suspended slabs.',
              'Class B (1:2.5:5): 2,500 psi; non-load bearing walls, lintels, and ground floor slabs.',
              'Class C (1:3:6): 2,000 psi; plant boxes, mass plain concrete, and footing beds.',
              'Curing Duration: Standard 28-day hydration period for full design strength.',
            ],
          },
          {
            id: 's3-t1-l2',
            lessonNumber: 2,
            title: 'Slump Testing & Workability Standards',
            duration: '6 min read',
            summary: 'ASTM standard slump cone test procedures for measuring workability and consistency of fresh concrete.',
            keyPoints: [
              'Slump Cone Dimensions: 300mm height, 200mm base diameter, 100mm top diameter.',
              'Standard Slumps: Slabs and beams (75mm - 125mm); Footings and heavy mass concrete (50mm - 100mm).',
            ],
          },
        ],
      },
      {
        id: 's3-t2',
        topicNumber: 2,
        title: 'Masonry & Concrete Hollow Blocks',
        lessons: [
          {
            id: 's3-t2-l1',
            lessonNumber: 1,
            title: 'CHB Sizes, Mortar Fills & Rebar Spacing',
            duration: '7 min read',
            summary: 'Standard Philippine masonry specifications, mortar fills, and reinforcing rebar layouts.',
            keyPoints: [
              'Standard CHB Sizes: 100mm (4") for interior non-load bearing; 150mm (6") for exterior perimeter walls.',
              'Rebar Reinforcement: Typically 10mm or 12mm bars spaced at 600mm horizontal and 600mm vertical.',
              'Mortar Mix: 1:3 cement-to-sand ratio for structural block jointing.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 's4',
    subjectNumber: 4,
    title: 'Structural Conceptualization & Theory',
    area: 'Area 2',
    weight: '30% Weight',
    icon: Box,
    topics: [
      {
        id: 's4-t1',
        topicNumber: 1,
        title: 'Lateral Load Resisting Systems & Trusses',
        lessons: [
          {
            id: 's4-t1-l1',
            lessonNumber: 1,
            title: 'Shear Walls, Moment Frames & Core Bracing',
            duration: '9 min read',
            summary: 'Seismic and wind force distribution mechanisms across multi-story structural configurations.',
            keyPoints: [
              'Shear Wall: Reinforced concrete wall designed to resist in-plane lateral shear and overturning moments.',
              'Special Moment Resisting Frame (SMRF): Ductile beam-column joints providing energy dissipation during earthquakes.',
              'Center of Mass vs Center of Rigidity: Minimizing eccentricity prevents catastrophic torsional twisting.',
            ],
          },
          {
            id: 's4-t1-l2',
            lessonNumber: 2,
            title: 'Pratt, Howe & Warren Roof Trusses',
            duration: '8 min read',
            summary: 'Internal stresses and diagonal/vertical web member behaviors in steel and timber trusses.',
            keyPoints: [
              'Pratt Truss: Diagonals are in tension under gravity loads, verticals in compression.',
              'Howe Truss: Diagonals are in compression under gravity loads, verticals in tension.',
              'Warren Truss: Equilateral/isosceles triangles where diagonals alternate between tension and compression.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 's5',
    subjectNumber: 5,
    title: 'Building Laws & Professional Practice (RA 9266 & NBCP)',
    area: 'Area 3',
    weight: '40% Weight',
    icon: Scale,
    topics: [
      {
        id: 's5-t1',
        topicNumber: 1,
        title: 'RA 9266 (The Architecture Act of 2004)',
        lessons: [
          {
            id: 's5-t1-l1',
            lessonNumber: 1,
            title: 'Mandatory Signing & Sealing of Architectural Documents',
            duration: '10 min read',
            summary: 'Statutory provisions governing exclusive licensure, registration, and criminal liabilities for illegal practice.',
            keyPoints: [
              'Section 20: Exclusively Registered and Licensed Architects (RLAs) may sign and seal architectural plans.',
              'CPD Requirement: 15 Credit Units per 3-year compliance period required for triennial PIC license renewal.',
              'SPP Documents: Standards of Professional Practice (SPP 200 to 208) governing scopes and compensation.',
            ],
          },
        ],
      },
      {
        id: 's5-t2',
        topicNumber: 2,
        title: 'PD 1096 (National Building Code of the Philippines)',
        lessons: [
          {
            id: 's5-t2-l1',
            lessonNumber: 1,
            title: 'Rule 7 & 8: AMBF, TOSL, USA, ISA & Setbacks',
            duration: '12 min read',
            summary: 'Zoning calculations, open space ratios, setbacks, and allowable maximum building footprint computations.',
            keyPoints: [
              'TOSL Formula: TOSL = ISA (Impervious Surface Area) + USA (Unpaved Surface Area).',
              'AMBF (Allowable Maximum Building Footprint): Total Lot Area (TLA) minus Total Open Space on Lot (TOSL).',
              'Minimum Ceiling Height: 2.70 meters for habitable rooms with natural ventilation.',
              'Egress Door Clear Width (Fire Code RA 9514): Minimum 915 mm (36 inches) clear width.',
            ],
          },
        ],
      },
    ],
  },
];

// Helper: Convert selected lessons into flashcard questions
function generateCardsFromLessons(
  selectedLessonIds: Set<string>,
  isRandomized: boolean,
  isShuffled: boolean
): FlashcardItem[] {
  const generated: FlashcardItem[] = [];

  SUBJECT_NOTES.forEach((subject) => {
    subject.topics.forEach((topic) => {
      topic.lessons.forEach((lesson) => {
        if (selectedLessonIds.has(lesson.id)) {
          lesson.keyPoints.forEach((point, pIdx) => {
            const colonIndex = point.indexOf(':');
            let term = '';
            let explanation = '';

            if (colonIndex !== -1) {
              term = point.substring(0, colonIndex).trim();
              explanation = point.substring(colonIndex + 1).trim();
            } else {
              term = `${lesson.title} Concept #${pIdx + 1}`;
              explanation = point.trim();
            }

            generated.push({
              id: `fc-${lesson.id}-${pIdx}-${Date.now()}`,
              subjectTitle: subject.title,
              topicTitle: topic.title,
              lessonTitle: lesson.title,
              question: `What are the key provisions and characteristics of "${term}" in ${lesson.title}?`,
              answer: term,
              explanation,
              isDifficult: false,
              isFavorite: false,
            });
          });
        }
      });
    });
  });

  let result = [...generated];
  if (isRandomized) {
    result = result.sort(() => Math.random() - 0.5);
  }
  if (isShuffled) {
    result = result.sort(() => Math.random() - 0.5);
  }

  return result;
}

// ── Preset Builder Topic Item Component ─────────────────────────────────────
function PresetTopicItem({
  topic,
  tIdx,
  isLastTopic,
  selectedLessonIds,
  expandedTopics,
  toggleTopic,
  toggleTopicSelection,
  toggleLessonSelection,
  lastSelectedTopicIndex,
  theme,
}: {
  topic: Topic;
  tIdx: number;
  isLastTopic: boolean;
  selectedLessonIds: Set<string>;
  expandedTopics: Record<string, boolean>;
  toggleTopic: (id: string) => void;
  toggleTopicSelection: (topic: Topic) => void;
  toggleLessonSelection: (lessonId: string) => void;
  lastSelectedTopicIndex: number;
  theme: any;
}) {
  const [headerHeight, setHeaderHeight] = useState(48);
  const center = Math.round(headerHeight / 2);

  const isTopicOpen = !!expandedTopics[topic.id];
  const topicLessonIds = topic.lessons.map((l) => l.id);
  const selectedInTopicCount = topicLessonIds.filter((id) =>
    selectedLessonIds.has(id)
  ).length;
  const isAllTopicSelected =
    topicLessonIds.length > 0 &&
    selectedInTopicCount === topicLessonIds.length;
  const isSomeTopicSelected =
    selectedInTopicCount > 0 && !isAllTopicSelected;
  const hasTopicSelected = selectedInTopicCount > 0;

  const isVerticalTopHighlighted =
    lastSelectedTopicIndex >= 0 &&
    tIdx <= lastSelectedTopicIndex;
  const isVerticalBottomHighlighted =
    lastSelectedTopicIndex >= 0 &&
    tIdx < lastSelectedTopicIndex;

  const lastSelectedLessonIndex = topic.lessons.reduce(
    (lastIdx, l, idx) =>
      selectedLessonIds.has(l.id) ? idx : lastIdx,
    -1
  );

  return (
    <View key={topic.id} style={styles.topicItemWrapper}>
      <View style={styles.treeBranchNode}>
        <View
          style={[
            styles.treeBranchTop,
            {
              height: center,
              backgroundColor: isVerticalTopHighlighted
                ? theme.accent
                : theme.border,
            },
          ]}
        />
        {!isLastTopic && (
          <View
            style={[
              styles.treeBranchBottom,
              {
                top: center,
                backgroundColor: isVerticalBottomHighlighted
                  ? theme.accent
                  : theme.border,
              },
            ]}
          />
        )}
        <View
          style={[
            styles.treeBranchHoriz,
            {
              top: center - 1,
              backgroundColor: hasTopicSelected
                ? theme.accent
                : theme.border,
            },
          ]}
        />
      </View>

      <View style={styles.topicMainColumn}>
        {/* Topic Header Row */}
        <View
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h > 0 && Math.abs(h - headerHeight) > 1) {
              setHeaderHeight(h);
            }
          }}
          style={[
            styles.topicHeader,
            {
              backgroundColor: hasTopicSelected
                ? theme.accentMuted
                : theme.backgroundSelected,
              borderColor: hasTopicSelected
                ? theme.accent
                : theme.border,
              borderWidth: hasTopicSelected ? 1.5 : 1,
            },
          ]}>
          <Pressable
            onPress={() => toggleTopic(topic.id)}
            style={styles.topicHeaderLeft}>
            <Text
              style={[
                styles.topicTitle,
                { color: theme.text },
              ]}>
              {topic.title}
            </Text>
            <Text
              style={[
                styles.topicSubtext,
                {
                  color: hasTopicSelected
                    ? theme.accent
                    : theme.textSecondary,
                  fontWeight: hasTopicSelected ? '700' : '400',
                },
              ]}>
              {hasTopicSelected
                ? `${selectedInTopicCount}/${topic.lessons.length} Selected`
                : `${topic.lessons.length} Lessons`}
            </Text>
          </Pressable>

          {/* + Add Topic Button */}
          <Pressable
            onPress={() => toggleTopicSelection(topic)}
            style={({ pressed }) => [
              styles.addSmallBtn,
              {
                backgroundColor: isAllTopicSelected
                  ? theme.accent
                  : isSomeTopicSelected
                  ? theme.accentMuted
                  : theme.backgroundElement,
                borderColor: isAllTopicSelected || isSomeTopicSelected
                  ? theme.accent
                  : theme.border,
                opacity: pressed ? 0.75 : 1,
              },
            ]}>
            {isAllTopicSelected ? (
              <Check size={12} color="#FFFFFF" strokeWidth={3} />
            ) : (
              <Plus
                size={12}
                color={isSomeTopicSelected ? theme.accent : theme.text}
                strokeWidth={2.5}
              />
            )}
          </Pressable>

          <Pressable
            onPress={() => toggleTopic(topic.id)}
            style={styles.chevronPressableSmall}>
            <RotatingChevron
              isOpen={isTopicOpen}
              color={hasTopicSelected ? theme.accent : theme.textSecondary}
              size={15}
            />
          </Pressable>
        </View>

        {/* Lesson Level Accordion */}
        {isTopicOpen && (
          <Animated.View
            entering={FadeInDown.duration(180)}
            exiting={FadeOutUp.duration(150)}
            layout={LinearTransition.duration(180)}
            style={styles.lessonsContainer}>
            {topic.lessons.map((lesson, lIdx) => {
              const isLessonSelected = selectedLessonIds.has(
                lesson.id
              );
              const isLastLesson =
                lIdx === topic.lessons.length - 1;
              const isLessonTopHighlighted =
                lastSelectedLessonIndex >= 0 &&
                lIdx <= lastSelectedLessonIndex;
              const isLessonBottomHighlighted =
                lastSelectedLessonIndex >= 0 &&
                lIdx < lastSelectedLessonIndex;

              return (
                <View
                  key={lesson.id}
                  style={styles.lessonRowWrapper}>
                  {/* Tree Branch Node for Lesson */}
                  <View style={styles.lessonBranchNode}>
                    <View
                      style={[
                        styles.lessonBranchTop,
                        {
                          backgroundColor: isLessonTopHighlighted
                            ? theme.accent
                            : theme.border,
                        },
                      ]}
                    />
                    {!isLastLesson && (
                      <View
                        style={[
                          styles.lessonBranchBottom,
                          {
                            backgroundColor: isLessonBottomHighlighted
                              ? theme.accent
                              : theme.border,
                          },
                        ]}
                      />
                    )}
                    <View
                      style={[
                        styles.lessonBranchHoriz,
                        {
                          backgroundColor: isLessonSelected
                            ? theme.accent
                            : theme.border,
                        },
                      ]}
                    />
                  </View>

                  <Pressable
                    onPress={() =>
                      toggleLessonSelection(lesson.id)
                    }
                    style={({ pressed }) => [
                      styles.lessonRow,
                      {
                        backgroundColor: isLessonSelected
                          ? theme.accentMuted
                          : theme.backgroundElement,
                        borderColor: isLessonSelected
                          ? theme.accent
                          : theme.border,
                        borderWidth: isLessonSelected ? 1.5 : 1,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}>
                    <View style={styles.lessonRowLeft}>
                      <View
                        style={[
                          styles.lessonNumCircle,
                          {
                            backgroundColor: isLessonSelected
                              ? theme.accent
                              : theme.backgroundSelected,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.lessonNumText,
                            {
                              color: isLessonSelected
                                ? '#FFFFFF'
                                : theme.accent,
                            },
                          ]}>
                          {lesson.lessonNumber}
                        </Text>
                      </View>
                      <View style={styles.lessonTextCol}>
                        <Text
                          style={[
                            styles.lessonTitle,
                            { color: theme.text },
                          ]}>
                          {lesson.title}
                        </Text>
                      </View>
                    </View>

                    {/* + Add Lesson Button */}
                    <View
                      style={[
                        styles.addSmallBtn,
                        {
                          backgroundColor: isLessonSelected
                            ? theme.accent
                            : theme.backgroundSelected,
                          borderColor: isLessonSelected
                            ? theme.accent
                            : theme.border,
                        },
                      ]}>
                      {isLessonSelected ? (
                        <Check
                          size={12}
                          color="#FFFFFF"
                          strokeWidth={3}
                        />
                      ) : (
                        <Plus
                          size={12}
                          color={theme.text}
                          strokeWidth={2.5}
                        />
                      )}
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </Animated.View>
        )}
      </View>
    </View>
  );
}

export default function FlashcardsHubScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // User-created Flashcard Presets (Empty initially as requested)
  const [presets, setPresets] = useState<FlashcardPreset[]>([]);

  // Active Session State
  const [activePreset, setActivePreset] = useState<FlashcardPreset | null>(null);
  const [activeCards, setActiveCards] = useState<FlashcardItem[]>([]);
  const [studyIndex, setStudyIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Bottom Sheet Modal for Preset Creation
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [selectedLessonIds, setSelectedLessonIds] = useState<Set<string>>(new Set());
  const [isShuffled, setIsShuffled] = useState(true);
  const [isRandomized, setIsRandomized] = useState(false);
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
      return {
        ...prev,
        [subjectId]: !isCurrentlyOpen,
      };
    });
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  // ── Selection Toggles ────────────────────────────────────────────────────
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

  const toggleTopicSelection = (topic: Topic) => {
    const topicLessonIds = topic.lessons.map((l) => l.id);
    const allSelected = topicLessonIds.every((id) => selectedLessonIds.has(id));

    setSelectedLessonIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        topicLessonIds.forEach((id) => next.delete(id));
      } else {
        topicLessonIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleSubjectSelection = (subject: SubjectNote) => {
    const subjectLessonIds = subject.topics.flatMap((t) => t.lessons.map((l) => l.id));
    const allSelected = subjectLessonIds.every((id) => selectedLessonIds.has(id));

    setSelectedLessonIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        subjectLessonIds.forEach((id) => next.delete(id));
      } else {
        subjectLessonIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleCloseAddModal = () => {
    const hasOpenDropdowns =
      Object.values(expandedSubjects).some(Boolean) ||
      Object.values(expandedTopics).some(Boolean);

    if (hasOpenDropdowns) {
      // 1. Collapse open dropdowns inside modal first
      setExpandedSubjects({});
      setExpandedTopics({});
      // 2. Slide down modal right after the collapse finishes
      setTimeout(() => {
        setIsAddModalVisible(false);
      }, 180);
    } else {
      setIsAddModalVisible(false);
    }
  };

  const handleOpenAddModal = () => {
    // Reset selections and dropdowns when opening freshly
    setSelectedLessonIds(new Set());
    setExpandedSubjects({});
    setExpandedTopics({});
    setCustomTitle('');
    setIsShuffled(true);
    setIsRandomized(false);
    setIsAddModalVisible(true);
  };

  const handleCreatePreset = () => {
    if (selectedLessonIds.size === 0) {
      Alert.alert(
        'No Lessons Selected',
        'Please tap the "+" button on at least one lesson or topic from the notes curriculum to generate flashcards.'
      );
      return;
    }

    const generatedCards = generateCardsFromLessons(
      selectedLessonIds,
      isRandomized,
      isShuffled
    );

    // Identify selected subjects and lessons
    const selectedSubjectsSet = new Set<string>();
    let primaryLessonTitle = '';

    SUBJECT_NOTES.forEach((s) => {
      s.topics.forEach((t) => {
        t.lessons.forEach((l) => {
          if (selectedLessonIds.has(l.id)) {
            selectedSubjectsSet.add(s.title);
            if (!primaryLessonTitle) {
              primaryLessonTitle = l.title;
            }
          }
        });
      });
    });

    const defaultTitle =
      selectedLessonIds.size === 1
        ? primaryLessonTitle
        : `${Array.from(selectedSubjectsSet)[0] || 'Curriculum'} Preset (${selectedLessonIds.size} Lessons)`;

    const newPreset: FlashcardPreset = {
      id: `preset-${Date.now()}`,
      title: customTitle.trim() || defaultTitle,
      lessonCount: selectedLessonIds.size,
      cardCount: generatedCards.length,
      isShuffled,
      isRandomized,
      createdAt: 'Just now',
      subjectNames: Array.from(selectedSubjectsSet),
      cards: generatedCards,
    };

    setPresets((prev) => [newPreset, ...prev]);
    handleCloseAddModal();
  };

  // ── Drill Session Handlers ───────────────────────────────────────────────
  const startPresetDrill = (preset: FlashcardPreset) => {
    let drillCards = [...preset.cards];
    if (preset.isShuffled) {
      drillCards = [...drillCards].sort(() => Math.random() - 0.5);
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

  const toggleDifficult = (id: string) => {
    setActiveCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isDifficult: !c.isDifficult } : c))
    );
  };

  const toggleFavorite = (id: string) => {
    setActiveCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    );
  };

  const currentStudyCard = activeCards[studyIndex];

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* ── Stationary Top Header ────────────────────────────────────────── */}
      <View
        style={[
          styles.topBar,
          { borderBottomColor: theme.border, backgroundColor: theme.background },
        ]}>
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
            {
              opacity: pressed ? 0.5 : 1,
            },
          ]}>
          <ArrowLeft size={20} color={theme.text} strokeWidth={2.2} />
        </Pressable>

        <View style={styles.topBarTitles}>
          <Text style={[styles.topBarHeading, { color: theme.text }]}>
            {activePreset ? activePreset.title : 'Flashcards'}
          </Text>
        </View>
      </View>

      {/* ── Active Flashcard Drill View ──────────────────────────────────── */}
      {activePreset && currentStudyCard ? (
        <View style={styles.studyContainer}>
          <View style={styles.studyHeader}>
            <View style={styles.studyHeaderLeft}>
              <Text style={[styles.studyDeckLabel, { color: theme.accent }]}>
                {currentStudyCard.subjectTitle}
              </Text>
              <Text style={[styles.studyTopicLabel, { color: theme.textSecondary }]}>
                {currentStudyCard.lessonTitle}
              </Text>
            </View>
            <View
              style={[
                styles.studyCounterBadge,
                { backgroundColor: theme.backgroundSelected, borderColor: theme.border },
              ]}>
              <Text style={[styles.studyCounter, { color: theme.text }]}>
                {studyIndex + 1} / {activeCards.length}
              </Text>
            </View>
          </View>

          {/* Flashcard Flip Box */}
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
              <Text style={[styles.flipHint, { color: theme.textSecondary }]}>
                Tap to flip card
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
                if (studyIndex < activeCards.length - 1) {
                  setStudyIndex(studyIndex + 1);
                  setIsFlipped(false);
                } else {
                  setActivePreset(null);
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
                {studyIndex < activeCards.length - 1
                  ? 'Next Card'
                  : 'Finish Drill'}
              </Text>
              <ChevronRight size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      ) : (
        /* ── Main Flashcard List / Empty State ────────────────────────────── */
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 80 },
          ]}>
          {presets.length === 0 ? (
            /* Clean Empty State */
            <View style={styles.emptyStateContainer}>
              <View
                style={[
                  styles.emptyStateIconBox,
                  { backgroundColor: theme.accentMuted },
                ]}>
                <Layers size={36} color={theme.accent} strokeWidth={1.8} />
              </View>

              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                No Flashcards Yet
              </Text>
              <Text style={[styles.emptyStateSubtitle, { color: theme.textSecondary }]}>
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
                <View
                  key={preset.id}
                  style={[
                    styles.presetCard,
                    {
                      backgroundColor: theme.backgroundElement,
                      borderColor: theme.border,
                    },
                  ]}>
                  {/* Top Badges & Delete */}
                  <View style={styles.presetCardTop}>
                    <View style={styles.presetBadgesRow}>
                      <View
                        style={[
                          styles.presetPill,
                          {
                            backgroundColor: theme.accentMuted,
                            borderColor: theme.border,
                          },
                        ]}>
                        <Text style={[styles.presetPillText, { color: theme.accent }]}>
                          {preset.cardCount} Cards
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.presetPill,
                          {
                            backgroundColor: theme.backgroundSelected,
                            borderColor: theme.border,
                          },
                        ]}>
                        <Text style={[styles.presetPillText, { color: theme.textSecondary }]}>
                          {preset.lessonCount} Lessons
                        </Text>
                      </View>

                      {preset.isShuffled && (
                        <View
                          style={[
                            styles.presetPill,
                            {
                              backgroundColor: theme.backgroundSelected,
                              borderColor: theme.border,
                            },
                          ]}>
                          <Shuffle size={10} color={theme.textSecondary} />
                          <Text style={[styles.presetPillText, { color: theme.textSecondary }]}>
                            Shuffled
                          </Text>
                        </View>
                      )}

                      {preset.isRandomized && (
                        <View
                          style={[
                            styles.presetPill,
                            {
                              backgroundColor: theme.backgroundSelected,
                              borderColor: theme.border,
                            },
                          ]}>
                          <Sparkles size={10} color={theme.textSecondary} />
                          <Text style={[styles.presetPillText, { color: theme.textSecondary }]}>
                            Random
                          </Text>
                        </View>
                      )}
                    </View>

                    <Pressable
                      onPress={() => handleDeletePreset(preset.id)}
                      hitSlop={8}
                      style={({ pressed }) => [
                        styles.deleteBtn,
                        { opacity: pressed ? 0.6 : 1 },
                      ]}>
                      <Trash2 size={15} color={theme.textSecondary} />
                    </Pressable>
                  </View>

                  {/* Preset Title & Scope */}
                  <View style={styles.presetCardBody}>
                    <Text style={[styles.presetCardTitle, { color: theme.text }]}>
                      {preset.title}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.presetCardScope, { color: theme.textSecondary }]}>
                      {preset.subjectNames.join(' • ')}
                    </Text>
                  </View>

                  {/* Footer & Start Drill Button */}
                  <View style={[styles.presetCardFooter, { borderTopColor: theme.border }]}>
                    <Text style={[styles.presetCardDate, { color: theme.textSecondary }]}>
                      {preset.createdAt}
                    </Text>

                    <Pressable
                      onPress={() => startPresetDrill(preset)}
                      style={({ pressed }) => [
                        styles.startDrillBtn,
                        {
                          backgroundColor: theme.accent,
                          opacity: pressed ? 0.85 : 1,
                        },
                      ]}>
                      <Play size={12} color="#FFFFFF" fill="#FFFFFF" />
                      <Text style={styles.startDrillBtnText}>Start Flashcards</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* ── Add Preset Bottom Sheet Modal (Comprehensive Notes List) ──────── */}
      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseAddModal}>
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalDismissArea}
            onPress={handleCloseAddModal}
          />

          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
                paddingBottom: Math.max(insets.bottom + 12, 20),
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

              <Pressable
                onPress={handleCloseAddModal}
                style={styles.modalCloseBtn}>
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
                                : `${subject.area} • ${subject.topics.length} Topics • ${subjectLessonIds.length} Lessons`}
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
                onPress={handleCreatePreset}
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
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    padding: 6,
    marginLeft: -6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitles: {
    flex: 1,
  },
  topBarHeading: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  topAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.xs,
  },
  topAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Empty State */
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
    gap: 14,
  },
  emptyStateIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  emptyStateSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  emptyStateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: Radius.sm,
    marginTop: 8,
  },
  emptyStateBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },

  /* Preset Card List */
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
    fontWeight: '700',
  },
  listAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.xs,
  },
  listAddBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  presetCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  presetCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  presetBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  presetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  presetPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 4,
  },
  presetCardBody: {
    gap: 4,
  },
  presetCardTitle: {
    fontSize: 15.5,
    fontWeight: '700',
  },
  presetCardScope: {
    fontSize: 12,
  },
  presetCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  presetCardDate: {
    fontSize: 11,
  },
  startDrillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.xs,
  },
  startDrillBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Active Study Drill */
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
  studyHeaderLeft: {
    gap: 2,
    flex: 1,
  },
  studyDeckLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  studyTopicLabel: {
    fontSize: 11.5,
  },
  studyCounterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  studyCounter: {
    fontSize: 12,
    fontWeight: '700',
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
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'center',
  },
  answerBox: {
    gap: 10,
  },
  answerText: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 25,
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

  /* Preset Creator Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    maxHeight: '90%',
  },
  modalHandleBar: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
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
    fontSize: 18,
    fontWeight: '800',
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalNotesContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  notesList: {
    gap: 12,
  },

  /* Subject Card */
  subjectCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  subjectHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  subjectHeaderLeftArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circleLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    borderWidth: 1,
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

  /* Topic Accordion */
  topicItemWrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  treeBranchNode: {
    width: 18,
    alignSelf: 'stretch',
    position: 'relative',
    marginRight: 4,
  },
  treeBranchTop: {
    position: 'absolute',
    left: 8,
    top: 0,
    width: 2,
  },
  treeBranchBottom: {
    position: 'absolute',
    left: 8,
    bottom: 0,
    width: 2,
  },
  treeBranchHoriz: {
    position: 'absolute',
    left: 8,
    width: 10,
    height: 2,
  },
  topicMainColumn: {
    flex: 1,
    gap: 6,
    marginBottom: 10,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: Radius.xs,
    borderWidth: 1,
    gap: 8,
  },
  topicHeaderLeft: {
    flex: 1,
    gap: 1,
  },
  topicTitle: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  topicSubtext: {
    fontSize: 10.5,
  },
  addSmallBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  chevronPressableSmall: {
    padding: 2,
  },
  lessonsContainer: {
    paddingLeft: 4,
    paddingTop: 4,
    gap: 0,
  },
  lessonRowWrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 6,
  },
  lessonBranchNode: {
    width: 16,
    alignSelf: 'stretch',
    position: 'relative',
    marginRight: 6,
  },
  lessonBranchTop: {
    position: 'absolute',
    left: 7,
    top: 0,
    height: '50%',
    width: 2,
  },
  lessonBranchBottom: {
    position: 'absolute',
    left: 7,
    top: '50%',
    bottom: -6,
    width: 2,
  },
  lessonBranchHoriz: {
    position: 'absolute',
    left: 7,
    top: '50%',
    marginTop: -1,
    width: 9,
    height: 2,
  },
  lessonRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: Radius.xs,
    borderWidth: 1,
    gap: 8,
  },
  lessonRowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lessonNumCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonNumText: {
    fontSize: 10,
    fontWeight: '700',
  },
  lessonTextCol: {
    flex: 1,
    gap: 1,
  },
  lessonTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  lessonMeta: {
    fontSize: 10.5,
  },

  /* Bottom Controls Panel in Modal */
  modalBottomPanel: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectionCountBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  selectionCountNumber: {
    fontSize: 14,
    fontWeight: '800',
  },
  selectionCountLabel: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  toggleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.xs,
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
    fontSize: 12.5,
  },
  createPresetActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 46,
    borderRadius: Radius.sm,
  },
  createPresetActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
