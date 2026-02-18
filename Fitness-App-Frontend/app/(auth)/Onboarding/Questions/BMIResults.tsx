import ButtonFit from "@/components/ui/ButtonFit";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import UndertextCard from "@/components/ui/UndertextCard";
import { theme } from "@/constants/theme";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { useOnboarding } from "../NavigationService";
import calculateBMI from "@/utils/CalculateBMI";
import FadeTranslate from "@/components/ui/FadeTranslate";

const BMIBar = require("@/assets/icons/onboarding/BMIBar.png");
const BMIIndicator = require("@/assets/icons/onboarding/BMIIndicator.png");
const UnderdevelopedImage = require("@/assets/icons/onboarding/underdeveloped.png");
const NormalImage = require("@/assets/icons/onboarding/normal.png");
const OverweightImage = require("@/assets/icons/onboarding/overweight.png");
const ObeseImage = require("@/assets/icons/onboarding/obese.png");
const F_UnderdevelopedImage = require("@/assets/icons/onboarding/F_underdeveloped.png");
const F_NormalImage = require("@/assets/icons/onboarding/F_normal.png");
const F_OverweightImage = require("@/assets/icons/onboarding/F_overweight.png");
const F_ObeseImage = require("@/assets/icons/onboarding/F_overweight.png");

