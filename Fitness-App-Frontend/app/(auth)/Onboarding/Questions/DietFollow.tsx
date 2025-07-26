import ButtonOnboarding from "@/components/ui/AnswerOnboarding";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
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

const DietFollow = () => {
  const { goForward } = useOnboarding();

  return (
    <View style={styles.outerContainer}>
      <SolidBackground />

      <View style={styles.container}>
        <QuestionOnboarding question="Have you tried any of these diets?" />
        <View style={{ marginTop: 30 }} />
        <ButtonOnboarding
                    text="Vegetarian"
          emoji='🥗'
          undertext="Excludes meat"
          forQuestion="DietFollow"
          onClickContinue
          order={0}
        />
        <ButtonOnboarding
                    text="Vegan"
          emoji='🥕'
          undertext="Excludes all animal products"
          forQuestion="DietFollow"
          onClickContinue
          order={1}
        />
        <ButtonOnboarding
                    text="Keto"
          emoji='🥑'
          undertext="Low-carb, high fat"
          forQuestion="DietFollow"
          onClickContinue
          order={2}
        />
        <ButtonOnboarding
                    text="No"
          emoji='❌'
          forQuestion="DietFollow"
          onClickContinue
          order={3}
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
