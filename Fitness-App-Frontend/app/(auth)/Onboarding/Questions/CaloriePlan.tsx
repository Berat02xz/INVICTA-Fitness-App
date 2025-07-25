import ButtonOnboarding from "@/components/ui/AnswerOnboarding";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import { theme } from "@/constants/theme";
import { getCaloriePlans, calculateBMR } from "@/utils/GetCaloriePlans";
import calculateCaloriesPerDay from "@/utils/CalculateCaloriesPerDay";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useOnboarding, UserAnswers } from "../NavigationService";

const DesiredTargetWeight = () => {
  const { goForward } = useOnboarding();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const userData = {
    age: UserAnswers.find((answer) => answer.question === "age")?.answer || 25,
    sex:
      UserAnswers.find((answer) => answer.question === "gender")?.answer || "male",
    height:
      UserAnswers.find((answer) => answer.question === "height")?.answer ||
      "185",
    weight:
      UserAnswers.find((answer) => answer.question === "weight")?.answer || 80,
    unit:
      UserAnswers.find((answer) => answer.question === "unit")?.answer ||
      "metric",
    activity_level:
      UserAnswers.find((answer) => answer.question === "activity_level")
        ?.answer || "Sedentary",
  };

  const plans = getCaloriePlans(userData);
  const bmr = calculateBMR(userData);
  const caloriesPerDay = calculateCaloriesPerDay(userData);
  UserAnswers.push({
    question: "bmr",
    answer: bmr,
  });
  UserAnswers.push({
    question: "tdee",
    answer: caloriesPerDay,
  });

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
              UserAnswers.push({
                question: "calories_target",
                answer: plan.caloriesPerDay,
              });
              UserAnswers.push({
                question: "calorie_deficit",
                answer: plan.rate,
              });
              goForward();
            }}
            style={{
              borderColor:
                selectedPlan === plan.type ? theme.primary : "transparent",
              backgroundColor:
                selectedPlan === plan.type ? theme.primary : theme.buttonsolid,
            }}
            forQuestion="calorie_plan"
            onClickContinue
          />
        ))}
        <View style={{ marginTop: 5 }}>
          <Text style={styles.noteText}>
            Plans that go below your BMR (your body’s basic energy need) are removed.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: "relative",
  },
  noteText: {
    color: "#888",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 10,
    lineHeight: 18,
    width: 330,
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
