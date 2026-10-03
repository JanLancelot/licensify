import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { X } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from 'react-native-reanimated';
import { Radius } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

const STORAGE_KEY = 'app_whats_new_dismissed_v1';
const WEB_STORAGE_KEY = '@app_whats_new_dismissed_v1';

export function WhatsNewCard() {
  const { colors, isDark } = useAppTheme();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const checkDismissed = async () => {
      try {
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined' && window.localStorage) {
            const dismissed = window.localStorage.getItem(WEB_STORAGE_KEY);
            if (dismissed === 'true') {
              setIsVisible(false);
            }
          }
          return;
        }
        const dismissed = await SecureStore.getItemAsync(STORAGE_KEY);
        if (dismissed === 'true') {
          setIsVisible(false);
        }
      } catch {
        // Fallback gracefully
      }
    };
    checkDismissed();
  }, []);

  const handleDismiss = async () => {
    setIsVisible(false);
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(WEB_STORAGE_KEY, 'true');
        }
        return;
      }
      await SecureStore.setItemAsync(STORAGE_KEY, 'true');
    } catch {
      // Fallback gracefully
    }
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutUp.duration(200)}
      layout={LinearTransition.springify()}
      style={[
        styles.announcementCard,
        {
          backgroundColor: isDark ? colors.backgroundElement : '#FFFFFF',
          borderColor: isDark
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(0, 0, 0, 0.06)',
        },
      ]}>
      {/* Top Header Row: Badge & Dismiss (X) Button */}
      <View style={styles.announcementTopRow}>
        <View
          style={[
            styles.announcementBadge,
            {
              backgroundColor: colors.accentMuted,
              borderColor: colors.accentBorder,
            },
          ]}>
          <Text
            style={[
              styles.announcementBadgeText,
              { color: colors.accent },
            ]}>
            WHAT'S NEW
          </Text>
        </View>

        <Pressable
          onPress={handleDismiss}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => [
            styles.announcementCloseBtn,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.06)'
                : 'rgba(0, 0, 0, 0.04)',
              opacity: pressed ? 0.7 : 1,
            },
          ]}>
          <X size={15} color={colors.textSecondary} strokeWidth={2.4} />
        </Pressable>
      </View>

      {/* Content Area with Multiple Update Sections */}
      <View style={styles.announcementBody}>
        {/* Section 1 */}
        <View style={styles.announcementSection}>
          <Text
            style={[
              styles.announcementSectionTitle,
              { color: isDark ? '#F9FAFB' : '#0F172A' },
            ]}>
            UI & Experience Redesign
          </Text>
          <View style={styles.announcementBulletList}>
            <View style={styles.announcementBulletRow}>
              <View
                style={[
                  styles.announcementBulletDot,
                  { backgroundColor: colors.accent },
                ]}
              />
              <Text
                style={[
                  styles.announcementBulletText,
                  { color: colors.textSecondary },
                ]}>
                Smoother page navigation transitions with zero screen flickering
              </Text>
            </View>
            <View style={styles.announcementBulletRow}>
              <View
                style={[
                  styles.announcementBulletDot,
                  { backgroundColor: colors.accent },
                ]}
              />
              <Text
                style={[
                  styles.announcementBulletText,
                  { color: colors.textSecondary },
                ]}>
                Refined dark & light themes with harmonized accent color palettes
              </Text>
            </View>
          </View>
        </View>

        {/* Section 2 */}
        <View style={styles.announcementSection}>
          <Text
            style={[
              styles.announcementSectionTitle,
              { color: isDark ? '#F9FAFB' : '#0F172A' },
            ]}>
            Study Modules & Materials
          </Text>
          <View style={styles.announcementBulletList}>
            <View style={styles.announcementBulletRow}>
              <View
                style={[
                  styles.announcementBulletDot,
                  { backgroundColor: colors.accent },
                ]}
              />
              <Text
                style={[
                  styles.announcementBulletText,
                  { color: colors.textSecondary },
                ]}>
                Updated comprehensive syllabus lesson notes with auto-saving progress
              </Text>
            </View>
            <View style={styles.announcementBulletRow}>
              <View
                style={[
                  styles.announcementBulletDot,
                  { backgroundColor: colors.accent },
                ]}
              />
              <Text
                style={[
                  styles.announcementBulletText,
                  { color: colors.textSecondary },
                ]}>
                Smart flashcard decks with active recall and mastery tracking
              </Text>
            </View>
          </View>
        </View>

        {/* Section 3 */}
        <View style={styles.announcementSection}>
          <Text
            style={[
              styles.announcementSectionTitle,
              { color: isDark ? '#F9FAFB' : '#0F172A' },
            ]}>
            Performance & Reliability
          </Text>
          <View style={styles.announcementBulletList}>
            <View style={styles.announcementBulletRow}>
              <View
                style={[
                  styles.announcementBulletDot,
                  { backgroundColor: colors.accent },
                ]}
              />
              <Text
                style={[
                  styles.announcementBulletText,
                  { color: colors.textSecondary },
                ]}>
                Faster offline caching and instant board exam drills loading
              </Text>
            </View>
            <View style={styles.announcementBulletRow}>
              <View
                style={[
                  styles.announcementBulletDot,
                  { backgroundColor: colors.accent },
                ]}
              />
              <Text
                style={[
                  styles.announcementBulletText,
                  { color: colors.textSecondary },
                ]}>
                Enhanced cloud synchronization with automatic retry support
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Actions Row */}
      <View style={styles.announcementFooter}>
        <Pressable
          onPress={handleDismiss}
          style={({ pressed }) => [
            styles.announcementActionBtn,
            {
              backgroundColor: colors.accent,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}>
          <Text style={styles.announcementActionBtnText}>Got it</Text>
        </Pressable>

        <Pressable
          onPress={handleDismiss}
          style={({ pressed }) => [
            styles.announcementDismissBtn,
            {
              opacity: pressed ? 0.6 : 1,
            },
          ]}>
          <Text
            style={[
              styles.announcementDismissText,
              { color: colors.textSecondary },
            ]}>
            Dismiss
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  announcementCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  announcementTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  announcementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  announcementBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  announcementCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  announcementBody: {
    gap: 12,
  },
  announcementSection: {
    gap: 6,
  },
  announcementSectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  announcementBulletList: {
    gap: 6,
  },
  announcementBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  announcementBulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 6,
  },
  announcementBulletText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  announcementFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  announcementActionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  announcementActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  announcementDismissBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  announcementDismissText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
