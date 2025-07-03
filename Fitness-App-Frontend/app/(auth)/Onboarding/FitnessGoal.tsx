import ButtonOnboarding from "@/components/ui/ButtonOnboarding";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import React from "react";
import { StyleSheet, View } from "react-native";

const iconmap = {
  weight_loss: require("@/assets/icons/onboarding/weight_loss.png"),
  weight_gain: require("@/assets/icons/onboarding/weight_gain.png"),
  build_strength: require("@/assets/icons/onboarding/build_strength.png"),
  improve_health: require("@/assets/icons/onboarding/improve_health.png"),
};

const FitnessGoalScreen = () => {
  return (
    <View style={styles.outerContainer}>
      <SolidBackground />

      <View style={styles.container}>
        <QuestionOnboarding
          question="What is your fitness goal?"
        />
        <View style={{ marginTop: 30 }} />

        <ButtonOnboarding
          imageSrc={iconmap.weight_loss}
          text="Lose Weight"
          onClick={() => {
            console.log("Weight Loss selected");
          }}
          oneAnswer
          forQuestion="fitness_goal"
        />
        <ButtonOnboarding
          imageSrc={iconmap.weight_gain}
          text="Gain Weight"
          onClick={() => {
            console.log("Weight Gain selected");
          }}
          oneAnswer
          forQuestion="fitness_goal"
        />
        <ButtonOnboarding
          imageSrc={iconmap.build_strength}
          text="Build Strength"
          onClick={() => {
            console.log("Build Strength selected");
          }}
          oneAnswer
          forQuestion="fitness_goal"
        />
        <ButtonOnboarding
          imageSrc={iconmap.improve_health}
          text="Improve Health"
          onClick={() => {
            console.log("Improve Health selected");
          }}
          oneAnswer
          forQuestion="fitness_goal"
        />
      </View>
    </View>
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

export default FitnessGoalScreen;
