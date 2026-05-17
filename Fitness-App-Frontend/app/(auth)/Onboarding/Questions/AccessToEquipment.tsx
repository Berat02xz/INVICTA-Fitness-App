import ButtonOnboarding from "@/components/ui/Onboarding/AnswerOnboarding";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import React from "react";
import { StyleSheet, View } from "react-native";


const AccessToEquipment = () => {
  return (
    <>
      <SolidBackground />
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <QuestionOnboarding question="Choose your workout access" />

          <View style={{ marginTop: 30 }} />

          <ButtonOnboarding
            text="Home Workouts"
            rightImage={require("@/assets/icons/onboarding/home.png")}
            undertext="No Equipment"
            onClickContinue
            forQuestion="equipment_access"
            order={0}
          />
          <ButtonOnboarding
            text="Basic Equipment"
            undertext="Dumbbells or similar gear at home"
            rightImage={require("@/assets/icons/onboarding/dumbbell.png")}
            onClickContinue
            forQuestion="equipment_access"
            order={1}
          />
          <ButtonOnboarding
            text="Gym Access"
            undertext="You can use full gym machines"
            rightImage={require("@/assets/icons/onboarding/weightlifter.png")}
            onClickContinue
            forQuestion="equipment_access"
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

export default AccessToEquipment;
