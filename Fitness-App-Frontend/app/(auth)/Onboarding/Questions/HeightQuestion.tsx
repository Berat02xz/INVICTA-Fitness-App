import ButtonFit from "@/components/ui/ButtonFit";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import UndertextCard from "@/components/ui/UndertextCard";
import UnitSwitch from "@/components/ui/UnitSwitch";
import { theme } from "@/constants/theme";
import React, { useState, useEffect } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useOnboarding } from "../NavigationService";

const HeightQuestion = () => {
  const { goForward, answers, saveSelection } = useOnboarding();

  // Initialize unit and height from answers or default values
  const [unit, setUnit] = useState<"metric" | "imperial">(
    (answers.unit as "metric" | "imperial") || "metric"
  );

  const [height, setHeight] = useState<string>(answers.height as string || "");

  // Clear or format height input on unit change
  useEffect(() => {
    setHeight(""); // reset height when unit changes to avoid invalid formatting
  }, [unit]);

  const handleHeightChange = (value: string) => {
    if (unit === "imperial") {
      // Keep only digits
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
    } else {
      // Metric: only digits
      setHeight(value.replace(/[^0-9]/g, ""));
    }
  };

  const handleSubmit = () => {
    saveSelection("height", height);
    saveSelection("unit", unit);
    goForward();
  };

  return (
    <View style={styles.container}>
      <SolidBackground style={StyleSheet.absoluteFill} />
      <View style={styles.content}>
        <QuestionOnboarding question="What is your height?" />
        <View style={styles.unitSwitchWrapper}>
          <UnitSwitch
            unit={unit}
            onSelect={setUnit}
            metricLabel="CM"
            imperialLabel="FT"
          />
        </View>
        <TextInput
          key={unit} // force rerender to clear input when unit changes
          style={styles.input}
          value={height}
          onChangeText={handleHeightChange}
          keyboardType="numeric"
          placeholder={unit === "metric" ? "cm" : "ft in"}
          placeholderTextColor={theme.buttonBorder}
          underlineColorAndroid="transparent"
        />

        <View style={styles.undertextCard}>
          <UndertextCard
            emoji="📏"
            title="Height"
            titleColor="white"
            text="Calculating your body mass index requires your height."
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
  bottom: {
    alignItems: "center",
    marginBottom: 50,
    flex: 1,
    justifyContent: "flex-end",
  },
});

export default HeightQuestion;
