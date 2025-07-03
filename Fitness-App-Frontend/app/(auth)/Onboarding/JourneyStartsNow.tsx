import {
  useOnboarding,
  UserAnswers,
} from "@/app/(auth)/Onboarding/NavigationService";
import ButtonFit from "@/components/ui/ButtonFit";
import SolidBackground from "@/components/ui/SolidBackground";
import { theme } from "@/constants/theme";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

export default function JourneyStartsNow() {
  const { goForward } = useOnboarding();
  const answerMap = Object.fromEntries(
    UserAnswers.map((item) => [item.question, item.answer])
  );

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

  const [targetDate, setTargetDate] = useState<string>(new Date().toISOString());
  useEffect(() => {
    const target = new Date();
    target.setMonth(target.getMonth() + 3);
    setTargetDate(target.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (targetDate) {
      const exists = UserAnswers.find((entry) => entry.question === "target date");
      if (!exists) {
        UserAnswers.push({ question: "target date", answer: targetDate });
        console.log("User answers submitted:", UserAnswers);
      }
    }
  }, [targetDate]);

  const unit = answerMap["unit"] || "metric";
  const rawTargetWeight = answerMap["target weight"] || "70";
  const targetWeight =
    unit === "metric" ? `${rawTargetWeight} kg` : `${rawTargetWeight} lb`;

  return (
    <View style={styles.outerContainer}>
      <SolidBackground />
      <View style={styles.container}>
        <View style={styles.main}>
          <View style={styles.middle}>
            <Text style={[styles.sloganBold, styles.whiteText]}>
              Your journey starts now.
            </Text>

            <Text style={styles.sloganRegular}>
              With our plan, you’ll crush your goal of {targetWeight} 🎉 by
            </Text>

            <Text style={[styles.sloganBold, styles.animatedDate]}>
              {animatedDateString}
            </Text>
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
  },
  container: {
    flex: 1,
    zIndex: 1,
    alignItems: "center",
  },
  main: {
    flex: 1,
    paddingTop: 250,
    paddingBottom: 80,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  middle: {
    alignItems: "center",
  },
  bottom: {
    alignItems: "center",
    marginBottom: 50,
    flex: 1,
    justifyContent: "flex-end",
  },
  sloganBold: {
    fontSize: 21,
    fontFamily: theme.bold,
    width: 300,
    textAlign: "center",
  },
  sloganRegular: {
    fontSize: 16,
    fontFamily: theme.light,
    color: "#D9D9D9",
    textAlign: "center",
    marginTop: 10,
    width: "60%",
  },
  whiteText: {
    color: "white",
  },
  animatedDate: {
    marginTop: 30,
    color: theme.primary,
  },
});
