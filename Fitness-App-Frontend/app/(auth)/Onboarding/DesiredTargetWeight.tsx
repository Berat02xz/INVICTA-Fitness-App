import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import GradientBackground from "@/components/ui/GradientBackground";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
import ButtonFit from "@/components/ui/ButtonFit";
import { useOnboarding } from "./NavigationService";
import { theme } from "@/constants/theme";
import UnitSwitch from "@/components/ui/UnitSwitch";
import { UserAnswers } from "./NavigationService";

const DesiredTargetWeight = () => {
  const { goForward } = useOnboarding();

  const [unit, setUnit] = useState<"metric" | "imperial">(UserAnswers.find(answer => answer.question === "unit")?.answer || "metric");
  const [targetweight, setTargetWeight] = useState<string>("");

  function handleSubmit() {
    UserAnswers.push({ question: "target weight", answer: targetweight });
    console.log("User answers submitted:", UserAnswers);
  }

  return (
    <View style={styles.container}>
      <GradientBackground position="bottom" />
      <View style={styles.main}>
        <View style={{ marginLeft: 55, justifyContent: "center", alignContent: "center", alignItems: "center" }}>
        <QuestionOnboarding
          question="Lets set a desired target weight"
          undertext="This helps us design your workouts to fit your lifestyle"
        />
</View>
        <View style={{ marginTop: 20, flexGrow: 1, alignItems: "center" }}>
          <View
            style={{
              flexDirection: "column",
              gap: 12,
              justifyContent: "left",
              flexGrow: 1,
            }}
          >
            <Text style={styles.infoText}>Target Weight</Text>

            <View
              style={{ flexDirection: "row", gap: 10, justifyContent: "left" }}
            >
              <TextInput
                style={styles.input}
                value={targetweight.toString()}
                onChangeText={setTargetWeight}
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
    paddingTop: 30,
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

export default DesiredTargetWeight;
