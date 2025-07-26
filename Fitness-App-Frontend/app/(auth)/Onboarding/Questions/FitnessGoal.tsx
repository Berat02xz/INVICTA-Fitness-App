import ButtonOnboarding from "@/components/ui/AnswerOnboarding";
import ButtonFit from "@/components/ui/ButtonFit";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import { theme } from "@/constants/theme";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useOnboarding } from "../NavigationService";
const iconmap = {
  weight_loss: require("@/assets/icons/onboarding/weight_loss.png"),
  weight_gain: require("@/assets/icons/onboarding/weight_gain.png"),
  build_strength: require("@/assets/icons/onboarding/build_strength.png"),
  improve_health: require("@/assets/icons/onboarding/improve_health.png"),
};

const FitnessGoalScreen = () => {
  const { goForward, saveSelection } = useOnboarding();
  
  type FitnessGoal = string;
  const [selectedGoal, setSelectedGoal] = useState<FitnessGoal | null>(null);

  const handleSelectGoal = (goal: FitnessGoal, question: string): void => {
    setSelectedGoal(goal);
    saveSelection(question, goal);
  };


  return (
    <View style={styles.outerContainer}>
      <SolidBackground />

      <View style={styles.container}>
        <QuestionOnboarding question="What is your fitness goal?" />
        <View style={{ marginTop: 30 }} />

        <ButtonOnboarding
          text="Lose Fat"
          emoji="🏃‍♂️"
          forQuestion="fitness_goal"
          order={0}
          onClickContinue={false}
        />
        <ButtonOnboarding
          text="Gain Muscle"
          emoji="🏋️‍♀️"
          forQuestion="fitness_goal"
          order={1}
          onClickContinue={false}
        />
        <ButtonOnboarding
          text="Build Strength"
          emoji="💪"
          forQuestion="fitness_goal"
          order={2}
          onClickContinue={false}
        />
        <ButtonOnboarding
          text="Holistic Wellbeing"
          //Green plant emoji
          emoji="🤸🏽"
          forQuestion="fitness_goal"
          order={3}
          onClickContinue={false}
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
