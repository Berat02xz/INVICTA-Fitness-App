import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { theme } from "@/constants/theme";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import FadeTranslate from "@/components/ui/FadeTranslate";
import BlurredBackground from "@/components/ui/BlurredBackground";

const titles = ['Body', 'Metabolism', 'Mind', 'Confidence', 'Health', 'Focus'];

export default function WelcomeScreen() {
  const [activeTitleIndex, setActiveTitleIndex] = useState(0);
  
  // Title animation
  const titleOpacity = useSharedValue(1);

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

  // Title animation style
  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  return (
    <BlurredBackground>
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
    </BlurredBackground>
  );
}

const styles = StyleSheet.create({
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
    color: theme.textColorSecondary,
    fontFamily: theme.regular,
    textAlign: 'center',
    marginBottom: 8,
  },
  dynamicTitle: {
    fontSize: 48,
    color: theme.primary,
    fontFamily: theme.bold,
    textAlign: 'center',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: Platform.OS === "ios" ? 50 : 30,
  },
  beginButton: {
    backgroundColor: theme.primary,
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
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: theme.bold,
    textAlign: 'center',
  },
  loginText: {
    color: theme.textColorSecondary,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: theme.regular,
  },
});