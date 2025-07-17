import BMIBar from "@/assets/icons/onboarding/BMIBar.png";
import BMIIndicator from "@/assets/icons/onboarding/BMIIndicator.png";
import ButtonFit from "@/components/ui/ButtonFit";
import SolidBackground from "@/components/ui/SolidBackground";
import UndertextCard from "@/components/ui/UndertextCard";
import { theme } from "@/constants/theme";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { useOnboarding, UserAnswers } from "./NavigationService";

function BMIResults() {
  const onboardingContext = useOnboarding();

  const weight =
    UserAnswers.find((answer) => answer.question === "weight")?.answer || "85";
  const height =
    UserAnswers.find((answer) => answer.question === "height")?.answer || "175";
  const unit =
    UserAnswers.find((answer) => answer.question === "unit")?.answer ||
    "metric";

  const [bmi, setBmi] = useState<number>(0);
  const [targetLeft, setTargetLeft] = useState<number>(-150);
  const [displayBmi, setDisplayBmi] = useState<number>(0);

  const leftAnim = useRef(new Animated.Value(-150)).current;
  const animatedBMI = useRef(new Animated.Value(0)).current;

  function calculateBMI(unit: "metric" | "imperial", weight: string, height: string): number {
  let bmi = 0;
  const weightValue = parseFloat(weight);

  if (unit === "metric") {
    const heightInM = parseFloat(height) / 100;
    bmi = weightValue / (heightInM * heightInM);
  } else {
    const [feetStr, inchStr] = height.split("'");
    const feet = parseInt(feetStr || "0", 10);
    let inches = parseInt(inchStr || "0", 10);

    // Sanitize: Cap inches at 11
    inches = Math.min(inches, 11);

    const totalInches = feet * 12 + inches;
    if (totalInches === 0) return 0;

    bmi = (weightValue / (totalInches * totalInches)) * 703;
  }

  return Math.round(bmi * 10) / 10;
}


  const calculateLeftValue = (bmiValue: number): number => {
    const minBMI = 15;
    const maxBMI = 40;
    const clampedBMI = Math.min(Math.max(bmiValue, minBMI), maxBMI); // <-- clamp to 40
    const range = maxBMI - minBMI;
    return ((clampedBMI - minBMI) / range) * 320 - 150;
  };

  const getDynamicCardContent = (bmi: number) => {
    if (bmi < 19) {
      return {
        emoji: "🧃",
        label: "Underweight",
        color: "#05C9FF",
        text: "You’re underweight. We’ll help you gain healthy mass through a balanced plan.",
      };
    }
    if (bmi >= 19 && bmi < 25) {
      return {
        emoji: "💪",
        label: "Normal weight",
        color: "#2FFF05",
        text: "Great job! You're in a healthy range. Let’s keep it that way with smart choices.",
      };
    }
    if (bmi >= 25 && bmi < 30) {
      return {
        emoji: "🥗",
        label: "Overweight",
        color: "#FF7A05",
        text: "You're slightly overweight. We'll focus on shedding some pounds safely.",
      };
    }
    return {
      emoji: "🚨",
      label: "Obesity",
      color: "#FF0000",
      text: "Your BMI is in the obesity range. We’ll help you take the first steps toward better health.",
    };
  };

  const dynamicCard = getDynamicCardContent(bmi);

  useEffect(() => {
    const calculatedBMI = calculateBMI(
      unit as "metric" | "imperial",
      weight,
      height
    );
    setBmi(calculatedBMI);
    setTargetLeft(calculateLeftValue(calculatedBMI));
  }, []);

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
    <View style={styles.outerContainer}>
      <SolidBackground style={StyleSheet.absoluteFill} />
      <View style={styles.main}>
        <View style={styles.middle}>
          <Text style={styles.sloganBold}>Your Body Mass Index</Text>
          <Text style={[styles.sloganRegular, { paddingTop: 60 }]}>
            {dynamicCard.text.split(" ").slice(0, 2).join(" ")}
          </Text>
          <Text style={styles.bmiValue}>{displayBmi.toFixed(1)}</Text>

          <Image
            source={BMIBar}
            style={{ width: 355 * scale, height: 27.9 * scale }}
          />
          <Animated.Image
            source={BMIIndicator}
            style={{
              position: "relative",
              top: 10,
              left: leftAnim,
              width: 17 * scale,
              height: 16 * scale,
            }}
          />

          <UndertextCard
            emoji={dynamicCard.emoji}
            title={dynamicCard.label}
            titleColor={dynamicCard.color}
            text={dynamicCard.text}
          />
        </View>
      </View>

      <View style={styles.bottom}>
        <ButtonFit
          title="Continue"
          backgroundColor={theme.primary}
          onPress={() => onboardingContext.goForward()}
        />
      </View>
    </View>
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
    paddingBottom: 80,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    zIndex: 1,
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
    fontSize: 25,
    fontFamily: theme.semibold,
    color: "#FFFFFF",
    textAlign: "center",
  },
  sloganRegular: {
    fontSize: 16,
    fontFamily: theme.semibold,
    color: "#D9D9D9",
    textAlign: "center",
    width: "65%",
  },
  bmiValue: {
    fontSize: 60,
    fontFamily: theme.black,
    color: "#FFFFFF",
    marginBottom: 60,
    lineHeight: 60,
  },
  undertextCard: {
    backgroundColor: theme.buttonsolid,
    padding: 15,
    borderRadius: 12,
    marginTop: 50,
    maxWidth: 330,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "center",
  },
  emoji: {
    fontSize: 25,
  },
  undertext: {
    flex: 1,
    fontSize: 15,
    color: theme.textColor,
    fontFamily: theme.regular,
    textAlign: "left",
    lineHeight: 22,
  },
  categoryTitle: {
    fontSize: 16,
    fontFamily: theme.semibold,
    marginBottom: 4,
  },
});

export default BMIResults;
