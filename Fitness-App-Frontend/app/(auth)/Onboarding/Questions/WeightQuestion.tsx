import ButtonFit from "@/components/ui/ButtonFit";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import UndertextCard from "@/components/ui/UndertextCard";
import UnitSwitch from "@/components/ui/UnitSwitch";
import { theme } from "@/constants/theme";
import React, { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useOnboarding } from "../NavigationService";

const DEFAULT_WEIGHT_METRIC = "70";
const DEFAULT_WEIGHT_IMPERIAL = "154";

const WeightQuestion = () => {
  const { goForward, answers, saveSelection } = useOnboarding();
  const [unit, setUnit] = useState<"metric" | "imperial">(
    (answers.unit as "metric" | "imperial") || "metric"
  );
  const [weight, setWeight] = useState<string>("");

  const handleWeightChange = (value: string) => {
    setWeight(value.replace(/[^0-9]/g, ""));
  };

  const handleSubmit = () => {
    let weightToSave = weight;
    if (weight === "") {
      weightToSave = unit === "metric" ? DEFAULT_WEIGHT_METRIC : DEFAULT_WEIGHT_IMPERIAL;
    }
    saveSelection("weight", weightToSave);
    saveSelection("unit", unit);
    goForward();
  };

  return (
    <>
      <SolidBackground style={StyleSheet.absoluteFill} />
      <View style={styles.container}>
        <View style={styles.content}>
          <QuestionOnboarding question="What is your weight?" />
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
            value={weight}
            onChangeText={handleWeightChange}
            keyboardType="numeric"
            placeholder={unit === "metric" ? "kg" : "lb"}
            placeholderTextColor={theme.buttonBorder}
            underlineColorAndroid="transparent"
          />
          <View style={styles.undertextCard}>
            <UndertextCard
              emoji="⚖️"
              title="Weight"
              titleColor="white"
              text="Your weight is essential for tailoring your fitness plan."
            />
          </View>
        </View>

        <View style={styles.bottom}>
          <ButtonFit
            title="Continue"
            backgroundColor={theme.primary}
            onPress={handleSubmit}
          />
        </View>
      </View>
    </>
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
    marginTop: 10,
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

export default WeightQuestion;
