import ButtonOnboarding from "@/components/ui/AnswerOnboarding";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import { theme } from "@/constants/theme";
import { getCaloriePlans, calculateBMR } from "@/utils/GetCaloriePlans";
import calculateCaloriesPerDay from "@/utils/CalculateCaloriesPerDay";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useOnboarding } from "../NavigationService";

const DesiredTargetWeight = () => {
  const { goForward, answers, saveSelection } = useOnboarding();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

const userData = {
    age: Number(answers.age) || 30,
    sex: String(answers.gender) || "male",
    height: answers.height || "185",
    weight: Number(answers.weight) || 80,
    unit: String(answers.unit) || "metric",
    activity_level: String(answers.activity_level) || "Sedentary",
  };



  const plans = getCaloriePlans(userData);
  const bmr = calculateBMR(userData);
  const caloriesPerDay = calculateCaloriesPerDay(userData);
  saveSelection("bmr", bmr);
  saveSelection("tdee", caloriesPerDay);

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
              saveSelection("calories_target", plan.type);
              saveSelection("calorie_deficit", plan.rate);
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
