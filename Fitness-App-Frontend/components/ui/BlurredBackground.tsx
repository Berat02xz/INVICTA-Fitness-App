import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
} from "react-native-reanimated";
import { BlurView } from 'expo-blur';
import { theme } from '@/constants/theme';

const { width, height } = Dimensions.get("window");

// Circle colors - dark theme with lime primary and deep green glows
const circleColors = [
  '#AAFB05', // lime primary — hero glow
  '#062B0A', // deep primary dark green
  '#3A7C00', // dark lime mid
  '#1A4D0A', // forest green
  '#AAFB05', // lime primary — secondary glow
  '#0A2204', // near-black green
  '#6BBF00', // warm lime variant
  '#062B0A', // deep primary repeat
];

interface BlurredBackgroundProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  circleBlur?: number;
  animationSpeed?: number;
}

export default function BlurredBackground({ 
  children, 
  intensity = Platform.OS === 'android' ? 90 : 55,
  tint = 'dark',
  circleBlur = 140,
  animationSpeed = 1
}: BlurredBackgroundProps) {
  // Simple shared values for circle positions - centered vertically in a horizontal line
  const centerY = height * 0.5;
  const circle1X = useSharedValue(width * 0.1);
  const circle1Y = useSharedValue(centerY);
  const circle2X = useSharedValue(width * 0.3);
  const circle2Y = useSharedValue(centerY);
  const circle3X = useSharedValue(width * 0.5);
  const circle3Y = useSharedValue(centerY);
  const circle4X = useSharedValue(width * 0.7);
  const circle4Y = useSharedValue(centerY);
  const circle5X = useSharedValue(width * 0.9);
  const circle5Y = useSharedValue(centerY);

  // Simple movement that works on all platforms - horizontal movement only
  useEffect(() => {
    // Start simple continuous horizontal movement for each circle
    const startMovement = () => {
      const baseSpeed = 3000 / animationSpeed;
      
      circle1X.value = withRepeat(withTiming(circle1X.value + 55, { duration: baseSpeed }), -1, true);
      circle1Y.value = withRepeat(withTiming(circle1Y.value + 70, { duration: baseSpeed * 1.3 }), -1, true);

      circle2X.value = withRepeat(withTiming(circle2X.value - 45, { duration: baseSpeed * 0.9 }), -1, true);
      circle2Y.value = withRepeat(withTiming(circle2Y.value - 60, { duration: baseSpeed * 1.1 }), -1, true);

      circle3X.value = withRepeat(withTiming(circle3X.value + 65, { duration: baseSpeed * 1.1 }), -1, true);
      circle3Y.value = withRepeat(withTiming(circle3Y.value + 50, { duration: baseSpeed * 0.95 }), -1, true);

      circle4X.value = withRepeat(withTiming(circle4X.value - 50, { duration: baseSpeed * 0.85 }), -1, true);
      circle4Y.value = withRepeat(withTiming(circle4Y.value + 80, { duration: baseSpeed * 1.15 }), -1, true);

      circle5X.value = withRepeat(withTiming(circle5X.value + 40, { duration: baseSpeed * 1.2 }), -1, true);
      circle5Y.value = withRepeat(withTiming(circle5Y.value - 55, { duration: baseSpeed * 1.05 }), -1, true);
    };

    startMovement();
  }, [animationSpeed]);

  // Simple animated styles
  const circle1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: circle1X.value }, { translateY: circle1Y.value }],
  }));

  const circle2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: circle2X.value }, { translateY: circle2Y.value }],
  }));

  const circle3Style = useAnimatedStyle(() => ({
    transform: [{ translateX: circle3X.value }, { translateY: circle3Y.value }],
  }));

  const circle4Style = useAnimatedStyle(() => ({
    transform: [{ translateX: circle4X.value }, { translateY: circle4Y.value }],
  }));

  const circle5Style = useAnimatedStyle(() => ({
    transform: [{ translateX: circle5X.value }, { translateY: circle5Y.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Animated Circles Background */}
      <View style={[
        styles.circlesContainer,
        { filter: Platform.OS === 'web' ? `blur(${circleBlur}px)` : undefined }
      ]}>
        <Animated.View style={[
          styles.circle, 
          { backgroundColor: circleColors[0] }, 
          circle1Style
        ]} />
        <Animated.View style={[
          styles.circle, 
          { 
            backgroundColor: circleColors[1], 
            width: 180, 
            height: 180,
          }, 
          circle2Style
        ]} />
        <Animated.View style={[
          styles.circle, 
          { 
            backgroundColor: circleColors[2], 
            width: 220, 
            height: 220,
          }, 
          circle3Style
        ]} />
        <Animated.View style={[
          styles.circle, 
          { 
            backgroundColor: circleColors[3], 
            width: 160, 
            height: 160,
          }, 
          circle4Style
        ]} />
        <Animated.View style={[
          styles.circle, 
          { 
            backgroundColor: circleColors[4], 
            width: 190, 
            height: 190,
          }, 
          circle5Style
        ]} />
      </View>

      <BlurView 
        intensity={intensity}
        blurReductionFactor={Platform.OS === 'android' ? 2 : undefined}
        tint={tint}
        style={styles.blurContainer}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
      >
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  circlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle: {
    position: 'absolute',
    width: 800,
    height: 800,
    borderRadius: 400,
    opacity: 0.65,
  },
  blurContainer: {
    flex: 1,
  },
});