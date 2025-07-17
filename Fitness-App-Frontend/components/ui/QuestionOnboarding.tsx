import { theme } from "@/constants/theme";
import React from "react";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";

interface QuestionOnboardingProps {
  question: string;
  undertext?: string;
}

const { width: screenWidth } = Dimensions.get("window");

export default function QuestionOnboarding({ question, undertext }: QuestionOnboardingProps) {
  // Font size logic
  let questionFontSize = 25;
  if (Platform.OS === "web") {
    questionFontSize = screenWidth > 768 ? 28 : 22; // Desktop web vs mobile web
  }

  return (
    <View>
      <Text style={[styles.questionText, { fontSize: questionFontSize }]}>
        {question}
      </Text>
      {undertext && <Text style={styles.undertext}>{undertext}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  questionText: {
    fontFamily: theme.bold,
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
