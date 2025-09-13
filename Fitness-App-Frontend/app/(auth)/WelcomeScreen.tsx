import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import { theme } from "@/constants/theme";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  useDerivedValue,
  Easing,
} from "react-native-reanimated";
import { BlurView } from 'expo-blur';
import FadeTranslate from "@/components/ui/FadeTranslate";

const { width, height } = Dimensions.get("window");

const titles = ['Body', 'Metabolism', 'Mind', 'Progress'];

// Circle colors - primarily red-ish
const circleColors = [
  '#b80b0bff', // Light red
  '#FF5252', // Red
  '#E57373', // Light red
  '#F44336', // Material red
  '#D32F2F', // Dark red
  '#B71C1C', // Deep red
  '#981306ff', // Light red accent
  '#FF1744', // Red accent
];

export default function WelcomeScreen() {
  const [activeTitleIndex, setActiveTitleIndex] = useState(0);
  
  // Simple shared values for circle positions
  const circle1X = useSharedValue(width * 0.2);
  const circle1Y = useSharedValue(height * 0.3);
  const circle2X = useSharedValue(width * 0.7);
  const circle2Y = useSharedValue(height * 0.2);
  const circle3X = useSharedValue(width * 0.3);
  const circle3Y = useSharedValue(height * 0.7);
  const circle4X = useSharedValue(width * 0.8);
  const circle4Y = useSharedValue(height * 0.6);
  const circle5X = useSharedValue(width * 0.5);
  const circle5Y = useSharedValue(height * 0.4);

  // Title animation
  const titleOpacity = useSharedValue(1);

  // Simple random movement for each circle - web compatible
  useEffect(() => {
    // Initialize positions immediately
    circle1X.value = width * 0.2;
    circle1Y.value = height * 0.3;
    circle2X.value = width * 0.7;
    circle2Y.value = height * 0.2;
    circle3X.value = width * 0.3;
    circle3Y.value = height * 0.7;
    circle4X.value = width * 0.8;
    circle4Y.value = height * 0.6;
    circle5X.value = width * 0.5;
    circle5Y.value = height * 0.4;

    // Start animations with slight delay for web compatibility
    const startAnimations = () => {
      const moveRange = 80;
      
      // Circle 1
      circle1X.value = withRepeat(
        withSequence(
          withTiming(width * 0.2 + moveRange, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
          withTiming(width * 0.2 - moveRange, { duration: 3000, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );
      
      circle1Y.value = withRepeat(
        withSequence(
          withTiming(height * 0.3 + moveRange * 0.8, { duration: 3500, easing: Easing.inOut(Easing.quad) }),
          withTiming(height * 0.3 - moveRange * 0.8, { duration: 3500, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );

      // Circle 2
      circle2X.value = withRepeat(
        withSequence(
          withTiming(width * 0.7 - moveRange, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
          withTiming(width * 0.7 + moveRange, { duration: 2500, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );
      
      circle2Y.value = withRepeat(
        withSequence(
          withTiming(height * 0.2 + moveRange * 0.6, { duration: 4000, easing: Easing.inOut(Easing.quad) }),
          withTiming(height * 0.2 - moveRange * 0.6, { duration: 4000, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );

      // Circle 3
      circle3X.value = withRepeat(
        withSequence(
          withTiming(width * 0.3 + moveRange * 0.7, { duration: 3200, easing: Easing.inOut(Easing.quad) }),
          withTiming(width * 0.3 - moveRange * 0.7, { duration: 3200, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );
      
      circle3Y.value = withRepeat(
        withSequence(
          withTiming(height * 0.7 - moveRange, { duration: 2800, easing: Easing.inOut(Easing.quad) }),
          withTiming(height * 0.7 + moveRange, { duration: 2800, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );

      // Circle 4
      circle4X.value = withRepeat(
        withSequence(
          withTiming(width * 0.8 - moveRange * 0.9, { duration: 3800, easing: Easing.inOut(Easing.quad) }),
          withTiming(width * 0.8 + moveRange * 0.9, { duration: 3800, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );
      
      circle4Y.value = withRepeat(
        withSequence(
          withTiming(height * 0.6 + moveRange * 0.5, { duration: 3600, easing: Easing.inOut(Easing.quad) }),
          withTiming(height * 0.6 - moveRange * 0.5, { duration: 3600, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );

      // Circle 5
      circle5X.value = withRepeat(
        withSequence(
          withTiming(width * 0.5 + moveRange * 0.6, { duration: 2700, easing: Easing.inOut(Easing.quad) }),
          withTiming(width * 0.5 - moveRange * 0.6, { duration: 2700, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );
      
      circle5Y.value = withRepeat(
        withSequence(
          withTiming(height * 0.4 - moveRange * 0.7, { duration: 4200, easing: Easing.inOut(Easing.quad) }),
          withTiming(height * 0.4 + moveRange * 0.7, { duration: 4200, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );
    };

    // Start animations immediately for web, with small delay for others
    if (Platform.OS === 'web') {
      startAnimations();
    } else {
      setTimeout(startAnimations, 100);
    }
  }, []);

  // Title shuffling effect
  useEffect(() => {
    const interval = setInterval(() => {
      titleOpacity.value = withSequence(
        withTiming(0, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
      
      setTimeout(() => {
        setActiveTitleIndex((prev) => (prev + 1) % titles.length);
      }, 200);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Simple animated styles with explicit positioning
  const circle1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: circle1X.value - width * 0.2 },
      { translateY: circle1Y.value - height * 0.3 }
    ],
  }));

  const circle2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: circle2X.value - width * 0.7 },
      { translateY: circle2Y.value - height * 0.2 }
    ],
  }));

  const circle3Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: circle3X.value - width * 0.3 },
      { translateY: circle3Y.value - height * 0.7 }
    ],
  }));

  const circle4Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: circle4X.value - width * 0.8 },
      { translateY: circle4Y.value - height * 0.6 }
    ],
  }));

  const circle5Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: circle5X.value - width * 0.5 },
      { translateY: circle5Y.value - height * 0.4 }
    ],
  }));

  // Title animation style with web fallback
  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Animated Circles Background */}
      <View style={styles.circlesContainer}>
        <Animated.View style={[
          styles.circle, 
          { 
            backgroundColor: circleColors[0],
            left: width * 0.2 - 250,
            top: height * 0.3 - 250,
          }, 
          circle1Style
        ]} />
        <Animated.View style={[
          styles.circle, 
          { 
            backgroundColor: circleColors[1], 
            width: 120, 
            height: 120,
            left: width * 0.7 - 60,
            top: height * 0.2 - 60,
          }, 
          circle2Style
        ]} />
        <Animated.View style={[
          styles.circle, 
          { 
            backgroundColor: circleColors[2], 
            width: 80, 
            height: 80,
            left: width * 0.3 - 40,
            top: height * 0.7 - 40,
          }, 
          circle3Style
        ]} />
        <Animated.View style={[
          styles.circle, 
          { 
            backgroundColor: circleColors[3], 
            width: 150, 
            height: 150,
            left: width * 0.8 - 75,
            top: height * 0.6 - 75,
          }, 
          circle4Style
        ]} />
        <Animated.View style={[
          styles.circle, 
          { 
            backgroundColor: circleColors[4], 
            width: 90, 
            height: 90,
            left: width * 0.5 - 45,
            top: height * 0.4 - 45,
          }, 
          circle5Style
        ]} />
      </View>


      <BlurView 
        intensity={Platform.OS === 'android' ? 150 : 20}
        blurReductionFactor={Platform.OS === 'android' ? 2 : undefined}
        tint="dark"
        style={styles.blurContainer}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
      >
        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <FadeTranslate order={1}>
              <Text style={styles.masterText}>Master your</Text>
             </FadeTranslate> 
             <FadeTranslate order={2}>
               <Animated.Text style={[styles.dynamicTitle, titleAnimatedStyle]}>
                 {titles[activeTitleIndex]}
               </Animated.Text>
             </FadeTranslate>
          </View>
              
          <FadeTranslate order={3}>
          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.beginButton}
              onPress={() => router.push("../../../(auth)/Onboarding/Questions/FitnessGoal")}
            >
                <Text style={styles.beginButtonText}>Begin</Text>
            </TouchableOpacity>

          <FadeTranslate order={4}>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.loginText}>You already have an account?</Text>
            </TouchableOpacity>
          </FadeTranslate>
          </View>              
          </FadeTranslate>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  circlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    filter: Platform.OS === 'web' ? 'blur(120px)' : undefined,
  },
  circle: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 50,
    opacity: 0.7,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  titleSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  masterText: {
    fontSize: 32,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: theme.regular,
    textAlign: 'center',
    marginBottom: 8,
  },
  dynamicTitle: {
    fontSize: 48,
    color: 'white',
    fontFamily: theme.bold,
    textAlign: 'center',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: Platform.OS === "ios" ? 50 : 30,
  },
  beginButton: {
    backgroundColor: 'white',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 60,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  beginButtonText: {
    color: '#000000',
    fontSize: 18,
    fontFamily: theme.bold,
    textAlign: 'center',
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: theme.regular,
  },
});