import { useRouter } from 'expo-router';
import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';

import { useAppTheme } from '@/context/theme-context';

/* Theme Color Palette Map for 3D Orb Backgrounds & Icons */
interface OrbThemePalette {
  topGrad: [string, string, string, string];
  rimColor: string;
  bookGrad: [string, string, string];
  bookShadow: string;
  flashcardTop: [string, string, string];
  flashcardMid: [string, string, string];
  flashcardBot: [string, string, string];
  flashcardShadow: string;
}

const ORB_THEME_PALETTES: Record<
  string,
  { light: OrbThemePalette; dark: OrbThemePalette }
> = {
  red: {
    light: {
      topGrad: ['#FFFFFF', '#FFF1F3', '#FFE4E8', '#FECDD6'],
      rimColor: '#FDA4AF',
      bookGrad: ['#FDA4AF', '#F43F5E', '#BE123C'],
      bookShadow: 'rgba(190, 18, 60, 0.22)',
      flashcardTop: ['#FECDD6', '#FB7185', '#E11D48'],
      flashcardMid: ['#FFF1F3', '#FDA4AF', '#F43F5E'],
      flashcardBot: ['#FFF1F3', '#FB7185', '#E11D48'],
      flashcardShadow: 'rgba(225, 29, 72, 0.22)',
    },
    dark: {
      topGrad: ['#3F1720', '#2E1016', '#220A10', '#18060A'],
      rimColor: '#5C1D2B',
      bookGrad: ['#FDA4AF', '#F43F5E', '#BE123C'],
      bookShadow: 'rgba(225, 29, 72, 0.28)',
      flashcardTop: ['#FECDD6', '#FB7185', '#E11D48'],
      flashcardMid: ['#FFF1F3', '#FDA4AF', '#F43F5E'],
      flashcardBot: ['#FFF1F3', '#FB7185', '#E11D48'],
      flashcardShadow: 'rgba(225, 29, 72, 0.32)',
    },
  },
  terracotta: {
    light: {
      topGrad: ['#FFFFFF', '#FFF3EB', '#FEE2D4', '#FDCBB7'],
      rimColor: '#FFD7C5',
      bookGrad: ['#FFA68B', '#F16841', '#C9441D'],
      bookShadow: 'rgba(180, 60, 30, 0.22)',
      flashcardTop: ['#FDE68A', '#FBBF24', '#E67E0A'],
      flashcardMid: ['#FFF4D0', '#FCD34D', '#F59E0B'],
      flashcardBot: ['#FFF4D0', '#FBBF24', '#D97706'],
      flashcardShadow: 'rgba(217, 119, 6, 0.24)',
    },
    dark: {
      topGrad: ['#38221B', '#2C1812', '#1E0E0A', '#160905'],
      rimColor: '#593226',
      bookGrad: ['#FFA68B', '#F16841', '#C9441D'],
      bookShadow: 'rgba(200, 90, 50, 0.28)',
      flashcardTop: ['#FDE68A', '#FBBF24', '#E67E0A'],
      flashcardMid: ['#FFF4D0', '#FCD34D', '#F59E0B'],
      flashcardBot: ['#FFF4D0', '#FBBF24', '#D97706'],
      flashcardShadow: 'rgba(217, 119, 6, 0.32)',
    },
  },
  amber: {
    light: {
      topGrad: ['#FFFFFD', '#FFFBEB', '#FEF3C7', '#FDE68A'],
      rimColor: '#FDE68A',
      bookGrad: ['#FCD34D', '#F59E0B', '#B45309'],
      bookShadow: 'rgba(180, 83, 9, 0.22)',
      flashcardTop: ['#FEF08A', '#FACC15', '#CA8A04'],
      flashcardMid: ['#FEF9C3', '#FDE047', '#EAB308'],
      flashcardBot: ['#FEF9C3', '#FACC15', '#CA8A04'],
      flashcardShadow: 'rgba(202, 138, 4, 0.24)',
    },
    dark: {
      topGrad: ['#3B2E15', '#2E220D', '#201607', '#170E03'],
      rimColor: '#59441D',
      bookGrad: ['#FCD34D', '#F59E0B', '#B45309'],
      bookShadow: 'rgba(217, 119, 6, 0.28)',
      flashcardTop: ['#FEF08A', '#FACC15', '#CA8A04'],
      flashcardMid: ['#FEF9C3', '#FDE047', '#EAB308'],
      flashcardBot: ['#FEF9C3', '#FACC15', '#CA8A04'],
      flashcardShadow: 'rgba(202, 138, 4, 0.32)',
    },
  },
  green: {
    light: {
      topGrad: ['#FFFFFF', '#ECFDF5', '#D1FAE5', '#A7F3D0'],
      rimColor: '#A7F3D0',
      bookGrad: ['#6EE7B7', '#10B981', '#047857'],
      bookShadow: 'rgba(4, 120, 87, 0.22)',
      flashcardTop: ['#A7F3D0', '#34D399', '#059669'],
      flashcardMid: ['#ECFDF5', '#6EE7B7', '#10B981'],
      flashcardBot: ['#ECFDF5', '#34D399', '#047857'],
      flashcardShadow: 'rgba(5, 150, 105, 0.24)',
    },
    dark: {
      topGrad: ['#123226', '#0C241B', '#071812', '#04100C'],
      rimColor: '#1A4D3B',
      bookGrad: ['#6EE7B7', '#10B981', '#047857'],
      bookShadow: 'rgba(16, 185, 129, 0.28)',
      flashcardTop: ['#A7F3D0', '#34D399', '#059669'],
      flashcardMid: ['#ECFDF5', '#6EE7B7', '#10B981'],
      flashcardBot: ['#ECFDF5', '#34D399', '#047857'],
      flashcardShadow: 'rgba(16, 185, 129, 0.32)',
    },
  },
  blue: {
    light: {
      topGrad: ['#FFFFFF', '#EFF6FF', '#DBEAFE', '#BFDBFE'],
      rimColor: '#BFDBFE',
      bookGrad: ['#93C5FD', '#3B82F6', '#1D4ED8'],
      bookShadow: 'rgba(29, 78, 216, 0.22)',
      flashcardTop: ['#BFDBFE', '#60A5FA', '#2563EB'],
      flashcardMid: ['#EFF6FF', '#93C5FD', '#3B82F6'],
      flashcardBot: ['#EFF6FF', '#60A5FA', '#1D4ED8'],
      flashcardShadow: 'rgba(37, 99, 235, 0.24)',
    },
    dark: {
      topGrad: ['#14243B', '#0D1A2C', '#081220', '#040B16'],
      rimColor: '#1E385C',
      bookGrad: ['#93C5FD', '#3B82F6', '#1D4ED8'],
      bookShadow: 'rgba(37, 99, 235, 0.28)',
      flashcardTop: ['#BFDBFE', '#60A5FA', '#2563EB'],
      flashcardMid: ['#EFF6FF', '#93C5FD', '#3B82F6'],
      flashcardBot: ['#EFF6FF', '#60A5FA', '#1D4ED8'],
      flashcardShadow: 'rgba(37, 99, 235, 0.32)',
    },
  },
  indigo: {
    light: {
      topGrad: ['#FFFFFF', '#EEF2FF', '#E0E7FF', '#C7D2FE'],
      rimColor: '#C7D2FE',
      bookGrad: ['#A5B4FC', '#6366F1', '#4338CA'],
      bookShadow: 'rgba(67, 56, 202, 0.22)',
      flashcardTop: ['#C7D2FE', '#818CF8', '#4F46E5'],
      flashcardMid: ['#EEF2FF', '#A5B4FC', '#6366F1'],
      flashcardBot: ['#EEF2FF', '#818CF8', '#4338CA'],
      flashcardShadow: 'rgba(79, 70, 229, 0.24)',
    },
    dark: {
      topGrad: ['#1E1E3D', '#15152C', '#0E0E20', '#080816'],
      rimColor: '#2C2D5C',
      bookGrad: ['#A5B4FC', '#6366F1', '#4338CA'],
      bookShadow: 'rgba(79, 70, 229, 0.28)',
      flashcardTop: ['#C7D2FE', '#818CF8', '#4F46E5'],
      flashcardMid: ['#EEF2FF', '#A5B4FC', '#6366F1'],
      flashcardBot: ['#EEF2FF', '#818CF8', '#4338CA'],
      flashcardShadow: 'rgba(79, 70, 229, 0.32)',
    },
  },
  violet: {
    light: {
      topGrad: ['#FFFFFF', '#F5F3FF', '#EDE9FE', '#DDD6FE'],
      rimColor: '#DDD6FE',
      bookGrad: ['#C4B5FD', '#8B5CF6', '#6D28D9'],
      bookShadow: 'rgba(109, 40, 217, 0.22)',
      flashcardTop: ['#DDD6FE', '#A78BFA', '#7C3AED'],
      flashcardMid: ['#F5F3FF', '#C4B5FD', '#8B5CF6'],
      flashcardBot: ['#F5F3FF', '#A78BFA', '#6D28D9'],
      flashcardShadow: 'rgba(124, 58, 237, 0.24)',
    },
    dark: {
      topGrad: ['#28183D', '#1C102C', '#130A20', '#0C0616'],
      rimColor: '#3F245E',
      bookGrad: ['#C4B5FD', '#8B5CF6', '#6D28D9'],
      bookShadow: 'rgba(124, 58, 237, 0.28)',
      flashcardTop: ['#DDD6FE', '#A78BFA', '#7C3AED'],
      flashcardMid: ['#F5F3FF', '#C4B5FD', '#8B5CF6'],
      flashcardBot: ['#F5F3FF', '#A78BFA', '#6D28D9'],
      flashcardShadow: 'rgba(124, 58, 237, 0.32)',
    },
  },
};

