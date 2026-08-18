import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop
} from 'react-native-svg';

import { useAppTheme } from '@/context/theme-context';

/* 1. Standalone Gradient-Filled Open Book Vector Icon */
function GradientFilledBookIcon({ size = 150 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Defs>
        <LinearGradient id="bookGradFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F89B7F" />
          <Stop offset="45%" stopColor="#E07A5F" />
          <Stop offset="100%" stopColor="#C85A32" />
        </LinearGradient>
      </Defs>

      {/* Left Page (Solid Terracotta Gradient Fill) */}
      <Path
        d="M 30 14 C 20 10 10 11 6 13.5 C 4.8 14.3 4 15.6 4 17 L 4 47 C 4 48.6 5.2 49.8 6.8 49 C 11.5 46.5 20.5 46 30 50 Z"
        fill="url(#bookGradFill)"
      />

      {/* Right Page (Solid Terracotta Gradient Fill) */}
      <Path
        d="M 34 14 C 44 10 54 11 58 13.5 C 59.2 14.3 60 15.6 60 17 L 60 47 C 60 48.6 58.8 49.8 57.2 49 C 52.5 46.5 43.5 46 34 50 Z"
        fill="url(#bookGradFill)"
      />

      {/* Subtle Inner Page Detail Lines in White */}
      <Path
        d="M 12 25 C 18 23 23 23 27 25"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      <Path
        d="M 12 33 C 18 31 23 31 27 33"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      <Path
        d="M 37 25 C 41 23 46 23 52 25"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      <Path
        d="M 37 33 C 41 31 46 31 52 33"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />
    </Svg>
  );
}

/* 2. Standalone Gradient-Filled Stacked Flashcards Vector Icon */
function GradientFilledFlashcardsIcon({ size = 150 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Defs>
        <LinearGradient id="cardsGradFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FDE68A" />
          <Stop offset="50%" stopColor="#FBBF24" />
          <Stop offset="100%" stopColor="#D97706" />
        </LinearGradient>
      </Defs>

      {/* Bottom Layer Card */}
      <Path
        d="M 12 43 L 32 53 L 52 43 L 32 33 Z"
        fill="url(#cardsGradFill)"
        opacity="0.5"
      />

      {/* Middle Layer Card */}
      <Path
        d="M 12 31 L 32 41 L 52 31 L 32 21 Z"
        fill="url(#cardsGradFill)"
        opacity="0.8"
      />

      {/* Top Layer Card */}
      <Path
        d="M 12 19 L 32 29 L 52 19 L 32 9 Z"
        fill="url(#cardsGradFill)"
      />

      {/* Subtle Top Card Detail Lines in White */}
      <Path
        d="M 23 19 L 32 23.5 L 41 19"
        stroke="#FFFFFF"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </Svg>
  );
}

