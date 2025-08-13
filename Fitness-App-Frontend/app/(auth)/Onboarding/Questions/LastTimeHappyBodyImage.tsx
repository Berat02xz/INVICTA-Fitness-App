import ButtonOnboarding from "@/components/ui/Onboarding/AnswerOnboarding";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import React from "react";
import { StyleSheet, View } from "react-native";
("use client");

const LastTimeHappyBodyImage = () => {
  return (
    <>
      <SolidBackground style={styles.background} />

      <View style={styles.outerContainer}>
        <View style={styles.innerContainer}>
          <QuestionOnboarding question="Last time you felt confident in your body?" />
          <View style={{ marginTop: 30 }} />

          <ButtonOnboarding
            text="<1 year ago"
            emoji="🤔"
            onClickContinue
            forQuestion="last_time_happy_body_image"
            order={0}
          />
          <ButtonOnboarding
            text="1-2 years ago"
            emoji="😅"
            onClickContinue
            forQuestion="last_time_happy_body_image"
            order={1}
          />
          <ButtonOnboarding
            text=">3 years ago"
            emoji="🙁"
            onClickContinue
            forQuestion="last_time_happy_body_image"
            order={2}
          />
          <ButtonOnboarding
            text="Never"
            emoji="✖️"
            onClickContinue
            forQuestion="last_time_happy_body_image"
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
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  innerContainer: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 25,
    zIndex: 1,
    alignItems: "center",
  },
});

export default LastTimeHappyBodyImage;
