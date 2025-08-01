import ButtonFit from "@/components/ui/ButtonFit";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import UndertextCard from "@/components/ui/UndertextCard";
import { theme } from "@/constants/theme";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useOnboarding } from "../NavigationService";

const AgeQuestion = () => {
  const { goForward, saveSelection, answers } = useOnboarding();

  const handleChange = (value: string) => {
    // Save as number if it's a valid numeric string
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) saveSelection("age", parsed);
  };

  const handleSubmit = () => {
    saveSelection("app_name", "Invicta");
    goForward(); 
  };

  return (
    <View style={styles.container}>
      <SolidBackground style={StyleSheet.absoluteFill} />
      <View style={styles.content}>
        <QuestionOnboarding question="What is your age?" />

        <TextInput
          style={styles.input}
          value={answers.age?.toString() || ""}
          onChangeText={handleChange}
          keyboardType="numeric"
          placeholder="Age"
          placeholderTextColor={theme.buttonBorder}
          maxLength={3}
          underlineColorAndroid="transparent"
        />

        <View style={styles.undertextCard}>
          <UndertextCard
            emoji="☝️"
            title="Your age is important"
            titleColor={theme.textColor}
            text="Helps us make adjustments to your personal plan."
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

export default AgeQuestion;
