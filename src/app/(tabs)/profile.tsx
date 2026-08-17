import { useAuthActions } from '@convex-dev/auth/react';
import { useRouter } from 'expo-router';
import {
  Cloud,
  Flame,
  Lock,
  LogOut,
  Moon,
  RotateCcw,
  Smartphone,
  Sun,
  Trophy,
  User,
  Zap
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius } from '@/constants/theme';
import { ThemeMode, useAppTheme } from '@/context/theme-context';

export default function ProfileScreen() {
  const { colors, themeMode, setThemeMode, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuthActions();

  const handleSignOut = async () => {
    const doSignOut = async () => {
      try {
        await signOut();
        router.replace('/(auth)/login' as any);
      } catch (e) {
        console.error('Sign out error:', e);
      }
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Are you sure you want to sign out?')) {
        await doSignOut();
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: doSignOut },
      ]);
    }
  };

  // Settings & Notifications State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [examAlerts, setExamAlerts] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const themeOptions: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
    { mode: 'system', label: 'System', icon: Smartphone },
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
  ];

  const handleToggleDarkMode = (value: boolean) => {
    setThemeMode(value ? 'dark' : 'light');
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      Alert.alert('Database Synced', 'Your study progress, quiz history, and flashcards are up to date.');
    }, 800);
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Study Statistics',
      'Are you sure you want to reset your quiz history and practice analytics? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => Alert.alert('Stats Reset', 'Your analytics have been reset.') },
      ]
    );
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 90 },
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.kicker, { color: colors.accent }]}>
              EXAMINEE PROFILE
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              Profile
            </Text>
          </View>
          <View
            style={[
              styles.yearPill,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}>
            <Text style={[styles.yearPillText, { color: colors.textSecondary }]}>
              ALE 2026
            </Text>
          </View>
        </View>

        {/* 1. PROFILE CARD */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
            },
          ]}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: colors.accentMuted,
                borderColor: colors.border,
              },
            ]}>
            <User size={26} color={colors.accent} />
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: colors.text }]}>
              Engr. Board Examinee
            </Text>
            <Text style={[styles.role, { color: colors.textSecondary }]}>
              johndoe@gmail.com
            </Text>
          </View>
        </View>

        {/* 2. STUDY STREAK & OVERALL STATISTICS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Overall Statistics
          </Text>

          <View
            style={[
              styles.groupedCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}>
            {/* Streak Row */}
            <View style={styles.streakRow}>
              <View style={styles.streakLeft}>
                <View
                  style={[
                    styles.streakIconBox,
                    {
                      backgroundColor: colors.accentMuted,
                      borderColor: colors.border,
                    },
                  ]}>
                  <Flame size={20} color={colors.accent} />
                </View>
                <View>
                  <Text style={[styles.streakCount, { color: colors.text }]}>
                    14-Day Study Streak
                  </Text>
                  <Text
                    style={[styles.streakSub, { color: colors.textSecondary }]}>
                    6 days until 20-Day Streak Milestone badge
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={[styles.itemDivider, { backgroundColor: colors.border }]}
            />

            {/* 3 Core Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  128h
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Time Logged
                </Text>
              </View>

              <View
                style={[styles.statDivider, { backgroundColor: colors.border }]}
              />

              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  1,420
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Questions
                </Text>
              </View>

              <View
                style={[styles.statDivider, { backgroundColor: colors.border }]}
              />

              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: colors.accent }]}>
                  84%
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Accuracy
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3. ACHIEVEMENTS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Achievements
          </Text>

          <View
            style={[
              styles.groupedCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}>
            {/* Achievement 1 */}
            <View style={styles.achievementRow}>
              <View
                style={[
                  styles.achieveIconBox,
                  {
                    backgroundColor: colors.accentMuted,
                    borderColor: colors.border,
                  },
                ]}>
                <Trophy size={16} color={colors.accent} />
              </View>
              <View style={styles.achieveInfo}>
                <Text style={[styles.achieveTitle, { color: colors.text }]}>
                  Code Master (Rule 7 & 8)
                </Text>
                <Text
                  style={[styles.achieveDesc, { color: colors.textSecondary }]}>
                  Answered 100+ NBCP calculation questions correctly.
                </Text>
              </View>
              <View
                style={[
                  styles.unlockedBadge,
                  {
                    backgroundColor: colors.accentMuted,
                    borderColor: colors.border,
                  },
                ]}>
                <Text style={[styles.unlockedText, { color: colors.accent }]}>
                  Unlocked
                </Text>
              </View>
            </View>

            <View
              style={[styles.itemDivider, { backgroundColor: colors.border }]}
            />

            {/* Achievement 2 */}
            <View style={styles.achievementRow}>
              <View
                style={[
                  styles.achieveIconBox,
                  {
                    backgroundColor: colors.accentMuted,
                    borderColor: colors.border,
                  },
                ]}>
                <Zap size={16} color={colors.accent} />
              </View>
              <View style={styles.achieveInfo}>
                <Text style={[styles.achieveTitle, { color: colors.text }]}>
                  Rapid Recall
                </Text>
                <Text
                  style={[styles.achieveDesc, { color: colors.textSecondary }]}>
                  Finished a 20-item drill in under 10 mins with &gt;85% score.
                </Text>
              </View>
              <View
                style={[
                  styles.unlockedBadge,
                  {
                    backgroundColor: colors.accentMuted,
                    borderColor: colors.border,
                  },
                ]}>
                <Text style={[styles.unlockedText, { color: colors.accent }]}>
                  Unlocked
                </Text>
              </View>
            </View>

            <View
              style={[styles.itemDivider, { backgroundColor: colors.border }]}
            />

            {/* Achievement 3 (In Progress) */}
            <View style={styles.achievementRow}>
              <View
                style={[
                  styles.achieveIconBox,
                  {
                    backgroundColor: colors.backgroundSelected,
                    borderColor: colors.border,
                  },
                ]}>
                <Lock size={15} color={colors.textSecondary} />
              </View>
              <View style={styles.achieveInfo}>
                <Text style={[styles.achieveTitle, { color: colors.text }]}>
                  Area 1 Specialist
                </Text>
                <Text
                  style={[styles.achieveDesc, { color: colors.textSecondary }]}>
                  Score 85%+ on three Area 1 Mock Tests (Progress: 2/3).
                </Text>
              </View>
              <Text
                style={[styles.progressAchieveText, { color: colors.textSecondary }]}>
                2/3 Done
              </Text>
            </View>
          </View>
        </View>

        {/* 4. SETTINGS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Settings
          </Text>

          <View
            style={[
              styles.groupedCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}>
            {/* Dark Mode Switch */}
            <View style={styles.settingSwitchRow}>
              <View style={styles.settingLabelBox}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Dark Mode
                </Text>
                <Text
                  style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Switch between dark and light architectural interface.
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={handleToggleDarkMode}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View
              style={[styles.itemDivider, { backgroundColor: colors.border }]}
            />

            {/* 3-Way Mode Segment */}
            <View style={styles.themeSelectorRow}>
              <Text style={[styles.themeLabel, { color: colors.textSecondary }]}>
                THEME MODE
              </Text>
              <View style={styles.themeOptionsGroup}>
                {themeOptions.map((opt) => {
                  const isSelected = themeMode === opt.mode;
                  const Icon = opt.icon;
                  return (
                    <Pressable
                      key={opt.mode}
                      onPress={() => setThemeMode(opt.mode)}
                      style={[
                        styles.themeOptionBtn,
                        {
                          backgroundColor: isSelected
                            ? colors.accent
                            : colors.backgroundSelected,
                          borderColor: isSelected
                            ? colors.accent
                            : colors.borderStrong,
                        },
                      ]}>
                      <Icon
                        size={13}
                        color={isSelected ? '#FFFFFF' : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.themeOptionBtnText,
                          {
                            color:
                              isSelected ? '#FFFFFF' : colors.textSecondary,
                          },
                        ]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View
              style={[styles.itemDivider, { backgroundColor: colors.border }]}
            />

            {/* Sound & Haptics */}
            <View style={styles.settingSwitchRow}>
              <View style={styles.settingLabelBox}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Sound & Drill Feedback
                </Text>
                <Text
                  style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Play audio cues on correct and incorrect quiz answers.
                </Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* 5. NOTIFICATIONS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Notifications
          </Text>

          <View
            style={[
              styles.groupedCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}>
            {/* Daily Reminder */}
            <View style={styles.settingSwitchRow}>
              <View style={styles.settingLabelBox}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Daily Study Reminder
                </Text>
                <Text
                  style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Scheduled alert at 8:00 PM to maintain your daily streak.
                </Text>
              </View>
              <Switch
                value={dailyReminder}
                onValueChange={setDailyReminder}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View
              style={[styles.itemDivider, { backgroundColor: colors.border }]}
            />

            {/* Weekly Summary */}
            <View style={styles.settingSwitchRow}>
              <View style={styles.settingLabelBox}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Weekly Readiness Report
                </Text>
                <Text
                  style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Receive weekly analytics on syllabus coverage and weak topics.
                </Text>
              </View>
              <Switch
                value={weeklyReport}
                onValueChange={setWeeklyReport}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View
              style={[styles.itemDivider, { backgroundColor: colors.border }]}
            />

            {/* Exam Alerts */}
            <View style={styles.settingSwitchRow}>
              <View style={styles.settingLabelBox}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  PRC Exam Schedule Alerts
                </Text>
                <Text
                  style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Updates regarding official PRC ALE deadlines and schedules.
                </Text>
              </View>
              <Switch
                value={examAlerts}
                onValueChange={setExamAlerts}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* 6. ACCOUNT */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Account
          </Text>

          <View
            style={[
              styles.groupedCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}>
            {/* Sync Row */}
            <View style={styles.accountActionRow}>
              <View style={styles.accountInfoBox}>
                <Text style={[styles.accountLabel, { color: colors.text }]}>
                  Cloud Backup & Local Sync
                </Text>
                <Text
                  style={[
                    styles.accountSubtext,
                    { color: colors.textSecondary },
                  ]}>
                  {isSyncing ? 'Syncing...' : 'Local SQLite Synced • Online'}
                </Text>
              </View>
              <Pressable
                disabled={isSyncing}
                onPress={handleManualSync}
                style={({ pressed }) => [
                  styles.syncBtn,
                  {
                    backgroundColor: colors.backgroundSelected,
                    borderColor: colors.borderStrong,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}>
                <Cloud size={13} color={colors.accent} />
                <Text style={[styles.syncBtnText, { color: colors.text }]}>
                  Sync Now
                </Text>
              </Pressable>
            </View>

            <View
              style={[styles.itemDivider, { backgroundColor: colors.border }]}
            />

            {/* Reset Stats Option */}
            <Pressable
              onPress={handleResetProgress}
              style={({ pressed }) => [
                styles.accountLinkRow,
                { opacity: pressed ? 0.7 : 1 },
              ]}>
              <View style={styles.accountLinkInfo}>
                <Text style={[styles.resetText, { color: '#EF4444' }]}>
                  Reset Study Analytics
                </Text>
                <Text
                  style={[
                    styles.accountSubtext,
                    { color: colors.textSecondary },
                  ]}>
                  Clear recorded drill logs and accuracy percentages.
                </Text>
              </View>
              <RotateCcw size={15} color="#EF4444" />
            </Pressable>

            <View
              style={[styles.itemDivider, { backgroundColor: colors.border }]}
            />

            {/* Logout Option */}
            <Pressable
              onPress={handleSignOut}
              style={({ pressed }) => [
                styles.accountLinkRow,
                { opacity: pressed ? 0.7 : 1 },
              ]}>
              <View style={styles.accountLinkInfo}>
                <Text style={[styles.resetText, { color: '#EF4444' }]}>
                  Sign Out
                </Text>
                <Text
                  style={[
                    styles.accountSubtext,
                    { color: colors.textSecondary },
                  ]}>
                  Log out of your LICENSIFY account.
                </Text>
              </View>
              <LogOut size={15} color="#EF4444" />
            </Pressable>
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
    paddingTop: 12,
    gap: 22,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -4,
  },
  kicker: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  yearPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  yearPillText: {
    fontSize: 11,
    fontWeight: '700',
  },

  /* Profile Card */
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  role: {
    fontSize: 11.5,
    lineHeight: 15,
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
  groupedCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  itemDivider: {
    height: 1,
    marginHorizontal: 16,
  },

  /* Overall Statistics & Streak */
  streakRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakIconBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  streakCount: {
    fontSize: 15,
    fontWeight: '800',
  },
  streakSub: {
    fontSize: 11.5,
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: 22,
  },

  /* Achievements */
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  achieveIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  achieveInfo: {
    flex: 1,
    gap: 2,
  },
  achieveTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  achieveDesc: {
    fontSize: 11.5,
    lineHeight: 15,
  },
  unlockedBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  unlockedText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  progressAchieveText: {
    fontSize: 11,
    fontWeight: '600',
  },

  /* Settings & Notifications */
  settingSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  settingLabelBox: {
    flex: 1,
    gap: 2,
  },
  settingTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  settingDesc: {
    fontSize: 11.5,
    lineHeight: 15,
  },
  themeSelectorRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  themeLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  themeOptionsGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOptionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  themeOptionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },

  /* Account */
  accountActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 10,
  },
  accountInfoBox: {
    flex: 1,
    gap: 2,
  },
  accountLabel: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  accountSubtext: {
    fontSize: 11.5,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  syncBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  accountLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 10,
  },
  accountLinkInfo: {
    flex: 1,
    gap: 2,
  },
  resetText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});
