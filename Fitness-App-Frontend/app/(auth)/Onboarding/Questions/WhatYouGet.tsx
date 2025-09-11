import React from "react";
import { ScrollView, StyleSheet, View, Platform } from "react-native";
import { theme } from "@/constants/theme";
import { useOnboarding } from "@/app/(auth)/Onboarding/NavigationService";
import FadeTranslate from "@/components/ui/FadeTranslate";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import UndertextCard from "@/components/ui/UndertextCard";
import SolidBackground from "@/components/ui/SolidBackground";
import ButtonFit from "@/components/ui/ButtonFit";

const features = [
  {
    emoji: "🏋️‍♂️",
    title: "Dynamic Workouts",
    titleColor: "white",
    text: "Access over 1500+ dynamic workouts tailored to your fitness level and goals.",
  },
  {
    emoji: "📸",
    title: "Meal Scanning with AI",
    titleColor: "white",
    text: "Scan your meals to track nutrition effortlessly with AI-powered analysis.",
  },  
  {
    emoji: "💪",
    title: "Muscle Statistics",
    titleColor: "white",
    text: "Track which muscles you’ve worked out each day for balanced training.",
  },  
  {
    emoji: "🤖",
    title: "AI Coach",
    titleColor: "white",
    text: "Chat with your personal AI coach who knows your calories, workouts, and answers fitness-related questions.",
  },
  {
    emoji: "🌟",
    title: "And More...",
    titleColor: "white",
    text: "Explore additional features to enhance your fitness journey.",
  },
];

export default function WhatYouGet() {
  const { goForward } = useOnboarding();

  return (
    <>
      <SolidBackground />
      <View style={styles.outerContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <FadeTranslate order={0}>
            <QuestionOnboarding
              question="What you get"
              undertext="Features to transform your fitness journey"
            />
          </FadeTranslate>

          {features.map((feature, i) => (
            <FadeTranslate order={i + 1} key={i}>
              <UndertextCard {...feature}  />
            </FadeTranslate>
          ))}
        </ScrollView>

        <View style={styles.bottom}>
          <ButtonFit
            title="Continue"
            backgroundColor={theme.primary}
            onPress={goForward}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: "relative",
    justifyContent: "space-between",
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 10, // Spacing between cards
    ...Platform.select({
      web: {
        width: 470, // Fixed width for web
      },
      default: {
        width: "100%", // Full width for mobile
      },
    }),
    justifyContent: "flex-start",
    alignSelf: "center",
  },
  bottom: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});