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

const DietFollow = () => {
  const { goForward } = useOnboarding();

  return (
    <View style={styles.container}>
      <GradientBackground position="bottom" />

      <View style={{ zIndex: 1 }}>
        <QuestionOnboarding question="Do you follow any of these diets?" />
        <View style={{ marginTop: 30 }}></View>
        <ButtonOnboarding
          height={57}
          text="Vegetarian 🍆"
          undertext="Excludes meat"
          onClick={() => {
            console.log("Vegetarian selected");
          }}
          forQuestion="DietFollow"
          oneAnswer
        />
        <ButtonOnboarding
          height={57}
          text="Vegan 🥕"
          undertext="Excludes all animal products"
          onClick={() => {
            console.log("Vegan selected");
          }}
          forQuestion="DietFollow"
          oneAnswer
        />
        <ButtonOnboarding
          height={57}
          text="Keto 🥑"
          undertext="Low-carb, high fat"
          onClick={() => {
            console.log("Keto selected");
          }}
          forQuestion="DietFollow"
          oneAnswer
        />
        <ButtonOnboarding
          height={57}
          text="No ❌"
          onClick={() => {
            console.log("No selected");
          }}
          forQuestion="DietFollow"
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

export default DietFollow;