/* 1. 3D Glossy Open Book Vector Icon with Drop Shadow */
function Glowing3DBookIcon({
  size = 118,
  palette,
}: {
  size?: number;
  palette: OrbThemePalette;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Defs>
        <LinearGradient id="bookLeft3D" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={palette.bookGrad[0]} />
          <Stop offset="40%" stopColor={palette.bookGrad[1]} />
          <Stop offset="100%" stopColor={palette.bookGrad[2]} />
        </LinearGradient>
        <LinearGradient id="bookRight3D" x1="100%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={palette.bookGrad[0]} />
          <Stop offset="40%" stopColor={palette.bookGrad[1]} />
          <Stop offset="100%" stopColor={palette.bookGrad[2]} />
        </LinearGradient>
        <LinearGradient id="bookShine" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
        </LinearGradient>
      </Defs>

      {/* Ambient Soft Drop Shadow */}
      <Ellipse
        cx="40"
        cy="66"
        rx="28"
        ry="5.5"
        fill={palette.bookShadow}
      />

      {/* Left Page */}
      <Path
        d="M 37.5 16 C 25.5 10.5 13 11.5 7.5 15 C 5.8 16 4.8 17.7 4.8 19.7 L 4.8 56 C 4.8 58 6.5 59.5 8.5 58.5 C 14.5 55.5 25.5 55 37.5 59.5 Z"
        fill="url(#bookLeft3D)"
      />

      {/* Right Page */}
      <Path
        d="M 42.5 16 C 54.5 10.5 67 11.5 72.5 15 C 74.2 16 75.2 17.7 75.2 19.7 L 75.2 56 C 75.2 58 73.5 59.5 71.5 58.5 C 65.5 55.5 54.5 55 42.5 59.5 Z"
        fill="url(#bookRight3D)"
      />

      {/* Left Page Top Shine Highlight */}
      <Path
        d="M 37.5 16 C 25.5 10.5 13 11.5 7.5 15 C 5.8 16 4.8 17.7 4.8 19.7 L 4.8 28 C 12 25 24 24.5 37.5 28 Z"
        fill="url(#bookShine)"
      />

      {/* Left Page 3 Curved White Lines */}
      <Path
        d="M 14 26 C 20.5 23 27 23 32 26"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.95"
      />
      <Path
        d="M 14 34.5 C 20.5 31.5 27 31.5 32 34.5"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.95"
      />
      <Path
        d="M 14 43 C 20.5 40 27 40 32 43"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.95"
      />

      {/* Right Page 3 Curved White Lines */}
      <Path
        d="M 48 26 C 53 23 59.5 23 66 26"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.95"
      />
      <Path
        d="M 48 34.5 C 53 31.5 59.5 31.5 66 34.5"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.95"
      />
      <Path
        d="M 48 43 C 53 40 59.5 40 66 43"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.95"
      />
    </Svg>
  );
}

