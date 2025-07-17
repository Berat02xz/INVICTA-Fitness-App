import ButtonFit from "@/components/ui/ButtonFit";
import ButtonOnboarding from "@/components/ui/ButtonOnboarding";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import { theme } from "@/constants/theme";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useOnboarding, UserAnswers } from "./NavigationService";
const iconmap = {
  weight_loss: require("@/assets/icons/onboarding/weight_loss.png"),
  weight_gain: require("@/assets/icons/onboarding/weight_gain.png"),
  build_strength: require("@/assets/icons/onboarding/build_strength.png"),
  improve_health: require("@/assets/icons/onboarding/improve_health.png"),
};

const FitnessGoalScreen = () => {
  const { goForward } = useOnboarding();
  
  type FitnessGoal = string;
  const [selectedGoal, setSelectedGoal] = useState<FitnessGoal | null>(null);

  const handleSelectGoal = (goal: FitnessGoal, question: string): void => {
    setSelectedGoal(goal);
    UserAnswers.push({ question, answer: goal });
    console.log(`${goal} selected`);
  };


  return (
    <View style={styles.outerContainer}>
      <SolidBackground />

      <View style={styles.container}>
        <QuestionOnboarding question="What is your fitness goal?" />
        <View style={{ marginTop: 30 }} />

        <ButtonOnboarding
          text="Lose Weight"
          emoji="🏃‍♂️"
          onClick={() => {
            handleSelectGoal("Lose Weight","Weight Goal");
          }}
          forQuestion="weight_goal"
          order={0}
        />
        <ButtonOnboarding
          text="Gain Weight"
          emoji="🏋️‍♀️"
          onClick={() => {
            handleSelectGoal("Gain Weight","Weight Goal");
          }}
          forQuestion="weight_goal"
          order={1}
        />
        <ButtonOnboarding
          text="Build Strength"
          emoji="💪"
          onClick={() => {
            handleSelectGoal("Build Strength","Fitness Goal");
          }}
          forQuestion="fitness_goal"
          order={2}
        />
        <ButtonOnboarding
          text="Improve Health"
          emoji="❤️"
          onClick={() => {
            handleSelectGoal("Improve Health","Fitness Goal");
          }}
          forQuestion="fitness_goal"
          order={3}
        />
      </View>
      {selectedGoal && (
  <View style={styles.bottom}>
    <ButtonFit
      title="Continue"
      backgroundColor={theme.primary}
      onPress={goForward}
    />
  </View>
)}

    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: "relative",
  },
  bottom: {
    alignItems: "center",
    marginBottom: 50,
    flex: 1,
    justifyContent: "flex-end",
  },
  container: {
    flex: 1,
    paddingTop: 30,
    padding: 25,
    zIndex: 1,
    alignItems: "center",
  },
});

export default FitnessGoalScreen;
