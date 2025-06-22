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

const HowMuchWater = () => {
  const { goForward } = useOnboarding();

  return (
    <View style={styles.container}>
      <GradientBackground position="bottom" />

      <View style={{ zIndex: 1 }}>
        <QuestionOnboarding question="How much water do you drink daily?" />
        <View style={{ marginTop: 30 }}></View>
        <ButtonOnboarding
          height={57}
          text="Only coffee or tea ☕"
          onClick={() => {
            console.log("Only coffee or tea selected");
          }}
          forQuestion="Water"
          oneAnswer
        />
        <ButtonOnboarding
          height={57}
          text="Less than 2 glasses 💧"
          undertext="up to 0,5l / 17oz"
          onClick={() => {
            console.log("Less than 2 glasses selected");
          }}
          forQuestion="Water"
          oneAnswer
        />
        <ButtonOnboarding
          height={57}
          text="2-6 glasses 💧💧"
          undertext="0,5-1.5l / 17-50 oz"
          onClick={() => {
            console.log("2-6 glasses selected");
          }}
          forQuestion="Water"
          oneAnswer
        />

        <ButtonOnboarding
          height={57}
          text="7-10 glasses 💧💧💧"
          undertext="1,5-2,5l / 50-85 oz"
          onClick={() => {
            console.log("7-10 glasses selected");
          }}
          forQuestion="Water"
          oneAnswer
        />

         <ButtonOnboarding
          height={57}
          text="More than 10 glasses 🐳"
          undertext="1,5-2.5l / 50-85 oz"
          onClick={() => {
            console.log("More than 10 glasses selected");
          }}
          forQuestion="Water"
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

export default HowMuchWater;
