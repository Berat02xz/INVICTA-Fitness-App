import ButtonOnboarding from "@/components/ui/Onboarding/AnswerOnboarding";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useOnboarding } from "../NavigationService";


const Gender = () => {
      const { goForward, saveSelection } = useOnboarding();
    
      type FitnessGoal = string;
      const [selectedGoal, setSelectedGoal] = useState<FitnessGoal | null>(null);
    
      const handleSelectGoal = (goal: FitnessGoal, question: string): void => {
        setSelectedGoal(goal);
        saveSelection(question, goal);
      };
      
  return (
    <>
      <SolidBackground />
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <QuestionOnboarding question="Select your gender" />

          <View style={{ marginTop: 30 }} />

          <ButtonOnboarding
            text="Male"
            rightImage={require("@/assets/icons/onboarding/Male.png")}
            onClickContinue
            forQuestion="gender"
            order={0}
            onClick={() =>
              handleSelectGoal("male", "gender")
            }
          />
          <ButtonOnboarding
            text="Female"
            rightImage={require("@/assets/icons/onboarding/Female.png")}
            onClickContinue
            forQuestion="gender"
            order={1}
            onClick={() =>
              handleSelectGoal("female", "gender")
            }
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
  bottom: {
    alignItems: "center",
    marginBottom: 50,
    flex: 1,
    justifyContent: "flex-end",
  },
});

export default Gender;
