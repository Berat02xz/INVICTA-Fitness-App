import {
  useOnboarding,
  UserAnswers,
} from "@/app/(auth)/Onboarding/NavigationService";
import ButtonFit from "@/components/ui/ButtonFit";
import SolidBackground from "@/components/ui/SolidBackground";
import { theme } from "@/constants/theme";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export default function HappyBodyImageResults() {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [percentage, setPercentage] = useState(0);
  const { goForward } = useOnboarding();

  const answerMap = Object.fromEntries(
    UserAnswers.map((item) => [item.question, item.answer])
  );

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 50,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    const listener = animatedValue.addListener(({ value }) => {
      setPercentage(Math.floor(value));
    });

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [animatedValue]);

  const lowWaterAnswers = ["Less than 2 glasses 💧", "Only coffee or tea ☕"];
  const isLowWater = lowWaterAnswers.includes(answerMap["Water"] || "");

  return (
    <View style={styles.outerContainer}>
      <SolidBackground />
      <View style={styles.container}>
        <View style={styles.main}>
          <View style={styles.middle}>
            <Text style={styles.sloganBold}>
              {isLowWater
                ? `Drinking water is essential`
                : `You drink more water than ${percentage}% of users`}
            </Text>

            <Text style={styles.sloganRegular}>
              {isLowWater
                ? "If you're not hydrated, your body can't perform at its highest level. InFit will remind you to drink enough water."
                : "InFit will remind you to drink enough water."}
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
    color: theme.primary,
    width: 300,
    textAlign: "center",
  },
  sloganRegular: {
    fontSize: 16,
    fontFamily: theme.light,
    color: "#D9D9D9",
    textAlign: "center",
    marginTop: 10,
    width: 300,
  },
});
