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

const PushUps = () => {

  return (
    <View style={styles.container}>
      <SolidBackground style={StyleSheet.absoluteFill} />

      <View style={styles.content}>
        <View style={{ zIndex: 1 }}>
          <QuestionOnboarding question="How many push-ups can you do?" />
          <View style={{ marginTop: 30 }} />
          <ButtonOnboarding
                        text="Less than 12"
            onClick={() => {
              console.log("Less than 12 selected");
            }}
            forQuestion="PushUps"
            oneAnswer
          />
          <ButtonOnboarding
            text="13-20 💪"
            onClick={() => {
              console.log("13-20 selected");
            }}
            forQuestion="PushUps"
            oneAnswer
          />
          <ButtonOnboarding
                        text="More than 21 💪💪"
            onClick={() => {
              console.log("More than 21 selected");
            }}
            forQuestion="PushUps"
            oneAnswer
          />
          
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 25,
    alignItems: "center",
  },
});

export default PushUps;
