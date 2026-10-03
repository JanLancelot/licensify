import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { Flame, User } from 'lucide-react-native';
import { Radius } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

interface HomeHeroCardProps {
  displayAvatarUri: string | null;
  streakDays: number;
  milestoneTarget: number;
  streakProgressPercent: number;
}

export function HomeHeroCard({
  displayAvatarUri,
  streakDays,
  milestoneTarget,
  streakProgressPercent,
}: HomeHeroCardProps) {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();

  return (
    <View
      style={[
        styles.mainHeroCard,
        {
          backgroundColor: isDark ? colors.backgroundElement : '#FFFFFF',
          borderColor: isDark
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(0, 0, 0, 0.06)',
        },
      ]}>
      {/* Left: Large User Profile Circular Avatar */}
      <Pressable
        onPress={() => router.push('/(tabs)/profile' as any)}
        style={({ pressed }) => [
          styles.heroAvatarBox,
          {
            backgroundColor: colors.accentMuted,
            borderColor: colors.accentBorder,
            opacity: pressed ? 0.85 : 1,
          },
        ]}>
        {displayAvatarUri ? (
          <ExpoImage
            source={{ uri: displayAvatarUri }}
            style={styles.heroAvatarImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <User size={46} color={colors.accent} strokeWidth={2.3} />
        )}
      </Pressable>

      {/* Right Column: Centered Flame, DAYS, and Milestone Progress */}
      <View style={styles.heroRightColumn}>
        <View style={styles.heroStreakCenteredBox}>
          <Flame size={50} color="#F59E0B" fill="#F59E0B" />
          <Text
            style={[
              styles.heroStreakText,
              { color: isDark ? '#FBBF24' : '#D97706' },
            ]}>
            {streakDays} {streakDays === 1 ? 'DAY' : 'DAYS'}
          </Text>
        </View>

        {/* Dynamic Streak Progress & Milestone Voucher Caption */}
        <View style={styles.heroBottomProgressArea}>
          <View
            style={[
              styles.heroProgressTrack,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.10)'
                  : 'rgba(0, 0, 0, 0.06)',
              },
            ]}>
            <View
              style={[
                styles.heroProgressFill,
                {
                  width: `${streakProgressPercent}%`,
                  backgroundColor: colors.accent,
                },
              ]}
            />
          </View>

          <Text
            style={[
              styles.heroMilestoneVoucherText,
              { color: colors.textSecondary },
            ]}>
            {streakDays >= milestoneTarget
              ? 'MILESTONE ACHIEVED! DISCOUNT VOUCHER UNLOCKED'
              : `COMPLETE ${milestoneTarget} DAYS TO GET DISCOUNT VOUCHER`}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainHeroCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroAvatarBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  heroRightColumn: {
    flex: 1,
    gap: 10,
    justifyContent: 'center',
  },
  heroStreakCenteredBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    alignSelf: 'center',
  },
  heroStreakText: {
    fontSize: 14.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  heroBottomProgressArea: {
    gap: 5,
    width: '100%',
  },
  heroProgressTrack: {
    height: 6,
    borderRadius: Radius.full,
    overflow: 'hidden',
    width: '100%',
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  heroMilestoneVoucherText: {
    fontSize: 8.8,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
