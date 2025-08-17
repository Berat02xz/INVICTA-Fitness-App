import ButtonOnboarding from "@/components/ui/Onboarding/AnswerOnboarding";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useOnboarding } from "../NavigationService";

const iconmap = {
  weight_loss: require("@/assets/icons/onboarding/weight_loss.png"),
  weight_gain: require("@/assets/icons/onboarding/weight_gain.png"),
  build_strength: require("@/assets/icons/onboarding/build_strength.png"),
  improve_health: require("@/assets/icons/onboarding/improve_health.png"),
};

const FeelBetweenMeals = () => {
  const { goForward } = useOnboarding();

  return (
    <>
      <SolidBackground />
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <QuestionOnboarding question="How do you feel between meals?" />
          <View style={{ marginTop: 30 }} />
          <ButtonOnboarding
            text="I feel tired after I eat"
            emoji="😴"
            forQuestion="FeelBetweenMeals"
            onClickContinue
            order={0}
          />
          <ButtonOnboarding
            text="I feel irritable"
            emoji="😡"
            forQuestion="FeelBetweenMeals"
            onClickContinue
            order={1}
          />
          <ButtonOnboarding
            text="I feel light and energetic"
            emoji="💪"
            forQuestion="FeelBetweenMeals"
            onClickContinue
            order={2}
          />
        </View>
      </View>
    </>
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
