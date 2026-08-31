import { useAuthActions } from '@convex-dev/auth/react';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import {
  Award,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Flame,
  HelpCircle,
  Info,
  LogOut,
  Mail,
  Moon,
  Palette,
  Smartphone,
  Star,
  Sun,
  Trophy,
  User,
  Volume2,
  X,
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
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ACCENT_THEME_LIST, AccentThemeKey } from '@/constants/theme';
import { ThemeMode, useAppTheme } from '@/context/theme-context';
import { api } from '../../../convex/_generated/api';
import { useSyncService } from '@/services/useSyncService';

// Preset Achievements for the Horizontal Box Carousel
interface AchievementItem {
  id: string;
  title: string;
  category: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  bg: string;
  darkBg: string;
  iconColor: string;
  isUnlocked: boolean;
  progressText: string;
}

const ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 'ach_1',
    title: 'Code Master',
    category: 'Rule 7 & 8',
    icon: Trophy,
    bg: '#FEF3C7',
    darkBg: 'rgba(245, 158, 11, 0.2)',
    iconColor: '#D97706',
    isUnlocked: true,
    progressText: 'Unlocked',
  },
  {
    id: 'ach_2',
    title: 'Rapid Recall',
    category: 'Flashcard Drills',
    icon: Zap,
    bg: '#EDE9FE',
    darkBg: 'rgba(139, 92, 246, 0.2)',
    iconColor: '#7C3AED',
    isUnlocked: true,
    progressText: 'Unlocked',
  },
  {
    id: 'ach_3',
    title: '14-Day Streak',
    category: 'Consistency',
    icon: Flame,
    bg: '#FFEDD5',
    darkBg: 'rgba(249, 115, 22, 0.2)',
    iconColor: '#EA580C',
    isUnlocked: true,
    progressText: 'Unlocked',
  },
  {
    id: 'ach_4',
    title: 'Area 1 Specialist',
    category: 'Mock Exam',
    icon: Star,
    bg: '#E0F2FE',
    darkBg: 'rgba(14, 165, 233, 0.2)',
    iconColor: '#0284C7',
    isUnlocked: false,
    progressText: '2/3 Done',
  },
  {
    id: 'ach_5',
    title: 'Perfectionist',
    category: '100% Score',
    icon: Award,
    bg: '#FCE7F3',
    darkBg: 'rgba(236, 72, 153, 0.2)',
    iconColor: '#DB2777',
    isUnlocked: false,
    progressText: '1/5 Done',
  },
];

/* Circular Pastel Icon Badge */
function SettingPastelBadge({
  icon: IconComponent,
  bg,
  darkBg,
  iconColor,
  isDark,
  size = 40,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  bg: string;
  darkBg: string;
  iconColor: string;
  isDark: boolean;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: isDark ? darkBg : bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <IconComponent size={20} color={iconColor} strokeWidth={2.2} />
    </View>
  );
}

