import ButtonOnboarding from "@/components/ui/ButtonOnboarding";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import { theme } from "@/constants/theme";
import { getCaloriePlans } from "@/utils/GetCaloriePlans";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useOnboarding, UserAnswers } from "./NavigationService";

const DesiredTargetWeight = () => {
  const { goForward } = useOnboarding();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const userData = {
    age: UserAnswers.find((answer) => answer.question === "age")?.answer || 25,
    sex: UserAnswers.find((answer) => answer.question === "sex")?.answer || "male",
    height: UserAnswers.find((answer) => answer.question === "height")?.answer || "185",
    weight: UserAnswers.find((answer) => answer.question === "weight")?.answer || 80,
    unit: UserAnswers.find((answer) => answer.question === "unit")?.answer || "metric",
    activity_level: UserAnswers.find((answer) => answer.question === "activity_level")?.answer || "Sedentary",
  };

  const plans = getCaloriePlans(userData);

  type FitnessGoal = string;


  return (
    <View style={styles.outerContainer}>
      <SolidBackground />

      <View style={styles.container}>
        <QuestionOnboarding question="Choose your calorie plan" />
        <View style={{ marginTop: 30 }} />

        {plans.map((plan, index) => (
          <ButtonOnboarding
            key={index}
            text={plan.type}
            undertext={`${plan.caloriesPerDay} kcal/day`}
            badgeText={plan.rate}
            order={index}
            onClick={() => { 
              setSelectedPlan(plan.type);
              UserAnswers.push({ question: "calories_target", answer: plan.caloriesPerDay });
              UserAnswers.push({ question: "calorie_deficit", answer: plan.rate });
              goForward();
            }}
            style={{
              borderColor: selectedPlan === plan.type ? theme.primary : "transparent",
              backgroundColor: selectedPlan === plan.type ? theme.primary : theme.buttonsolid,
            }}
            forQuestion="calorie_plan"
            oneAnswer
          />
        ))}
      </View>
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

export default DesiredTargetWeight;
