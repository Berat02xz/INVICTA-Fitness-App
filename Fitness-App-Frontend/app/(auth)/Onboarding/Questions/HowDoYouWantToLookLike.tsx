import ButtonOnboarding from "@/components/ui/Onboarding/AnswerOnboarding";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import React from "react";
import { StyleSheet, View } from "react-native";
("use client");

const bodyImage = {
  Slim: require("@/assets/icons/onboarding/Skinny.png"),
  Cut: require("@/assets/icons/onboarding/Cut.png"),
  Bulk: require("@/assets/icons/onboarding/Bulk.png"),
};

const HowDoYouWantToLookLike = () => {
  return (
    <>
      {" "}
      <SolidBackground />
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <QuestionOnboarding question="Choose your body goal" />
          <View style={{ marginTop: 30 }} />

          <ButtonOnboarding
            height={150}
            text="Athletic"
            onClickContinue
            forQuestion="look_goal"
            BodyImage={bodyImage.Slim}
            order={0}
          />
          <ButtonOnboarding
            height={150}
            text="Shredded"
            onClickContinue
            forQuestion="look_goal"
            BodyImage={bodyImage.Cut}
            order={1}
          />
          <ButtonOnboarding
            height={150}
            text="Strong"
            onClickContinue
            forQuestion="look_goal"
            BodyImage={bodyImage.Bulk}
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
    position: "relative", // Important for absolute background
  },
  container: {
    flex: 1,
    paddingTop: 30,
    padding: 25,
    zIndex: 1,
    alignItems: "center",
  },
});

export default HowDoYouWantToLookLike;
