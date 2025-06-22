import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ButtonOnboarding from "@/components/ui/ButtonOnboarding";
import GradientBackground from "@/components/ui/GradientBackground";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
import ButtonFit from "@/components/ui/ButtonFit";
import { useOnboarding } from "./NavigationService";
import { theme } from "@/constants/theme";

const iconmap = {
  weight_loss: require("@/assets/icons/onboarding/weight_loss.png"),
  weight_gain: require("@/assets/icons/onboarding/weight_gain.png"),
  build_strength: require("@/assets/icons/onboarding/build_strength.png"),
  improve_health: require("@/assets/icons/onboarding/improve_health.png"),
};

const FeelBetweenMeals = () => {
  const { goForward } = useOnboarding();

  return (
    <View style={styles.container}>
      <GradientBackground position="bottom" />

      <View style={{ zIndex: 1 }}>
        <QuestionOnboarding question="How do you feel between meals?" />
        <View style={{ marginTop: 30 }}></View>
        <ButtonOnboarding
          height={57}
          text="I’m tired after I eat"
          onClick={() => {
            console.log("I’m tired after I eat selected");
          }}
          forQuestion="FeelBetweenMeals"
          oneAnswer
        />
        <ButtonOnboarding
          height={57}
          text="I get sleepy when I'm hungry"
          onClick={() => {
            console.log("I get sleepy when I'm hungry selected");
          }}
          forQuestion="FeelBetweenMeals"
          oneAnswer
        />
        <ButtonOnboarding
          height={57}
          text="I feel irritable when i’m hungry"
          onClick={() => {
            console.log("I feel irritable when i’m hungry selected");
          }}
          forQuestion="FeelBetweenMeals"
          oneAnswer
        />
        <ButtonOnboarding
          height={57}
          text="I have enough energy during the day"
          onClick={() => {
            console.log("I have enough energy during the day selected");
          }}
          forQuestion="FeelBetweenMeals"
          oneAnswer
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

export default FeelBetweenMeals;
