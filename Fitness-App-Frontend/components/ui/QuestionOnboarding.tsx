import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "@/constants/theme";

interface QuestionOnboardingProps {
    question: string;
    undertext?: string;
}

export default function QuestionOnboarding({ question, undertext }: QuestionOnboardingProps) {
  return (
    <View>
      <Text style={styles.questionText}>{question}</Text>
      {undertext && <Text style={styles.undertext}>{undertext}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  questionText: {
    fontFamily: theme.medium,
    fontSize: 21,
    color: "#FFFFFF",
    textAlign: "left",
    maxWidth: "90%",
  },
  undertext: {
    marginTop: 10,
    fontFamily: theme.light,
    fontSize: 16,
    color: "#D9D9D9",
    textAlign: "left",
    lineHeight: 25,
    maxWidth: "90%",
  },
});