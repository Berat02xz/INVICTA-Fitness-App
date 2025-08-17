import ButtonOnboarding from "@/components/ui/Onboarding/AnswerOnboarding";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useOnboarding } from "../NavigationService";

const HowMuchWater = () => {
  const { goForward } = useOnboarding();

  return (
    <>
      <SolidBackground />
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <QuestionOnboarding question="How much water do you drink daily?" />
          <View style={{ marginTop: 30 }} />
          <ButtonOnboarding
            text="2 glasses"
            emoji="💧"
            undertext="0,5l / 17oz"
            forQuestion="Water"
            onClickContinue
            order={1}
          />
          <ButtonOnboarding
            text="2-6 glasses"
            emoji="💦"
            undertext="0,5-1.5l / 17-50 oz"
            forQuestion="Water"
            onClickContinue
            order={2}
          />
          <ButtonOnboarding
            text="7-10 glasses"
            emoji="🌊"
            undertext="1,5-2,5l / 50-85 oz"
            forQuestion="Water"
            onClickContinue
            order={3}
          />
          <ButtonOnboarding
            text="More than 10 glasses"
            emoji="🐋"
            undertext="1,5-2.5l / 50-85 oz"
            forQuestion="Water"
            onClickContinue
            order={4}
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

export default HowMuchWater;
