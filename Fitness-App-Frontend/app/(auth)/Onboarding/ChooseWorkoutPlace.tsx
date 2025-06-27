import React from "react";
import { View, Text } from "react-native";
import ButtonOnboarding from "@/components/ui/ButtonOnboarding";
("use client");
import GradientBackground from "@/components/ui/GradientBackground";
import { StyleSheet } from "react-native";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";

const activity_level = {
  home: require("@/assets/icons/onboarding/home_equipment.png"),
  gym: require("@/assets/icons/onboarding/gym_equipment.png"),
};

const ChooseWorkoutPlace = () => {
  return (
    <View style={styles.container}>
      <GradientBackground position="bottom" />

      <View style={{ zIndex: 1 }}>
        <QuestionOnboarding
          question="Choose the place for your workouts"
        />
        <View style={{ marginTop: 30 }}></View>

        <ButtonOnboarding
          height={57}
          text="Home"
          imageSrc={activity_level.home}
          onClick={() => {
            console.log("Home selected");
          }}
          oneAnswer
          forQuestion="workout_place"
        />
        <ButtonOnboarding
          height={57}
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
  container: {
    flex: 1,
    paddingTop: 30,
    padding: 25,
  },
});

export default ChooseWorkoutPlace;
