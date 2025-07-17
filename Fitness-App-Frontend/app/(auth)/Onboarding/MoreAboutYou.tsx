import ButtonFit from "@/components/ui/ButtonFit";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import UnitSwitch from "@/components/ui/UnitSwitch";
import { theme } from "@/constants/theme";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useOnboarding, UserAnswers } from "./NavigationService";

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
    const questions = ["age", "weight", "height", "unit"];
    const answers = [age, weight, height, unit];

    questions.forEach((q, idx) => {
      const existingIndex = UserAnswers.findIndex(
        (item) => item.question === q
      );
      if (existingIndex > -1) {
        UserAnswers[existingIndex].answer = answers[idx];
      } else {
        UserAnswers.push({ question: q, answer: answers[idx] });
      }
    });
  }

  return (
    <View style={styles.container}>
      <SolidBackground style={StyleSheet.absoluteFill} />

      <View style={styles.content}>
        <View
          style={{
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <QuestionOnboarding question="Tell us more about you.." />
        </View>

        <View style={{ marginTop: 10, flexGrow: 1, alignItems: "center" }}>
          <View
            style={{
              flexDirection: "column",
              gap: 12,
              justifyContent: "flex-start",
              flexGrow: 1,
            }}
          >
            <Text style={styles.infoText}>Age</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="Enter your age"
              placeholderTextColor={theme.buttonBorder}
            />

            <Text style={styles.infoText}>Weight</Text>
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                justifyContent: "flex-start",
              }}
            >
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder={unit === "metric" ? "Kg" : "Lb"}
                placeholderTextColor={theme.buttonBorder}
              />
              <UnitSwitch
                unit={unit}
                onSelect={setUnit}
                metricLabel="KG"
                imperialLabel="LB"
              />
            </View>

            <Text style={styles.infoText}>Height</Text>
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                justifyContent: "flex-start",
              }}
            >
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={unit === "imperial" ? HeightImperial : setHeight}
                keyboardType="numeric"
                placeholder={unit === "metric" ? "Cm" : "Ft ln"}
                placeholderTextColor={theme.buttonBorder}
              />
              <UnitSwitch
                unit={unit}
                onSelect={setUnit}
                metricLabel="CM"
                imperialLabel="FT"
              />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 25,
    paddingBottom: 30,
  },
  bottom: {
    alignItems: "center",
    marginBottom: 50,
    flex: 1,
    justifyContent: "flex-end",
  },
  infoText: {
    fontSize: 16,
    fontFamily: theme.medium,
    color: theme.textColor,
    textAlign: "left",
    marginTop: 20,
  },
  input: {
    height: 52,
    backgroundColor: theme.buttonsolid,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    fontFamily: theme.regular,
    color: theme.textColor,
    width: 230,
  },
});

export default MoreAboutYou;
