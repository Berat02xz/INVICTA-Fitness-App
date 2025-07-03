import ButtonOnboarding from "@/components/ui/ButtonOnboarding";
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
        <QuestionOnboarding question="Which type of equipment do you have access to?" />
        
        <View style={{ marginTop: 30 }} />

        <ButtonOnboarding
          text="No Equipment"
          imageSrc={activity_level.home}
          onClick={() => {
            console.log("No Equipment selected");
          }}
          oneAnswer
          forQuestion="equipment_access"
        />
        <ButtonOnboarding
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
          text="Full Equipment"
          undertext="Bands, weights & bars, machines"
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
});

export default AccessToEquipment;
