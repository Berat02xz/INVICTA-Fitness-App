import { theme } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

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
    fontFamily: theme.bold,
    fontSize: 25,
    color: "#FFFFFF",
    textAlign: "center",
    maxWidth: "100%",
  },
  undertext: {
    marginTop: 10,
    fontFamily: theme.light,
    fontSize: 16,
    color: "#D9D9D9",
    textAlign: "center",
    lineHeight: 25,
    maxWidth: "100%",
  },
});