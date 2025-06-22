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

const HowMuchSleep = () => {
  const { goForward } = useOnboarding();

  return (
    <View style={styles.container}>
      <GradientBackground position="bottom" />

      <View style={{ zIndex: 1 }}>
        <QuestionOnboarding question="How much sleep do you get?" />
        <View style={{ marginTop: 30 }}></View>
        <ButtonOnboarding
          height={57}
          text="Fewer than 6 hours"
          onClick={() => {
            console.log("Fewer than 6 hours selected");
          }}
          forQuestion="Sleep"
          oneAnswer
        />
        <ButtonOnboarding
          height={57}
          text="Between 6 and 8 hours 😴"
          onClick={() => {
            console.log("Between 6 and 8 hours selected");
          }}
          forQuestion="Sleep"
          oneAnswer
        />
        <ButtonOnboarding
          height={57}
          text="Over 8 hours 😴😴"
          onClick={() => {
            console.log("Over 8 hours selected");
          }}
          forQuestion="Sleep"
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

export default HowMuchSleep;
