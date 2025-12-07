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
    text: "Access over 1500+ dynamic workouts tailored to your fitness level and goals.",
    backgroundColor: "#E8F5E9",
  },
  {
    emoji: "📸",
    title: "Meal Scanning with AI",
    text: "Scan your meals to track nutrition effortlessly with AI-powered analysis.",
    backgroundColor: "#FFF3E0",
  },  
  {
    emoji: "💪",
    title: "Muscle Statistics",
    text: "Track which muscles you've worked out each day for balanced training.",
    backgroundColor: "#E3F2FD",
  },  
  {
    emoji: "🤖",
    title: "AI Coach",
    text: "Chat with your personal AI coach who knows your calories, workouts, and answers fitness-related questions.",
    backgroundColor: "#FCE4EC",
  },
  {
    emoji: "🌟",
    title: "And More...",
    text: "Explore additional features to enhance your fitness journey.",
    backgroundColor: "#F3E5F5",
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
    paddingVertical: 30,
    paddingHorizontal: 20,
    gap: 14,
    ...Platform.select({
      web: {
        width: 470,
      },
      default: {
        width: "100%",
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