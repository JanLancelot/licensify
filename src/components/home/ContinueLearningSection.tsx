import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { trackLessonInteraction } from '@/hooks/useLocalData';
import { useAppTheme } from '@/context/theme-context';

export interface ContinueItem {
  id: string;
  title: string;
  percent: number;
  done: number;
  total: number;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  lastActiveTimestamp: number;
  nextLessonId?: string;
  nextTopicId?: string;
}

interface ContinueLearningSectionProps {
  continueItems: ContinueItem[];
}

export function ContinueLearningSection({
  continueItems,
}: ContinueLearningSectionProps) {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();

  if (continueItems.length === 0) return null;

  return (
    <View style={styles.sectionContainer}>
      {/* Section Header Row with Vertical Accent Bar */}
      <View style={styles.continueSectionHeader}>
        <View
          style={[
            styles.continueHeaderAccentBar,
            { backgroundColor: colors.accent },
          ]}
        />
        <Text style={[styles.continueSectionTitle, { color: colors.text }]}>
          CONTINUE LEARNING
        </Text>
      </View>

      <View style={styles.continueCardsList}>
        {continueItems.map((item) => {
          const IconComp = item.icon;

          return (
            <Pressable
              key={item.id}
              onPress={() => {
                if (item.nextLessonId) {
                  trackLessonInteraction(item.nextLessonId);
                }
                router.push({
                  pathname: '/(tabs)/learn/notes/[lessonId]' as any,
                  params: {
                    subjectId: item.id,
                    topicId: item.nextTopicId,
                    lessonId: item.nextLessonId,
                  },
                });
              }}
              style={({ pressed }) => [
                styles.continueLearningCard,
                {
                  backgroundColor: isDark
                    ? colors.backgroundElement
                    : '#FFFFFF',
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.06)',
                  opacity: pressed ? 0.92 : 1,
                  transform: [{ scale: pressed ? 0.99 : 1 }],
                },
              ]}>
              {/* Left: Soft Tinted Circular Icon Container */}
              <View
                style={[
                  styles.circularIconWrap,
                  {
                    backgroundColor: colors.accentMuted,
                    borderColor: colors.accentBorder,
                  },
                ]}>
                <IconComp
                  size={22}
                  color={colors.accent}
                  strokeWidth={2.2}
                />
              </View>

              {/* Middle: Title & % on header row, Progress track below */}
              <View style={styles.continueCardContent}>
                <View style={styles.continueCardHeaderRow}>
                  <Text
                    style={[
                      styles.continueSubjectTitle,
                      { color: colors.text },
                    ]}>
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.continuePercentBadge,
                      { color: colors.accent },
                    ]}>
                    {item.percent}%
                  </Text>
                </View>

                {/* Progress Track */}
                <View
                  style={[
                    styles.continueProgressTrack,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.10)'
                        : 'rgba(239, 241, 245, 1)',
                    },
                  ]}>
                  <View
                    style={[
                      styles.continueProgressFill,
                      {
                        width: `${item.percent}%`,
                        backgroundColor: colors.accent,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Right Divider & Circular Chevron Action Button */}
              <View
                style={[
                  styles.continueRightDivider,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.06)',
                  },
                ]}
              />

              <View
                style={[
                  styles.chevronCircleWrap,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.06)'
                      : '#F8FAFC',
                  },
                ]}>
                <ChevronRight
                  size={18}
                  color={colors.text}
                  strokeWidth={2.4}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    gap: 12,
  },
  continueSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  continueHeaderAccentBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
  continueSectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  continueCardsList: {
    gap: 12,
  },
  continueLearningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 22,
    borderWidth: 1,
    gap: 14,
  },
  circularIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueCardContent: {
    flex: 1,
    gap: 8,
  },
  continueCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  continueSubjectTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 0.3,
    flex: 1,
  },
  continuePercentBadge: {
    fontSize: 14,
    fontWeight: '900',
  },
  continueProgressTrack: {
    height: 7,
    borderRadius: 3.5,
    overflow: 'hidden',
    width: '100%',
  },
  continueProgressFill: {
    height: '100%',
    borderRadius: 3.5,
  },
  continueRightDivider: {
    width: 1,
    height: 32,
    marginHorizontal: 2,
  },
  chevronCircleWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
