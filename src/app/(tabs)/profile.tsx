import { useAuthActions } from '@convex-dev/auth/react';
import { useRouter } from 'expo-router';
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Flame,
  Lock,
  LogOut,
  Moon,
  RotateCcw,
  Shield,
  Smartphone,
  Sparkles,
  Sun,
  Trophy,
  User,
  Volume2,
  Zap,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { ThemeMode, useAppTheme } from '@/context/theme-context';

/* Gradient Squircle Icon */
function ProfileGradientIcon({
  icon: IconComponent,
  colors: [startColor, endColor],
  size = 46,
  borderRadius = 15,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  colors: [string, string];
  size?: number;
  borderRadius?: number;
}) {
  const gradId = `prof_grad_${startColor.replace(/[^a-zA-Z0-9]/g, '')}_${endColor.replace(/[^a-zA-Z0-9]/g, '')}_${size}`;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={startColor} />
            <Stop offset="100%" stopColor={endColor} />
          </LinearGradient>
        </Defs>
        <Rect
          width={size}
          height={size}
          rx={borderRadius}
          fill={`url(#${gradId})`}
        />
      </Svg>
      <IconComponent size={Math.round(size * 0.48)} color="#FFFFFF" strokeWidth={2.2} />
    </View>
  );
}

export default function ProfileScreen() {
  const { colors, themeMode, setThemeMode, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = () => {
    const doSignOut = async () => {
      setIsSigningOut(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 600));
        await signOut();
        router.replace('/(auth)/login' as any);
      } catch (e) {
        console.error('Sign out error:', e);
        setIsSigningOut(false);
      }
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Are you sure you want to sign out?')) {
        doSignOut();
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out of your account?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: doSignOut },
      ]);
    }
  };

  // Settings State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const themeOptions: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
    { mode: 'system', label: 'System', icon: Smartphone },
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
  ];

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      Alert.alert('Database Synced', 'Your study progress, presets, and quiz history are up to date.');
    }, 800);
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Study Statistics',
      'Are you sure you want to reset your quiz history and practice analytics? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => Alert.alert('Stats Reset', 'Your analytics have been reset.'),
        },
      ]
    );
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* 1. Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
          Profile
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 90 },
        ]}>
        {/* 2. USER PROFILE CARD */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
            },
          ]}>
          <ProfileGradientIcon
            icon={User}
            colors={['#E58368', '#C85A32']}
            size={60}
            borderRadius={20}
          />

          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
              Engr. Board Examinee
            </Text>
            <Text style={[styles.role, { color: colors.textSecondary }]}>
              johndoe@gmail.com
            </Text>
            <View
              style={[
                styles.candidatePill,
                {
                  backgroundColor: isDark
                    ? 'rgba(224, 122, 95, 0.2)'
                    : '#F8EAE4',
                },
              ]}>
              <Text style={[styles.candidatePillText, { color: colors.accent }]}>
                ALE 2026 Candidate
              </Text>
            </View>
          </View>
        </View>

        {/* 3. STUDY STREAK & OVERALL STATISTICS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
            Overall Statistics
          </Text>

          <View
            style={[
              styles.groupedCard,
              {
                backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
              },
            ]}>
            {/* Streak Banner */}
            <View style={styles.streakRow}>
              <ProfileGradientIcon
                icon={Flame}
                colors={['#F59E0B', '#D97706']}
                size={42}
                borderRadius={14}
              />
              <View style={styles.streakInfo}>
                <Text style={[styles.streakCount, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
                  14-Day Study Streak
                </Text>
                <Text style={[styles.streakSub, { color: colors.textSecondary }]}>
                  6 days until 20-Day Streak Milestone badge
                </Text>
              </View>
            </View>

            {/* 3 Core Stats Row */}
            <View style={styles.statsRow}>
              <View
                style={[
                  styles.statPillCard,
                  { backgroundColor: isDark ? '#23262F' : '#FFFFFF' },
                ]}>
                <Text style={[styles.statValue, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
                  128h
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Time Logged
                </Text>
              </View>

              <View
                style={[
                  styles.statPillCard,
                  { backgroundColor: isDark ? '#23262F' : '#FFFFFF' },
                ]}>
                <Text style={[styles.statValue, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
                  1,420
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Questions
                </Text>
              </View>

              <View
                style={[
                  styles.statPillCard,
                  { backgroundColor: isDark ? '#23262F' : '#FFFFFF' },
                ]}>
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

        {/* 4. ACHIEVEMENTS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
            Achievements
          </Text>

          <View style={styles.achievementsList}>
            {/* Achievement 1 */}
            <View
              style={[
                styles.achievementCard,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
                },
              ]}>
              <ProfileGradientIcon
                icon={Trophy}
                colors={['#E58368', '#C85A32']}
                size={44}
                borderRadius={14}
              />
              <View style={styles.achieveInfo}>
                <Text style={[styles.achieveTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
                  Code Master (Rule 7 & 8)
                </Text>
                <Text style={[styles.achieveDesc, { color: colors.textSecondary }]}>
                  Answered 100+ NBCP calculation questions correctly.
                </Text>
              </View>
              <View
                style={[
                  styles.unlockedBadge,
                  {
                    backgroundColor: isDark
                      ? 'rgba(224, 122, 95, 0.2)'
                      : '#F8EAE4',
                  },
                ]}>
                <Text style={[styles.unlockedText, { color: colors.accent }]}>
                  Unlocked
                </Text>
              </View>
            </View>

            {/* Achievement 2 */}
            <View
              style={[
                styles.achievementCard,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
                },
              ]}>
              <ProfileGradientIcon
                icon={Zap}
                colors={['#FBBF24', '#D97706']}
                size={44}
                borderRadius={14}
              />
              <View style={styles.achieveInfo}>
                <Text style={[styles.achieveTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
                  Rapid Recall
                </Text>
                <Text style={[styles.achieveDesc, { color: colors.textSecondary }]}>
                  Finished a 20-item drill in under 10 mins with &gt;85% score.
                </Text>
              </View>
              <View
                style={[
                  styles.unlockedBadge,
                  {
                    backgroundColor: isDark
                      ? 'rgba(224, 122, 95, 0.2)'
                      : '#F8EAE4',
                  },
                ]}>
                <Text style={[styles.unlockedText, { color: colors.accent }]}>
                  Unlocked
                </Text>
              </View>
            </View>

            {/* Achievement 3 (In Progress) */}
            <View
              style={[
                styles.achievementCard,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
                },
              ]}>
              <View
                style={[
                  styles.lockedIconBox,
                  { backgroundColor: isDark ? '#23262F' : '#E8E2DE' },
                ]}>
                <Lock size={18} color={colors.textSecondary} strokeWidth={2.2} />
              </View>
              <View style={styles.achieveInfo}>
                <Text style={[styles.achieveTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
                  Area 1 Specialist
                </Text>
                <Text style={[styles.achieveDesc, { color: colors.textSecondary }]}>
                  Score 85%+ on three Area 1 Mock Tests (Progress: 2/3).
                </Text>
              </View>
              <Text style={[styles.progressAchieveText, { color: colors.accent }]}>
                2/3 Done
              </Text>
            </View>
          </View>
        </View>

        {/* 5. SETTINGS & PREFERENCES */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
            Preferences
          </Text>

          <View
            style={[
              styles.groupedCard,
              {
                backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
              },
            ]}>
            {/* Theme Mode Selector */}
            <View style={styles.themeSelectorBox}>
              <Text style={[styles.fieldLabel, { color: colors.accent }]}>
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
                      style={({ pressed }) => [
                        styles.themeOptionBtn,
                        {
                          backgroundColor: isSelected
                            ? colors.accent
                            : isDark
                              ? '#23262F'
                              : '#FFFFFF',
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}>
                      <Icon
                        size={15}
                        color={isSelected ? '#FFFFFF' : colors.textSecondary}
                        strokeWidth={2.4}
                      />
                      <Text
                        style={[
                          styles.themeOptionBtnText,
                          {
                            color: isSelected ? '#FFFFFF' : isDark ? '#E2E8F0' : '#1E293B',
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={[styles.itemDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />

            {/* Sound & Haptics */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconCircle,
                    { backgroundColor: isDark ? '#23262F' : '#FFFFFF' },
                  ]}>
                  <Volume2 size={16} color={colors.accent} strokeWidth={2.2} />
                </View>
                <View style={styles.settingTextGroup}>
                  <Text style={[styles.settingTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
                    Sound & Drill Feedback
                  </Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                    Audio cues on quiz answers
                  </Text>
                </View>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: isDark ? '#374151' : '#D1D5DB', true: colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.itemDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />

            {/* Daily Reminder */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconCircle,
                    { backgroundColor: isDark ? '#23262F' : '#FFFFFF' },
                  ]}>
                  <Bell size={16} color={colors.accent} strokeWidth={2.2} />
                </View>
                <View style={styles.settingTextGroup}>
                  <Text style={[styles.settingTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
                    Daily Study Reminder
                  </Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                    Notifications for study streak
                  </Text>
                </View>
              </View>
              <Switch
                value={dailyReminder}
                onValueChange={setDailyReminder}
                trackColor={{ false: isDark ? '#374151' : '#D1D5DB', true: colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* 6. DATA MANAGEMENT */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
            Data & Sync
          </Text>

          <View
            style={[
              styles.groupedCard,
              {
                backgroundColor: isDark ? '#1C1F26' : '#F6F0ED',
              },
            ]}>
            {/* Sync Cloud */}
            <Pressable
              onPress={handleManualSync}
              disabled={isSyncing}
              style={({ pressed }) => [
                styles.actionLinkRow,
                { opacity: pressed ? 0.75 : 1 },
              ]}>
              <View style={styles.actionLinkLeft}>
                <View
                  style={[
                    styles.settingIconCircle,
                    { backgroundColor: isDark ? '#23262F' : '#FFFFFF' },
                  ]}>
                  <Cloud size={16} color={colors.accent} strokeWidth={2.2} />
                </View>
                <View style={styles.settingTextGroup}>
                  <Text style={[styles.settingTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
                    Sync with Cloud
                  </Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                    {isSyncing ? 'Syncing...' : 'Keep presets and progress backed up'}
                  </Text>
                </View>
              </View>
              {isSyncing ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <ChevronRight size={18} color={colors.accent} strokeWidth={2.2} />
              )}
            </Pressable>

            <View style={[styles.itemDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />

            {/* Reset Stats */}
            <Pressable
              onPress={handleResetProgress}
              style={({ pressed }) => [
                styles.actionLinkRow,
                { opacity: pressed ? 0.75 : 1 },
              ]}>
              <View style={styles.actionLinkLeft}>
                <View
                  style={[
                    styles.settingIconCircle,
                    { backgroundColor: isDark ? '#23262F' : '#FFFFFF' },
                  ]}>
                  <RotateCcw size={16} color="#EF4444" strokeWidth={2.2} />
                </View>
                <View style={styles.settingTextGroup}>
                  <Text style={[styles.settingTitle, { color: '#EF4444' }]}>
                    Reset Study Statistics
                  </Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                    Clear quiz records and performance history
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} strokeWidth={2.2} />
            </Pressable>
          </View>
        </View>

        {/* 7. SIGN OUT BUTTON */}
        <Pressable
          onPress={handleSignOut}
          disabled={isSigningOut}
          style={({ pressed }) => [
            styles.signOutBtn,
            {
              backgroundColor: isDark ? '#261C19' : '#FAF3F0',
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.985 : 1 }],
            },
          ]}>
          {isSigningOut ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <>
              <LogOut size={18} color={colors.accent} strokeWidth={2.4} />
              <Text style={[styles.signOutBtnText, { color: colors.accent }]}>
                Sign Out
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      {/* Signing Out Full-Screen Loading Overlay */}
      <Modal visible={isSigningOut} transparent animationType="fade">
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.loadingOverlay}>
          <View
            style={[
              styles.loadingBox,
              { backgroundColor: isDark ? '#1C1F26' : '#FFFFFF' },
            ]}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[styles.loadingTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
              Signing Out...
            </Text>
          </View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  contentContainer: {
    paddingHorizontal: 16,
    gap: 18,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 24,
    gap: 16,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  role: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  candidatePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
    marginTop: 2,
  },
  candidatePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    paddingHorizontal: 4,
  },
  groupedCard: {
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakInfo: {
    flex: 1,
    gap: 2,
  },
  streakCount: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  streakSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statPillCard: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  achievementsList: {
    gap: 10,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    gap: 12,
  },
  achieveInfo: {
    flex: 1,
    gap: 2,
  },
  achieveTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  achieveDesc: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  unlockedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unlockedText: {
    fontSize: 11,
    fontWeight: '700',
  },
  lockedIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressAchieveText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  themeSelectorBox: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
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
    paddingVertical: 10,
    borderRadius: 12,
  },
  themeOptionBtnText: {
    fontSize: 12.5,
  },
  itemDivider: {
    height: 1,
    marginVertical: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  settingIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTextGroup: {
    flex: 1,
    gap: 2,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  settingDesc: {
    fontSize: 11.5,
  },
  actionLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  actionLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 4,
  },
  signOutBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
    width: 180,
  },
  loadingTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
});
