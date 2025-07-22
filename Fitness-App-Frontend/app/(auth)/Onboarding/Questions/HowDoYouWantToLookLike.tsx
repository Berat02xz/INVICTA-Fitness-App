import ButtonOnboarding from '@/components/ui/AnswerOnboarding';
import QuestionOnboarding from '@/components/ui/QuestionOnboarding';
import SolidBackground from '@/components/ui/SolidBackground';
import React from 'react';
import { StyleSheet, View } from 'react-native';
"use client";

const bodyImage = {
  Slim: require("@/assets/icons/onboarding/Skinny.png"),
  Cut: require("@/assets/icons/onboarding/Cut.png"),
  Bulk: require("@/assets/icons/onboarding/Bulk.png"),
};

const HowDoYouWantToLookLike = () => {
  return (
    <View style={styles.outerContainer}>
      <SolidBackground />

      <View style={styles.container}>
        <QuestionOnboarding question="Choose your body goal" />
        <View style={{ marginTop: 30 }} />

        <ButtonOnboarding
          height={150}
          text="Athletic"
          onClick={() => console.log("Athletic selected")}
          onClickContinue
          forQuestion="look_goal"
          BodyImage={bodyImage.Slim}
          order={0}
        />
        <ButtonOnboarding
          height={150}
          text="Shredded"
          onClick={() => console.log("Shredded selected")}
          onClickContinue
          forQuestion="look_goal"
          BodyImage={bodyImage.Cut}
          order={1}
        />
        <ButtonOnboarding
          height={150}
          text="Strong"
          onClick={() => console.log("Strong selected")}
          onClickContinue
          forQuestion="look_goal"
          BodyImage={bodyImage.Bulk}
          order={2}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: 'relative', // Important for absolute background
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
