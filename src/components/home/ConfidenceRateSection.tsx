import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from 'react-native-reanimated';
import { Radius } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

export interface ConfidenceItem {
  id: string;
  lessonName: string;
  topicName?: string;
  confidencePercent: number;
}

interface ConfidenceRateSectionProps {
  confidenceLessons: ConfidenceItem[];
}

export function ConfidenceRateSection({
  confidenceLessons,
}: ConfidenceRateSectionProps) {
  const { colors, isDark } = useAppTheme();
  const [showAllLessons, setShowAllLessons] = useState(false);

  const displayedLessons = showAllLessons
    ? confidenceLessons
    : confidenceLessons.slice(0, 5);

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Confidence Rate
        </Text>
      </View>

      <View
        style={[
          styles.confidenceChartCard,
          {
            backgroundColor: isDark ? colors.backgroundElement : '#FFFFFF',
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.06)',
          },
        ]}>
        <View style={styles.confidenceChartWrapper}>
          {/* Rows Area with Bounded Vertical Axis Line */}
          <View style={styles.chartContentArea}>
            {/* Continuous Vertical Axis Line strictly bounded to the rows */}
            {displayedLessons.length > 0 && (
              <View
                style={[
                  styles.chartVerticalAxis,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.35)'
                      : '#111827',
                  },
                ]}
              />
            )}

            {/* Rows */}
            <Animated.View
              layout={LinearTransition.duration(250)}
              style={styles.chartRowsContainer}>
              {displayedLessons.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                    No progress yet. Study lessons or take quizzes to see your confidence rate!
                  </Text>
                </View>
              ) : (
                displayedLessons.map((item, index) => {
                  // Bar width ratio relative to 68% max container width so % fits on right
                  const barWidthPercent =
                    Math.max(3, Math.min(100, item.confidencePercent)) * 0.68;

                  return (
                    <Animated.View
                      key={item.id}
                      entering={FadeInDown.duration(200).delay(
                        index >= 5 ? (index - 5) * 35 : 0
                      )}
                      exiting={FadeOutUp.duration(160)}
                      layout={LinearTransition.duration(240)}
                      style={styles.chartRow}>
                      {/* Left Column: Lesson Name */}
                      <View style={styles.chartLeftLabelBox}>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={[
                            styles.chartLessonText,
                            { color: colors.text },
                          ]}>
                          {item.lessonName}
                        </Text>
                      </View>

                      {/* Right Area: Horizontal Bar + % Label */}
                      <View style={styles.chartRightBarArea}>
                        <View
                          style={[
                            styles.chartHorizontalBar,
                            {
                              width: `${barWidthPercent}%`,
                              backgroundColor: colors.accent,
                            },
                          ]}
                        />
                        <Text
                          style={[
                            styles.chartPercentLabel,
                            { color: colors.accent },
                          ]}>
                          {item.confidencePercent}%
                        </Text>
                      </View>
                    </Animated.View>
                  );
                })
              )}
            </Animated.View>
          </View>

          {/* Show More / Show Less Toggle Button */}
          {confidenceLessons.length > 5 && (
            <Pressable
              onPress={() => setShowAllLessons((prev) => !prev)}
              style={({ pressed }) => [
                styles.toggleLessonsBtn,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(0, 0, 0, 0.03)',
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.06)',
                  opacity: pressed ? 0.75 : 1,
                },
              ]}>
              <Text
                style={[styles.toggleLessonsBtnText, { color: colors.accent }]}>
                {showAllLessons ? 'Show Less' : 'Show More'}
              </Text>
              {showAllLessons ? (
                <ChevronUp size={14} color={colors.accent} strokeWidth={2.4} />
              ) : (
                <ChevronDown size={14} color={colors.accent} strokeWidth={2.4} />
              )}
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  confidenceChartCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  confidenceChartWrapper: {
    gap: 4,
  },
  chartContentArea: {
    position: 'relative',
  },
  chartVerticalAxis: {
    position: 'absolute',
    left: 130,
    top: 2,
    bottom: 2,
    width: 2,
    borderRadius: 1,
    zIndex: 1,
  },
  chartRowsContainer: {
    gap: 16,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 28,
    paddingVertical: 2,
  },
  chartLeftLabelBox: {
    width: 130,
    paddingRight: 10,
    justifyContent: 'center',
  },
  chartLessonText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.1,
    lineHeight: 15,
  },
  chartRightBarArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartHorizontalBar: {
    height: 4.5,
    borderRadius: 2.5,
  },
  chartPercentLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  emptyStateContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
  toggleLessonsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'center',
    gap: 5,
  },
  toggleLessonsBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