/* 2. 3D Glossy Stacked Flashcards Vector Icon with Depth */
function Glowing3DFlashcardsIcon({
  size = 118,
  palette,
}: {
  size?: number;
  palette: OrbThemePalette;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Defs>
        <LinearGradient id="topCard3D" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={palette.flashcardTop[0]} />
          <Stop offset="40%" stopColor={palette.flashcardTop[1]} />
          <Stop offset="100%" stopColor={palette.flashcardTop[2]} />
        </LinearGradient>
        <LinearGradient id="midCard3D" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={palette.flashcardMid[0]} stopOpacity="0.95" />
          <Stop offset="50%" stopColor={palette.flashcardMid[1]} stopOpacity="0.9" />
          <Stop offset="100%" stopColor={palette.flashcardMid[2]} stopOpacity="0.85" />
        </LinearGradient>
        <LinearGradient id="botCard3D" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={palette.flashcardBot[0]} stopOpacity="0.8" />
          <Stop offset="50%" stopColor={palette.flashcardBot[1]} stopOpacity="0.75" />
          <Stop offset="100%" stopColor={palette.flashcardBot[2]} stopOpacity="0.7" />
        </LinearGradient>
      </Defs>

      {/* Ambient Soft Drop Shadow */}
      <Ellipse
        cx="40"
        cy="68"
        rx="27"
        ry="5.5"
        fill={palette.flashcardShadow}
      />

      {/* Bottom Layer Card */}
      <Path
        d="M 37.5 37.5 C 38.8 36.8 41.2 36.8 42.5 37.5 L 66 50 C 68 51.2 68 53 66 54.2 L 42.5 66.5 C 41.2 67.2 38.8 67.2 37.5 66.5 L 14 54.2 C 12 53 12 51.2 14 50 Z"
        fill="url(#botCard3D)"
      />
      {/* Bottom Card White Edge Rim */}
      <Path
        d="M 14 50 L 37.5 37.5 C 38.8 36.8 41.2 36.8 42.5 37.5 L 66 50"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        opacity="0.85"
      />

      {/* Middle Layer Card */}
      <Path
        d="M 37.5 24.5 C 38.8 23.8 41.2 23.8 42.5 24.5 L 66 37 C 68 38.2 68 40 66 41.2 L 42.5 53.5 C 41.2 54.2 38.8 54.2 37.5 53.5 L 14 41.2 C 12 40 12 38.2 14 37 Z"
        fill="url(#midCard3D)"
      />
      {/* Middle Card White Edge Rim */}
      <Path
        d="M 14 37 L 37.5 24.5 C 38.8 23.8 41.2 23.8 42.5 24.5 L 66 37"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        opacity="0.9"
      />

      {/* Top Layer Card */}
      <Path
        d="M 37.5 11.5 C 38.8 10.8 41.2 10.8 42.5 11.5 L 66 24 C 68 25.2 68 27 66 28.2 L 42.5 40.5 C 41.2 41.2 38.8 41.2 37.5 40.5 L 14 28.2 C 12 27 12 25.2 14 24 Z"
        fill="url(#topCard3D)"
      />

      {/* White Chevron on Top Card */}
      <Path
        d="M 28 23 L 40 29.5 L 52 23"
        stroke="#FFFFFF"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.98"
      />
    </Svg>
  );
}

