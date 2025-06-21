import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ButtonOnboarding from "@/components/ui/ButtonOnboarding";
import GradientBackground from "@/components/ui/GradientBackground";

const iconmap = {
  weight_loss: require("@/assets/icons/onboarding/weight_loss.png"),
  weight_gain: require("@/assets/icons/onboarding/weight_gain.png"),
  build_strength: require("@/assets/icons/onboarding/build_strength.png"),
  improve_health: require("@/assets/icons/onboarding/improve_health.png"),
};

const FitnessGoalScreen = () => {
  return (
    <View style={styles.container}>
      <GradientBackground position="top" />

      <View style={{ zIndex: 1 }}>
        <ButtonOnboarding
          height={57}
          imageSrc={iconmap.weight_loss}
          text="Lose Weight"
          onClick={() => {
            console.log("Weight Loss selected");
          }}
          oneAnswer
        />
        <ButtonOnboarding
          height={57}
          imageSrc={iconmap.weight_gain}
          text="Gain Weight"
          onClick={() => {
            console.log("Weight Gain selected");
          }}
          oneAnswer
        />
        <ButtonOnboarding
          height={57}
          imageSrc={iconmap.build_strength}
          text="Build Strength"
          onClick={() => {
            console.log("Build Strength selected");
          }}
          oneAnswer
        />

        <ButtonOnboarding
          height={57}
          imageSrc={iconmap.improve_health}
          text="Improve Health"
          onClick={() => {
            console.log("Improve Health selected");
          }}
          oneAnswer
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#032ff0",
    flex: 1,
    padding: 24,
  },
});

export default FitnessGoalScreen;