export default function ProfileScreen() {
  const { colors, themeMode, setThemeMode, accentTheme, setAccentTheme, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuthActions();

  // Convex profile and mutation
  const userProfile = useQuery(api.users.getCurrentUserProfile);
  const updateProfileMutation = useMutation(api.users.updateProfile);
  const { syncDown, syncUp, syncProgress, lastSyncedAt } = useSyncService();

  // User info state
  const [customUserName, setCustomUserName] = useState<string | null>(null);
  const [customUserEmail, setCustomUserEmail] = useState<string | null>(null);

  const remoteFullName = userProfile
    ? [userProfile.firstName, userProfile.lastName].filter(Boolean).join(' ') || userProfile.username
    : null;
  const userName = customUserName ?? remoteFullName ?? 'Candidate Examinee';
  const userEmail = customUserEmail ?? userProfile?.email ?? 'candidate@archiapp.com';

  // Modals state
  const [isEditProfileVisible, setIsEditProfileVisible] = useState(false);
  const [isSeeAllAchievementsVisible, setIsSeeAllAchievementsVisible] = useState(false);
  const [isSyncModalVisible, setIsSyncModalVisible] = useState(false);
  const [editNameInput, setEditNameInput] = useState('');
  const [editEmailInput, setEditEmailInput] = useState('');

  // Sign out state
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Settings switches
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const themeOptions: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
    { mode: 'system', label: 'System', icon: Smartphone },
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
  ];

  const handleSaveProfile = async () => {
    if (editNameInput.trim()) {
      setCustomUserName(editNameInput.trim());
      const parts = editNameInput.trim().split(' ');
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ') || undefined;
      try {
        await updateProfileMutation({
          firstName,
          lastName,
          username: editNameInput.trim().toLowerCase().replace(/\s+/g, '_'),
        });
      } catch (err) {
        console.warn('Failed to update remote profile:', err);
      }
    }
    if (editEmailInput.trim()) {
      let email = editEmailInput.trim().toLowerCase();
      if (!email.includes('@')) {
        email = `${email}@gmail.com`;
      } else if (!email.includes('.')) {
        email = `${email}.com`;
      }
      setCustomUserEmail(email);
    }
    setIsEditProfileVisible(false);
  };

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

  const handleManualSync = async () => {
    setIsSyncModalVisible(true);
    setIsSyncing(true);
    try {
      await syncDown();
      await syncUp();
    } catch (err) {
      console.warn('Sync notice:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* 1. Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 90 },
        ]}>
        {/* 2. CLEAN PROFILE HEADER SECTION (No Purple Box) */}
        <View style={styles.profileHeaderSection}>
          {/* Centered Circular Avatar Icon */}
          <View
            style={[
              styles.avatarWrapper,
              {
                backgroundColor: colors.accentMuted,
                borderColor: colors.accentBorder,
              },
            ]}>
            <User size={40} color={colors.accent} strokeWidth={2.3} />
          </View>

          {/* Profile Name */}
          <Text style={[styles.profileName, { color: colors.text }]}>
            {userName}
          </Text>

          {/* Email Row */}
          <View style={styles.emailRow}>
            <Mail size={13} color={colors.textSecondary} strokeWidth={2.2} />
            <Text style={[styles.emailText, { color: colors.textSecondary }]}>
              {userEmail}
            </Text>
          </View>

          {/* Edit Profile Pill Button */}
          <Pressable
            onPress={() => {
              setEditNameInput(userName);
              setEditEmailInput(userEmail);
              setIsEditProfileVisible(true);
            }}
            style={({ pressed }) => [
              styles.editProfileBtn,
              {
                backgroundColor: isDark ? '#23262F' : '#F3F4F6',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}>
            <Text style={[styles.editProfileBtnText, { color: colors.text }]}>
              Edit Profile
            </Text>
          </Pressable>
        </View>

        {/* 3. ACHIEVEMENTS HORIZONTAL CAROUSEL */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Achievements
            </Text>
            <Pressable
              onPress={() => setIsSeeAllAchievementsVisible(true)}
              hitSlop={8}
              style={styles.seeMoreBtn}>
              <Text style={[styles.seeMoreText, { color: colors.accent }]}>See all</Text>
              <ChevronRight size={15} color={colors.accent} strokeWidth={2.2} />
            </Pressable>
          </View>

          {/* Horizontal Scrolling Box Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsScroll}>
            {ACHIEVEMENTS.map((item) => {
              const IconComp = item.icon;

              return (
                <View
                  key={item.id}
                  style={[
                    styles.achievementBoxCard,
                    {
                      backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                    },
                  ]}>
                  {/* Icon Badge */}
                  <View
                    style={[
                      styles.achieveIconCircle,
                      {
                        backgroundColor: isDark ? item.darkBg : item.bg,
                      },
                    ]}>
                    <IconComp size={22} color={item.iconColor} strokeWidth={2.3} />
                  </View>

                  {/* Clean Title */}
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.achieveBoxTitle,
                      { color: isDark ? '#F9FAFB' : '#111827' },
                    ]}>
                    {item.title}
                  </Text>

                  {/* Minimal Progress Badge */}
                  <View
                    style={[
                      styles.achieveStatusTag,
                      {
                        backgroundColor: item.isUnlocked
                          ? isDark
                            ? 'rgba(16, 185, 129, 0.2)'
                            : '#D1FAE5'
                          : isDark
                            ? 'rgba(255, 255, 255, 0.06)'
                            : '#F3F4F6',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.achieveStatusText,
                        {
                          color: item.isUnlocked
                            ? '#10B981'
                            : colors.textSecondary,
                        },
                      ]}>
                      {item.progressText}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* 4. PREFERENCES & THEME */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Preferences
          </Text>

          <View
            style={[
              styles.cardBoxGroup,
              {
                backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}>
            {/* Theme Mode Selector */}
            <View style={styles.themeSelectorRow}>
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
                            : '#F8FAFC',
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

            <View style={[styles.itemDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]} />

            {/* ROYGBIV Accent Theme Color Variations */}
            <View style={styles.accentPickerContainer}>
              <View style={styles.accentPickerHeaderRow}>
                <Palette size={16} color={colors.accent} strokeWidth={2.3} />
                <Text style={[styles.accentPickerTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
                  Accent Color Theme
                </Text>
              </View>

              {/* Horizontal Scroll Swatches */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.accentSwatchesRow}>
                {ACCENT_THEME_LIST.map((themeOption) => {
                  const isSelected = accentTheme === themeOption.key;
                  const swatchColor = isDark ? themeOption.dark.accent : themeOption.light.accent;

                  return (
                    <Pressable
                      key={themeOption.key}
                      onPress={() => setAccentTheme(themeOption.key)}
                      style={({ pressed }) => [
                        styles.swatchItemBtn,
                        {
                          backgroundColor: isSelected
                            ? isDark
                              ? 'rgba(255,255,255,0.08)'
                              : '#F8FAFC'
                            : 'transparent',
                          borderColor: isSelected
                            ? swatchColor
                            : isDark
                              ? 'rgba(255,255,255,0.06)'
                              : 'rgba(0,0,0,0.04)',
                          transform: [{ scale: pressed ? 0.92 : 1 }],
                        },
                      ]}>
                      {/* Minimalist Solid Swatch Circle with Selection Checkmark */}
                      <View
                        style={[
                          styles.swatchCircle,
                          {
                            backgroundColor: swatchColor,
                            shadowColor: swatchColor,
                          },
                        ]}>
                        {isSelected && (
                          <Check size={18} color="#FFFFFF" strokeWidth={3.2} />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={[styles.itemDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]} />

            {/* Sound Feedback */}
            <View style={styles.settingItemRow}>
              <SettingPastelBadge
                icon={Volume2}
                bg="#EDE9FE"
                darkBg="rgba(139, 92, 246, 0.2)"
                iconColor="#7C3AED"
                isDark={isDark}
              />
              <Text style={[styles.settingItemTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
                Sound Effects
              </Text>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: isDark ? '#374151' : '#D1D5DB', true: colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.itemDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]} />

            {/* Daily Reminder */}
            <View style={styles.settingItemRow}>
              <SettingPastelBadge
                icon={Bell}
                bg="#FCE7F3"
                darkBg="rgba(236, 72, 153, 0.2)"
                iconColor="#DB2777"
                isDark={isDark}
              />
              <Text style={[styles.settingItemTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
                Daily Reminder
              </Text>
              <Switch
                value={dailyReminder}
                onValueChange={setDailyReminder}
                trackColor={{ false: isDark ? '#374151' : '#D1D5DB', true: colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* 5. GENERAL SETTINGS & LINKS */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Account & Help
          </Text>

          <View
            style={[
              styles.cardBoxGroup,
              {
                backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}>
            {/* Cloud Sync */}
            <Pressable
              onPress={handleManualSync}
              disabled={isSyncing}
              style={({ pressed }) => [
                styles.navItemRow,
                { opacity: pressed ? 0.7 : 1 },
              ]}>
              <SettingPastelBadge
                icon={Cloud}
                bg="#E0F2FE"
                darkBg="rgba(14, 165, 233, 0.2)"
                iconColor="#0284C7"
                isDark={isDark}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingItemTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
                  Cloud Backup
                </Text>
                {lastSyncedAt ? (
                  <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
                    Last synced {new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                ) : null}
              </View>
              {isSyncing ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.accent }}>
                    {syncProgress.percentage}%
                  </Text>
                  <ActivityIndicator size="small" color={colors.accent} />
                </View>
              ) : (
                <ChevronRight size={18} color={isDark ? '#9CA3AF' : '#4B5563'} strokeWidth={2.2} />
              )}
            </Pressable>

            <View style={[styles.itemDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]} />

            {/* Legal Information */}
            <Pressable
              onPress={() => Alert.alert('Legal Information', 'Architecture Licensure Exam Prep Terms & Privacy Policy.')}
              style={({ pressed }) => [
                styles.navItemRow,
                { opacity: pressed ? 0.7 : 1 },
              ]}>
              <SettingPastelBadge
                icon={Info}
                bg="#EDE9FE"
                darkBg="rgba(139, 92, 246, 0.2)"
                iconColor="#7C3AED"
                isDark={isDark}
              />
              <Text style={[styles.settingItemTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
                Legal Information
              </Text>
              <ChevronRight size={18} color={isDark ? '#9CA3AF' : '#4B5563'} strokeWidth={2.2} />
            </Pressable>

            <View style={[styles.itemDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]} />

            {/* Help and Support */}
            <Pressable
              onPress={() => Alert.alert('Help & Support', 'Reach us anytime at support@boardexamprep.com')}
              style={({ pressed }) => [
                styles.navItemRow,
                { opacity: pressed ? 0.7 : 1 },
              ]}>
              <SettingPastelBadge
                icon={HelpCircle}
                bg="#E0F2FE"
                darkBg="rgba(14, 165, 233, 0.2)"
                iconColor="#0284C7"
                isDark={isDark}
              />
              <Text style={[styles.settingItemTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
                Help and Support
              </Text>
              <ChevronRight size={18} color={isDark ? '#9CA3AF' : '#4B5563'} strokeWidth={2.2} />
            </Pressable>
          </View>
        </View>

        {/* 6. SIGN OUT BUTTON */}
        <Pressable
          onPress={handleSignOut}
          disabled={isSigningOut}
          style={({ pressed }) => [
            styles.signOutCardBox,
            {
              backgroundColor: isDark ? '#231B19' : '#FEF2F2',
              borderColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
              opacity: pressed ? 0.8 : 1,
            },
          ]}>
          <LogOut size={18} color="#EF4444" strokeWidth={2.4} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal visible={isEditProfileVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.editModalBox,
              { backgroundColor: isDark ? '#1C1F26' : '#FFFFFF' },
            ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
                Edit Profile
              </Text>
              <Pressable
                onPress={() => setIsEditProfileVisible(false)}
                hitSlop={8}
                style={styles.modalCloseBtn}>
                <X size={18} color={isDark ? '#9CA3AF' : '#4B5563'} strokeWidth={2.4} />
              </Pressable>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Full Name</Text>
                <TextInput
                  value={editNameInput}
                  onChangeText={setEditNameInput}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textSecondary}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: isDark ? '#23262F' : '#F9FAFB',
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
                      color: isDark ? '#F9FAFB' : '#111827',
                    },
                  ]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email Address</Text>
                <TextInput
                  value={editEmailInput}
                  onChangeText={setEditEmailInput}
                  placeholder="e.g. johndoe@gmail.com"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: isDark ? '#23262F' : '#F9FAFB',
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
                      color: isDark ? '#F9FAFB' : '#111827',
                    },
                  ]}
                />
              </View>

              <Pressable
                onPress={handleSaveProfile}
                style={({ pressed }) => [
                  styles.saveModalBtn,
                  {
                    backgroundColor: colors.accent,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}>
                <Text style={styles.saveModalBtnText}>Save Changes</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* SEE ALL ACHIEVEMENTS MODAL */}
      <Modal visible={isSeeAllAchievementsVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.seeAllModalBox,
              { backgroundColor: isDark ? '#1C1F26' : '#FFFFFF' },
            ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
                All Achievements
              </Text>
              <Pressable
                onPress={() => setIsSeeAllAchievementsVisible(false)}
                hitSlop={8}
                style={styles.modalCloseBtn}>
                <X size={18} color={isDark ? '#9CA3AF' : '#4B5563'} strokeWidth={2.4} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              <View style={styles.seeAllList}>
                {ACHIEVEMENTS.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.seeAllItemRow,
                        {
                          backgroundColor: isDark ? '#23262F' : '#F9FAFB',
                          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                        },
                      ]}>
                      <View
                        style={[
                          styles.achieveIconCircle,
                          {
                            backgroundColor: isDark ? item.darkBg : item.bg,
                          },
                        ]}>
                        <IconComp size={20} color={item.iconColor} strokeWidth={2.3} />
                      </View>
                      <View style={{ flex: 1, gap: 2, alignItems: 'flex-start' }}>
                        <Text
                          style={[
                            styles.seeAllItemTitle,
                            { color: isDark ? '#F9FAFB' : '#111827' },
                          ]}>
                          {item.title}
                        </Text>
                        <Text
                          style={[
                            styles.seeAllItemCategory,
                            { color: colors.textSecondary },
                          ]}>
                          {item.category}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.achieveStatusTag,
                          {
                            backgroundColor: item.isUnlocked
                              ? isDark
                                ? 'rgba(16, 185, 129, 0.2)'
                                : '#D1FAE5'
                              : isDark
                                ? 'rgba(255, 255, 255, 0.06)'
                                : '#F3F4F6',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.achieveStatusText,
                            {
                              color: item.isUnlocked
                                ? '#10B981'
                                : colors.textSecondary,
                            },
                          ]}>
                          {item.progressText}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
            <Text style={[styles.loadingTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
              Signing Out...
            </Text>
          </View>
        </Animated.View>
      </Modal>

      {/* CLOUD BACKUP PROGRESS MODAL */}
      <Modal visible={isSyncModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.syncModalBox,
              { backgroundColor: isDark ? '#1C1F26' : '#FFFFFF' },
            ]}>
            {/* Header Icon */}
            <View style={styles.syncHeaderIconRow}>
              <View
                style={[
                  styles.syncIconCircle,
                  {
                    backgroundColor: syncProgress.step === 'complete'
                      ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5')
                      : syncProgress.step === 'error'
                        ? (isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2')
                        : (isDark ? 'rgba(2, 132, 199, 0.2)' : '#E0F2FE'),
                  },
                ]}>
                {syncProgress.step === 'complete' ? (
                  <CheckCircle2 size={32} color="#10B981" strokeWidth={2.4} />
                ) : syncProgress.step === 'error' ? (
                  <X size={32} color="#EF4444" strokeWidth={2.4} />
                ) : (
                  <Cloud size={32} color={colors.accent} strokeWidth={2.4} />
                )}
              </View>
            </View>

            {/* Title & Percentage */}
            <Text style={[styles.syncModalTitle, { color: colors.text }]}>
              {syncProgress.step === 'complete' ? 'Sync Complete' : 'Cloud Backup'}
            </Text>
            <Text style={[styles.syncPercentageText, { color: syncProgress.step === 'complete' ? '#10B981' : colors.accent }]}>
              {syncProgress.percentage}%
            </Text>

            {/* Smooth Track Bar */}
            <View
              style={[
                styles.syncProgressBarTrack,
                { backgroundColor: isDark ? '#23262F' : '#F1F5F9' },
              ]}>
              <View
                style={[
                  styles.syncProgressBarFill,
                  {
                    width: `${syncProgress.percentage}%`,
                    backgroundColor: syncProgress.step === 'complete' ? '#10B981' : colors.accent,
                  },
                ]}
              />
            </View>

            {/* Live Message */}
            <Text
              numberOfLines={2}
              style={[styles.syncMessageText, { color: colors.textSecondary }]}>
              {syncProgress.message}
            </Text>

            {/* Action / Done Button */}
            <Pressable
              onPress={() => setIsSyncModalVisible(false)}
              disabled={isSyncing && syncProgress.step !== 'complete' && syncProgress.step !== 'error'}
              style={({ pressed }) => [
                styles.syncDoneBtn,
                {
                  backgroundColor: (isSyncing && syncProgress.step !== 'complete' && syncProgress.step !== 'error')
                    ? (isDark ? '#23262F' : '#E2E8F0')
                    : (syncProgress.step === 'complete' ? '#10B981' : colors.accent),
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              {isSyncing && syncProgress.step !== 'complete' && syncProgress.step !== 'error' ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator size="small" color={colors.textSecondary} />
                  <Text style={[styles.syncDoneBtnText, { color: colors.textSecondary }]}>
                    Syncing...
                  </Text>
                </View>
              ) : (
                <Text style={styles.syncDoneBtnText}>
                  {syncProgress.step === 'complete' ? 'Done' : 'Close'}
                </Text>
              )}
            </Pressable>
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
    paddingTop: 6,
    gap: 18,
  },
  profileHeaderSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emailText: {
    fontSize: 13.5,
    fontWeight: '500',
  },
  editProfileBtn: {
    paddingVertical: 7,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 6,
  },
  editProfileBtnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  sectionContainer: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  seeMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeMoreText: {
    fontSize: 13,
    fontWeight: '700',
  },
  achievementsScroll: {
    gap: 12,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  achievementBoxCard: {
    width: 136,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
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
  achieveIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achieveBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  achieveStatusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  achieveStatusText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  cardBoxGroup: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
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
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      },
    }),
  },
  themeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 6,
  },
  themeOptionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 12,
  },
  themeOptionBtnText: {
    fontSize: 12,
  },
  accentPickerContainer: {
    paddingVertical: 10,
    gap: 8,
  },
  accentPickerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  accentPickerTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  accentSwatchesRow: {
    gap: 8,
    paddingVertical: 4,
  },
  swatchItemBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    borderRadius: 22,
    borderWidth: 2,
  },
  swatchCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  swatchLetter: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  itemDivider: {
    height: 1,
    marginVertical: 4,
  },
  settingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 14,
  },
  settingItemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  navItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 14,
  },
  signOutCardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 4,
  },
  signOutText: {
    color: '#EF4444',
    fontSize: 14.5,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  editModalBox: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    gap: 18,
  },
  seeAllModalBox: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalForm: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14.5,
    fontWeight: '600',
  },
  saveModalBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  saveModalBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  seeAllList: {
    gap: 10,
    paddingVertical: 6,
  },
  seeAllItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  seeAllItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
    textAlign: 'left',
  },
  seeAllItemCategory: {
    fontSize: 11.5,
    fontWeight: '500',
    textAlign: 'left',
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
  syncModalBox: {
    width: '88%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  syncHeaderIconRow: {
    marginBottom: 12,
  },
  syncIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  syncPercentageText: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  syncProgressBarTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 14,
  },
  syncProgressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  syncMessageText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    minHeight: 36,
  },
  syncDoneBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
