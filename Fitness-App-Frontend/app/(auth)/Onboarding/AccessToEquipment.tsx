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
  full: require("@/assets/icons/onboarding/full_equipment.png"),
};

const AccessToEquipment = () => {
  return (
    <View style={styles.container}>
      <GradientBackground position="bottom" />

      <View style={{ zIndex: 1 }}>
        <QuestionOnboarding
          question="Which type of equipment do you have access to?"
        />
        <View style={{ marginTop: 30 }}></View>

        <ButtonOnboarding
          height={57}
          text="No Equipment"
          imageSrc={activity_level.home}
          onClick={() => {
            console.log("No Equipment selected");
          }}
          oneAnswer
          forQuestion="equipment_access"
        />
        <ButtonOnboarding
          height={57}
          text="Basic Equipment"
          undertext="Resistance band, dumbbells"
          imageSrc={activity_level.gym}
          onClick={() => {
            console.log("Basic Equipment selected");
          }}
          oneAnswer
          forQuestion="equipment_access"
        />
        <ButtonOnboarding
          height={57}
          text="Full Equipment"
          undertext="Resistance band, dumbbells, parallel and horizontal bars"
          imageSrc={activity_level.full}
          onClick={() => {
            console.log("Full Equipment selected");
          }}
          oneAnswer
          forQuestion="equipment_access"
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

export default AccessToEquipment;
