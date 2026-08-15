import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Building,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Layers,
  Scale,
  Search,
  TreePine,
  X,
} from 'lucide-react-native';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { Radius } from '@/constants/theme';

type TabType = 'subjects' | 'modules' | 'lessons';

interface LessonNote {
  id: string;
  title: string;
  area: string;
  duration: string;
  module: string;
  summary: string;
  keyPoints: string[];
}

const LESSON_NOTES: LessonNote[] = [
  {
    id: 'l1',
    title: 'Classical Greek & Roman Orders',
    area: 'Area 1',
    duration: '8 min read',
    module: 'History & Theory',
    summary: 'Proportions and distinctive column components of Classical Architecture.',
    keyPoints: [
      'Doric Order: Simplest and earliest Greek order. No base in Greek Doric; features fluted columns and triglyphs/metopes in frieze.',
      'Ionic Order: Characterized by spiral volutes (scrolls) on the capital, slender proportions, and molded base.',
      'Corinthian Order: Most ornate classical order, decorated with acanthus leaves and small volutes.',
      'Composite & Tuscan: Roman variations; Tuscan is unadorned and simplest, Composite blends Ionic volutes with Corinthian acanthus.',
    ],
  },
  {
    id: 'l2',
    title: 'Rule 7 & 8: Classification of Occupancies & GFA',
    area: 'Area 3',
    duration: '12 min read',
    module: 'Professional Practice & Laws',
    summary: 'National Building Code (PD 1096) zoning provisions, setbacks, and floor area ratios.',
    keyPoints: [
      'Group A: Residential Dwellings (single-family, duplexes).',
      'Group B: Residentials, Hotels & Apartments (multiple units).',
      'TOSL (Total Open Space within Lot): TOSL = ISA (Impervious Surface Area) + USA (Unpaved Surface Area).',
      'AMBF (Allowable Maximum Building Footprint): TLA - TOSL.',
      'GFA (Gross Floor Area) vs TGFA (Total Gross Floor Area): TGFA includes parking, open spaces, balconies, and roofs.',
    ],
  },
  {
    id: 'l3',
    title: 'Sanitary Plumbing: Trap Seals, Vents & Drains',
    area: 'Area 2',
    duration: '10 min read',
    module: 'Building Tech & Utilities',
    summary: 'National Plumbing Code requirements for wastewater drainage, venting systems, and traps.',
    keyPoints: [
      'Standard Trap Seal Depth: Minimum of 2 inches (51 mm) to a maximum of 4 inches (102 mm).',
      'Vent Pipes: Prevent siphonage and backpressure of trap seals; must terminate at least 15 cm above the roof surface.',
      'Drainage Slope: Standard horizontal drainage piping requires 1/4 inch per foot (2%) uniform slope.',
      'Septic Tank Sizing: Requires minimum liquid depth of 0.60 m and digestion chamber representing 2/3 of total capacity.',
    ],
  },
  {
    id: 'l4',
    title: 'RA 9266 Architecture Act of 2004 & Code of Ethics',
    area: 'Area 3',
    duration: '14 min read',
    module: 'Professional Practice & Laws',
    summary: 'Legal scope of architecture practice, registration, licensure, and professional conduct.',
    keyPoints: [
      'Section 20: Mandatory requirement for signing and sealing of architectural plans exclusively by Registered Architects (RLAs).',
      'SPP 201: Pre-Design Services (consultation, feasibility, site selection).',
      'SPP 202: Regular Design Services (schematic, design development, contract documents, construction phase).',
      'Architects Credo: Commitment to integrity, client fiduciary responsibility, and safety of the public.',
    ],
  },
  {
    id: 'l5',
    title: 'Concrete Mix Ratios, Slump & Curing',
    area: 'Area 2',
    duration: '9 min read',
    module: 'Building Tech & Utilities',
    summary: 'Structural specifications for concrete mixes, slump testing, and standard hydration periods.',
    keyPoints: [
      'Class AA (1:1.5:3): Underwater construction and high-strength retaining structures (approx 4,000 psi).',
      'Class A (1:2:4): Reinforced concrete columns, beams, girders, and suspended floor slabs (approx 3,000 psi).',
      'Class B (1:2.5:5): Non-load bearing walls, lintels, and ground floor slabs (approx 2,500 psi).',
      'Class C (1:3:6): Plant boxes, footing beds, and mass plain concrete.',
      'Standard Curing Duration: 28 days for full design compressive strength achievement.',
    ],
  },
  {
    id: 'l6',
    title: 'Urban Zoning & Subdivision Standards (BP 220 & PD 957)',
    area: 'Area 1',
    duration: '11 min read',
    module: 'Urban Planning',
    summary: 'Minimum lot sizes, right-of-way widths, and open space allocations for socialized and economic housing.',
    keyPoints: [
      'BP 220 Socialized Housing: Single detached min lot size is 64 sq.m (Economic: 72 sq.m). Duplex min: 48 sq.m (Economic: 54 sq.m). Rowhouse min: 28 sq.m (Economic: 36 sq.m).',
      'PD 957 Open Space: Required parks/playgrounds and community facilities scaled based on density.',
      'Major Road ROW: Minimum 10m to 12m for primary subdivision collectors.',
    ],
  },
];

