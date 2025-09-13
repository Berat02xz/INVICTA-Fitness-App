import React from "react";
import { ScrollView, StyleSheet, View, Platform } from "react-native";
import ReviewCard from "@/components/ui/Onboarding/ReviewCard";
import SolidBackground from "@/components/ui/SolidBackground";
import ButtonFit from "@/components/ui/ButtonFit";
import { theme } from "@/constants/theme";
import { useOnboarding } from "@/app/(auth)/Onboarding/NavigationService";
import FadeTranslate from "@/components/ui/FadeTranslate";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
const reviews = [
  {
    name: "Matt Young",
    username: "matty",
    avatar: require("@/assets/avatars/avatar6.jpg"),
    rating: 5,
    comment:
      "Kinda crazy how accurate the results prediction are. I put my details 3 months ago and it was almost exact.",
  },
  {
    name: "Clayton Marsh",
    username: "clay",
    avatar: require("@/assets/avatars/avatar4.jpg"),
    rating: 4,
    comment:
      "Didn't expect much but the app makes it super easy to track meals and make workouts a habit. My posture looks way better",
  },
  {
    name: "DanFit",
    username: "danfit",
    avatar: require("@/assets/avatars/avatar7.jpg"),
    rating: 5,
    comment:
      "This app makes staying fit easy and effective for all levels. No gym or equipment needed.",
  },
  {
    name: "Theo",
    username: "theo",
    avatar: require("@/assets/avatars/avatar3.jpg"),
    rating: 4,
    comment: "Downloaded for the workouts, stayed for the meal tracking.",
  },
];

export default function Reviews() {
  const { goForward } = useOnboarding();

  return (
    <>
      <SolidBackground />
      <View style={styles.outerContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <FadeTranslate order={0}>
            <QuestionOnboarding
              question="This program adapts to you based on latest science"
              undertext="and it has helped thousands"
            />
          </FadeTranslate>

          {reviews.map((review, i) => (
            <FadeTranslate order={i + 1} key={i}>
              <ReviewCard {...review} />
            </FadeTranslate>
          ))}
        </ScrollView>

        <View style={styles.bottom}>
          <FadeTranslate order={5} duration={1000}>
            <ButtonFit
              title="Continue"
              backgroundColor={theme.primary}
              onPress={goForward}
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
    justifyContent: "space-between",
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 10, // spacing between cards
    ...Platform.select({
      web: {
        width: 470,
      },
      default: { width: "100%" },
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
