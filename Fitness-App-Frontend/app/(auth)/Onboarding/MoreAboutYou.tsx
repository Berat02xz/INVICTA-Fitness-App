import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import ButtonOnboarding from "@/components/ui/ButtonOnboarding";
import GradientBackground from "@/components/ui/GradientBackground";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
import ButtonFit from "@/components/ui/ButtonFit";
import { useOnboarding } from "./NavigationService";
import { theme } from "@/constants/theme";
import UnitSwitch from "@/components/ui/UnitSwitch";
import {UserAnswers} from "./NavigationService";
import { KeyboardAvoidingView,Platform,ScrollView } from "react-native";

const maleIcon = require("@/assets/icons/onboarding/Male.png");
const femaleIcon = require("@/assets/icons/onboarding/Female.png");

const MoreAboutYou = () => {
  const { goForward } = useOnboarding();
  const [age, setAge] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [height, setHeight] = useState<string>("");

  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  function HeightImperial(value: string) {
    const cleaned = value.replace(/[^0-9]/g, "");

  if (cleaned.length === 0) {
    setHeight("");
    return;
  }

  if (cleaned.length <= 1) {
    setHeight(`${cleaned}'`);
  } else {
    const feet = cleaned.slice(0, 1);
    const inches = cleaned.slice(1, 3);
    setHeight(`${feet}'${inches}`);
  }
  }

  function handleSubmit() {
    UserAnswers.push({question: "age", answer: age});
    UserAnswers.push({question: "weight", answer: weight});
    UserAnswers.push({question: "height", answer: height});
    UserAnswers.push({question: "unit", answer: unit});
  }

  return (
    <View style={styles.container}>
      <GradientBackground position="bottom" />
      <View style={styles.main}>
                <View style={{ marginLeft: 55, justifyContent: "center", alignContent: "center", alignItems: "center" }}>
        
          <QuestionOnboarding
            question="Tell us more about you.."
            undertext="This helps us design your workouts to fit your lifestyle"
          />
</View>
        <View style={{ marginTop: 10, flexGrow: 1, alignItems: "center" }}>
          <View
            style={{
              flexDirection: "column",
              gap: 12,
              justifyContent: "left",
              flexGrow: 1,
            }}
          >
            <Text style={styles.infoText}>Age</Text>
            <TextInput style={styles.input} value={age.toString()} onChangeText={setAge} keyboardType="numeric" placeholder="Enter your age" placeholderTextColor={theme.buttonBorder} />
            <Text style={styles.infoText}>Weight</Text>

            <View
              style={{ flexDirection: "row", gap: 10, justifyContent: "left" }}
            >
              <TextInput style={styles.input} value={weight.toString()} onChangeText={setWeight} keyboardType="numeric" placeholder={unit === "metric" ? "Kg" : "Lb"} placeholderTextColor={theme.buttonBorder} />
              <UnitSwitch
                unit={unit}
                onSelect={setUnit}
                metricLabel="KG"
                imperialLabel="LB"
              />
            </View>
            <Text style={styles.infoText}>Height</Text>
            <View
              style={{ flexDirection: "row", gap: 10, justifyContent: "left" }}
            >
              <TextInput style={styles.input} value={height.toString()} onChangeText={unit === "imperial" ? HeightImperial : setHeight} keyboardType="numeric"  placeholder={unit === "metric" ? "Cm" : "Ft ln"} placeholderTextColor={theme.buttonBorder} />
              <UnitSwitch
                unit={unit}
                onSelect={setUnit}
                metricLabel="CM"
                imperialLabel="FT"
              />
            </View>
          </View>
        </View>

        <View style={styles.bottom}>
          <ButtonFit
            title="Continue"
            backgroundColor={theme.primary}
            onPress={() => {
            handleSubmit();
              goForward();
            }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
    padding: 25,
  },
  main: {
    flex: 1,
    
  },
  bottom: {
    alignItems: "center",
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    fontFamily: theme.medium,
    color: theme.textColor,
    textAlign: "left",
    marginTop: 20,
  },
  input: {
    height: 45,
    borderColor: theme.buttonBorder,
    backgroundColor: theme.buttonsolid,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 16,
    fontFamily: theme.regular,
    color: theme.textColor,
    width: 250,
  },
});

export default MoreAboutYou;