export default function NotesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();

  const [activeTab, setActiveTab] = useState<TabType>(
    (params.tab as TabType) || 'subjects'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<LessonNote | null>(null);

  const filteredLessons = LESSON_NOTES.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Top Navigation Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backBtn,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
              opacity: pressed ? 0.75 : 1,
            },
          ]}>
          <ArrowLeft size={18} color={theme.text} />
        </Pressable>

        <View style={styles.topBarTitles}>
          <Text style={[styles.topBarKicker, { color: theme.accent }]}>
            CURRICULUM & DOCUMENTATION
          </Text>
          <Text style={[styles.topBarHeading, { color: theme.text }]}>
            Notes Library
          </Text>
        </View>
      </View>

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
          onPress={() => setActiveTab('subjects')}
          style={[
            styles.segmentBtn,
            activeTab === 'subjects' && [
              styles.segmentBtnActive,
              { backgroundColor: theme.accent, borderColor: theme.accent },
            ],
          ]}>
          <Text
            style={[
              styles.segmentText,
              {
                color:
                  activeTab === 'subjects' ? '#FFFFFF' : theme.textSecondary,
              },
            ]}>
            Subjects
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('modules')}
          style={[
            styles.segmentBtn,
            activeTab === 'modules' && [
              styles.segmentBtnActive,
              { backgroundColor: theme.accent, borderColor: theme.accent },
            ],
          ]}>
          <Text
            style={[
              styles.segmentText,
              {
                color:
                  activeTab === 'modules' ? '#FFFFFF' : theme.textSecondary,
              },
            ]}>
            Modules
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('lessons')}
          style={[
            styles.segmentBtn,
            activeTab === 'lessons' && [
              styles.segmentBtnActive,
              { backgroundColor: theme.accent, borderColor: theme.accent },
            ],
          ]}>
          <Text
            style={[
              styles.segmentText,
              {
                color:
                  activeTab === 'lessons' ? '#FFFFFF' : theme.textSecondary,
              },
            ]}>
            Lessons ({LESSON_NOTES.length})
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
        {/* VIEW 1: SUBJECTS */}
        {activeTab === 'subjects' && (
          <View style={styles.tabContent}>
            {/* Area 1 */}
            <View
              style={[
                styles.subjectCard,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}>
              <View style={styles.subjectTop}>
                <View>
                  <Text style={[styles.subjectKicker, { color: theme.accent }]}>
                    AREA 1 • 30% WEIGHT
                  </Text>
                  <Text style={[styles.subjectTitle, { color: theme.text }]}>
                    History, Theory, Planning & Laws
                  </Text>
                </View>
                <View
                  style={[
                    styles.percentPill,
                    {
                      backgroundColor: theme.accentMuted,
                      borderColor: theme.border,
                    },
                  ]}>
                  <Text style={[styles.percentPillText, { color: theme.accent }]}>
                    82% Ready
                  </Text>
                </View>
              </View>

              <Text
                style={[styles.subjectDesc, { color: theme.textSecondary }]}>
                Ancient to contemporary architectural history, urban planning standards (BP 220, PD 957), and the Philippine Architecture Act (RA 9266).
              </Text>

              <View
                style={[styles.subjectMetaRow, { borderTopColor: theme.border }]}>
                <Text style={[styles.subjectMeta, { color: theme.textSecondary }]}>
                  34 Lessons • 8 Quizzes
                </Text>
                <Pressable
                  onPress={() => setActiveTab('lessons')}
                  style={styles.viewNotesBtn}>
                  <Text
                    style={[styles.viewNotesText, { color: theme.accent }]}>
                    View Lessons →
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Area 2 */}
            <View
              style={[
                styles.subjectCard,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}>
              <View style={styles.subjectTop}>
                <View>
                  <Text style={[styles.subjectKicker, { color: theme.accent }]}>
                    AREA 2 • 30% WEIGHT
                  </Text>
                  <Text style={[styles.subjectTitle, { color: theme.text }]}>
                    Structural, Utilities & Building Materials
                  </Text>
                </View>
                <View
                  style={[
                    styles.percentPill,
                    {
                      backgroundColor: theme.accentMuted,
                      borderColor: theme.border,
                    },
                  ]}>
                  <Text style={[styles.percentPillText, { color: theme.accent }]}>
                    64% Ready
                  </Text>
                </View>
              </View>

              <Text
                style={[styles.subjectDesc, { color: theme.textSecondary }]}>
                Building technology systems, MEPFS sanitary & electrical, structural conceptualization, estimation, and material specifications.
              </Text>

              <View
                style={[styles.subjectMetaRow, { borderTopColor: theme.border }]}>
                <Text style={[styles.subjectMeta, { color: theme.textSecondary }]}>
                  48 Lessons • 12 Quizzes
                </Text>
                <Pressable
                  onPress={() => setActiveTab('lessons')}
                  style={styles.viewNotesBtn}>
                  <Text
                    style={[styles.viewNotesText, { color: theme.accent }]}>
                    View Lessons →
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Area 3 */}
            <View
              style={[
                styles.subjectCard,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}>
              <View style={styles.subjectTop}>
                <View>
                  <Text style={[styles.subjectKicker, { color: theme.accent }]}>
                    AREA 3 • 40% WEIGHT
                  </Text>
                  <Text style={[styles.subjectTitle, { color: theme.text }]}>
                    Architectural Design & Site Planning
                  </Text>
                </View>
                <View
                  style={[
                    styles.percentPill,
                    {
                      backgroundColor: theme.accentMuted,
                      borderColor: theme.border,
                    },
                  ]}>
                  <Text style={[styles.percentPillText, { color: theme.accent }]}>
                    76% Ready
                  </Text>
                </View>
              </View>

              <Text
                style={[styles.subjectDesc, { color: theme.textSecondary }]}>
                Design problem scenarios, space programming, site development, zoning analysis, and Rule 7 & 8 computation formulas.
              </Text>

              <View
                style={[styles.subjectMetaRow, { borderTopColor: theme.border }]}>
                <Text style={[styles.subjectMeta, { color: theme.textSecondary }]}>
                  45 Lessons • 6 Simulations
                </Text>
                <Pressable
                  onPress={() => setActiveTab('lessons')}
                  style={styles.viewNotesBtn}>
                  <Text
                    style={[styles.viewNotesText, { color: theme.accent }]}>
                    View Lessons →
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* VIEW 2: MODULES */}
        {activeTab === 'modules' && (
          <View style={styles.tabContent}>
            <View
              style={[
                styles.groupedList,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}>
              {/* Module 1 */}
              <Pressable
                onPress={() => router.push('/(tabs)/learn/history' as any)}
                style={({ pressed }) => [
                  styles.moduleRow,
                  { opacity: pressed ? 0.7 : 1 },
                ]}>
                <View style={styles.moduleRowLeft}>
                  <Text style={[styles.moduleKicker, { color: theme.accent }]}>
                    MODULE 1
                  </Text>
                  <Text style={[styles.moduleRowTitle, { color: theme.text }]}>
                    History & Theory of Architecture
                  </Text>
                  <Text
                    style={[
                      styles.moduleRowSubtext,
                      { color: theme.textSecondary },
                    ]}>
                    Classical Orders, Renaissance, Asian & Philippine Vernacular
                  </Text>
                </View>
                <View style={styles.moduleRowRight}>
                  <Text
                    style={[
                      styles.moduleCountText,
                      { color: theme.textSecondary },
                    ]}>
                    34 Lessons
                  </Text>
                  <ChevronRight size={16} color={theme.textSecondary} />
                </View>
              </Pressable>

              <View
                style={[styles.rowDivider, { backgroundColor: theme.border }]}
              />

              {/* Module 2 */}
              <Pressable
                onPress={() => router.push('/(tabs)/learn/building-tech' as any)}
                style={({ pressed }) => [
                  styles.moduleRow,
                  { opacity: pressed ? 0.7 : 1 },
                ]}>
                <View style={styles.moduleRowLeft}>
                  <Text style={[styles.moduleKicker, { color: theme.accent }]}>
                    MODULE 2
                  </Text>
                  <Text style={[styles.moduleRowTitle, { color: theme.text }]}>
                    Building Technology & Utilities
                  </Text>
                  <Text
                    style={[
                      styles.moduleRowSubtext,
                      { color: theme.textSecondary },
                    ]}>
                    Concrete mixes, structural trusses, MEPFS & Plumbing code
                  </Text>
                </View>
                <View style={styles.moduleRowRight}>
                  <Text
                    style={[
                      styles.moduleCountText,
                      { color: theme.textSecondary },
                    ]}>
                    48 Lessons
                  </Text>
                  <ChevronRight size={16} color={theme.textSecondary} />
                </View>
              </Pressable>

              <View
                style={[styles.rowDivider, { backgroundColor: theme.border }]}
              />

              {/* Module 3 */}
              <Pressable
                onPress={() => router.push('/(tabs)/learn/practice-law' as any)}
                style={({ pressed }) => [
                  styles.moduleRow,
                  { opacity: pressed ? 0.7 : 1 },
                ]}>
                <View style={styles.moduleRowLeft}>
                  <Text style={[styles.moduleKicker, { color: theme.accent }]}>
                    MODULE 3
                  </Text>
                  <Text style={[styles.moduleRowTitle, { color: theme.text }]}>
                    Professional Practice & Laws
                  </Text>
                  <Text
                    style={[
                      styles.moduleRowSubtext,
                      { color: theme.textSecondary },
                    ]}>
                    RA 9266, NBCP (PD 1096), Fire Code (RA 9514) & Ethics
                  </Text>
                </View>
                <View style={styles.moduleRowRight}>
                  <Text
                    style={[
                      styles.moduleCountText,
                      { color: theme.textSecondary },
                    ]}>
                    26 Lessons
                  </Text>
                  <ChevronRight size={16} color={theme.textSecondary} />
                </View>
              </Pressable>

              <View
                style={[styles.rowDivider, { backgroundColor: theme.border }]}
              />

              {/* Module 4 */}
              <Pressable
                onPress={() => router.push('/(tabs)/learn/history' as any)}
                style={({ pressed }) => [
                  styles.moduleRow,
                  { opacity: pressed ? 0.7 : 1 },
                ]}>
                <View style={styles.moduleRowLeft}>
                  <Text style={[styles.moduleKicker, { color: theme.accent }]}>
                    MODULE 4
                  </Text>
                  <Text style={[styles.moduleRowTitle, { color: theme.text }]}>
                    Urban Planning & Site Planning
                  </Text>
                  <Text
                    style={[
                      styles.moduleRowSubtext,
                      { color: theme.textSecondary },
                    ]}>
                    Zoning, Subdivisions (BP 220, PD 957) & Topography
                  </Text>
                </View>
                <View style={styles.moduleRowRight}>
                  <Text
                    style={[
                      styles.moduleCountText,
                      { color: theme.textSecondary },
                    ]}>
                    19 Lessons
                  </Text>
                  <ChevronRight size={16} color={theme.textSecondary} />
                </View>
              </Pressable>
            </View>
          </View>
        )}

        {/* VIEW 3: LESSONS */}
        {activeTab === 'lessons' && (
          <View style={styles.tabContent}>
            {/* Search Box */}
            <View
              style={[
                styles.searchBox,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}>
              <Search size={15} color={theme.textSecondary} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search notes, formulas, or laws..."
                placeholderTextColor={theme.textSecondary}
                style={[styles.searchInput, { color: theme.text }]}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <X size={15} color={theme.textSecondary} />
                </Pressable>
              )}
            </View>

            {/* Lessons Grouped List */}
            <View
              style={[
                styles.groupedList,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}>
              {filteredLessons.map((lesson, idx) => (
                <React.Fragment key={lesson.id}>
                  <Pressable
                    onPress={() => setSelectedLesson(lesson)}
                    style={({ pressed }) => [
                      styles.lessonItemRow,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}>
                    <View style={styles.lessonItemLeft}>
                      <View style={styles.lessonMetaTagRow}>
                        <Text
                          style={[
                            styles.lessonMetaArea,
                            { color: theme.accent },
                          ]}>
                          {lesson.area}
                        </Text>
                        <Text
                          style={[
                            styles.lessonMetaDot,
                            { color: theme.textSecondary },
                          ]}>
                          •
                        </Text>
                        <Text
                          style={[
                            styles.lessonMetaDuration,
                            { color: theme.textSecondary },
                          ]}>
                          {lesson.duration}
                        </Text>
                      </View>
                      <Text
                        style={[styles.lessonItemTitle, { color: theme.text }]}>
                        {lesson.title}
                      </Text>
                      <Text
                        style={[
                          styles.lessonItemModule,
                          { color: theme.textSecondary },
                        ]}>
                        {lesson.module}
                      </Text>
                    </View>
                    <ChevronRight size={16} color={theme.textSecondary} />
                  </Pressable>

                  {idx < filteredLessons.length - 1 && (
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

      {/* Lesson Reading Reader Modal */}
      <Modal
        visible={!!selectedLesson}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedLesson(null)}>
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: theme.background },
          ]}>
          <View style={[styles.modalTopBar, { borderBottomColor: theme.border }]}>
            <View style={styles.modalTitleBox}>
              <Text style={[styles.modalAreaTag, { color: theme.accent }]}>
                {selectedLesson?.area} • {selectedLesson?.module}
              </Text>
              <Text style={[styles.modalMainTitle, { color: theme.text }]}>
                {selectedLesson?.title}
              </Text>
            </View>
            <Pressable
              onPress={() => setSelectedLesson(null)}
              style={({ pressed }) => [
                styles.modalCloseBtn,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <X size={18} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}>
            {/* Overview Card */}
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}>
              <Text style={[styles.modalCardLabel, { color: theme.accent }]}>
                CORE SUMMARY
              </Text>
              <Text style={[styles.modalSummaryText, { color: theme.text }]}>
                {selectedLesson?.summary}
              </Text>
            </View>

            {/* Key Points */}
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}>
              <Text style={[styles.modalCardLabel, { color: theme.accent }]}>
                KEY EXAM PROVISIONS & FORMULAS
              </Text>

              <View style={styles.keyPointsList}>
                {selectedLesson?.keyPoints.map((point, index) => (
                  <View key={index} style={styles.pointRow}>
                    <View
                      style={[
                        styles.pointBullet,
                        { backgroundColor: theme.accent },
                      ]}
                    />
                    <Text
                      style={[
                        styles.pointText,
                        { color: theme.text },
                      ]}>
                      {point}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <Pressable
              onPress={() => {
                setSelectedLesson(null);
                router.push('/(tabs)/practice' as any);
              }}
              style={[
                styles.modalPracticeBtn,
                { backgroundColor: theme.accent },
              ]}>
              <Text style={styles.modalPracticeText}>
                Practice Questions for this Topic
              </Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    borderWidth: 1,
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

  /* Subject Cards */
  subjectCard: {
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 10,
  },
  subjectTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subjectKicker: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  subjectTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  percentPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  percentPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  subjectDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  subjectMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  subjectMeta: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  viewNotesBtn: {
    paddingVertical: 2,
  },
  viewNotesText: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* Grouped Lists (Modules & Lessons) */
  groupedList: {
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  moduleRowLeft: {
    flex: 1,
    gap: 2,
  },
  moduleKicker: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  moduleRowTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  moduleRowSubtext: {
    fontSize: 11.5,
    lineHeight: 15,
  },
  moduleRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  moduleCountText: {
    fontSize: 11.5,
  },
  rowDivider: {
    height: 1,
    marginHorizontal: 16,
  },

  /* Search */
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: Radius.sm,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },

  /* Lesson Row */
  lessonItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  lessonItemLeft: {
    flex: 1,
    gap: 2,
  },
  lessonMetaTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  lessonMetaArea: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  lessonMetaDot: {
    fontSize: 10,
  },
  lessonMetaDuration: {
    fontSize: 11,
  },
  lessonItemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  lessonItemModule: {
    fontSize: 11.5,
  },

  /* Modal */
  modalContainer: {
    flex: 1,
  },
  modalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  modalTitleBox: {
    flex: 1,
    gap: 2,
  },
  modalAreaTag: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  modalMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    padding: 20,
    gap: 14,
  },
  modalCard: {
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 8,
  },
  modalCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  modalSummaryText: {
    fontSize: 13,
    lineHeight: 18,
  },
  keyPointsList: {
    gap: 10,
    marginTop: 4,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  pointBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 6,
  },
  pointText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 17,
  },
  modalPracticeBtn: {
    paddingVertical: 12,
    borderRadius: Radius.sm,
    alignItems: 'center',
    marginTop: 6,
  },
  modalPracticeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
