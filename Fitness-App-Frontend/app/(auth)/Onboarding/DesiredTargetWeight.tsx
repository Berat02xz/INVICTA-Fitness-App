import ButtonFit from "@/components/ui/ButtonFit";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import UndertextCard from "@/components/ui/UndertextCard";
import UnitSwitch from "@/components/ui/UnitSwitch";
import { theme } from "@/constants/theme";
import React, { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useOnboarding, UserAnswers } from "./NavigationService";

const DesiredTargetWeight = () => {
  const { goForward } = useOnboarding();

  const [unit, setUnit] = useState<"metric" | "imperial">(
    UserAnswers.find((answer) => answer.question === "unit")?.answer || "metric"
  );
  const [targetWeight, setTargetWeight] = useState<string>("");

  const handleWeightChange = (value: string) => {
    setTargetWeight(value.replace(/[^0-9]/g, ""));
  };

  const handleSubmit = () => {
    const existingTarget = UserAnswers.findIndex(
      (item) => item.question === "target weight"
    );
    if (existingTarget > -1) {
      UserAnswers[existingTarget].answer = targetWeight;
    } else {
      UserAnswers.push({ question: "target weight", answer: targetWeight });
    }

    const existingUnit = UserAnswers.findIndex(
      (item) => item.question === "unit"
    );
    if (existingUnit > -1) {
      UserAnswers[existingUnit].answer = unit;
    } else {
      UserAnswers.push({ question: "unit", answer: unit });
    }

    goForward();
  };

  return (
    <View style={styles.container}>
      <SolidBackground style={StyleSheet.absoluteFill} />
      <View style={styles.content}>
        <QuestionOnboarding question="What is your target weight?" />

        <View style={styles.unitSwitchWrapper}>
          <UnitSwitch
            unit={unit}
            onSelect={setUnit}
            metricLabel="KG"
            imperialLabel="LB"
          />
        </View>

        <TextInput
          key={unit}
          style={styles.input}
          value={targetWeight}
          onChangeText={handleWeightChange}
          keyboardType="numeric"
          placeholder={unit === "metric" ? "kg" : "lb"}
          placeholderTextColor={theme.buttonBorder}
          underlineColorAndroid="transparent"
        />

        <UndertextCard
          emoji="🎯"
          title="Target Weight"
          titleColor="red"
          text="Setting a target helps us build a plan to reach your goal efficiently."
        />
      </View>

      <View style={styles.bottom}>
        <ButtonFit
          title="Continue"
          backgroundColor={theme.primary}
          onPress={handleSubmit}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    fontSize: 36,
    width: 150,
    borderBottomWidth: 1,
    borderBottomColor: theme.primary,
    textAlign: "center",
    color: theme.textColor,
    fontFamily: theme.bold,
    marginTop: 40,
  },
  unitSwitchWrapper: {
    marginTop: 20,
    alignItems: "center",
  },
  undertextCard: {
    backgroundColor: theme.buttonsolid,
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    maxWidth: 300,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  bottom: {
    alignItems: "center",
    marginBottom: 50,
    flex: 1,
    justifyContent: "flex-end",
  },
});

export default DesiredTargetWeight;
