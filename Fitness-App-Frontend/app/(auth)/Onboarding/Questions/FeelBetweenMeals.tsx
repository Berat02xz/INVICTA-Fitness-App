import ButtonOnboarding from "@/components/ui/Onboarding/AnswerOnboarding";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import React from "react";
import { StyleSheet, View } from "react-native";

const FeelBetweenMeals = () => {
  return (
    <>
      <SolidBackground />
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <QuestionOnboarding question="How do you feel between meals?" />
          <View style={{ marginTop: 30 }} />
          <ButtonOnboarding
            text="tired or sluggish"
            rightImage={require("@/assets/icons/onboarding/sleepy.png")}
            forQuestion="FeelBetweenMeals"
            onClickContinue
            order={0}
          />
          <ButtonOnboarding
            text="irritable"
            rightImage={require("@/assets/icons/onboarding/angry.png")}
            forQuestion="FeelBetweenMeals"
            onClickContinue
            order={1}
          />
          <ButtonOnboarding
            text="light and energetic"
            rightImage={require("@/assets/icons/onboarding/strong.png")}
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
