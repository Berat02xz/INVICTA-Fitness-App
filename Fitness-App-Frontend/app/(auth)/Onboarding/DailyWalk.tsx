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

const DailyWalk = () => {
  const { goForward } = useOnboarding();

  return (
    <View style={styles.outerContainer}>
      <SolidBackground />

      <View style={styles.container}>
        <QuestionOnboarding question="How much do you walk daily?" />
        <View style={{ marginTop: 30 }} />
        <ButtonOnboarding
                    text="Less than 1 hour"
          emoji='👍'
          onClick={() => {
            console.log("Less than 1 hour selected");
          }}
          forQuestion="DailyWalk"
          oneAnswer
          order={0}
        />
        <ButtonOnboarding
                    text="1-2 hours"
          emoji='👌'
          onClick={() => {
            console.log("1-2 hours selected");
          }}
          forQuestion="DailyWalk"
          oneAnswer
          order={1}
        />
        <ButtonOnboarding
                    text="More than 2 hours"
          emoji='💪'
          onClick={() => {
            console.log("More than 2 hours selected");
          }}
          forQuestion="DailyWalk"
          oneAnswer
          order={2}
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

export default DailyWalk;
