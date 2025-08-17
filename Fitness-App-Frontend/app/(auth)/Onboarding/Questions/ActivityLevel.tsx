import ButtonOnboarding from "@/components/ui/Onboarding/AnswerOnboarding";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import React from "react";
import { StyleSheet, View } from "react-native";

const activity_level = {
  no_level: require("@/assets/icons/onboarding/activity_level_00000.png"),
  slightly_active: require("@/assets/icons/onboarding/activity_level_00001.png"),
  moderately_active: require("@/assets/icons/onboarding/activity_level_00002.png"),
  very_active: require("@/assets/icons/onboarding/activity_level_00003.png"),
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
            undertext="Little to no movement"
            imageSrc={activity_level.no_level}
            forQuestion="activity_level"
            order={0}
          />
          <ButtonOnboarding
            text="Slightly Active"
            undertext="Light daily movement or walks"
            imageSrc={activity_level.slightly_active}
            forQuestion="activity_level"
            order={1}
          />
          <ButtonOnboarding
            text="Moderately Active"
            undertext="physical job"
            imageSrc={activity_level.moderately_active}
            forQuestion="activity_level"
            order={2}
          />
          <ButtonOnboarding
            text="Very Active"
            undertext="I exercise daily"
            imageSrc={activity_level.very_active}
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
