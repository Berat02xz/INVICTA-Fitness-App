import ButtonOnboarding from "@/components/ui/ButtonOnboarding";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useOnboarding } from "./NavigationService";

const iconmap = {
  weight_loss: require("@/assets/icons/onboarding/weight_loss.png"),
  weight_gain: require("@/assets/icons/onboarding/weight_gain.png"),
  build_strength: require("@/assets/icons/onboarding/build_strength.png"),
  improve_health: require("@/assets/icons/onboarding/improve_health.png"),
};

const FeelBetweenMeals = () => {
  const { goForward } = useOnboarding();

  return (
    <View style={styles.outerContainer}>
      <SolidBackground />

      <View style={styles.container}>
        <QuestionOnboarding question="How do you feel between meals?" />
        <View style={{ marginTop: 30 }} />
        <ButtonOnboarding
                    text="I’m tired after I eat"
                    emoji='😴'
          onClick={() => {
            console.log("I’m tired after I eat selected");
          }}
          forQuestion="FeelBetweenMeals"
          oneAnswer
        />
        <ButtonOnboarding
                    text="I get sleepy when I'm hungry"
          emoji='😌'
          onClick={() => {
            console.log("I get sleepy when I'm hungry selected");
          }}
          forQuestion="FeelBetweenMeals"
          oneAnswer
        />
        <ButtonOnboarding
                    text="I feel irritable when i’m hungry"
          emoji='😡'
          onClick={() => {
            console.log("I feel irritable when i’m hungry selected");
          }}
          forQuestion="FeelBetweenMeals"
          oneAnswer
        />
        <ButtonOnboarding
                    text="I have enough energy during the day"
          emoji='💪'
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

export default FeelBetweenMeals;
