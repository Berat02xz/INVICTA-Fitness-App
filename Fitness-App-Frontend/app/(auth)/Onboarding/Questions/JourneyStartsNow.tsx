import { useOnboarding } from "@/app/(auth)/Onboarding/NavigationService";
import ButtonFit from "@/components/ui/ButtonFit";
import FadeTranslate from "@/components/ui/FadeTranslate";
import SolidBackground from "@/components/ui/SolidBackground";
import UndertextCard from "@/components/ui/UndertextCard";
import { theme } from "@/constants/theme";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
    saveSelection("target date", isoDate); // use isoDate directly
  }, []);

  // -------------------- Get calorie plan from UserAnswers --------------------
  // It should be an object like { type, rate, caloriesPerDay }
  const caloric_intake = answers.caloric_intake || null;
  const caloriesTarget = answers.calories_target || null;

  const displayedCalories = caloric_intake || "0";

  return (
    <View style={styles.outerContainer}>
      <SolidBackground />
      {Platform.OS !== "web" && (
        <ConfettiCannon
          count={20}
          origin={{ x: -10, y: -10 }}
          fadeOut
          fallSpeed={3500}
        />
      )}

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
                  titleColor="white"
                  text="In 3 months, expect noticeable gains in strength and tone."
                />
              </FadeTranslate>
              <FadeTranslate order={3}>
                <UndertextCard
                  emoji="🔥"
                  title={`${caloriesTarget || "Calorie Target"}`}
                  titleColor="white"
                  text={`${displayedCalories} calories per day to stay on track`}
                />
              </FadeTranslate>
              <FadeTranslate order={4}>
                <UndertextCard
                  emoji="📅"
                  title="Target Date"
                  titleColor="white"
                  text={`You’ll crush your goal by ${animatedDateString}`}
                />
              </FadeTranslate>
            </View>

            <FadeTranslate order={5}>
              <Text style={styles.sloganRegular}>
                Your only limit is you. Show up every day.
              </Text>
            </FadeTranslate>
          </View>
        </View>

        <View style={styles.bottom}>
          <ButtonFit
            title="Continue"
            backgroundColor={theme.primary}
            onPress={goForward}
          />
        </View>
      </View>
    </View>
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
    paddingHorizontal: 70,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  middle: {
    alignItems: "center",
  },
  cardsContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  bottom: {
    alignItems: "center",
    marginBottom: 40,
  },
  sloganBold: {
    fontSize: 23,
    fontFamily: theme.bold,
    width: 300,
    textAlign: "center",
  },
  sloganRegular: {
    fontSize: 18,
    fontFamily: theme.light,
    color: "#D9D9D9",
    textAlign: "center",
    marginTop: 10,
  },
  whiteText: {
    color: "white",
  },
  animatedDate: {
    marginTop: 30,
    color: theme.primary,
  },
});
