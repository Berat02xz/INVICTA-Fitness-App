import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ButtonOnboarding from "@/components/ui/ButtonOnboarding";
import GradientBackground from "@/components/ui/GradientBackground";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";

const iconmap = {
  weight_loss: require("@/assets/icons/onboarding/weight_loss.png"),
  weight_gain: require("@/assets/icons/onboarding/weight_gain.png"),
  build_strength: require("@/assets/icons/onboarding/build_strength.png"),
  improve_health: require("@/assets/icons/onboarding/improve_health.png"),
};

const FitnessGoalScreen = () => {
  return (
    <View style={styles.container}>
      <GradientBackground position="bottom" />

      <View style={{ zIndex: 1 }}>

        <QuestionOnboarding
          question="What is your fitness goal?"
          undertext="Knowing your goals helps us tailor your experience"

        />
        <View style={{ marginTop: 30 }}></View>

        <ButtonOnboarding
          height={57}
          imageSrc={iconmap.weight_loss}
          text="Lose Weight"
          onClick={() => {
            console.log("Weight Loss selected");
          }}
          oneAnswer
          forQuestion="fitness_goal"
        />
        <ButtonOnboarding
          height={57}
          imageSrc={iconmap.weight_gain}
          text="Gain Weight"
          onClick={() => {
            console.log("Weight Gain selected");
          }}
          oneAnswer
          forQuestion="fitness_goal"
        />
        <ButtonOnboarding
          height={57}
          imageSrc={iconmap.build_strength}
          text="Build Strength"
          onClick={() => {
            console.log("Build Strength selected");
          }}
          oneAnswer
          forQuestion="fitness_goal"
        />

        <ButtonOnboarding
          height={57}
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
  container: {
    flex: 1,
    paddingTop: 30,
    padding: 25,
  },
});

export default FitnessGoalScreen;
