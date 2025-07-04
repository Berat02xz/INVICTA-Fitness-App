import BMIBar from "@/assets/icons/onboarding/BMIBar.png";
import BMIIndicator from "@/assets/icons/onboarding/BMIIndicator.png";
import ButtonFit from "@/components/ui/ButtonFit";
import SolidBackground from "@/components/ui/SolidBackground";
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

  const BmiStatus = (() => {
    if (bmi < 19) {
      return (
        <Text style={[styles.sloganRegular, { color: "#05C9FF" }]}>
          Underweight
        </Text>
      );
    }
    if (bmi >= 19 && bmi < 25) {
      return (
        <Text style={[styles.sloganRegular, { color: "#2FFF05" }]}>
          Normal weight
        </Text>
      );
    }
    if (bmi >= 25 && bmi < 30) {
      return (
        <Text style={[styles.sloganRegular, { color: "#FF7A05" }]}>
          Overweight
        </Text>
      );
    }
    return (
      <Text style={[styles.sloganRegular, { color: "#FF0000" }]}>Obesity</Text>
    );
  })();

  function calculateBMIwithTemporaryData(
    unit: "metric" | "imperial",
    weight: string,
    height: string
  ): number {
    let bmi;
    const weightInKg = parseFloat(weight);
    const heightInM = parseFloat(height) / 100;
    if (unit === "metric") {
      bmi = weightInKg / (heightInM * heightInM);
    } else {
      const [feet, inches] = height.split("'").map(Number);
      const totalInches = feet * 12 + inches;
      const heightInMImperial = totalInches * 0.0254;
      bmi = (weightInKg / (heightInMImperial * heightInMImperial)) * 703;
    }
    return Math.round(bmi * 10) / 10;
  }

  const calculateLeftValue = (bmiValue: number): number => {
    const minBMI = 15;
    const maxBMI = 40;
    const clampedBMI = Math.min(Math.max(bmiValue, minBMI), maxBMI);
    const range = maxBMI - minBMI;
    return ((clampedBMI - minBMI) / range) * 320 - 150;
  };

  useEffect(() => {
    const calculatedBMI = calculateBMIwithTemporaryData(
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
      easing: Easing.out(Easing.poly(15))
    }).start();
  }, [targetLeft]);

  useEffect(() => {
    Animated.timing(animatedBMI, {
      toValue: bmi,
      duration: 9000,
      useNativeDriver: false,
      easing: Easing.out(Easing.poly(15))
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
          {BmiStatus}
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

          <View style={styles.card}>
  <Text
    style={[
      styles.infoText,
      {
        marginTop: 0, 
        maxWidth: "80%",
        textAlign: "left",
        fontSize: 16,
      },
    ]}
  >
    Stay within a healthy BMI with our support.
  </Text>
</View>

        </View>
      </View>
      <View style={styles.bottom}>
        <ButtonFit
          title="Continue"
          backgroundColor={theme.primary}
          onPress={() => {
            onboardingContext.goForward();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: "relative", // solid background will fill this
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
    paddingTop: 60,
    fontSize: 16,
    fontFamily: theme.semibold,
    color: "#D9D9D9",
    textAlign: "center",
    width: "65%",
  },
  infoText: {
    fontSize: 16,
    fontFamily: theme.regular,
    color: theme.textColor,
    textAlign: "center",
  },
  bmiValue: {
    fontSize: 60,
    fontFamily: theme.black,
    color: "#FFFFFF",
    marginBottom: 60,
    lineHeight: 60,
  },
  card: {
  backgroundColor: theme.buttonsolid,
  borderRadius: 10,
  padding: 20,
  marginTop: 50,
  alignItems: "flex-start", 
  width: 330,
  alignSelf: "center",
},

});

export default BMIResults;
