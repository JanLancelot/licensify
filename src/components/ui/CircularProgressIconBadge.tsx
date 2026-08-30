import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export const SUBJECT_PALETTES = [
  {
    bg: '#EDE9FE',
    darkBg: 'rgba(139, 92, 246, 0.22)',
    icon: '#7C3AED',
    darkIcon: '#C4B5FD',
  }, // Lavender / Purple
  {
    bg: '#FCE7F3',
    darkBg: 'rgba(236, 72, 153, 0.22)',
    icon: '#DB2777',
    darkIcon: '#F472B6',
  }, // Soft Pink
  {
    bg: '#E0E7FF',
    darkBg: 'rgba(99, 102, 241, 0.22)',
    icon: '#4F46E5',
    darkIcon: '#A5B4FC',
  }, // Indigo / Violet
  {
    bg: '#FFEDD5',
    darkBg: 'rgba(249, 115, 22, 0.22)',
    icon: '#EA580C',
    darkIcon: '#FDBA74',
  }, // Peach / Orange
  {
    bg: '#E0F2FE',
    darkBg: 'rgba(14, 165, 233, 0.22)',
    icon: '#0284C7',
    darkIcon: '#7DD3FC',
  }, // Sky Blue / Cyan
  {
    bg: '#D1FAE5',
    darkBg: 'rgba(16, 185, 129, 0.22)',
    icon: '#059669',
    darkIcon: '#6EE7B7',
  }, // Mint / Emerald
];

export function CircularProgressIconBadge({
  size = 48,
  strokeWidth = 2.8,
  progress = 0,
  progressColor = '#10B981',
  trackColor,
  bgColor,
  isDark,
  children,
}: {
  size?: number;
  strokeWidth?: number;
  progress?: number;
  progressColor?: string;
  trackColor?: string;
  bgColor?: string;
  isDark: boolean;
  children: React.ReactNode;
}) {
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference * (1 - clampedProgress);

  const defaultTrack = isDark
    ? 'rgba(255, 255, 255, 0.12)'
    : 'rgba(0, 0, 0, 0.08)';

  const innerSize = size - strokeWidth * 2 - 4;

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
        {/* Background Track Ring */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor || defaultTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress Outline Ring */}
        {clampedProgress > 0 && (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${center} ${center})`}
          />
        )}
      </Svg>

      {/* Inner Pastel Circle */}
      <View
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          backgroundColor: bgColor,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {children}
      </View>
    </View>
  );
}