/* 3D Orb Background with Radial Illumination, Specular Glow & Sparkles */
function GlowingOrbBackground({
  size,
  isDark,
  themeType,
  palette,
}: {
  size: number;
  isDark: boolean;
  themeType: 'notes' | 'flashcards';
  palette: OrbThemePalette;
}) {
  if (size <= 0) return null;

  const half = size / 2;

  // Gradient definitions tailored for 3D sphere/orb depth
  const gradId = `orb_${themeType}_${isDark ? 'dark' : 'light'}`;
  const rimColor = palette.rimColor;
  const stopColors = palette.topGrad;

  return (
    <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
      <Defs>
        {/* Main 3D Spherical Radial Gradient */}
        <RadialGradient
          id={gradId}
          cx="50%"
          cy="38%"
          rx="62%"
          ry="62%"
          fx="48%"
          fy="30%">
          <Stop offset="0%" stopColor={stopColors[0]} stopOpacity="1" />
          <Stop offset="42%" stopColor={stopColors[1]} stopOpacity="1" />
          <Stop offset="82%" stopColor={stopColors[2]} stopOpacity="1" />
          <Stop offset="100%" stopColor={stopColors[3]} stopOpacity="1" />
        </RadialGradient>
      </Defs>

      {/* Base 3D Radial Fill */}
      <Circle cx={half} cy={half} r={half} fill={`url(#${gradId})`} />

      {/* Outer Soft Ambient Ring Halo */}
      <Circle
        cx={half}
        cy={half}
        r={half - 1.5}
        stroke={rimColor}
        strokeWidth={3}
        fill="none"
        opacity={isDark ? 0.7 : 0.85}
      />

      {/* Inner Specular Light Edge Rim */}
      <Circle
        cx={half}
        cy={half}
        r={half - 4.5}
        stroke="#FFFFFF"
        strokeWidth={1.5}
        fill="none"
        opacity={isDark ? 0.08 : 0.45}
      />

      {/* Subtle Magical Sparkles / Micro Stars */}
      {/* Sparkle 1: Top Left */}
      <Circle
        cx={half * 0.42}
        cy={half * 0.58}
        r={2.2}
        fill="#FFFFFF"
        opacity={isDark ? 0.45 : 0.8}
      />
      <Path
        d={`M ${half * 0.42} ${half * 0.58 - 5} Q ${half * 0.42} ${half * 0.58} ${half * 0.42 + 5} ${half * 0.58} Q ${half * 0.42} ${half * 0.58} ${half * 0.42} ${half * 0.58 + 5} Q ${half * 0.42} ${half * 0.58} ${half * 0.42 - 5} ${half * 0.58} Z`}
        fill="#FFFFFF"
        opacity={isDark ? 0.35 : 0.65}
      />

      {/* Sparkle 2: Bottom Left */}
      <Circle
        cx={half * 0.35}
        cy={half * 1.48}
        r={1.8}
        fill="#FFFFFF"
        opacity={isDark ? 0.35 : 0.6}
      />

      {/* Sparkle 3: Top Right */}
      <Circle
        cx={half * 1.62}
        cy={half * 0.62}
        r={1.5}
        fill="#FFFFFF"
        opacity={isDark ? 0.35 : 0.55}
      />
    </Svg>
  );
}

