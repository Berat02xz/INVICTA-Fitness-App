import ButtonOnboarding from "@/components/ui/Onboarding/AnswerOnboarding";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
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
    <>
      <SolidBackground style={StyleSheet.absoluteFill} />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={{ zIndex: 1 }}>
            <QuestionOnboarding question="How many pushups can you do?" />
            <View style={{ marginTop: 30 }} />
            <ButtonOnboarding
              text="Beginner"
              undertext="Less than 10 push-ups"
              emoji="🥀"
              forQuestion="PushUps"
              onClickContinue
              order={0}
            />
            <ButtonOnboarding
              text="Intermediate"
              undertext="10 to 20 push-ups"
              emoji="😤"
              forQuestion="PushUps"
              onClickContinue
              order={1}
            />
            <ButtonOnboarding
              text="Advanced"
              undertext="21 to 30 push-ups"
              emoji="🚀"
              forQuestion="PushUps"
              onClickContinue
              order={2}
            />
            <ButtonOnboarding
              text="Gym Enthusiast"
              undertext="More than 30 push-ups"
              emoji="💪"
              forQuestion="PushUps"
              onClickContinue
              order={3}
            />
          </View>
        </View>
      </View>
    </>
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
