import ButtonOnboarding from "@/components/ui/AnswerOnboarding";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import React from "react";
import { StyleSheet, View } from "react-native";

const activity_level = {
  home: require("@/assets/icons/onboarding/home_equipment.png"),
  gym: require("@/assets/icons/onboarding/gym_equipment.png"),
  full: require("@/assets/icons/onboarding/full_equipment.png"),
};

const AccessToEquipment = () => {
  return (
    <View style={styles.outerContainer}>
      <SolidBackground />

      <View style={styles.container}>
        <QuestionOnboarding question="Choose your workout environment" />

        <View style={{ marginTop: 30 }} />

        <ButtonOnboarding
          text="Home"
          imageSrc={activity_level.home}
          undertext="Home workouts with no equipment"
          onClickContinue
          forQuestion="equipment_access"
          order={0}
        />
        <ButtonOnboarding
          text="Basic Equipment"
          undertext="Dumbbells or similar gear at home"
          imageSrc={activity_level.gym}
          onClickContinue
          forQuestion="equipment_access"
          order={1}
        />
        <ButtonOnboarding
          text="Gym Access"
          undertext="You can use full gym machines"
          imageSrc={activity_level.full}
          onClickContinue
          forQuestion="equipment_access"
          order={2}
        />

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: 'relative', 
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

export default AccessToEquipment;
