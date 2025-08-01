import {
  useOnboarding,
} from "@/app/(auth)/Onboarding/NavigationService";
import ButtonFit from "@/components/ui/ButtonFit";
import SolidBackground from "@/components/ui/SolidBackground";
import UndertextCard from "@/components/ui/UndertextCard";
import { theme } from "@/constants/theme";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export default function HappyBodyImageResults() {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [percentage, setPercentage] = useState(0);
  const { goForward, answers } = useOnboarding();

  const WaterAnswer = String(answers.Water) || "2 glasses";
  const lowWaterAnswers = ["2 glasses", "2-6 glasses"];
  const isLowWater = lowWaterAnswers.includes(WaterAnswer);

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


  return (
    <View style={styles.outerContainer}>
      <SolidBackground />
      <View style={styles.container}>
        <View style={styles.main}>
          <View style={styles.middle}>
            <Text style={styles.sloganBold}>
              {isLowWater
                ? `Water is essential for progress.`
                : `You drink more water than ${percentage}% of users`}
            </Text>
            <View style={styles.undertextCard}>
              <UndertextCard
                emoji="💧"
                title="Hydration Reminder"
                titleColor="white"
                text="Invicta will remind you to drink enough water."
              />
            </View>
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
    alignSelf: "center",
  },
  undertextCard: {
    marginTop: 10,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  middle: {
    alignItems: "center",
    width: "100%",
    // Remove height: "100%" — not needed
    justifyContent: "center",
  },

  bottom: {
    alignItems: "center",
    marginBottom: 50,
  },

  sloganBold: {
    fontSize: 25,
    fontFamily: theme.bold,
    color: theme.primary,
    width: 360,
    textAlign: "center",
    alignSelf: "center",
  },
  sloganRegular: {
    fontSize: 16,
    fontFamily: theme.light,
    color: "#D9D9D9",
    textAlign: "center",
    alignSelf: "center",
    marginTop: 10,
    width: 300,
  },
});
