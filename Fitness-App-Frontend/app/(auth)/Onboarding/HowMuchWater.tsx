import ButtonOnboarding from "@/components/ui/ButtonOnboarding";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useOnboarding } from "./NavigationService";

const HowMuchWater = () => {
  const { goForward } = useOnboarding();

  return (
    <View style={styles.outerContainer}>
      <SolidBackground />

      <View style={styles.container}>
        <QuestionOnboarding question="How much water do you drink daily?" />
        <View style={{ marginTop: 30 }} />

        <ButtonOnboarding
                    text="Only coffee or tea ☕"
          onClick={() => {
            console.log("Only coffee or tea selected");
          }}
          forQuestion="Water"
          oneAnswer
        />
        <ButtonOnboarding
                    text="Less than 2 glasses 💧"
          undertext="up to 0,5l / 17oz"
          onClick={() => {
            console.log("Less than 2 glasses selected");
          }}
          forQuestion="Water"
          oneAnswer
        />
        <ButtonOnboarding
                    text="2-6 glasses 💧💧"
          undertext="0,5-1.5l / 17-50 oz"
          onClick={() => {
            console.log("2-6 glasses selected");
          }}
          forQuestion="Water"
          oneAnswer
        />
        <ButtonOnboarding
                    text="7-10 glasses 💧💧💧"
          undertext="1,5-2,5l / 50-85 oz"
          onClick={() => {
            console.log("7-10 glasses selected");
          }}
          forQuestion="Water"
          oneAnswer
        />
        <ButtonOnboarding
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

export default HowMuchWater;
