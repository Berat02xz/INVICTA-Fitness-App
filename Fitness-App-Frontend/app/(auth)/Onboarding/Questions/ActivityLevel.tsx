import ButtonOnboarding from "@/components/ui/Onboarding/AnswerOnboarding";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import React from "react";
import { StyleSheet, View } from "react-native";

const activity_level = {
  no_level: "seat-recline-normal", // Person sitting/reclining
  slightly_active: "walk", // Person walking
  moderately_active: "run", // Person running
  very_active: "weight-lifter", // Person lifting weights
};

const ActivityLevel = () => {
  return (
    <>
      <SolidBackground />
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <QuestionOnboarding question="What is your activity level?" />
          <View style={{ marginTop: 30 }} />

          <ButtonOnboarding
            text="Sedentary"
            emoji="🪑"
            forQuestion="activity_level"
            order={0}
          />
          <ButtonOnboarding
            text="Slightly Active"
            emoji="🚶‍♂️"
            forQuestion="activity_level"
            order={1}
          />
          <ButtonOnboarding
            text="Moderately Active"
            emoji="🏃‍♂️"
            forQuestion="activity_level"
            order={2}
          />
          <ButtonOnboarding
            text="Very Active"
            emoji="🏋️‍♂️"
            forQuestion="activity_level"
            order={3}
          />
        </View>
      </View>
    </>
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
    padding: 25,
    zIndex: 1,
    alignItems: "center",
  },
});

export default ActivityLevel;
