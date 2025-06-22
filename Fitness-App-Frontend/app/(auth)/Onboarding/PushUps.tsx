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

const PushUps = () => {
  const { goForward } = useOnboarding();

  return (
    <View style={styles.container}>
      <GradientBackground position="bottom" />

      <View style={{ zIndex: 1 }}>
        <QuestionOnboarding question="How many push-ups can you do?" />
        <View style={{ marginTop: 30 }}></View>
        <ButtonOnboarding
          height={57}
          text="I don't know"
          onClick={() => {
            console.log("I don't know selected");
          }}
          forQuestion="PushUps"
          oneAnswer
        />
        <ButtonOnboarding
          height={57}
          text="Less than 12"
          onClick={() => {
            console.log("Less than 12 selected");
          }}
          forQuestion="PushUps"
          oneAnswer
        />
        <ButtonOnboarding
          height={57}
          text="13-20 💪"
          onClick={() => {
            console.log("13-20 selected");
          }}
          forQuestion="PushUps"
          oneAnswer
        />
        <ButtonOnboarding
          height={57}
          text="More than 21 💪💪"
          onClick={() => {
            console.log("More than 21 selected");
          }}
          forQuestion="PushUps"
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

export default PushUps;
