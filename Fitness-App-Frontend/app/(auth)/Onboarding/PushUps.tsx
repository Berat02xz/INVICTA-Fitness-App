import ButtonOnboarding from "@/components/ui/ButtonOnboarding";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import React from "react";
import { StyleSheet, View } from "react-native";

const iconmap = {
  pushUp1: require("@/assets/icons/onboarding/pushUp1.png"),
  pushUp2: require("@/assets/icons/onboarding/pushUp2.png"),
  pushUp3: require("@/assets/icons/onboarding/pushUp3.png"),
  Gym: require("@/assets/icons/onboarding/Gym.png"),
};

const PushUps = () => {

  return (
    <View style={styles.container}>
      <SolidBackground style={StyleSheet.absoluteFill} />

      <View style={styles.content}>
        <View style={{ zIndex: 1 }}>
          <QuestionOnboarding question="How many push-ups can you do in one round?" />
          <View style={{ marginTop: 30 }} />
          <ButtonOnboarding
            text="Less than 10"
            imageSrc={iconmap.pushUp1}
            onClick={() => {
              console.log("Less than 10 selected");
            }}
            forQuestion="PushUps"
            oneAnswer
          />
          <ButtonOnboarding
            text="10-20"
            imageSrc={iconmap.pushUp2}
            onClick={() => {
              console.log("10-20 selected");
            }}
            forQuestion="PushUps"
            oneAnswer
          />
          <ButtonOnboarding
            text="21-30"
            imageSrc={iconmap.pushUp3}
            onClick={() => {
              console.log("21-30 selected");
            }}
            forQuestion="PushUps"
            oneAnswer
          />
          <ButtonOnboarding
            text="More than 30"
            imageSrc={iconmap.Gym}
            onClick={() => {
              console.log("More than 30 selected");
            }}
            forQuestion="PushUps"
            oneAnswer
          />
          
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 25,
    alignItems: "center",
  },
});

export default PushUps;
