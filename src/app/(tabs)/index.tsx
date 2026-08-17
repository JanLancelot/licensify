import { useRouter } from 'expo-router';
import {
  ArrowRight,
  Award,
  ChevronRight,
  Play,
  Zap,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Clean Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Dashboard
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 90 },
        ]}>
        {/* 1. OVERALL PROGRESS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Overall Progress
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}>
            {/* Top Score Summary */}
            <View style={styles.progressHero}>
              <View>
                <Text style={[styles.progressBigNumber, { color: theme.accent }]}>
                  74%
                </Text>
                <Text style={[styles.progressSubLabel, { color: theme.textSecondary }]}>
                  Overall Readiness Score
                </Text>
              </View>
              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor: theme.accentMuted,
                    borderColor: theme.border,
                  },
                ]}>
                <Award size={13} color={theme.accent} />
                <Text style={[styles.statusPillText, { color: theme.accent }]}>
                  On Track
                </Text>
              </View>
            </View>

            {/* Clean Progress Bar */}
            <View
              style={[
                styles.track,
                { backgroundColor: theme.backgroundSelected },
              ]}>
              <View
                style={[
                  styles.fill,
                  { width: '74%', backgroundColor: theme.accent },
                ]}
              />
            </View>

            {/* 3 Key Stats */}
            <View
              style={[styles.statsRow, { borderTopColor: theme.border }]}>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  128h
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Study Time
                </Text>
              </View>

              <View
                style={[styles.statDivider, { backgroundColor: theme.border }]}
              />

              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  1,420
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Answered
                </Text>
              </View>

              <View
                style={[styles.statDivider, { backgroundColor: theme.border }]}
              />

              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: theme.accent }]}>
                  84%
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Accuracy
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2. CONTINUE STUDYING */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Continue Studying
          </Text>

          <Pressable
            onPress={() => router.push('/(tabs)/learn/practice-law' as any)}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <View style={styles.continueHeaderRow}>
              <Text
                style={[styles.continueTag, { color: theme.accent }]}>
                MODULE 3 • PRACTICE & LAWS
              </Text>
              <Text
                style={[styles.continuePercent, { color: theme.textSecondary }]}>
                65% Done
              </Text>
            </View>

            <Text style={[styles.continueTitle, { color: theme.text }]}>
              Rule 7 & 8: Classification of Occupancies
            </Text>
            <Text
              style={[styles.continueSubtitle, { color: theme.textSecondary }]}>
              Lesson 4 • NBCP PD 1096 Computations
            </Text>

            <View style={styles.continueFooter}>
              <View
                style={[
                  styles.miniTrack,
                  { backgroundColor: theme.backgroundSelected, flex: 1 },
                ]}>
                <View
                  style={[
                    styles.fill,
                    { width: '65%', backgroundColor: theme.accent },
                  ]}
                />
              </View>
              <View
                style={[
                  styles.resumeButton,
                  { backgroundColor: theme.accent },
                ]}>
                <Play size={11} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.resumeButtonText}>Resume</Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* 3. RECOMMENDED LESSONS */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Recommended Lessons
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/learn' as any)}
              style={({ pressed }) => [
                styles.seeAllBtn,
                { opacity: pressed ? 0.6 : 1 },
              ]}>
              <Text style={[styles.seeAllText, { color: theme.accent }]}>
                See all
              </Text>
              <ArrowRight size={13} color={theme.accent} />
            </Pressable>
          </View>

          <View
            style={[
              styles.groupedCard,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}>
            {/* Lesson 1 */}
            <Pressable
              onPress={() => router.push('/(tabs)/learn/history' as any)}
              style={({ pressed }) => [
                styles.listItem,
                { opacity: pressed ? 0.7 : 1 },
              ]}>
              <View style={styles.listItemLeft}>
                <Text style={[styles.listMeta, { color: theme.accent }]}>
                  Area 1 • 15 min
                </Text>
                <Text style={[styles.listTitle, { color: theme.text }]}>
                  Classical Greek & Roman Orders
                </Text>
              </View>
              <ChevronRight size={16} color={theme.textSecondary} />
            </Pressable>

            <View
              style={[styles.itemDivider, { backgroundColor: theme.border }]}
            />

            {/* Lesson 2 */}
            <Pressable
              onPress={() => router.push('/(tabs)/learn/building-tech' as any)}
              style={({ pressed }) => [
                styles.listItem,
                { opacity: pressed ? 0.7 : 1 },
              ]}>
              <View style={styles.listItemLeft}>
                <Text style={[styles.listMeta, { color: theme.accent }]}>
                  Area 2 • 25 min
                </Text>
                <Text style={[styles.listTitle, { color: theme.text }]}>
                  Sanitary & Storm Drainage Systems
                </Text>
              </View>
              <ChevronRight size={16} color={theme.textSecondary} />
            </Pressable>

            <View
              style={[styles.itemDivider, { backgroundColor: theme.border }]}
            />

            {/* Lesson 3 */}
            <Pressable
              onPress={() => router.push('/(tabs)/learn/practice-law' as any)}
              style={({ pressed }) => [
                styles.listItem,
                { opacity: pressed ? 0.7 : 1 },
              ]}>
              <View style={styles.listItemLeft}>
                <Text style={[styles.listMeta, { color: theme.accent }]}>
                  Area 3 • 20 min
                </Text>
                <Text style={[styles.listTitle, { color: theme.text }]}>
                  RA 9266 Architecture Act & SPP 200
                </Text>
              </View>
              <ChevronRight size={16} color={theme.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* 4. WEAK SUBJECTS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Weak Subjects
          </Text>

          <View
            style={[
              styles.groupedCard,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}>
            {/* Weak Subject 1 */}
            <View style={styles.weakItem}>
              <View style={styles.weakItemInfo}>
                <Text style={[styles.listTitle, { color: theme.text }]}>
                  Building Utilities & MEPFS
                </Text>
                <Text style={[styles.weakMeta, { color: theme.textSecondary }]}>
                  Area 2 • 48% accuracy on drills
                </Text>
              </View>
              <Pressable
                onPress={() => router.push('/(tabs)/practice' as any)}
                style={({ pressed }) => [
                  styles.compactPracticeBtn,
                  {
                    backgroundColor: theme.backgroundSelected,
                    borderColor: theme.borderStrong,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}>
                <Zap size={12} color={theme.accent} />
                <Text style={[styles.compactPracticeText, { color: theme.text }]}>
                  Practice
                </Text>
              </Pressable>
            </View>

            <View
              style={[styles.itemDivider, { backgroundColor: theme.border }]}
            />

            {/* Weak Subject 2 */}
            <View style={styles.weakItem}>
              <View style={styles.weakItemInfo}>
                <Text style={[styles.listTitle, { color: theme.text }]}>
                  Structural Concepts & Trusses
                </Text>
                <Text style={[styles.weakMeta, { color: theme.textSecondary }]}>
                  Area 2 • 55% accuracy on drills
                </Text>
              </View>
              <Pressable
                onPress={() => router.push('/(tabs)/practice' as any)}
                style={({ pressed }) => [
                  styles.compactPracticeBtn,
                  {
                    backgroundColor: theme.backgroundSelected,
                    borderColor: theme.borderStrong,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}>
                <Zap size={12} color={theme.accent} />
                <Text style={[styles.compactPracticeText, { color: theme.text }]}>
                  Practice
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* 5. RECENT ACTIVITY */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Recent Activity
          </Text>

          <View
            style={[
              styles.groupedCard,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}>
            {/* Activity 1 */}
            <View style={styles.activityRow}>
              <View style={styles.activityMain}>
                <Text style={[styles.listTitle, { color: theme.text }]}>
                  PRC ALE Area 1 Mock Simulation
                </Text>
                <Text style={[styles.activitySub, { color: theme.textSecondary }]}>
                  Score: 86% • Passed
                </Text>
              </View>
              <Text style={[styles.activityTimestamp, { color: theme.textSecondary }]}>
                2h ago
              </Text>
            </View>

            <View
              style={[styles.itemDivider, { backgroundColor: theme.border }]}
            />

            {/* Activity 2 */}
            <View style={styles.activityRow}>
              <View style={styles.activityMain}>
                <Text style={[styles.listTitle, { color: theme.text }]}>
                  Terms & Styles Flashcards
                </Text>
                <Text style={[styles.activitySub, { color: theme.textSecondary }]}>
                  35 terms mastered
                </Text>
              </View>
              <Text style={[styles.activityTimestamp, { color: theme.textSecondary }]}>
                Yesterday
              </Text>
            </View>

            <View
              style={[styles.itemDivider, { backgroundColor: theme.border }]}
            />

            {/* Activity 3 */}
            <View style={styles.activityRow}>
              <View style={styles.activityMain}>
                <Text style={[styles.listTitle, { color: theme.text }]}>
                  Rule 7 & 8 NBCP Computation Drill
                </Text>
                <Text style={[styles.activitySub, { color: theme.textSecondary }]}>
                  Score: 90% (18/20)
                </Text>
              </View>
              <Text style={[styles.activityTimestamp, { color: theme.textSecondary }]}>
                2d ago
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    paddingTop: 8,
    gap: 22,
  },

  /* Header */
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  /* Section Structure */
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* Clean Containers */
  card: {
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 12,
  },
  groupedCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },

  /* Progress Card */
  progressHero: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  progressBigNumber: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 34,
  },
  progressSubLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  track: {
    height: 6,
    borderRadius: Radius.xs,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: 20,
  },

  /* Continue Card */
  continueHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  continueTag: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  continuePercent: {
    fontSize: 11,
    fontWeight: '600',
  },
  continueTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: -4,
  },
  continueSubtitle: {
    fontSize: 12,
    marginTop: -8,
  },
  continueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  miniTrack: {
    height: 4,
    borderRadius: Radius.xs,
    overflow: 'hidden',
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.xs,
  },
  resumeButtonText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },

  /* Grouped List Items (Recommended, Weak, Activity) */
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  listItemLeft: {
    flex: 1,
    gap: 2,
  },
  listMeta: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  listTitle: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  itemDivider: {
    height: 1,
    marginHorizontal: 14,
  },

  /* Weak Subjects */
  weakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  weakItemInfo: {
    flex: 1,
    gap: 2,
  },
  weakMeta: {
    fontSize: 11.5,
  },
  compactPracticeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  compactPracticeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  /* Recent Activity */
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  activityMain: {
    flex: 1,
    gap: 2,
  },
  activitySub: {
    fontSize: 11.5,
  },
  activityTimestamp: {
    fontSize: 11,
  },
});
