import { useOnboarding } from "@/app/(auth)/Onboarding/NavigationService";
import ButtonFit from "@/components/ui/ButtonFit";
import FadeTranslate from "@/components/ui/FadeTranslate";
import SolidBackground from "@/components/ui/SolidBackground";
import UndertextCard from "@/components/ui/UndertextCard";
import ReviewCard from "@/components/ui/Onboarding/ReviewCard";
import { theme } from "@/constants/theme";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ScrollView } from "react-native-reanimated/lib/typescript/Animated";
import ConfettiCannon from "react-native-confetti-cannon";

export default function JourneyStartsNow() {
  const { goForward, saveSelection, answers } = useOnboarding();

  const animation = useRef(new Animated.Value(0)).current;
  const [animatedDateString, setAnimatedDateString] = useState("");

  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 3);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 3000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    const id = animation.addListener(({ value }) => {
      const animatedDate = new Date(
        startDate.getTime() + value * (endDate.getTime() - startDate.getTime())
      );
      const formatted = animatedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      setAnimatedDateString(formatted);
    });

    return () => animation.removeListener(id);
  }, [animation]);

  const [targetDate, setTargetDate] = useState<string>(
    new Date().toISOString()
  );
  useEffect(() => {
    const target = new Date();
    target.setMonth(target.getMonth() + 3);
    const isoDate = target.toISOString().split("T")[0];
    setTargetDate(isoDate);
    saveSelection("target date", isoDate);
  }, []);

  const caloric_intake = answers.caloric_intake || null;
  const caloriesTarget = answers.calories_target || null;
  const displayedCalories = caloric_intake || "0";

  
  return (
    <>
      <SolidBackground />
      <ConfettiCannon count={20} origin={{ x: -10, y: 0 }} />

      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <View style={styles.main}>
            <View style={styles.middle}>
              <FadeTranslate order={1}>
                <Text style={[styles.sloganBold, styles.whiteText]}>
                  Your journey starts now.
                </Text>
              </FadeTranslate>

              <View style={styles.cardsContainer}>
                <FadeTranslate order={2}>
                  <UndertextCard
                    emoji="💪"
                    title="Muscle Progress"
                    text="In 3 months, expect noticeable gains in strength and tone."
                    backgroundColor="#E8F5E9"
                  />
                </FadeTranslate>
                <FadeTranslate order={3}>
                  <UndertextCard
                    emoji="🔥"
                    title={`${caloriesTarget || "Calorie Target"}`}
                    text={`${displayedCalories} calories per day to stay on track`}
                    backgroundColor="#FFF3E0"
                  />
                </FadeTranslate>
                <FadeTranslate order={4}>
                  <UndertextCard
                    emoji="📅"
                    title="Target Date"
                    text={`You'll crush your goal by ${animatedDateString}`}
                    backgroundColor="#E3F2FD"
                  />
                </FadeTranslate>
                <FadeTranslate order={5}>
                  <UndertextCard
                    emoji="🍽️"
                    title="Workout & Diet"
                    text="Initial Daily Caloric Intake based on your goals"
                    backgroundColor="#FCE4EC"
                  />
                </FadeTranslate>
              </View>

              <FadeTranslate order={7}>
                <Text style={styles.sloganRegular}>
                  Your only limit is you. Show up every day.
                </Text>
              </FadeTranslate>
            </View>
          </View>
          <FadeTranslate order={15} duration={500}>
            <View style={styles.bottom}>
              <ButtonFit
                title="Continue"
                backgroundColor={theme.primary}
                onPress={goForward}
              />
            </View>
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
    overflow: "hidden",
  },
  container: {
    flex: 1,
    zIndex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  middle: {
    alignItems: "center",
    width: "100%",
  },
  cardsContainer: {
    marginTop: 30,
    marginBottom: 20,
    gap: 15,
  },
  bottom: {
    alignItems: "center",
    marginBottom: 50,
    width: "100%",
  },
  sloganBold: {
    fontSize: 28,
    fontFamily: theme.bold,
    textAlign: "center",
    color: theme.textColor,
    marginBottom: 10,
  },
  sloganRegular: {
    fontSize: 16,
    fontFamily: theme.light,
    color: theme.textColorSecondary,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 24,
  },
  whiteText: {
    color: theme.textColor,
  },
});
