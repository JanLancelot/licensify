import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Image } from 'expo-image';

export interface BrandMarkProps {
  style?: StyleProp<ViewStyle>;
  size?: number;
}

/** A light backing keeps both colors of the original mark visible in either theme. */
export function BrandMark({ style, size = 64 }: BrandMarkProps) {
  return (
    <View style={[styles.brandMark, { width: size, height: size }, style]}>
      <Image
        source={require('@/assets/brand/p-app.svg')}
        style={styles.image}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  brandMark: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  image: {
    width: '80%',
    height: '80%',
  },
});
