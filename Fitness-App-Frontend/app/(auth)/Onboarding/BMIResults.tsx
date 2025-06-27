import React, { useRef, useState } from "react";
import { View, Text } from "react-native";
import ButtonOnboarding from "@/components/ui/ButtonOnboarding";
import GradientBackground from "@/components/ui/GradientBackground";
import { StyleSheet } from "react-native";
import ButtonFit from "@/components/ui/ButtonFit";
import { theme } from "@/constants/theme";
import { useOnboarding } from "./NavigationService";
import { Image } from "expo-image";
import BMIBar from "@/assets/icons/onboarding/BMIBar.png";
import BMIIndicator from "@/assets/icons/onboarding/BMIIndicator.png";
import { Animated } from "react-native";
import { useEffect } from "react";
import { UserAnswers } from "./NavigationService";

function BMIResults() {
  const onboardingContext = useOnboarding();

  const weight =
    UserAnswers.find((answer) => answer.question === "weight")?.answer || "85"; // default weight
  const height =
    UserAnswers.find((answer) => answer.question === "height")?.answer || "175"; // default height
  const unit =
    UserAnswers.find((answer) => answer.question === "unit")?.answer ||
    "metric";

  const [bmi, setBmi] = useState<number>(0);
  const [targetLeft, setTargetLeft] = useState<number>(-170);
  const [displayBmi, setDisplayBmi] = useState<number>(0);

  const leftAnim = useRef(new Animated.Value(-170)).current;
  const animatedBMI = useRef(new Animated.Value(0)).current;

  const BmiStatus = (() => {
    if (bmi < 19) {
      return (
        <Text style={[styles.sloganRegular, { color: "lightblue" }]}>
          Underweight
        </Text>
      );
    }
    if (bmi >= 19 && bmi < 25) {
      return (
        <Text style={[styles.sloganRegular, { color: "lightgreen" }]}>
          Normal weight
        </Text>
      );
    }
    if (bmi >= 25 && bmi < 30) {
      return (
        <Text style={[styles.sloganRegular, { color: "orange" }]}>
          Overweight
        </Text>
      );
    }
    return (
      <Text style={[styles.sloganRegular, { color: "red" }]}>Obesity</Text>
    );
  })();

  //This function is to be used only on this screen
  //in main app there will be a separate function that takes from LocalStorage
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
      //imperial height is given in format such as 5'10"
      const [feet, inches] = height.split("'").map(Number);
      const totalInches = feet * 12 + inches;
      const heightInMImperial = totalInches * 0.0254;
      bmi = (weightInKg / (heightInMImperial * heightInMImperial)) * 703;
    }
    return Math.round(bmi * 10) / 10;
  }

  // Starting left value for indicator is -170, ending point is 170
  // BMI values go fom 15 to 40, so we can calculate the left value based on the BMI value
  const calculateLeftValue = (bmiValue: number): number => {
    const minBMI = 15;
    const maxBMI = 40;
    const clampedBMI = Math.min(Math.max(bmiValue, minBMI), maxBMI);
    const range = maxBMI - minBMI;
    return ((clampedBMI - minBMI) / range) * 340 - 170;
  };

  useEffect(() => {
    const calculatedBMI = calculateBMIwithTemporaryData(
      unit as "metric" | "imperial",
      weight,
      height
    );
    setBmi(calculatedBMI);
    const left = calculateLeftValue(calculatedBMI);
    setTargetLeft(left);
  }, []);

  useEffect(() => {
    Animated.timing(leftAnim, {
      toValue: targetLeft,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [targetLeft]);

  useEffect(() => {
    Animated.timing(animatedBMI, {
      toValue: bmi,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [bmi]);

  useEffect(() => {
    const id = animatedBMI.addListener(({ value }) => {
      setDisplayBmi(Math.round(value * 10) / 10);
    });

    return () => {
      animatedBMI.removeListener(id);
    };
  }, []);

  return (
    <View style={styles.container}>
      <GradientBackground position="bottom" />

      <View style={styles.main}>
        <View style={styles.middle}>
          <Text style={styles.sloganBold}>Your BMI is...</Text>
          {BmiStatus}
          <Text style={styles.bmiValue}>{displayBmi.toFixed(1)}</Text>
          <Image source={BMIBar} style={{ width: 369, height: 55 }} />
          <Animated.Image
            source={BMIIndicator}
            style={{
              position: "relative",
              top: 10,
              left: leftAnim,
              width: 20,
              height: 19,
            }}
          />

          <Text
            style={[
              styles.infoText,
              {
                marginTop: 70,
                width: 350,
                fontFamily: theme.light,
                fontSize: 19,
              },
            ]}
          >
            Our program will help you achieve a{" "}
            <Text
              style={{
                color: "lightgreen",
                fontFamily: theme.light,
                fontSize: 19,
              }}
            >
              Normal
            </Text>{" "}
            BMI of 18.5 - 24.9
          </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  main: {
    flex: 1,
    paddingTop: 120,
    paddingBottom: 80,
    paddingHorizontal: 24,
    justifyContent: "space-between",

  },
  top: {
    alignItems: "center",
  },
  middle: {
    alignItems: "center",
  },
  bottom: {
    alignItems: "center",
    gap: 10,
  },
  Logo: {
    fontSize: 48,
    fontFamily: theme.black,
    color: theme.textColor,
    marginBottom: 20,
  },
  sloganBold: {
    fontSize: 21,
    fontFamily: theme.medium,
    color: "#FFFFFF",
    textAlign: "center",
  },
  sloganRegular: {
    fontSize: 16,
    fontFamily: theme.light,
    color: "#D9D9D9",
    textAlign: "center",
    marginTop: 2,
    width: "65%",
  },
  infoText: {
    fontSize: 16,
    fontFamily: theme.regular,
    color: theme.textColor,
  },
  bmiValue: {
    fontSize: 60,
    fontFamily: theme.bold,
    color: "#FFFFFF",
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 30,
  },
});

export default BMIResults;
