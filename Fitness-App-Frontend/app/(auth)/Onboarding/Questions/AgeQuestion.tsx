import ButtonFit from "@/components/ui/ButtonFit";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import UndertextCard from "@/components/ui/UndertextCard";
import { theme } from "@/constants/theme";
import React, { useEffect, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useOnboarding } from "../NavigationService";
import FadeTranslate from "@/components/ui/FadeTranslate";

const DEFAULT_AGE = "25"; // You can change this default as needed

const AgeQuestion = () => {
  const { goForward, saveSelection, answers } = useOnboarding();
  const [age, setAge] = useState<string>(() => answers?.age?.toString() ?? "");

  // If answers.age arrives later, initialize only when local age is empty
  useEffect(() => {
    if (answers?.age != null && age === "") {
      setAge(String(answers.age));
    }
  }, [answers?.age]);

  const handleChange = (value: string) => {
    const digitsOnly = value.replace(/[^0-9]/g, "");
    setAge(digitsOnly);
  };

  const handleSubmit = () => {
    const ageToSave = age === "" ? DEFAULT_AGE : age;
    saveSelection("age", ageToSave);
    goForward();
  };

  return (
    <>
      <SolidBackground style={StyleSheet.absoluteFill} />
      <View style={styles.container}>
        <View style={styles.content}>
          <FadeTranslate order={1}>
          <QuestionOnboarding question="What is your age?" />
          </FadeTranslate>
          <FadeTranslate order={2}>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={handleChange}
            keyboardType="numeric"
            placeholder="Age"
            placeholderTextColor={theme.buttonBorder}
            maxLength={3}
            underlineColorAndroid="transparent"
          />
          </FadeTranslate>
          <FadeTranslate order={3}>
          <View style={styles.undertextCard}>
            <UndertextCard
              emoji="☝️"
              title="Your age is important"
              titleColor={theme.textColor}
              text="Helps us make adjustments to your personal plan."
            />
          </View>
          </FadeTranslate>
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
