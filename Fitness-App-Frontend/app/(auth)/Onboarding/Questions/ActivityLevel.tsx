import ButtonOnboarding from "@/components/ui/AnswerOnboarding";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
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
    <View style={styles.outerContainer}>
      <SolidBackground />

      <View style={styles.container}>
        <QuestionOnboarding
          question="What is your activity level?"
        />
        <View style={{ marginTop: 30 }} />

        <ButtonOnboarding
          text="Sedentary"
          undertext="Little to no movement"
          imageSrc={activity_level.no_level}
          onClick={() => {
            console.log("Sedentary selected");
          }}
          
          forQuestion="activity_level"
          order={0}
        />
        <ButtonOnboarding
          text="Slightly Active"
          undertext="Walk or move a bit daily"
          imageSrc={activity_level.slightly_active}
          onClick={() => {
            console.log("Slightly Active selected");
          }}
          
          forQuestion="activity_level"
          order={1}
        />
        <ButtonOnboarding
          text="Moderately Active"
          undertext="Physically demanding job"
          imageSrc={activity_level.moderately_active}
          onClick={() => {
            console.log("Moderately Active selected");
          }}
          
          forQuestion="activity_level"
          order={2}
        />
        <ButtonOnboarding
          text="Very Active"
          undertext="I exercise daily"
          imageSrc={activity_level.very_active}
          onClick={() => {
            console.log("Very Active selected");
          }}
          
          forQuestion="activity_level"
          order={3}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: 'relative',
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
