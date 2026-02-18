import { theme } from "@/constants/theme";
import React from "react";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";

interface QuestionOnboardingProps {
  question: string;
  undertext?: string;
}

const { width: screenWidth } = Dimensions.get("window");

export default function QuestionOnboarding({ question, undertext }: QuestionOnboardingProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>
        {question}
      </Text>
      {undertext && <Text style={styles.undertext}>{undertext}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
  },
  questionText: {
    fontFamily: 'ExtraBold',
    fontSize: 30,
    color: '#FFFFFF',
    textAlign: "center",
    alignSelf: "center",
    maxWidth: "100%",
    flexWrap: 'wrap',
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
