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
  let questionFontSize = 27;
  if (Platform.OS === "web") {
    questionFontSize = screenWidth > 768 ? 30 : 30; // Desktop web vs mobile web
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
    fontFamily: theme.semibold,
    color: theme.textColor,
    textAlign: "center",
    alignSelf: "center",
    maxWidth: "90%",
  },
  undertext: {
    marginTop: 10,
    fontFamily: theme.light,
    fontSize: 16,
    color: "rgba(0, 0, 0, 0.84)",
    textAlign: "center",
    lineHeight: 25,
    maxWidth: "100%",
  },
});
