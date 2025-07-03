import ButtonOnboarding from "@/components/ui/ButtonOnboarding";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import React from "react";
import { StyleSheet, View } from "react-native";

const activity_level = {
  home: require("@/assets/icons/onboarding/home_equipment.png"),
  gym: require("@/assets/icons/onboarding/gym_equipment.png"),
};

const ChooseWorkoutPlace = () => {
  return (
    <View style={styles.outerContainer}>
      <SolidBackground />

      <View style={styles.container}>
        <QuestionOnboarding question="Choose the place for your workouts" />
        <View style={{ marginTop: 30 }} />

        <ButtonOnboarding
                    text="Home"
          imageSrc={activity_level.home}
          onClick={() => {
            console.log("Home selected");
          }}
          oneAnswer
          forQuestion="workout_place"
        />
        <ButtonOnboarding
                    text="Gym"
          imageSrc={activity_level.gym}
          onClick={() => {
            console.log("Gym selected");
          }}
          oneAnswer
          forQuestion="workout_place"
        />
      </View>
    </View>
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

export default ChooseWorkoutPlace;
