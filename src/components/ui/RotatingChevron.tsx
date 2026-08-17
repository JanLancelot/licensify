import React from 'react';
import { ChevronRight } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

export interface RotatingChevronProps {
  isOpen: boolean;
  color: string;
  size?: number;
}

export function RotatingChevron({
  isOpen,
  color,
  size = 18,
}: RotatingChevronProps) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: withTiming(isOpen ? '90deg' : '0deg', {
            duration: 220,
          }),
        },
      ],
    };
  }, [isOpen]);

  return (
    <Animated.View style={animatedStyle}>
      <ChevronRight size={size} color={color} strokeWidth={2.2} />
    </Animated.View>
  );
}