/* Circular Learn Hero Button */
function LearnCircularButton({
  title,
  size,
  iconComponent,
  themeType,
  textColor,
  palette,
  isDark,
  onPress,
}: {
  title: string;
  size: number;
  iconComponent: React.ReactNode;
  themeType: 'notes' | 'flashcards';
  textColor: string;
  palette: OrbThemePalette;
  isDark: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.circularHeroBtn,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.965 : 1 }],
        },
      ]}>
      {/* 3D Orb Background with Ambient Halo & Sparkles */}
      <GlowingOrbBackground
        size={size}
        isDark={isDark}
        themeType={themeType}
        palette={palette}
      />

      {/* Centered Content */}
      <View style={styles.circleCenterContent}>
        <View style={styles.iconCenterBox}>{iconComponent}</View>

        <Text
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          style={[
            styles.cardTitle,
            {
              fontSize: Math.min(Math.max(size * 0.075, 17), 22),
              lineHeight: Math.min(Math.max(size * 0.09, 21), 26),
              color: textColor,
            },
          ]}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

export default function LearnScreen() {
  const { colors, isDark, accentTheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Active theme palette for orb circle backgrounds and icons
  const activePaletteConfig =
    ORB_THEME_PALETTES[accentTheme] || ORB_THEME_PALETTES.terracotta;
  const currentOrbPalette = isDark
    ? activePaletteConfig.dark
    : activePaletteConfig.light;

  // Balanced circle diameter (~285px)
  const circleSize = Math.min(Math.max(width * 0.74, 270), 290);
  const iconSize = Math.round(circleSize * 0.46); // ~132px

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* 1. Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Learn</Text>
      </View>

      {/* 2. Scrollable container with balanced circle buttons */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 84 },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* CIRCLE 1: COMPREHENSIVE NOTES */}
        <LearnCircularButton
          title={'Comprehensive\nNotes'}
          size={circleSize}
          iconComponent={
            <Glowing3DBookIcon size={iconSize} palette={currentOrbPalette} />
          }
          themeType="notes"
          textColor={colors.text}
          palette={currentOrbPalette}
          isDark={isDark}
          onPress={() => router.push('/(tabs)/learn/notes' as any)}
        />

        {/* CIRCLE 2: FLASHCARDS */}
        <LearnCircularButton
          title="Flashcards"
          size={circleSize}
          iconComponent={
            <Glowing3DFlashcardsIcon size={iconSize} palette={currentOrbPalette} />
          }
          themeType="flashcards"
          textColor={colors.text}
          palette={currentOrbPalette}
          isDark={isDark}
          onPress={() => router.push('/(tabs)/learn/flashcards' as any)}
        />
      </ScrollView>
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
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  circularHeroBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  circleCenterContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 2,
    maxWidth: '85%',
  },
  iconCenterBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: '100%',
    ...(Platform.OS === 'web'
      ? ({
          whiteSpace: 'pre-line',
          wordBreak: 'normal',
          overflowWrap: 'normal',
        } as any)
      : {}),
  },
});


