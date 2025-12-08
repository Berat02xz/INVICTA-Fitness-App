import ButtonOnboarding from "@/components/ui/Onboarding/AnswerOnboarding";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useOnboarding } from "../NavigationService";


const DietFollow = () => {
  const { goForward } = useOnboarding();

  return (
    <>
      <SolidBackground />
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <QuestionOnboarding question="Diet Restrictions?" />
          <View style={{ marginTop: 30 }} />
          <ButtonOnboarding
            text="Vegetarian"
            rightImage={require("@/assets/icons/onboarding/salad.png")}
            undertext="Excludes meat"
            forQuestion="DietFollow"
            onClickContinue
            order={0}
          />
          <ButtonOnboarding
            text="Vegan"
            rightImage={require("@/assets/icons/onboarding/carrot.png")}
            undertext="Excludes all animal products"
            forQuestion="DietFollow"
            onClickContinue
            order={1}
          />
          <ButtonOnboarding
            text="Keto"
            rightImage={require("@/assets/icons/onboarding/avocado.png")}
            undertext="Low-carb, high fat"
            forQuestion="DietFollow"
            onClickContinue
            order={2}
          />
          <ButtonOnboarding
            text="No"
            rightImage={require("@/assets/icons/onboarding/never.png")}
            forQuestion="DietFollow"
            onClickContinue
            order={3}
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

export default DietFollow;
