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

const DietFollow = () => {
  const { goForward } = useOnboarding();

  return (
    <View style={styles.outerContainer}>
      <SolidBackground />

      <View style={styles.container}>
        <QuestionOnboarding question="Do you follow any of these diets?" />
        <View style={{ marginTop: 30 }} />
        <ButtonOnboarding
                    text="Vegetarian 🍆"
          undertext="Excludes meat"
          onClick={() => {
            console.log("Vegetarian selected");
          }}
          forQuestion="DietFollow"
          oneAnswer
        />
        <ButtonOnboarding
                    text="Vegan 🥕"
          undertext="Excludes all animal products"
          onClick={() => {
            console.log("Vegan selected");
          }}
          forQuestion="DietFollow"
          oneAnswer
        />
        <ButtonOnboarding
                    text="Keto 🥑"
          undertext="Low-carb, high fat"
          onClick={() => {
            console.log("Keto selected");
          }}
          forQuestion="DietFollow"
          oneAnswer
        />
        <ButtonOnboarding
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

export default DietFollow;