function BMIResults() {
  const onboardingContext = useOnboarding();
  const { answers, saveSelection } = onboardingContext;

  const weight = answers.weight?.toString() || "85";
  const height = answers.height?.toString() || "185";
  const unit = answers.unit || "metric";
  const gender = ((answers.gender as string) || "male").toLowerCase();

  // Extract values from answers array (assuming multiple selections)
  const fitnessLevel = Array.isArray(answers.fitnessLevel)
    ? answers.fitnessLevel[0]
    : answers.fitnessLevel || "Beginner";
  const activityLevel = Array.isArray(answers.activity_level)
    ? answers.activity_level[0]
    : answers.activity_level || "Sedentary";
  const motivation = Array.isArray(answers.motivation)
    ? answers.motivation[0]
    : answers.motivation || "HIGH";

  const [bmi, setBmi] = useState<number>(0);
  const [targetLeft, setTargetLeft] = useState<number>(-3.6);
  const [displayBmi, setDisplayBmi] = useState<number>(0);

  const leftAnim = useRef(new Animated.Value(-3.6)).current;
  const animatedBMI = useRef(new Animated.Value(0)).current;

  // --- only save once on init or when inputs change ---
  useEffect(() => {
    const calculatedBMI = calculateBMI(
      unit as "metric" | "imperial",
      weight,
      height
    );
    setBmi(calculatedBMI);
    setTargetLeft(calculateLeftValue(calculatedBMI));
    saveSelection("bmi", calculatedBMI);
  }, [weight, height, unit]);

  const calculateLeftValue = (bmiValue: number): number => {
    const minBMI = 15;
    const maxBMI = 40; // Increased to handle higher BMI values
    const clampedBMI = Math.min(Math.max(bmiValue, minBMI), maxBMI);
    const range = maxBMI - minBMI;
    // Returns percentage position (0-100), accounting for indicator width
    return ((clampedBMI - minBMI) / range) * 285; // Updated for 285px width
  };

  const getBodyImage = (bmi: number) => {
    const isFemale = gender === "female";
    
    if (bmi < 19) {
      return isFemale ? F_UnderdevelopedImage : UnderdevelopedImage;
    }
    if (bmi >= 19 && bmi < 25) {
      return isFemale ? F_NormalImage : NormalImage;
    }
    if (bmi >= 25 && bmi < 30) {
      return isFemale ? F_OverweightImage : OverweightImage;
    }
    return isFemale ? F_ObeseImage : ObeseImage;
  };

  const getDynamicCardContent = (bmi: number) => {
    if (bmi < 19) {
      return {
        emoji: "❤️",
        title: "You are underweight!",
        text: "Your tailored plan will help you achieve your goal BMI in no time!",
      };
    }
    if (bmi >= 19 && bmi < 25) {
      return {
        emoji: "❤️",
        title: "You are healthy!",
        text: "Your tailored plan will help you maintain your goal BMI in no time!",
      };
    }
    if (bmi >= 25 && bmi < 30) {
      return {
        emoji: "❤️",
        title: "You are overweight!",
        text: "Your tailored plan will help you achieve your goal BMI in no time!",
      };
    }
    return {
      emoji: "❤️",
      title: "You are obese!",
      text: "Your tailored plan will help you achieve your goal BMI in no time!",
    };
  };

  const dynamicCard = getDynamicCardContent(bmi);
  const bodyImage = getBodyImage(bmi);

  useEffect(() => {
    Animated.timing(leftAnim, {
      toValue: targetLeft,
      duration: 9000,
      useNativeDriver: false,
      easing: Easing.out(Easing.poly(15)),
    }).start();
  }, [targetLeft]);

  useEffect(() => {
    Animated.timing(animatedBMI, {
      toValue: bmi,
      duration: 9000,
      useNativeDriver: false,
      easing: Easing.out(Easing.poly(15)),
    }).start();
  }, [bmi]);

  useEffect(() => {
    const id = animatedBMI.addListener(({ value }) => {
      setDisplayBmi(Math.round(value * 10) / 10);
    });
    return () => animatedBMI.removeListener(id);
  }, []);

  const scale = 0.9;

  return (
    <>
      <SolidBackground style={StyleSheet.absoluteFill} />
      <View style={styles.outerContainer}>
        <View style={styles.main}>
          {/* Header */}
          <FadeTranslate order={1}>
            <View style={{ marginBottom: 20 }}>
              <QuestionOnboarding
                question="Your Current Card:"
              />
            </View>
          </FadeTranslate>

          {/* BMI Bar Card */}
          <FadeTranslate order={2}>
            <View style={styles.bmiCard}>
              <Text style={styles.bmiLabel}>Body Mass Index</Text>
              <View style={styles.bmiBarSection}>
                <View style={styles.bmiBarContainer}>
                  <Image
                    source={BMIBar}
                    style={{ width: "100%", height: 51 }}
                  />
                  <Animated.Image
                    source={BMIIndicator}
                    style={{
                      position: "absolute",
                      top: 5,
                      left: Animated.add(
                        Animated.multiply(leftAnim, new Animated.Value(1)),
                        new Animated.Value(0)
                      ),
                      width: 24,
                      height: 24,
                      zIndex: 10,
                    }}
                  />
                </View>
              </View>
            </View>
          </FadeTranslate>

          {/* Stats and Body Image Section */}
          <FadeTranslate order={4}>
            <View style={styles.statsBodyCard}>
              <View style={styles.statsBodySection}>
                {/* Left: Stats */}
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Body Mass Index</Text>
                    <Text style={styles.statValue}>{displayBmi.toFixed(1)}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Lifestyle</Text>
                    <Text style={styles.statValue}>{activityLevel}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Motivation</Text>
                    <Text style={styles.statValue}>{motivation}</Text>
                  </View>
                </View>

                {/* Right: Body Image */}
                <View style={styles.bodyImageContainer}>
                  <Image
                    source={bodyImage}
                    style={styles.bodyImage}
                    contentFit="contain"
                  />
                </View>
              </View>
            </View>
          </FadeTranslate>

          {/* UndertextCard */}
          <FadeTranslate order={5}>
            <View style={styles.undertextCardContainer}>
              <UndertextCard
                emoji={dynamicCard.emoji}
                title={dynamicCard.title}
                text={dynamicCard.text}
                backgroundColor="#00A713"
              />
            </View>
          </FadeTranslate>
        </View>

        {/* Continue Button */}
        <View style={styles.bottom}>
          <FadeTranslate order={6} duration={1000}>
            <ButtonFit
              title="Continue"
              backgroundColor={theme.primary}
              onPress={() => onboardingContext.goForward()}
            />
          </FadeTranslate>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: "relative",
  },
  main: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 24,
    justifyContent: "flex-start",
    zIndex: 1,
    overflow: "visible" as any,
  },
  bmiLabel: {
    fontSize: 15,
    fontFamily: theme.regular,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },
  bmiBarSection: {
    alignItems: "center",
    position: "relative",
    height: 60,
    justifyContent: "center",
    overflow: "visible" as any,
  },
  bmiBarContainer: {
    position: "relative",
    width: "100%",
    maxWidth: 285,
    alignItems: "center",
  },
  bmiCard: {
    backgroundColor: theme.deepPrimary,
    borderRadius: 20,
    paddingTop: 20,
    alignSelf: "center",
    width: "100%",
    maxWidth: 340,
    height: 120,
    marginBottom: 18,
  },
  statsBodyCard: {
    backgroundColor: theme.deepPrimary,
    borderRadius: 20,
    padding: 20,
    alignSelf: "center",
    width: "100%",
    maxWidth: 340,
    marginBottom: 18,
  },
  statsBodySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
  },
  statsContainer: {
    justifyContent: "center",
  },
  statItem: {
    marginBottom: 15,
  },
  statLabel: {
    fontSize: 15,
    fontFamily: theme.regular,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    fontFamily: theme.bold,
    color: "#FFFFFF",
  },
  bodyImageContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
    width: 120,
  },
  bodyImage: {
    width: 120,
    height: 200,
  },
  bmiValue: {
    fontSize: 50,
    fontFamily: theme.black,
    color: theme.primary,
    textAlign: "center",
    marginBottom: 20,
  },
  undertextCardContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  bottom: {
    alignItems: "center",
    marginBottom: 50,
    paddingHorizontal: 24,
  },
});

export default BMIResults;
