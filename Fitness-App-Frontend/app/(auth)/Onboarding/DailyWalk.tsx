import ButtonOnboarding from "@/components/ui/ButtonOnboarding";
import GradientBackground from "@/components/ui/GradientBackground";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useOnboarding } from "./NavigationService";

const iconmap = {
  weight_loss: require("@/assets/icons/onboarding/weight_loss.png"),
  weight_gain: require("@/assets/icons/onboarding/weight_gain.png"),
  build_strength: require("@/assets/icons/onboarding/build_strength.png"),
  improve_health: require("@/assets/icons/onboarding/improve_health.png"),
};

const DailyWalk = () => {
  const { goForward } = useOnboarding();

  return (
    <View style={styles.container}>
      <GradientBackground position="bottom" />

      <View style={{ zIndex: 1 }}>
        <QuestionOnboarding question="How much do you walk daily?" />
        <View style={{ marginTop: 30 }}></View>
        <ButtonOnboarding
          height={57}
          text="Less than 1 hour"
          onClick={() => {
            console.log("Less than 1 hour selected");
          }}
          forQuestion="DailyWalk"
          oneAnswer
        />
        <ButtonOnboarding
          height={57}
          text="1-2 hours 🚶"
          onClick={() => {
            console.log("1-2 hours selected");
          }}
          forQuestion="DailyWalk"
          oneAnswer
        />
        <ButtonOnboarding
          height={57}
          text="More than 2 hours 🚶🚶"
          onClick={() => {
            console.log("More than 2 hours selected");
          }}
          forQuestion="DailyWalk"
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

export default DailyWalk;
