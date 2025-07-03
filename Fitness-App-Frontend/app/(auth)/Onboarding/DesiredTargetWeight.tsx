import ButtonFit from "@/components/ui/ButtonFit";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import UnitSwitch from "@/components/ui/UnitSwitch";
import { theme } from "@/constants/theme";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useOnboarding, UserAnswers } from "./NavigationService";

const DesiredTargetWeight = () => {
  const { goForward } = useOnboarding();

  const [unit, setUnit] = useState<"metric" | "imperial">(
    UserAnswers.find(answer => answer.question === "unit")?.answer || "metric"
  );
  const [targetweight, setTargetWeight] = useState<string>("");

  function handleSubmit() {
    UserAnswers.push({ question: "target weight", answer: targetweight });
  }

  return (
    <View style={styles.outerContainer}>
      <SolidBackground />
      <View style={styles.container}>
        <View style={{ justifyContent: "center", alignContent: "center", alignItems: "center" }}>
          <QuestionOnboarding
            question="Lets set a desired target weight"
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

            <View style={{ flexDirection: "row", gap: 10, justifyContent: "left" }}>
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
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: "relative",
  },
  container: {
    flex: 1,
    paddingTop: 30,
    paddingVertical: 25,
    zIndex: 1,
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
    height: 45,
    backgroundColor: theme.buttonsolid,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    fontFamily: theme.regular,
    color: theme.textColor,
    width: 250,
  },
});

export default DesiredTargetWeight;