/* Dynamic Responsive Card Background that harmonizes with centered layout */
function DynamicCardBackground({
  width,
  height,
  color,
}: {
  width: number;
  height: number;
  color: string;
}) {
  if (width <= 0 || height <= 0) return null;

  // Concentric rings center behind the icon
  const centerX = width * 0.5;
  const centerY = height * 0.34;
  const dotStartX = width - 58;
  const dotStartY = 24;

  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id={`ambient_${color.replace(/[^a-zA-Z0-9]/g, '')}`} x1="100%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <Stop offset="50%" stopColor={color} stopOpacity="0.06" />
          <Stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </LinearGradient>
        <LinearGradient id={`ambient_btm_${color.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <Stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </LinearGradient>
      </Defs>

      {/* Ambient Corner Glows */}
      <Path
        d={`M ${width * 0.4} 0 Q ${width * 0.65} ${height * 0.4} ${width} ${height * 0.6} L ${width} 0 Z`}
        fill={`url(#ambient_${color.replace(/[^a-zA-Z0-9]/g, '')})`}
      />
      <Path
        d={`M 0 ${height * 0.6} Q ${width * 0.3} ${height * 0.75} 0 ${height} Z`}
        fill={`url(#ambient_btm_${color.replace(/[^a-zA-Z0-9]/g, '')})`}
      />

      {/* 3x3 Dot Grid Top Right */}
      {[0, 1, 2].map((col) =>
        [0, 1, 2].map((row) => (
          <Circle
            key={`dot_tr_${col}_${row}`}
            cx={dotStartX + col * 15}
            cy={dotStartY + row * 15}
            r="2.2"
            fill={color}
            opacity="0.28"
          />
        ))
      )}

      {/* 3x2 Dot Grid Bottom Left */}
      {[0, 1, 2].map((col) =>
        [0, 1].map((row) => (
          <Circle
            key={`dot_bl_${col}_${row}`}
            cx={24 + col * 15}
            cy={height - 38 + row * 15}
            r="2.2"
            fill={color}
            opacity="0.22"
          />
        ))
      )}

      {/* Concentric Halo Rings Radiating from Behind the Center Icon */}
      <Circle
        cx={centerX}
        cy={centerY}
        r={75}
        stroke={color}
        strokeWidth="1.3"
        opacity="0.22"
        fill="none"
      />
      <Circle
        cx={centerX}
        cy={centerY}
        r={120}
        stroke={color}
        strokeWidth="1.2"
        opacity="0.15"
        fill="none"
      />
      <Circle
        cx={centerX}
        cy={centerY}
        r={175}
        stroke={color}
        strokeWidth="1.1"
        opacity="0.10"
        fill="none"
      />
      <Circle
        cx={centerX}
        cy={centerY}
        r={240}
        stroke={color}
        strokeWidth="1.0"
        opacity="0.06"
        fill="none"
      />
    </Svg>
  );
}

/* Individual Learn Hero Card with Centered Layout */
function LearnHeroCard({
  title,
  subtitle,
  iconComponent,
  accentColor,
  backgroundColor,
  isDark,
  onPress,
}: {
  title: string;
  subtitle: string;
  iconComponent: React.ReactNode;
  accentColor: string;
  backgroundColor: string;
  isDark: boolean;
  onPress: () => void;
}) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setDimensions({ width, height });
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onLayout={handleLayout}
      style={({ pressed }) => [
        styles.learnHeroCard,
        {
          backgroundColor,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}>
      {/* 100% Fully Fitted Background SVG */}
      <DynamicCardBackground
        width={dimensions.width}
        height={dimensions.height}
        color={accentColor}
      />

      {/* Centered Content Block (Icon nicely paired with Text) */}
      <View style={styles.cardCenterContent}>
        <View style={styles.iconCenterBox}>
          {iconComponent}
        </View>

        <View style={styles.cardTextGroup}>
          <Text
            style={[
              styles.cardTitle,
              { color: isDark ? '#F9FAFB' : '#0F172A' },
            ]}>
            {title}
          </Text>
          <Text
            style={[
              styles.cardSubtitle,
              { color: isDark ? '#9CA3AF' : '#64748B' },
            ]}>
            {subtitle}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function LearnScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* 1. Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Learn
        </Text>
      </View>

      {/* 2. Two Hero Cards filling the vertical space */}
      <View
        style={[
          styles.fillContainer,
          { paddingBottom: insets.bottom + 84 },
        ]}>
        {/* CARD 1: COMPREHENSIVE NOTES */}
        <LearnHeroCard
          title="Comprehensive Notes"
          subtitle="In-depth coverage of all topics you need to know."
          iconComponent={<GradientFilledBookIcon size={150} />}
          accentColor={colors.accent}
          backgroundColor={isDark ? '#261C19' : '#FAF3F0'}
          isDark={isDark}
          onPress={() => router.push('/(tabs)/learn/notes' as any)}
        />

        {/* CARD 2: FLASHCARDS */}
        <LearnHeroCard
          title="Flashcards"
          subtitle="Review key concepts with smart flashcards."
          iconComponent={<GradientFilledFlashcardsIcon size={150} />}
          accentColor="#D97706"
          backgroundColor={isDark ? '#281E15' : '#FEF8EE'}
          isDark={isDark}
          onPress={() => router.push('/(tabs)/learn/flashcards' as any)}
        />
      </View>
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
    paddingBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  fillContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 16,
  },
  learnHeroCard: {
    flex: 1,
    borderRadius: 26,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cardCenterContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 2,
  },
  iconCenterBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextGroup: {
    alignItems: 'center',
    gap: 4,
    maxWidth: '85%',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
});
